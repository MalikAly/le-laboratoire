import os
import shutil
import uuid
from pathlib import Path

import aiofiles
from fastapi import UploadFile

from app.config import settings

UPLOAD_DIR = Path(settings.UPLOAD_DIR)


async def save_upload(task_id: int, file: UploadFile) -> tuple[str, int]:
    task_dir = UPLOAD_DIR / str(task_id)
    task_dir.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename).suffix if file.filename else ""
    unique_name = f"{uuid.uuid4().hex}{extension}"
    dest_path = task_dir / unique_name

    size = 0
    async with aiofiles.open(dest_path, "wb") as out_file:
        while True:
            chunk = await file.read(1024 * 64)
            if not chunk:
                break
            await out_file.write(chunk)
            size += len(chunk)

    relative_path = str(Path(str(task_id)) / unique_name)
    return relative_path, size


async def delete_task_files(task_id: int) -> None:
    task_dir = UPLOAD_DIR / str(task_id)
    if task_dir.exists():
        shutil.rmtree(task_dir)


def get_file_path(relative_path: str) -> str:
    return str(UPLOAD_DIR / relative_path)
