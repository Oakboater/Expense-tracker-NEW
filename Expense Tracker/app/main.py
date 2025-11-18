from typing import List
from fastapi import FastAPI, Depends
from .database import Session, Person, Expense, Category
from .schemas import PersonCreate, ExpenseCreate, ExpenseOut, Login
from datetime import datetime
from sqlalchemy.orm import joinedload
from sqlalchemy import func

# RUN DATABASE WITH uvicorn app.main:app --reload

app = FastAPI()

# database
def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()



@app.get("/")

def read_roots():
    return {"boot up complete": "Tracker API is running!"}



@app.get("/people")
def get_people(db: Session = Depends(get_db)):
    people = db.query(Person).all()
    return [
        {
            "ssn": p.ssn,
            "firstname": p.firstname,
            "lastname": p.lastname,
            "gender": p.gender,
            "age": p.age
        }
        for p in people
    ]


@app.get("/expenses/{user_id}", response_model=List[ExpenseOut])
def get_expense(user_id: int, page: int = 1, limit: int = 20, sort: str = "date_desc", db: Session = Depends(get_db)):
    order_by = Expense.date.desc()
    query = db.query(Expense).filter(Expense.owner==user_id).order_by(order_by)

    total_items = query.count()
    total_pages = (total_items + limit - 1) // limit

    expenses = query.offset((page - 1) * limit).limit(limit).all()

    result = [
    ExpenseOut(
        item = e.item,
        cost = e.cost,
        date = e.date,
        category = e.category_rel.name if e.category_rel else None,
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
        "data": result
    }


@app.get("/summaries/{user_id}")
def summary(user_id: int, db: Session = Depends(get_db)):
    result = (
        db.query(
            Category.name,
            func.sum(Expense.cost).label("total")
        )
        .join(Expense, Expense.category_id == Category.id)
        .filter(Expense.owner == user_id)
        .group_by(Category.name)
        .all()
    )

    return [{"category": r[0], "total": r[1]} for r in result]



@app.post("/people")
def create_person(person: PersonCreate, db: Session = Depends(get_db)):
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
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    existing_category = db.query(Category).filter(
        Category.name == expense.category,
        Category.owner == expense.owner
    ).first()

    if not existing_category:
        category = Category(name=expense.category, owner=expense.owner)
        db.add(category)
        db.commit()
        db.refresh(category)
        final_category = category
    else:
        final_category = existing_category
    new_expense = Expense(
        cost=expense.cost,
        item=expense.item,
        owner=expense.owner,
        category_id=final_category.id,
        date=expense.date or datetime.now()
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return {
        "Message": f"Expense {new_expense.item} added successfully",
        "expense_id": new_expense.tid,
        "category": final_category.name
    }



@app.post("/login")
def login(data: Login, db: Session = Depends(get_db)):
    user = db.query(Person).filter(Person.ssn == data.ssn).first()

    if not user:
            return {"Error": "User does not exist"}

    if not user.check_password(data.password):
            return {"Error": "Incorrect password"}

    return {
            "Message": "Login successful",
            "ssn": user.ssn,
            "firstname": user.firstname,
            "lastname": user.lastname
            }


@app.delete("/categories/{user_id}/{category_name}")
def delete_categories(user_id: int, category_name: str, db: Session = Depends(get_db)):

    category = db.query(Category).filter(
        Category.name == category_name,
        Category.owner == user_id
    ).first()

    if not category:
        return {"Error": "Category does not exist"}

    linked_expenses = db.query(Expense).filter(
        Expense.category_id == category.id
    ).all()

    if linked_expenses:
        return {"Error": "Cannot delete linked category, Delete expenses first."}

    db.delete(category)
    db.commit()

    return {"Message": f"Category {category_name} deleted successfully"}

@app.get("/categories/{user_id}")
def get_categories(user_id: int,     db: Session = Depends(get_db)):
    cats = db.query(Category).filter(Category).filter(Category.owner == user_id).all()
    return [{"id": c.id, "name": c.name} for c in cats]


@app.delete("/expenses/{user_id}/{expense_id}")
def delete_expense(user_id: int, expense_id: int, db: Session = Depends(get_db)):

    expense = db.query(Expense).filter(
        Expense.tid == expense_id,
        Expense.owner == user_id
    ).first()

    if not expense:
        return {"Error": "Expense does not exist"}
    db.delete(expense)
    db.commit()
    return {"Message": f"Expense {expense_id} deleted successfully"}

@app.patch("/expenses/{expense_id}")
def update_expense(expense_id: int, updated: ExpenseCreate, db: Session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.tid == expense_id).first()

    if not expense:
        return {"Error": "Expense not found"}

    # else update

    expense.item = updated.item
    expense.cost = updated.cost

    db.commit()
    db.refresh(expense)

    return {
        "Message": f"Expense {expense.tid} updated successfully",
        "item": expense.item,
        "cost": expense.cost,
        "date": expense.date
    }
