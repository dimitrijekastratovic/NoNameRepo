from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse


app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")

CONTENT_DIR = Path(__file__).parent.parent / "content"

TOPIC_ORDER = ["data-structures", "algorithms", "system-design"]

ARTICLE_ORDER = {
    "data-structures": [
        "arrays", "stacks", "queues", "linked-lists", "hash-maps",
        "trees", "heaps", "graphs", "tries",
    ],
    "algorithms": [
        "binary-search", "two-pointers", "sliding-window", "recursion",
        "divide-and-conquer", "sorting-algorithms", "breadth-first-search",
        "depth-first-search", "backtracking", "greedy-algorithms",
        "monotonic-stack", "union-find", "dijkstra", "dynamic-programming",
    ],
    "system-design": ["scalability"],
}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return FileResponse("app/static/index.html")

@app.get("/topics")
def get_topics():
    topics = []
    for topic in TOPIC_ORDER:
        topic_dir = CONTENT_DIR / topic
        if not topic_dir.is_dir():
            continue
        existing = {f.stem for f in topic_dir.iterdir() if f.is_file() and f.suffix == ".md"}
        articles = [a for a in ARTICLE_ORDER.get(topic, []) if a in existing]
        topics.append({"topic": topic, "articles": articles})
    return {"topics": topics}

@app.get("/topics/{topic}/{article}")
def get_article(topic: str, article: str):
    article_path = CONTENT_DIR / topic / f"{article}.md"
    if not article_path.exists():
        raise HTTPException(status_code=404, detail="Article not found")
    content = article_path.read_text(encoding="utf-8")
    return {"content": content}