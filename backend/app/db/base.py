"""Declarative base shared by every ORM model."""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """All models inherit from this so Alembic/metadata can discover them."""
