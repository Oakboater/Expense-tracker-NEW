from sqlalchemy import create_engine, text, ForeignKey, Column, Integer, String, CHAR
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.oracle.dictionary import all_tables
from sqlalchemy.engine import row

Base = declarative_base()


class person(Base):
    __tablename__ = 'person'

    ssn = Column('ssn', Integer, primary_key=True)
    firstname = Column('firstname', String)
    lastname = Column('lastname', String)
    gender = Column('gender', CHAR)
    age = Column('age', Integer)
    def __init__(self, ssn, firstname, lastname, gender, age):
                self.ssn = ssn
                self.firstname = firstname
                self.lastname = lastname
                self.gender = gender
                self.age = age

    def __repr__(self):
     return f"({self.ssn}), {self.firstname}, {self.lastname} ({self.gender}), {self.age})"


class Thing(Base):
    __tablename__ = "things"

    tid = Column("tid", Integer, primary_key=True)
    description = Column("Description", String)
    owner = Column(Integer, ForeignKey("person.ssn"))

    def __init__(self, tid, description, owner):
        self.tid = tid
        self.description = description
        self.owner = owner

    def __repr__(self):
        return f"({self.tid}) {self.description} owned by {self.owner}"


engine = create_engine("sqlite:///database.db", echo=True)

Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()

p0 = person(3263345, "Bob", "Dillian", "M", 35)

session.add(p0)

session.commit()

p1 = person(4363, "Hillian", "Dillian", "M", 35)
p2 = person(545677, "Alan", "Smiles", "M", 25)
p3 = person(755434, "Ava", "Smith", "F", 23)
p4 = person(65432, "Maria", "sim", "F", 43)

session.add_all([p1, p2, p3, p4])
session.commit()

results = session.query(person).all()
print(results)

t1 = Thing(1, "Car", p0.ssn)
t2 = Thing(2, "Gaming PC", p1.ssn)
t3 = Thing(3, "20000 Student Debt", p2.ssn)
t4 = Thing(4, "Book", p3.ssn)
t5 = Thing(5, "A cat", p4.ssn)

session.add_all([t1, t2, t3, t4, t5])
session.commit()

resultsthing = session.query(Thing, person).filter(Thing.owner == person.ssn).filter(person.firstname == "Ava").all()
for r in resultsthing:
    print(r)




class Expense(Base):
    __tablename__ = 'expense'
    tid = Column('tid', Integer, primary_key=True)
    item = Column("item", String)
    amount = Column('amount', Integer)
    owner = Column('name', Integer, ForeignKey("person.ssn"))
    def __init__(self, tid, item, amount, owner,):
        self.name = owner
        self.tid = tid
        self.item = item
        self.amount = amount
    def __repr__(self):
        return f"({self.tid}, {self.item}, {self.amount} -- {self.name})"

Base.metadata.create_all(bind=engine)






