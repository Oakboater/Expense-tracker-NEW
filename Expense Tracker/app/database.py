from datetime import datetime
from sqlalchemy import create_engine, ForeignKey, Column, Integer, String, CHAR, DateTime, Float
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from werkzeug.security import generate_password_hash, check_password_hash


# SETUP
Base = declarative_base()


# Models
class Person(Base):
    __tablename__ = "person"

    ssn = Column(Integer, primary_key=True, autoincrement=True)
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    gender = Column(CHAR, nullable=False)
    age = Column(Integer, nullable=False)
    password_hash = Column(String, nullable=False)


    expenses = relationship("Expense", back_populates="person_rel")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)


    def check_password(self, password: str):
        return check_password_hash(self.password_hash, password)


    def __repr__(self):
        return f"Person(ssn={self.ssn}, name={self.firstname} {self.lastname})"


class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    owner = Column(Integer, ForeignKey("person.ssn"))
    expenses = relationship("Expense", back_populates="category_rel")


class Expense(Base):
    __tablename__ = "expense"

    tid = Column(Integer, primary_key=True, autoincrement=True)
    item = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.now)
    owner = Column(Integer, ForeignKey("person.ssn"))
    category_id = Column(Integer, ForeignKey("category.id"))

    person_rel = relationship("Person", back_populates="expenses")
    category_rel = relationship("Category", back_populates="expenses")


    def __repr__(self):
        return f"Expense(tid={self.tid}, item={self.item}, cost={self.cost}, owner={self.owner})"
    




# Database setup

engine = create_engine("sqlite:///database.db", echo=False)  # Turn off echo in production
Session = sessionmaker(bind=engine)
session = Session()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)


