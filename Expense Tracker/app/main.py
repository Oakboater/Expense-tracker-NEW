from fastapi import FastAPI
from database import session, Person, Expense
from sqlalchemy import func
from schemas import PersonCreate, ExpenseCreate


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
        session.query(Person.firstname, func.sum(Expense.amount))
        .join(Expense, Expense.owner == Person.ssn)
        .group_by(Person.firstname)
        .all()
    )
    return [{"person": name, "total_spent": total} for name, total in totals]



@app.post("/people")
def create_person(person: PersonCreate):
    new_person = Person(
        firstname=person.firstname,
        lastname=person.lastname,
        gender=person.gender,
        age=person.age
    )
    session.add(new_person)
    session.commit()
    return {"Message": f"Person {person.firstname} added successfully"}

@app.post("/expenses")
def create_expense(expense: ExpenseCreate):
    new_expense = Expense(
        amount=expense.amount,
        item=expense.item,
        owner=expense.owner,
        category_id=expense.category_id,
        date=expense.datetime.now() or expense.date
    )
    session.add(new_expense)
    session.commit()
    return {"Message": f"Expense {expense.item} added successfully"}

