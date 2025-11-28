from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Generic, TypeVar

T = TypeVar('T')


# Person schema

class PersonCreate(BaseModel):
    firstname: str
    lastname: str
    gender: str
    age: int
    password: str

class PersonUpdate(BaseModel):
    firstname: Optional[str]
    lastname: Optional[str]
    gender: Optional[str]
    age: Optional[int]
    password: Optional[str]


# Expense schema

class ExpenseCreate(BaseModel):
    item: str
    cost: float
    category: str
    date: Optional[datetime] = None

class IncomeCreate(BaseModel):
    amount: float
    source: str
    date: datetime | None = None


class IncomeOut(BaseModel):
    id: int
    amount: float
    source: str
    date: datetime

    class Config:
        orm_mode = True

class BudgetCreate(BaseModel):
    category: str
    limit: float
    period: str = "monthly"
    start_date: datetime | None = None
    end_date: datetime | None = None


class BudgetOut(BaseModel):
    id: int
    category: str
    limit: float
    period: str
    start_date: datetime | None
    end_date: datetime | None

    class Config:
        orm_mode = True




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


# Pagination Models

class Metadata(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    limit: int


class PaginatedResponse(BaseModel, Generic[T]):
    metadata: Metadata
    data: List[T]


# JWT Token Response

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: int


