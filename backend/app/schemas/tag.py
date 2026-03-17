from typing import Optional

from pydantic import BaseModel, ConfigDict


class TagCreate(BaseModel):
    name: str
    color: str


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    color: str
    project_id: int
