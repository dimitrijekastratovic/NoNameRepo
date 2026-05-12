from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter()
CONTENT_DIR = Path(__file__).parent.parent.parent / "content"
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

@router.get("/topics")
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

@router.get("/topics/{topic}/{article}")
def get_article(topic: str, article: str):
    article_path = CONTENT_DIR / topic / f"{article}.md"
    if not article_path.exists():
        raise HTTPException(status_code=404, detail="Article not found")
    content = article_path.read_text(encoding="utf-8")
    return {"content": content}