from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead
from app.schemas.task import TaskRead
from app.services.project import get_projects, get_project, create_project, update_project, delete_project
from app.services import task as task_service

router = APIRouter(tags=["projects"])


@router.get("", response_model=list[ProjectRead])
async def list_projects(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    return await get_projects(db)


@router.get("/{project_id}", response_model=ProjectRead)
async def read_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
async def create_new_project(
    body: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return await create_project(db, name=body.name, description=body.description)


@router.patch("/{project_id}", response_model=ProjectRead)
async def patch_project(
    project_id: int,
    body: ProjectUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    updates = body.model_dump(exclude_unset=True)
    project = await update_project(db, project_id, **updates)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    await delete_project(db, project_id)


@router.get("/{project_id}/tasks", response_model=list[TaskRead])
async def list_project_tasks(
    project_id: int,
    tag_id: Optional[int] = None,
    assignee_id: Optional[int] = None,
    column_id: Optional[int] = None,
    due_before: Optional[date] = None,
    due_after: Optional[date] = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return await task_service.get_tasks_by_project(
        db,
        project_id=project_id,
        tag_id=tag_id,
        assignee_id=assignee_id,
        column_id=column_id,
        due_before=due_before,
        due_after=due_after,
    )
