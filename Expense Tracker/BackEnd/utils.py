from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import Expense


def get_sort_options(sort: str):
    # Map sort keys to SQLAlchemy expressions
    options = {
        "date_desc": Expense.date.desc(),
        "date_asc": Expense.date.asc(),
        "cost_desc": Expense.cost.desc(),
        "cost_asc": Expense.cost.asc()
    }
    return options.get(sort, Expense.date.desc())


def get_financial_summary(db: Session, owner_ssn: int, days: int = 30):
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    # Total expenses (negative values)
    total_expenses = (
            db.query(func.coalesce(func.sum(Expense.cost), 0))
            .filter(
                Expense.owner == owner_ssn,
                Expense.date >= start_date,
                Expense.date <= end_date,
                Expense.cost < 0  # SQLAlchemy comparison — valid expression
            )
            .scalar()
            or 0
    )

    # Total income (positive values)
    total_income = (
            db.query(func.coalesce(func.sum(Expense.cost), 0))
            .filter(
                Expense.owner == owner_ssn,
                Expense.date >= start_date,
                Expense.date <= end_date,
                Expense.cost > 0  # SQLAlchemy comparison — valid expression
            )
            .scalar()
            or 0
    )

    # Ensure clean numeric output
    total_expenses = float(total_expenses)
    total_income = float(total_income)

    return {
        "days": days,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "net": float(total_income + total_expenses)
    }
