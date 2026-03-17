from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import Project
from app.models.project_column import ProjectColumn


async def get_projects(db: AsyncSession) -> list[Project]:
    result = await db.execute(select(Project).order_by(Project.id))
    return list(result.scalars().all())


async def get_project(db: AsyncSession, project_id: int) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    return result.scalar_one_or_none()


async def create_project(
    db: AsyncSession,
    name: str,
    description: str | None = None,
) -> Project:
    project = Project(name=name, description=description)
    db.add(project)
    await db.flush()

    default_columns = [
        ProjectColumn(project_id=project.id, name="À faire", position=0, color="#6366f1"),
        ProjectColumn(project_id=project.id, name="En cours", position=1, color="#f97316"),
        ProjectColumn(project_id=project.id, name="Terminé", position=2, color="#22c55e"),
    ]
    for col in default_columns:
        db.add(col)

    await db.commit()
    await db.refresh(project)
    return project


async def update_project(
    db: AsyncSession,
    project_id: int,
    **kwargs,
) -> Project | None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        return None
    for key, value in kwargs.items():
        if value is not None or key == "description":
            setattr(project, key, value)
    await db.commit()
    await db.refresh(project)
    return project


async def delete_project(db: AsyncSession, project_id: int) -> None:
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if project:
        await db.delete(project)
        await db.commit()
