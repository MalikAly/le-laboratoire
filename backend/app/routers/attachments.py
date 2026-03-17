import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.dependencies import get_db, get_current_user
from app.models.attachment import Attachment
from app.models.task import Task
from app.models.user import User
from app.schemas.attachment import AttachmentRead
from app.services.file import save_upload, delete_task_files, get_file_path

# Router for collection operations scoped under a task
collection_router = APIRouter(tags=["attachments"])

# Router for individual attachment operations
item_router = APIRouter(tags=["attachments"])


@collection_router.get("", response_model=list[AttachmentRead])
async def list_attachments(
    task_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[Attachment]:
    result = await db.execute(select(Task).where(Task.id == task_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    result = await db.execute(
        select(Attachment)
        .where(Attachment.task_id == task_id)
        .order_by(Attachment.created_at)
    )
    return list(result.scalars().all())


@collection_router.post("", response_model=AttachmentRead, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Attachment:
    result = await db.execute(select(Task).where(Task.id == task_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file.size and file.size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB} MB",
        )

    relative_path, file_size = await save_upload(task_id, file)

    attachment = Attachment(
        task_id=task_id,
        filename=file.filename or "upload",
        file_path=relative_path,
        file_size=file_size,
        uploaded_by=current_user.id,
    )
    db.add(attachment)
    await db.commit()
    await db.refresh(attachment)
    return attachment


@item_router.get("/{att_id}/download")
async def download_attachment(
    att_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Attachment).where(Attachment.id == att_id))
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")

    full_path = get_file_path(attachment.file_path)
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on disk",
        )

    return FileResponse(
        path=full_path,
        filename=attachment.filename,
        media_type="application/octet-stream",
    )


@item_router.delete("/{att_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment(
    att_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    result = await db.execute(select(Attachment).where(Attachment.id == att_id))
    attachment = result.scalar_one_or_none()
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    if attachment.uploaded_by != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete another user's attachment",
        )

    full_path = get_file_path(attachment.file_path)
    if os.path.exists(full_path):
        os.remove(full_path)

    await db.delete(attachment)
    await db.commit()
