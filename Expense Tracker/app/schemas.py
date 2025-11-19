from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Generic, TypeVar
from typing import Optional

T = TypeVar('T')
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
    tid: int
    item: str
    cost: float
    date: datetime
    category: Optional[str]

class Login(BaseModel):
    ssn: int
    password: str

class Metadata(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    limit: int

class PaginatedResponse(BaseModel, Generic[T]):
    metadata: Metadata
    data: List[T]

# HELLOO MY FRIENDS!

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    ssn: Optional[int] = None

