from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.project_column import ProjectColumn
from app.models.user import User
from app.schemas.project_column import ColumnCreate, ColumnUpdate, ColumnRead, ColumnReorder
from app.services.project import get_project

router = APIRouter(tags=["columns"])


@router.get("", response_model=list[ColumnRead])
async def list_columns(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ProjectColumn]:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    result = await db.execute(
        select(ProjectColumn)
        .where(ProjectColumn.project_id == project_id)
        .order_by(ProjectColumn.position)
    )
    return list(result.scalars().all())


@router.post("", response_model=ColumnRead, status_code=status.HTTP_201_CREATED)
async def add_column(
    project_id: int,
    body: ColumnCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ProjectColumn:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    result = await db.execute(
        select(ProjectColumn)
        .where(ProjectColumn.project_id == project_id)
        .order_by(ProjectColumn.position.desc())
    )
    last = result.scalars().first()
    next_position = (last.position + 1) if last else 0

    column = ProjectColumn(
        project_id=project_id,
        name=body.name,
        color=body.color,
        position=next_position,
    )
    db.add(column)
    await db.commit()
    await db.refresh(column)
    return column


@router.patch("/{col_id}", response_model=ColumnRead)
async def update_column(
    project_id: int,
    col_id: int,
    body: ColumnUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> ProjectColumn:
    result = await db.execute(
        select(ProjectColumn).where(
            ProjectColumn.id == col_id,
            ProjectColumn.project_id == project_id,
        )
    )
    column = result.scalar_one_or_none()
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")

    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(column, key, value)

    await db.commit()
    await db.refresh(column)
    return column


@router.delete("/{col_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_column(
    project_id: int,
    col_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(ProjectColumn).where(
            ProjectColumn.id == col_id,
            ProjectColumn.project_id == project_id,
        )
    )
    column = result.scalar_one_or_none()
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    await db.delete(column)
    await db.commit()


@router.put("/reorder", response_model=list[ColumnRead])
async def reorder_columns(
    project_id: int,
    body: ColumnReorder,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[ProjectColumn]:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    result = await db.execute(
        select(ProjectColumn).where(ProjectColumn.project_id == project_id)
    )
    columns = {col.id: col for col in result.scalars().all()}

    for position, col_id in enumerate(body.ordered_ids):
        if col_id not in columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Column {col_id} does not belong to project {project_id}",
            )
        columns[col_id].position = position

    await db.commit()

    result = await db.execute(
        select(ProjectColumn)
        .where(ProjectColumn.project_id == project_id)
        .order_by(ProjectColumn.position)
    )
    return list(result.scalars().all())
