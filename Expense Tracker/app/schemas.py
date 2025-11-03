from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Person schema
class PersonCreate(BaseModel):
    ssn: int
    firstname: str
    lastname: str
    gender: str
    age: int

# Expense schema

class ExpenseCreate(BaseModel):
    item: str
    amount: int
    owner: int
    category_id: int
    date: Optional[datetime] = None




# HELLOO MY FRIENDS!



