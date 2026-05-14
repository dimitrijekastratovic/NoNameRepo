from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .routers.content import router as content
from .routers.auth import router as auth

from sqlmodel import SQLModel
from .database import engine
from .models.user import User  # noqa: F401
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(content)
app.include_router(auth, prefix="/auth")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return FileResponse("app/static/index.html")

@app.get("/login")
def login():
    return FileResponse("app/static/login.html")

@app.get("/register")
def register():
    return FileResponse("app/static/register.html")