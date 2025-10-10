from sqlalchemy import create_engine, text
from sqlalchemy.dialects.oracle.dictionary import all_tables
from sqlalchemy.engine import row

engine = create_engine('sqlite:///:memory:', echo=True)

with engine.connect() as conn:
    conn.execute(text("CREATE TABLE table_example (x, y)"))

    conn.execute(text("INSERT INTO table_example (x,y) VALUES (:x,:y)"),
                 [{"x": 4, "y": 5}, {"x": 6, "y": 7}],
                 )
    conn.commit()

    result = conn.execute(text("SELECT x, y from table_example WHERE y = :y"), {"y":7})
    for row in result:
        print(f"x: {row.x} and y: {row.y}")




