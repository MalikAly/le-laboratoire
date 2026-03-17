from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ObjectiveCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ObjectiveUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ObjectiveRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    name: str
    description: Optional[str]
    created_at: datetime
