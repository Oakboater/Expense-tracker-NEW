from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import literal

from .database import Session as DBSession, Person, Expense, Category
from .auth import create_access_token, get_current_user, create_refresh_token, verify_refresh_token
from .schemas import PersonCreate, ExpenseCreate, ExpenseOut, PaginatedResponse, Token
from .utils import get_sort_options


app = FastAPI()  # RUN DATABASE WITH uvicorn app.main:app --reload

# Database dependency
def get_db():
    db = DBSession()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def read_roots():
    return {"boot up complete": "Tracker API is running!"}




@app.get("/me", response_model=dict)
def get_me(current_user: Person = Depends(get_current_user)):
    return {
        "ssn": current_user.ssn,
        "firstname": current_user.firstname,
        "lastname": current_user.lastname,
        "gender": current_user.gender,
        "age": current_user.age
    }


@app.get("/me/expenses", response_model=PaginatedResponse[ExpenseOut])
def get_my_expenses(
    page: int = 1,
    limit: int = 20,
    sort: str = "date_desc",
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    order_by = get_sort_options(sort)
    # noinspection PyTypeChecker
    query = db.query(Expense).filter(Expense.owner == literal(current_user.ssn)).order_by(order_by)

    total_items = query.count()
    total_pages = (total_items + limit - 1) // limit

    expenses = query.offset((page - 1) * limit).limit(limit).all()

    result = [
        ExpenseOut(
            tid=e.tid,
            item=e.item,
            cost=e.cost,
            date=e.date,
            category=e.category_rel.name if e.category_rel else None,
        )
        for e in expenses
    ]

    return {
        "metadata": {
            "total_items": total_items,
            "total_pages": total_pages,
            "current_page": page,
            "limit": limit,
        },
        "data": result,
    }


@app.get("/me/categories")
def get_my_categories(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    # noinspection PyTypeChecker
    query = db.query(Category).filter(Category.owner == literal(current_user.ssn))

    total_items = query.count()
    total_pages = (total_items + limit - 1) // limit

    categories = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "metadata": {
            "total_items": total_items,
            "total_pages": total_pages,
            "current_page": page,
            "limit": limit,
        },
        "data": [{"id": c.id, "name": c.name} for c in categories],
    }


@app.get("/people")
def get_people(db: Session = Depends(get_db)):
    people = db.query(Person).all()
    return [
        {
            "ssn": p.ssn,
            "firstname": p.firstname,
            "lastname": p.lastname,
            "gender": p.gender,
            "age": p.age,
        }
        for p in people
    ]

@app.post("/token", response_model=Token)
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    try:
        ssn = int(form_data.username)
    except ValueError:
        raise HTTPException(status_code=400, detail="Username must be numeric SSN")

    # noinspection PyTypeChecker
    user = db.query(Person).filter(Person.ssn == ssn).first()
    if not user or not user.check_password(form_data.password):
        raise HTTPException(status_code=401, detail="Incorrect credentials")

    token_data = {"sub": user.ssn}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(token_data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }



@app.post("/refresh")
def refresh_access_token(refresh_token: str):
    payload = verify_refresh_token(refresh_token)
    ssn = payload.get("sub")

    new_access = create_access_token({"sub": ssn})

    return {
        "access_token": new_access,
        "token_type": "bearer"
    }


@app.post("/people")
def create_person(person: PersonCreate, db: Session = Depends(get_db)):
    # noinspection PyTypeChecker
    existing_user = db.query(Person).filter(
        Person.firstname == person.firstname,
        Person.lastname == person.lastname
    ).first()

    if existing_user:
        return {"Error": "User already exists"}

    new_person = Person(
        firstname=person.firstname,
        lastname=person.lastname,
        gender=person.gender,
        age=person.age
    )
    new_person.set_password(person.password)
    db.add(new_person)
    db.commit()

    return {"Message": f"Person {person.firstname} added successfully"}


@app.post("/expenses")
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    expense_owner = current_user.ssn

    # noinspection PyTypeChecker
    existing_category = db.query(Category).filter(
        Category.name == expense.category,
        Category.owner == literal(expense_owner)
    ).first()

    if not existing_category:
        category = Category(name=expense.category, owner=expense_owner)
        db.add(category)
        db.commit()
        db.refresh(category)
    else:
        category = existing_category

    new_expense = Expense(
        cost=expense.cost,
        item=expense.item,
        owner=expense_owner,
        category_id=category.id,
        date=expense.date or datetime.now()
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return {
        "Message": f"Expense {new_expense.item} added successfully",
        "expense_id": new_expense.tid,
        "category": category.name,
    }


@app.patch("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    updated: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    # noinspection PyTypeChecker
    expense = db.query(Expense).filter(
        Expense.tid == expense_id,
        Expense.owner == literal(current_user.ssn)
    ).first()

    if not expense:
        return {"Error": "Expense not found"}

    expense.item = updated.item
    expense.cost = updated.cost

    db.commit()
    db.refresh(expense)

    return {
        "Message": f"Expense {expense.tid} updated successfully",
        "item": expense.item,
        "cost": expense.cost,
        "date": expense.date,
    }


@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    # noinspection PyTypeChecker
    expense = db.query(Expense).filter(
        Expense.tid == expense_id,
        Expense.owner == literal(current_user.ssn)
    ).first()

    if not expense:
        return {"Error": "Expense does not exist"}

    db.delete(expense)
    db.commit()

    return {"Message": f"Expense {expense_id} deleted successfully"}


