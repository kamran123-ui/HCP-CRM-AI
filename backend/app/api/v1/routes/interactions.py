import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.interaction import InteractionCreate, InteractionRead, InteractionUpdate
from app.services import interaction_service
from app.services.interaction_service import InteractionNotFound

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.get("", response_model=list[InteractionRead])
def list_interactions(
    hcp_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list:
    return interaction_service.list_interactions(db, current_user.id, hcp_id)


@router.post("", response_model=InteractionRead, status_code=status.HTTP_201_CREATED)
def create_interaction(
    payload: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return interaction_service.create_interaction(db, current_user.id, payload)


@router.get("/{interaction_id}", response_model=InteractionRead)
def get_interaction(
    interaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return interaction_service.get_interaction(db, current_user.id, interaction_id)
    except InteractionNotFound as exc:
        raise HTTPException(status_code=404, detail="Interaction not found") from exc


@router.patch("/{interaction_id}", response_model=InteractionRead)
def update_interaction(
    interaction_id: uuid.UUID,
    payload: InteractionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return interaction_service.update_interaction(db, current_user.id, interaction_id, payload)
    except InteractionNotFound as exc:
        raise HTTPException(status_code=404, detail="Interaction not found") from exc


@router.delete("/{interaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interaction(
    interaction_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        interaction_service.delete_interaction(db, current_user.id, interaction_id)
    except InteractionNotFound as exc:
        raise HTTPException(status_code=404, detail="Interaction not found") from exc
