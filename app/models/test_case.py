from sqlmodel import SQLModel, Field
from typing import Optional

class TestCase(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    input: str
    expected_output: str
    problem_id: int = Field(foreign_key="problem.id")