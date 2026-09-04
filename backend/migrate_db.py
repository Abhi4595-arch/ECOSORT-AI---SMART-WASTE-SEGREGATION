from sqlalchemy import text

from backend.database import engine


# ============================================================
# DATABASE MIGRATION
# ============================================================

with engine.begin() as connection:

    # --------------------------------------------------------
    # Create users table
    # --------------------------------------------------------

    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                name VARCHAR NOT NULL,
                email VARCHAR NOT NULL UNIQUE,
                password_hash VARCHAR NOT NULL,
                created_at DATETIME
            )
            """
        )
    )

    # --------------------------------------------------------
    # Check existing scans columns
    # --------------------------------------------------------

    columns = connection.execute(
        text("PRAGMA table_info(scans)")
    ).fetchall()

    column_names = {
        column[1]
        for column in columns
    }

    # --------------------------------------------------------
    # Add explanation if missing
    # --------------------------------------------------------

    if "explanation" not in column_names:

        connection.execute(
            text(
                """
                ALTER TABLE scans
                ADD COLUMN explanation VARCHAR DEFAULT ''
                """
            )
        )

    # --------------------------------------------------------
    # Add user_id if missing
    # --------------------------------------------------------

    if "user_id" not in column_names:

        connection.execute(
            text(
                """
                ALTER TABLE scans
                ADD COLUMN user_id INTEGER
                """
            )
        )


print("Database migration complete")