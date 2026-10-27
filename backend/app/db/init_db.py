"""
Creates all tables and (optionally) seeds sample data.

For a real production rollout, replace `create_all` with Alembic
migrations (`alembic upgrade head`) so schema changes are versioned.
This script is kept for fast local bootstrapping and CI test databases.
"""
from app.core.logging_config import get_logger
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.hcp import HCP
from app.models.interaction import Interaction
from app.models.user import User
from app.core.security import hash_password

logger = get_logger(__name__)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")


def seed_db() -> None:
    """Idempotent sample data for local development and demos."""
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            logger.info("Seed skipped - data already present.")
            return

        rep = User(
            email="rep@demo.io",
            full_name="Asha Verma",
            hashed_password=hash_password("Demo@1234"),
            role="field_rep",
        )
        db.add(rep)

        hcps = [
            HCP(name="Dr. Ritu Sharma", specialty="Oncology", institution="AIIMS Delhi", tier="A"),
            HCP(name="Dr. Karan Mehta", specialty="Cardiology", institution="Fortis Hospital", tier="B"),
            HCP(name="Dr. Neha Kapoor", specialty="Endocrinology", institution="Apollo Hospitals", tier="A"),
        ]
        db.add_all(hcps)
        db.commit()
        logger.info("Seed data inserted: 1 user, %d HCPs.", len(hcps))
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
    seed_db()
