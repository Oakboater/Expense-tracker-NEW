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
    age = Column('age', Integer)\
    

    def __init__(self, ssn, firstname, lastname, gender, age):
        self.ssn = ssn
        self.firstname = firstname
        self.lastname = lastname
        self.gender = gender
        self.age = age

    
    def __repr__(self):
        return f"({self.ssn}), {self.firstname}, {self.lastname} ({self.gender}), {self.age})"
    

engine = create_engine("sqlite:///:memory:", echo=True)

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

session.add_all([p1,p2,p3,p4])
session.commit

results = session.query(person).all()
print(results)
