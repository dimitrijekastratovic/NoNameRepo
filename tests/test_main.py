from fastapi.testclient import TestClient
from app.main import app, questions

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_questions():
    response = client.get("/questions")
    response = response.json()

    i = 0
    for question in questions:
        assert response["questions"][i]["question"] == question["question"]
        i += 1

def test_answers():
    response1 = client.post("/questions/0/answer", json={"answer": "Yes"})
    response1 = response1.json()
    assert response1["correct"]

    response2 = client.post("/questions/1/answer", json={"answer": "Yes"})
    response2 = response2.json()
    assert not response2["correct"]

    response3 = client.post("/questions/10/answer", json={"answer": "Yes"})
    assert response3.status_code == 404
