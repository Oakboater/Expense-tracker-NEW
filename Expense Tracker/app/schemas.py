from fastapi import FastAPI
from .database import session, Person, Expense
from .schemas import PersonCreate, ExpenseCreate
from sqlalchemy import func
from datetime import datetime

# RUN DATABASE WITH uvicorn app.main:app --reload
app = FastAPI()



# database
def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()


@app.get("/")

def read_roots():
    return {"boot up complete": "Tracker API is running!"}


@app.get("/people")
def get_people():
    people = session.query(Person).all()
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

@app.get("/totals")
def get_totals():
    totals = (
        session.query(Person.firstname, func.sum(Expense.cost))
        .join(Expense, Expense.owner == Person.ssn)
        .group_by(Person.firstname)
        .all()
    )
    return [{"person": name, "total_spent": total} for name, total in totals]


@app.get("/expenses/{user_id}")
def get_expense(user_id: int):
    expense = session.query(Expense).filter(Expense.owner == user_id).all()

    return [
        {
        "Item": e.item,
        "Cost": e.cost,
        "date": e.date,
        "category": e.category_rel.name if e.category_rel else None,
        "category_id": e.category_id
        }
        for e in expense
    ]


@app.post("/people")
def create_person(person: PersonCreate):
    existing_user = session.query(Person).filter(
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
    session.add(new_person)
    session.commit()
    return {"Message": f"Person {person.firstname} added successfully"}

@app.post("/expenses")
def create_expense(expense: ExpenseCreate):
    new_expense = Expense(
        cost=expense.cost,
        item=expense.item,
        owner=expense.owner,
        category_id=expense.category_id,
        date=datetime.now() or expense.date
    )
    session.add(new_expense)
    session.commit()
    return {"Message": f"Expense {expense.item} added successfully"}

