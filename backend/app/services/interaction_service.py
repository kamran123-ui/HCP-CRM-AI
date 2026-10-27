import uuid

from sqlalchemy.orm import Session

from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate, InteractionUpdate


class InteractionNotFound(Exception):
    pass


def create_interaction(db: Session, user_id: uuid.UUID, payload: InteractionCreate) -> Interaction:
    interaction = Interaction(user_id=user_id, **payload.model_dump())
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    return interaction


def list_interactions(db: Session, user_id: uuid.UUID, hcp_id: uuid.UUID | None = None) -> list[Interaction]:
    query = db.query(Interaction).filter(Interaction.user_id == user_id)
    if hcp_id:
        query = query.filter(Interaction.hcp_id == hcp_id)
    return query.order_by(Interaction.interaction_datetime.desc()).all()


def get_interaction(db: Session, user_id: uuid.UUID, interaction_id: uuid.UUID) -> Interaction:
    interaction = db.get(Interaction, interaction_id)
    if interaction is None or interaction.user_id != user_id:
        raise InteractionNotFound()
    return interaction


def update_interaction(
    db: Session, user_id: uuid.UUID, interaction_id: uuid.UUID, payload: InteractionUpdate
) -> Interaction:
    interaction = get_interaction(db, user_id, interaction_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(interaction, field, value)
    db.commit()
    db.refresh(interaction)
    return interaction


def delete_interaction(db: Session, user_id: uuid.UUID, interaction_id: uuid.UUID) -> None:
    interaction = get_interaction(db, user_id, interaction_id)
    db.delete(interaction)
    db.commit()
