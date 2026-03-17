from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.project_column import ProjectColumn
    from app.models.objective import Objective
    from app.models.tag import Tag


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    columns: Mapped[list["ProjectColumn"]] = relationship(
        "ProjectColumn",
        back_populates="project",
        order_by="ProjectColumn.position",
        cascade="all, delete-orphan",
    )
    objectives: Mapped[list["Objective"]] = relationship(
        "Objective",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        back_populates="project",
        cascade="all, delete-orphan",
    )
