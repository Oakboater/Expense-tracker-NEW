from sqlalchemy import create_engine, text
from sqlalchemy.dialects.oracle.dictionary import all_tables

engine = create_engine('sqlite:///:memory:', echo=True)

with engine.connect() as conn:
    conn.execute(text("CREATE TABLE table_example (x int, y int)"))

    conn.execute(
        text("INSERT INTO table_example (x, y) VALUES (:x, :y)"),
    [{"x": 1, "y": 1}, {"x": 3, "y": 4}],
    )

    conn.commit()
All_TABLE = SELECT
print(ALL_TABLE)
if "x" in ALL_TABLE > 3:
    print("X is more then 0")



