from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task
from app.models.tag import Tag
from app.models.objective import Objective


def _task_with_relations():
    return (
        select(Task)
        .options(
            selectinload(Task.tags),
            selectinload(Task.assignee),
        )
    )


async def get_tasks(
    db: AsyncSession,
    objective_id: int,
    tag_id: int | None = None,
    assignee_id: int | None = None,
    column_id: int | None = None,
    due_before: date | None = None,
    due_after: date | None = None,
) -> list[Task]:
    stmt = _task_with_relations().where(Task.objective_id == objective_id)

    if tag_id is not None:
        stmt = stmt.where(Task.tags.any(Tag.id == tag_id))
    if assignee_id is not None:
        stmt = stmt.where(Task.assignee_id == assignee_id)
    if column_id is not None:
        stmt = stmt.where(Task.column_id == column_id)
    if due_before is not None:
        stmt = stmt.where(Task.due_date <= due_before)
    if due_after is not None:
        stmt = stmt.where(Task.due_date >= due_after)

    stmt = stmt.order_by(Task.position)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_tasks_by_project(
    db: AsyncSession,
    project_id: int,
    tag_id: int | None = None,
    assignee_id: int | None = None,
    column_id: int | None = None,
    due_before: date | None = None,
    due_after: date | None = None,
) -> list[Task]:
    stmt = (
        _task_with_relations()
        .join(Objective, Task.objective_id == Objective.id)
        .where(Objective.project_id == project_id)
    )

    if tag_id is not None:
        stmt = stmt.where(Task.tags.any(Tag.id == tag_id))
    if assignee_id is not None:
        stmt = stmt.where(Task.assignee_id == assignee_id)
    if column_id is not None:
        stmt = stmt.where(Task.column_id == column_id)
    if due_before is not None:
        stmt = stmt.where(Task.due_date <= due_before)
    if due_after is not None:
        stmt = stmt.where(Task.due_date >= due_after)

    stmt = stmt.order_by(Task.position)
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_task(db: AsyncSession, task_id: int) -> Task | None:
    stmt = _task_with_relations().where(Task.id == task_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_task(
    db: AsyncSession,
    objective_id: int,
    column_id: int,
    title: str,
    description: str | None = None,
    due_date: date | None = None,
    assignee_id: int | None = None,
) -> Task:
    task = Task(
        objective_id=objective_id,
        column_id=column_id,
        title=title,
        description=description,
        due_date=due_date,
        assignee_id=assignee_id,
    )
    db.add(task)
    await db.commit()

    stmt = _task_with_relations().where(Task.id == task.id)
    result = await db.execute(stmt)
    return result.scalar_one()


async def update_task(db: AsyncSession, task_id: int, **kwargs) -> Task | None:
    stmt = _task_with_relations().where(Task.id == task_id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    if not task:
        return None
    for key, value in kwargs.items():
        setattr(task, key, value)
    await db.commit()

    result = await db.execute(_task_with_relations().where(Task.id == task_id))
    return result.scalar_one_or_none()


async def move_task(
    db: AsyncSession,
    task_id: int,
    column_id: int,
    position: int,
) -> Task | None:
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if not task:
        return None
    task.column_id = column_id
    task.position = position
    await db.commit()

    stmt = _task_with_relations().where(Task.id == task_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def delete_task(db: AsyncSession, task_id: int) -> None:
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()
    if task:
        await db.delete(task)
        await db.commit()


async def set_task_tags(db: AsyncSession, task_id: int, tag_ids: list[int]) -> Task | None:
    stmt = _task_with_relations().where(Task.id == task_id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    if not task:
        return None

    tags_result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
    tags = list(tags_result.scalars().all())
    task.tags = tags

    await db.commit()

    result = await db.execute(_task_with_relations().where(Task.id == task_id))
    return result.scalar_one_or_none()
