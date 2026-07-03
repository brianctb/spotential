from sqlmodel import Session, create_engine, text
from sqlalchemy.sql.expression import UpdateBase
from models.business import Business
from models.census import CensusTract
import os
from dotenv import load_dotenv
from typing import cast

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL"])


def assign_tracts():
    with Session(engine) as session:
        statement = text(f"""
                         UPDATE {Business.__tablename__} b
                         SET tract_id = t.tract_id FROM {CensusTract.__tablename__} t
                         WHERE  ST_Contains(t.geom
                             , b.geom);
                         """)

        # cast is typing-only (no-op at runtime): tells pyright to treat this
        # TextClause as UpdateBase so exec()'s overload resolves to CursorResult,
        # which has .rowcount.
        result = session.exec(cast(UpdateBase, statement))
        rows_updated = result.rowcount
        session.commit()

        print(f"Tract assignment complete. Updated {rows_updated} businesses.")


if "__main__" == __name__:
    assign_tracts()
