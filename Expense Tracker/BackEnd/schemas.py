from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Generic, TypeVar

T = TypeVar('T')

# Person schema
class PersonCreate(BaseModel):
    username: str
    firstname: str
    lastname: str
    gender: str
    age: int
    password: str
    profile_emoji: Optional[str] = "👤"

class PersonUpdate(BaseModel):
    username: Optional[str]
    firstname: Optional[str]
    lastname: Optional[str]
    gender: Optional[str]
    age: Optional[int]
    password: Optional[str]
    profile_emoji: Optional[str]

class PersonOut(BaseModel):
    id: int
    username: str
    firstname: str
    lastname: str
    gender: str
    age: int
    profile_emoji: str
    created_at: datetime

    class Config:
        orm_mode = True

# Expense schema
class ExpenseCreate(BaseModel):
    item: str
    cost: float
    category: str
    date: Optional[datetime] = None

class ExpenseOut(BaseModel):
    id: int
    item: str
    cost: float
    date: datetime
    category: Optional[str]

    class Config:
        orm_mode = True

# Income schema
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

# Budget schema
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

# Report schema
class CategorySummary(BaseModel):
    category: str
    total: float

class MonthlySummary(BaseModel):
    month: int
    year: int
    total_expense: float
    by_category: List[CategorySummary]

# Response Models
class Login(BaseModel):
    username: str
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
    refresh_token: str
    token_type: str

class TokenData(BaseModel):
    sub: int