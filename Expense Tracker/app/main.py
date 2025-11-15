from typing import List
from fastapi import FastAPI, Depends
from database import Session, Person, Expense, Category
from schemas import PersonCreate, ExpenseCreate, ExpenseOut, Login
from datetime import datetime

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
def get_expense(user_id: int, db: Session = Depends(get_db)):
    expense_list = db.query(Expense).filter(Expense.owner == user_id).all()

    result = []
    for e in expense_list:
        category = db.query(Category).filter(Category.id == e.category_id).first()
        result.append(
            ExpenseOut(
                item=e.item,
                cost=e.cost,
                date=e.date,
                category=category.name if category else None
            )
        )
    return result





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
    return {"Message": f"Expense {expense.item} added successfully"}


@app.post("/login")
def login(data: Login, db: Session = Depends(get_db)):
    user = db.query(Person).filter(person.ssn == data.ssn).first()

    if not user:
            return {"Error": "User does not exist"}

    if not user.checkpassword(data.password):
            return {"Error": "Incorrect password"}

    return {
            "Message": "Login successful",
            "ssn": user.ssn,
            "firstname": user.firstname,
            "lastname": user.lastname
            }


