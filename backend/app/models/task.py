from datetime import datetime, date
from typing import Optional, TYPE_CHECKING

from sqlalchemy import String, Text, Integer, Date, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.tag import task_tags

if TYPE_CHECKING:
    from app.models.objective import Objective
    from app.models.project_column import ProjectColumn
    from app.models.user import User
    from app.models.tag import Tag
    from app.models.comment import Comment
    from app.models.attachment import Attachment


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    objective_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("objectives.id", ondelete="CASCADE"),
        nullable=False,
    )
    column_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("project_columns.id", ondelete="RESTRICT"),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    assignee_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    objective: Mapped["Objective"] = relationship("Objective", back_populates="tasks")
    column: Mapped["ProjectColumn"] = relationship("ProjectColumn", back_populates="tasks")
    assignee: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="assigned_tasks",
        foreign_keys=[assignee_id],
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        secondary=task_tags,
        back_populates="tasks",
    )
    comments: Mapped[list["Comment"]] = relationship(
        "Comment",
        back_populates="task",
        cascade="all, delete-orphan",
    )
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment",
        back_populates="task",
        cascade="all, delete-orphan",
    )
