from sqlalchemy import text
from backend.database import engine


with engine.connect() as c:

    c.execute(
        text(
            "ALTER TABLE scans "
            "ADD COLUMN explanation VARCHAR DEFAULT ''"
        )
    )

    c.commit()


print("Database migration complete")