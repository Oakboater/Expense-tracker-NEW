from app.database import Expense


def get_sort_options(sort: str):

    options = {
        "date_desc": Expense.date.desc(),
        "date_asc": Expense.date.asc(),
        "cost_desc": Expense.cost.desc(),
        "cost_asc": Expense.cost.asc()
    }
    return options.get(sort, Expense.date.desc())
