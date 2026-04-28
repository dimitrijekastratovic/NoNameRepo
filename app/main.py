from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

questions = [{"id": 0, "question": "Can a stack be implemented using a list?", "answer": "Yes"},
            {"id": 1, "question": "Is binary search possible on an unsorted array?", "answer": "No"},
            {"id": 2, "question": "Can a hash map have duplicate keys?", "answer": "No"}]

class AnswerSubmission(BaseModel):
    answer: str

# GET - health
@app.get("/health")
def get_health():
    return {"status": "ok"}

# GET - questions
@app.get("/questions")
def get_questions():
    return {"questions": questions}

# POST - questions/{id}/answer
@app.post("/questions/{id}/answer")
def post_answer(id: int, submission: AnswerSubmission):
    if(id < 0 or id >= len(questions)):
        raise HTTPException(status_code=404, detail="Question not found")
    
    if(questions[id]["answer"] == submission.answer):
        return {"correct": True}
    else:
        return {"correct": False}