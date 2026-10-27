from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.hcp import HCP
from app.models.user import User
from app.schemas.hcp import HCPCreate, HCPRead

router = APIRouter(prefix="/hcps", tags=["HCPs"])


@router.get("", response_model=list[HCPRead])
def list_hcps(
    q: str | None = Query(default=None, description="Search by name"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[HCP]:
    query = db.query(HCP)
    if q:
        query = query.filter(HCP.name.ilike(f"%{q}%"))
    return query.order_by(HCP.name).all()


@router.post("", response_model=HCPRead, status_code=201)
def create_hcp(
    payload: HCPCreate, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> HCP:
    hcp = HCP(**payload.model_dump())
    db.add(hcp)
    db.commit()
    db.refresh(hcp)
    return hcp
