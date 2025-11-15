from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Person schema
class PersonCreate(BaseModel):
    firstname: str
    lastname: str
    gender: str
    age: int
    password: str


# Expense schema

class ExpenseCreate(BaseModel):
    item: str
    cost: float
    owner: int
    category: str
    date: Optional[datetime] = None


# Response Models

class ExpenseOut(BaseModel):
    item: str
    cost: float
    date: datetime
    category: Optional[str]

class Login(BaseModel):
    ssn: int
    password: str


# HELLOO MY FRIENDS!



