from datetime import datetime
from typing import Any
from sqlalchemy import create_engine, ForeignKey,  Column, Integer, String, CHAR, DateTime, func
from sqlalchemy.orm import sessionmaker, relationship, declarative_base

# SETUP
Base = declarative_base()

# Models

class Person(Base):
    __tablename__ = "person"

    ssn = Column("ssn", Integer, primary_key=True)
    firstname = Column("firstname", String)
    lastname = Column("lastname", String)
    gender = Column("gender", CHAR)
    age = Column("age", Integer)

    expenses = relationship("Expense", back_populates="person_rel")
    things = relationship("Thing", back_populates="owner_rel")

    def __init__(self, ssn, firstname, lastname, gender, age, **kw: Any):
        super().__init__(**kw)
        self.ssn = ssn
        self.firstname = firstname
        self.lastname = lastname
        self.gender = gender
        self.age = age

    def __repr__(self):
        return f"({self.ssn}), {self.firstname}, {self.lastname} ({self.gender}), {self.age}"


class Thing(Base):
    __tablename__ = "thing"

    tid = Column("tid", Integer, primary_key=True)
    description = Column("Description", String)
    owner = Column(Integer, ForeignKey("person.ssn"))

    owner_rel = relationship("Person", back_populates="things")

    def __init__(self, tid, description, owner, **kw: Any):
        super().__init__(**kw)
        self.tid = tid
        self.description = description
        self.owner = owner

    def __repr__(self):
        return f"({self.tid}) {self.description} owned by {self.owner}"


class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    expenses = relationship("Expense", back_populates="category_rel")


class Expense(Base):
    __tablename__ = "expense"

    tid = Column("tid", Integer, primary_key=True)
    item = Column("item", String)
    amount = Column("amount", Integer)
    date = Column(DateTime, default=datetime.now())
    owner = Column(Integer, ForeignKey("person.ssn"))
    category_id = Column(Integer, ForeignKey("category.id"))

    person_rel = relationship("Person", back_populates="expenses")
    category_rel = relationship("Category", back_populates="expenses")

    def __init__(self, tid, item, amount, owner, **kw: Any):
        super().__init__(**kw)
        self.owner = owner
        self.tid = tid
        self.item = item
        self.amount = amount

    def __repr__(self):
        return f"({self.tid}, {self.item}, {self.amount} -- {self.owner})"



# DB SETUP
engine = create_engine("sqlite:///database.db", echo=True)

# WARNING: Drops tables each time for dev testing
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()



# Demo data test

# --- People ---
p0 = Person(3263345, "Bob", "Dillan", "M", 35)
p1 = Person(4363, "Lillian", "Dillan", "M", 35)
p2 = Person(545677, "Alan", "Smiles", "M", 25)
p3 = Person(755434, "Ava", "Smith", "F", 23)
p4 = Person(65432, "Maria", "Sim", "F", 43)

session.add_all([p0, p1, p2, p3, p4])
session.commit()

print(session.query(Person).all())

# --- Things ---
t1 = Thing(1, "Car", p0.ssn)
t2 = Thing(2, "Gaming PC", p1.ssn)
t3 = Thing(3, "20000 Student Debt", p2.ssn)
t4 = Thing(4, "Book", p3.ssn)
t5 = Thing(5, "A cat", p4.ssn)

session.add_all([t1, t2, t3, t4, t5])
session.commit()

# --- Show possessions ---
people = session.query(Person).all()
for p in people:
    print(f"{p.firstname} owns:")
    for thing in p.things:
        print(f"  - {thing.description}")


# Categories and Expenses

emergency = Category(name="Emergency")
indulgence = Category(name="Indulgence")
study = Category(name="Study")
session.add_all([emergency, indulgence, study])

e1 = Expense(101, "GPU", 500, p0.ssn)
e1.category_rel = emergency  # GPU broke LLLLL
e2 = Expense(134, "Car Window Repair", 230, p3.ssn)
e2.category_rel = emergency
e3 = Expense(144, "Book", 50, p2.ssn)
e3.category_rel = indulgence

session.add_all([e1, e2, e3])
session.commit()

# Queries

info_on_all = session.query(Person, Thing, Expense).all()
print(info_on_all)

ssn_item_expense = session.query(Expense).join(Person, Expense.owner == Person.ssn).all()
for expense in ssn_item_expense:
    print(expense, expense.amount, expense.owner, expense.item)

# Totals per person

totals = (
    session.query(Person.firstname, func.sum(Expense.amount))
    .join(Expense, Expense.owner == Person.ssn)
    .group_by(Person.firstname)
    .all()
)
for name, total in totals:
    print(f"{name} spent ${total}")

# Totals per category
category_totals = (
    session.query(Category.name, func.sum(Expense.amount))
    .join(Expense)
    .group_by(Category.name)
    .all()
)
for category, total in category_totals:
    print(f"{category} spent ${total}")
