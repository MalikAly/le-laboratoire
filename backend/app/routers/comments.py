from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user
from app.models.comment import Comment
from app.models.task import Task
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentUpdate, CommentRead

# Router for collection operations scoped under a task
collection_router = APIRouter(tags=["comments"])

# Router for individual comment operations
item_router = APIRouter(tags=["comments"])


def _comment_with_author():
    return select(Comment).options(selectinload(Comment.author))


@collection_router.get("", response_model=list[CommentRead])
async def list_comments(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Comment]:
    result = await db.execute(select(Task).where(Task.id == task_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    result = await db.execute(
        _comment_with_author()
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at)
    )
    return list(result.scalars().all())


@collection_router.post("", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def add_comment(
    task_id: int,
    body: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Comment:
    result = await db.execute(select(Task).where(Task.id == task_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    comment = Comment(task_id=task_id, author_id=current_user.id, content=body.content)
    db.add(comment)
    await db.commit()

    result = await db.execute(_comment_with_author().where(Comment.id == comment.id))
    return result.scalar_one()


@item_router.patch("/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: int,
    body: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Comment:
    result = await db.execute(
        _comment_with_author().where(Comment.id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot edit another user's comment",
        )

    comment.content = body.content
    await db.commit()

    result = await db.execute(_comment_with_author().where(Comment.id == comment_id))
    return result.scalar_one()


@item_router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's comment",
        )
    await db.delete(comment)
    await db.commit()
