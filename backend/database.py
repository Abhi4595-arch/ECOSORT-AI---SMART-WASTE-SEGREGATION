from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    DateTime
)

from sqlalchemy.orm import declarative_base, sessionmaker

from datetime import datetime


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

DATABASE_URL = "sqlite:///./eco_sort.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ============================================================
# SCAN MODEL
# ============================================================

class Scan(Base):

    __tablename__ = "scans"

    # --------------------------------------------------------
    # Scan ID
    # --------------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # --------------------------------------------------------
    # Waste category
    # --------------------------------------------------------

    category = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------------
    # AI confidence
    # --------------------------------------------------------

    confidence = Column(
        Float,
        nullable=False
    )

    # --------------------------------------------------------
    # Confidence status
    # --------------------------------------------------------

    confidence_status = Column(
        String,
        nullable=False,
        default="High Confidence"
    )

    # --------------------------------------------------------
    # Manual review flag
    # --------------------------------------------------------

    review_required = Column(
        Integer,
        default=0
    )

    # --------------------------------------------------------
    # Recommended waste bin
    # --------------------------------------------------------

    recommended_bin = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------------
    # Disposal guidance
    # --------------------------------------------------------

    disposal_guidance = Column(
        String,
        nullable=False
    )

    # --------------------------------------------------------
    # Explainable AI
    # --------------------------------------------------------

    explanation = Column(
        String,
        nullable=False,
        default=""
    )

    # --------------------------------------------------------
    # Hazardous warning
    # --------------------------------------------------------

    hazardous_warning = Column(
        Integer,
        default=0
    )

    # --------------------------------------------------------
    # Scan timestamp
    # --------------------------------------------------------

    timestamp = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(
    bind=engine
)


# ============================================================
# DATABASE SESSION
# ============================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()