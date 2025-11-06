from fastapi import FastAPI, Depends
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
def get_people(db: session = Depends(get_db)):
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


@app.get("/expenses/{user_id}")
def get_expense(user_id: int, db: session = Depends(get_db)):
    expense = db.query(Expense).filter(Expense.owner == user_id).all()

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
def create_person(person: PersonCreate, db: session = Depends(get_db)):
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
def create_expense(expense: ExpenseCreate, db: session = Depends(get_db)):
    new_expense = Expense(
        cost=expense.cost,
        item=expense.item,
        owner=expense.owner,
        category_id=expense.category_id,
        date=datetime.now() or expense.date
    )
    db.add(new_expense)
    db.commit()
    return {"Message": f"Expense {expense.item} added successfully"}

