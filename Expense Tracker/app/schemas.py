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
    amount: int
    owner: int
    category_id: int
    date: Optional[datetime] = None




# HELLOO MY FRIENDS!



