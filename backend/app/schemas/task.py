from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.tag import TagRead
from app.schemas.user import UserRead


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    column_id: int
    due_date: Optional[date] = None
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[date] = None
    assignee_id: Optional[int] = None


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    objective_id: int
    column_id: int
    title: str
    description: Optional[str]
    due_date: Optional[date]
    assignee_id: Optional[int]
    position: int
    created_at: datetime
    updated_at: datetime
    tags: list[TagRead] = []
    assignee: Optional[UserRead] = None


class TaskMove(BaseModel):
    column_id: int
    position: int


class TaskTagsUpdate(BaseModel):
    tag_ids: list[int]
