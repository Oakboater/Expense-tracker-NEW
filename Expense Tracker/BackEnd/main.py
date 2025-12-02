from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import literal

from database import Session as DBSession, Person, Expense, Category, Income, Budget
from auth import create_access_token, get_current_user, create_refresh_token, verify_refresh_token
from schemas import PersonCreate, ExpenseCreate, ExpenseOut, PaginatedResponse, Token, PersonUpdate, IncomeOut, IncomeCreate, BudgetCreate, BudgetOut
from utils import get_sort_options, get_financial_summary
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()  # RUN DATABASE WITH uvicorn app.main:app --reload

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173"   # Vite default
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
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


@app.get("/me/summary")
def financial_summary(
    days: int = Query(30, ge=1),
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    summary = get_financial_summary(db, current_user.ssn, days=days)
    return summary

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

@app.get("/me/income", response_model=list[IncomeOut])
def get_my_income(
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    income = (
        db.query(Income)
        .filter(Income.owner == current_user.ssn)
        .order_by(Income.date.desc())
        .all()
    )
    return income

@app.get("/me/budgets", response_model=list[BudgetOut])
def get_my_budgets(
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.owner == current_user.ssn
    ).all()

    return budgets



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

from sqlalchemy import func

@app.get("/me/summary/monthly")
def monthly_summary(
    month: int,  # 1-12
    year: int,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    # Filter expenses by user and month
    expenses = db.query(
        Expense.category_id,
        func.sum(Expense.cost).label("total")
    ).filter(
        Expense.owner == current_user.ssn,
        func.extract('year', Expense.date) == year,
        func.extract('month', Expense.date) == month
    ).group_by(Expense.category_id).all()

    result = [{"category": db.query(Category).get(cat_id).name, "total": total} for cat_id, total in expenses]

    total_expense = sum([r["total"] for r in result])

    return {
        "month": month,
        "year": year,
        "total_expense": total_expense,
        "by_category": result
    }


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

    token_data = {"sub": str(user.ssn)}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(token_data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@app.post("/income")
def create_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    new_income = Income(
        amount=income.amount,
        source=income.source,
        date=income.date or datetime.now(),
        owner=current_user.ssn
    )

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return {
        "message": "Income added successfully",
        "id": new_income.id,
        "source": new_income.source,
        "amount": new_income.amount
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


@app.post("/budgets")
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    new_budget = Budget(
        category=budget.category,
        limit=budget.limit,
        period=budget.period,
        start_date=budget.start_date,
        end_date=budget.end_date,
        owner=current_user.ssn
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return {"message": "Budget created", "id": new_budget.id}


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


@app.patch("/budgets/{budget_id}")
def update_budget(
    budget_id: int,
    updated: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.owner == current_user.ssn
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    budget.category = updated.category
    budget.limit = updated.limit
    budget.period = updated.period
    budget.start_date = updated.start_date
    budget.end_date = updated.end_date

    db.commit()
    db.refresh(budget)

    return {"message": "Budget updated"}

@app.patch("/me")
def update_me(
    updated: PersonUpdate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    user = current_user

    if updated.firstname is not None:
        user.firstname = updated.firstname
    if updated.lastname is not None:
        user.lastname = updated.lastname
    if updated.gender is not None:
        user.gender = updated.gender
    if updated.age is not None:
        user.age = updated.age
    if updated.password is not None:
        user.set_password(updated.password)  # make sure you hash the password

    db.commit()
    db.refresh(user)

    return {
        "Message": "Profile updated successfully",
        "user": {
            "ssn": user.ssn,
            "firstname": user.firstname,
            "lastname": user.lastname,
            "gender": user.gender,
            "age": user.age,
        }
    }

@app.patch("/income/{income_id}")
def update_income(
    income_id: int,
    updated: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.owner == current_user.ssn
    ).first()

    if not income:
        raise HTTPException(status_code=404, detail="Income not found")

    income.amount = updated.amount
    income.source = updated.source
    income.date = updated.date or income.date

    db.commit()
    db.refresh(income)

    return {"message": "Income updated successfully"}



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

@app.delete("/income/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.owner == current_user.ssn
    ).first()

    if not income:
        raise HTTPException(status_code=404, detail="Income not found")

    db.delete(income)
    db.commit()

    return {"message": "Income deleted successfully"}

@app.delete("/budgets/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: Person = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.owner == current_user.ssn
    ).first()

    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")

    db.delete(budget)
    db.commit()

    return {"message": "Budget deleted"}

@app.delete("/me")
def delete_me(
        db: Session = Depends(get_db),
        current_user: Person = Depends(get_current_user)
):

    db.query(Expense).filter(Expense.owner == current_user.ssn).delete()

    db.query(Category).filter(Category.owner == current_user.ssn).delete()

    db.delete(current_user)
    db.commit()

    return {"Message": "Your account and all related data have been deleted successfully"}



