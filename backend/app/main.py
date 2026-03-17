from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import AsyncSessionLocal
from app.routers import auth, users, projects, columns, objectives, tags, tasks, comments, attachments
from app.services.user import get_user_by_username, create_user


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with AsyncSessionLocal() as db:
        existing = await get_user_by_username(db, settings.ADMIN_USERNAME)
        if not existing:
            await create_user(
                db,
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                password=settings.ADMIN_PASSWORD,
                is_admin=True,
            )
    yield


app = FastAPI(
    title="Le Laboratoire - Gestion de Projets",
    lifespan=lifespan,
    redirect_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth
app.include_router(auth.router, prefix="/auth")

# Users
app.include_router(users.router, prefix="/users")

# Projects
app.include_router(projects.router, prefix="/projects")

# Columns scoped under project
app.include_router(
    columns.router,
    prefix="/projects/{project_id}/columns",
)

# Objectives scoped under project
app.include_router(
    objectives.router,
    prefix="/projects/{project_id}/objectives",
)

# Tags scoped under project
app.include_router(
    tags.router,
    prefix="/projects/{project_id}/tags",
)

# Tasks: collection operations scoped under objective
app.include_router(
    tasks.collection_router,
    prefix="/objectives/{objective_id}/tasks",
)

# Tasks: individual task operations
app.include_router(
    tasks.item_router,
    prefix="/tasks",
)

# Comments: collection operations scoped under task
app.include_router(
    comments.collection_router,
    prefix="/tasks/{task_id}/comments",
)

# Comments: individual comment operations
app.include_router(
    comments.item_router,
    prefix="/comments",
)

# Attachments: collection operations scoped under task
app.include_router(
    attachments.collection_router,
    prefix="/tasks/{task_id}/attachments",
)

# Attachments: individual attachment operations
app.include_router(
    attachments.item_router,
    prefix="/attachments",
)
