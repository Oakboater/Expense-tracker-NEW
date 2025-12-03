from datetime import datetime
from sqlalchemy import create_engine, ForeignKey, Column, Integer, String, CHAR, DateTime, Float, UniqueConstraint, Boolean
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from werkzeug.security import generate_password_hash, check_password_hash


# SETUP
Base = declarative_base()


# Models
class Person(Base):
    __tablename__ = "person"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    profile_emoji = Column(String, default="👤")
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)

    expenses = relationship("Expense", back_populates="person_rel")
    income_rel = relationship("Income", back_populates="owner_rel")
    budget_rel = relationship("Budget", back_populates="owner_rel")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str):
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"Person(id={self.id}, username={self.username})"


class Category(Base):
    __tablename__ = "category"
    __table_args__ = (
        UniqueConstraint("name", "owner", name="uix_user_category"),
    )

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    owner = Column(Integer, ForeignKey("person.id"))
    expenses = relationship("Expense", back_populates="category_rel")


class Expense(Base):
    __tablename__ = "expense"

    id = Column(Integer, primary_key=True, autoincrement=True)
    item = Column(String, nullable=False)
    cost = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.now)
    owner = Column(Integer, ForeignKey("person.id"))
    category_id = Column(Integer, ForeignKey("category.id"))

    person_rel = relationship("Person", back_populates="expenses")
    category_rel = relationship("Category", back_populates="expenses")

    def __repr__(self):
        return f"Expense(id={self.id}, item={self.item}, cost={self.cost}, owner={self.owner})"


class Income(Base):
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    source = Column(String(100), nullable=False)
    date = Column(DateTime, default=datetime.now)
    owner = Column(Integer, ForeignKey("person.id"), nullable=False)

    owner_rel = relationship("Person", back_populates="income_rel")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    limit = Column(Float, nullable=False)
    period = Column(String(20), default="monthly")
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    owner = Column(Integer, ForeignKey("person.id"), nullable=False)

    owner_rel = relationship("Person", back_populates="budget_rel")


# Database setup
engine = create_engine("sqlite:///database.db", echo=False)
Session = sessionmaker(bind=engine)
session = Session()

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)