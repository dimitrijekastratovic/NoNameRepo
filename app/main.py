from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")

CONTENT_DIR = Path(__file__).parent.parent / "content"

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return FileResponse("app/static/index.html")

@app.get("/topics")
def get_topics():
    topics = []
    for topic_dir in CONTENT_DIR.iterdir():
        topic = ""
        articles = []
        if topic_dir.is_dir():
            topic = topic_dir.name
        else:
            continue
        for article in topic_dir.iterdir():
            if article.is_file() and article.suffix == ".md":
                articles.append(article.stem)
        topics.append({"topic": topic, "articles": articles})
    return {"topics": topics}

@app.get("/topics/{topic}/{article}")
def get_article(topic: str, article: str):
    article_path = CONTENT_DIR / topic / f"{article}.md"
    if not article_path.exists():
        raise HTTPException(status_code=404, detail="Article not found")
    content = article_path.read_text(encoding="utf-8")
    return {"content": content}