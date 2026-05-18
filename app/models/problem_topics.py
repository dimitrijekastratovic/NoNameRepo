from sqlmodel import SQLModel, Field

class ProblemTopic(SQLModel, table=True):
    problem_id: int = Field(foreign_key="problem.id", primary_key=True)
    topic_id: int = Field(foreign_key="topic.id", primary_key=True)