from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, TagUpdate, TagRead
from app.services.project import get_project

router = APIRouter(tags=["tags"])


@router.get("", response_model=list[TagRead])
async def list_tags(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Tag]:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    result = await db.execute(
        select(Tag).where(Tag.project_id == project_id).order_by(Tag.name)
    )
    return list(result.scalars().all())


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    project_id: int,
    body: TagCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Tag:
    project = await get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    tag = Tag(project_id=project_id, name=body.name, color=body.color)
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return tag


@router.patch("/{tag_id}", response_model=TagRead)
async def update_tag(
    project_id: int,
    tag_id: int,
    body: TagUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> Tag:
    result = await db.execute(
        select(Tag).where(Tag.id == tag_id, Tag.project_id == project_id)
    )
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    updates = body.model_dump(exclude_unset=True)
    for key, value in updates.items():
        setattr(tag, key, value)

    await db.commit()
    await db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    project_id: int,
    tag_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> None:
    result = await db.execute(
        select(Tag).where(Tag.id == tag_id, Tag.project_id == project_id)
    )
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    await db.delete(tag)
    await db.commit()
