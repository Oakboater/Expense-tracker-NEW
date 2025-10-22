from datetime import datetime
from sqlalchemy import create_engine, ForeignKey, Column, Integer, String, CHAR, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from typing import Any

Base = declarative_base()


class Person(Base):
    __tablename__ = 'person'
    expenses = relationship("Expense", back_populates="person_rel")
    things = relationship("Thing", back_populates="owner_rel")
    ssn = Column('ssn', Integer, primary_key=True)
    firstname = Column('firstname', String)
    lastname = Column('lastname', String)
    gender = Column('gender', CHAR)
    age = Column('age', Integer)

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
    owner_rel = relationship("Person", back_populates="things")
    tid = Column("tid", Integer, primary_key=True)
    description = Column("Description", String)
    owner = Column(Integer, ForeignKey("person.ssn"))

    def __init__(self, tid, description, owner, **kw: Any):
        super().__init__(**kw)
        self.tid = tid
        self.description = description
        self.owner = owner

    def __repr__(self):
        return f"({self.tid}) {self.description} owned by {self.owner}"


engine = create_engine("sqlite:///database.db", echo=True)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

p0 = Person(3263345, "Bob", "Dillan", "M", 35)
session.add(p0)
session.commit()

p1 = Person(4363, "Lillian", "Dillan", "M", 35)
p2 = Person(545677, "Alan", "Smiles", "M", 25)
p3 = Person(755434, "Ava", "Smith", "F", 23)
p4 = Person(65432, "Maria", "sim", "F", 43)

session.add_all([p1, p2, p3, p4])
session.commit()

results = session.query(Person).all()
print(results)

t1 = Thing(1, "Car", p0.ssn)
t2 = Thing(2, "Gaming PC", p1.ssn)
t3 = Thing(3, "20000 Student Debt", p2.ssn)
t4 = Thing(4, "Book", p3.ssn)
t5 = Thing(5, "A cat", p4.ssn)

session.add_all([t1, t2, t3, t4, t5])
session.commit()

resultsthing = session.query(Thing, Person).filter(Thing.owner == Person.ssn).filter(Person.firstname == "Ava").all()
for r in resultsthing:
    print(r)

people = session.query(Person).all()
for p in people:
    print(f"{p.firstname} owns:")
    for thing in p.things:
        print(f"  - {thing.description}")


class Expense(Base):
    __tablename__ = 'expense'
    person_rel = relationship("Person", back_populates="expenses")
    tid = Column('tid', Integer, primary_key=True)
    item = Column("item", String)
    amount = Column('amount', Integer)
    date = Column(DateTime, default=datetime.now())
    owner = Column(Integer, ForeignKey("person.ssn"))

    def __init__(self, tid, item, amount, owner, **kw: Any):
        super().__init__(**kw)
        self.owner = owner
        self.tid = tid
        self.item = item
        self.amount = amount

    def __repr__(self):
        return f"({self.tid}, {self.item}, {self.amount} -- {self.owner})"


Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

e1 = Expense(101, "GPU", 500, p0.ssn)
e2 = Expense(134, "Car Window Repair", 230, p3.ssn)
e3 = Expense(144, "Book", 230, p2.ssn)

session.add_all([e1, e2, e3])
session.commit()

info_on_all = session.query(Person, Thing, Expense).all()
print(info_on_all)

ssn_item_expense = session.query(Expense).join(Person, Expense.owner == Person.ssn).all()
for expense in ssn_item_expense:
    print(expense, expense.amount, expense.owner, expense.item)
