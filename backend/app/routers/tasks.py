from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.objective import Objective
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskRead, TaskMove, TaskTagsUpdate
from app.services import task as task_service

# Router for collection operations scoped under an objective
collection_router = APIRouter(tags=["tasks"])

# Router for individual task operations
item_router = APIRouter(tags=["tasks"])


@collection_router.get("", response_model=list[TaskRead])
async def list_tasks(
    objective_id: int,
    tag_id: Optional[int] = None,
    assignee_id: Optional[int] = None,
    column_id: Optional[int] = None,
    due_before: Optional[date] = None,
    due_after: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    result = await db.execute(select(Objective).where(Objective.id == objective_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Objective not found")

    return await task_service.get_tasks(
        db,
        objective_id=objective_id,
        tag_id=tag_id,
        assignee_id=assignee_id,
        column_id=column_id,
        due_before=due_before,
        due_after=due_after,
    )


@collection_router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    objective_id: int,
    body: TaskCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Objective).where(Objective.id == objective_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Objective not found")

    return await task_service.create_task(
        db,
        objective_id=objective_id,
        column_id=body.column_id,
        title=body.title,
        description=body.description,
        due_date=body.due_date,
        assignee_id=body.assignee_id,
    )


@item_router.get("/{task_id}", response_model=TaskRead)
async def get_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    task = await task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@item_router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: int,
    body: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    updates = body.model_dump(exclude_unset=True)
    task = await task_service.update_task(db, task_id, **updates)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@item_router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    task = await task_service.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    await task_service.delete_task(db, task_id)


@item_router.put("/{task_id}/move", response_model=TaskRead)
async def move_task(
    task_id: int,
    body: TaskMove,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    task = await task_service.move_task(db, task_id, body.column_id, body.position)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task


@item_router.put("/{task_id}/tags", response_model=TaskRead)
async def set_tags(
    task_id: int,
    body: TaskTagsUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    task = await task_service.set_task_tags(db, task_id, body.tag_ids)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
