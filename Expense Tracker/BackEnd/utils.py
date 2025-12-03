from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import Expense, Income


def get_sort_options(sort: str):
    options = {
        "date_desc": Expense.date.desc(),
        "date_asc": Expense.date.asc(),
        "cost_desc": Expense.cost.desc(),
        "cost_asc": Expense.cost.asc()
    }
    return options.get(sort, Expense.date.desc())


def get_financial_summary(db: Session, owner_id: int, days: int = 30):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    # Total expenses
    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.cost), 0))
        .filter(
            Expense.owner == owner_id,
            Expense.date >= start_date,
            Expense.date <= end_date,
        )
        .scalar()
        or 0
    )

    # Total income
    total_income = (
        db.query(func.coalesce(func.sum(Income.amount), 0))
        .filter(
            Income.owner == owner_id,
            Income.date >= start_date,
            Income.date <= end_date,
        )
        .scalar()
        or 0
    )

    return {
        "days": days,
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "net": float(total_income - total_expenses)
    }