from fastapi import FastAPI
from database import session, Person, Expense, Category, Thing
from sqlalchemy import func
app = FastAPI()

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

@app.get("totals")
def get_totals():
    totals = (
        session.query(Person.firstname, func.sum(Expense.amount))
        .join(Expense, Expense.owner == Person.ssn)
        .group_by(Person.firstname)
        .all()
    )
    return [{"person": name, "total_spent": total} for name, total in totals]

