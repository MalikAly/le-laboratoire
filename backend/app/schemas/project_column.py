from typing import Optional

from pydantic import BaseModel, ConfigDict


class ColumnCreate(BaseModel):
    name: str
    color: Optional[str] = None


class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class ColumnRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    name: str
    position: int
    color: Optional[str]


class ColumnReorder(BaseModel):
    ordered_ids: list[int]
