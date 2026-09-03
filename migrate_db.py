from sqlalchemy import text
from backend.database import engine


with engine.connect() as c:

    c.execute(
        text(
            "ALTER TABLE scans "
            "ADD COLUMN confidence_status VARCHAR DEFAULT 'High Confidence'"
        )
    )

    c.execute(
        text(
            "ALTER TABLE scans "
            "ADD COLUMN review_required INTEGER DEFAULT 0"
        )
    )

    c.commit()


print("Database migration complete")