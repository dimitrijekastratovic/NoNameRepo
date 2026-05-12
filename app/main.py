from fastapi import FastAPI
from .routers.content import router
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


app = FastAPI()
app.include_router(router)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return FileResponse("app/static/index.html")