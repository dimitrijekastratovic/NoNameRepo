from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_get_topics_returns_valid_structure():
    response = client.get("/topics")
    assert response.status_code == 200
    data = response.json()
    assert "topics" in data
    assert isinstance(data["topics"], list)
    for topic in data["topics"]:
        assert "topic" in topic
        assert "articles" in topic
        assert isinstance(topic["articles"], list)
    
def test_get_article_returns_valid_structure():
    #TODO - Introduce test fixtures to create test content before running tests
    response = client.get("/topics/data-structures/arrays")
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert isinstance(data["content"], str)

def test_get_article_returns_404_when_not_found():
    response = client.get("/topics/data-structures/nonexistent-article")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert data["detail"] == "Article not found"