from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.objective import Objective
from app.models.user import User
from app.schemas.objective import ObjectiveCreate, ObjectiveUpdate, ObjectiveRead
from app.services.project import get_project

router = APIRouter(tags=["objectives"])


@router.get("", response_model=list[ObjectiveRead])
async def list_objectives(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Objective]:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    result = await db.execute(
        select(Objective)
        .where(Objective.project_id == project_id)
        .order_by(Objective.created_at)
    )
    return list(result.scalars().all())


@router.post("", response_model=ObjectiveRead, status_code=status.HTTP_201_CREATED)
async def create_objective(
    project_id: int,
    body: ObjectiveCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Objective:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    objective = Objective(
        project_id=project_id,
        name=body.name,
        description=body.description,
    )
    db.add(objective)
    await db.commit()
    await db.refresh(objective)
    return objective


@router.patch("/{obj_id}", response_model=ObjectiveRead)
async def update_objective(
    project_id: int,
    obj_id: int,
    body: ObjectiveUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Objective:
    result = await db.execute(
        select(Objective).where(
            Objective.id == obj_id,
            Objective.project_id == project_id,
        )
    )
    objective = result.scalar_one_or_none()
    if not objective:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Objective not found")

    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(objective, key, value)

    await db.commit()
    await db.refresh(objective)
    return objective


@router.delete("/{obj_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_objective(
    project_id: int,
    obj_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Objective).where(
            Objective.id == obj_id,
            Objective.project_id == project_id,
        )
    )
    objective = result.scalar_one_or_none()
    if not objective:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Objective not found")
    await db.delete(objective)
    await db.commit()
