from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# Pydantic Schemas for Request/Response validation

class UserBase(BaseModel):
    name: str
    mail_id: EmailStr
    age: Optional[int] = 20
    student_education: Optional[str] = "Undergraduate"
    domain_of_studying: Optional[str] = "Computer Science & Mathematics"
    profile_picture: Optional[str] = "https://api.dicebear.com/7.x/bottts/svg?seed=student"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    student_education: Optional[str] = None
    domain_of_studying: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponse(UserBase):
    id: str
    streak_count: int = 0
    credits_value: int = 100
    best_streak: int = 0
    freeze_count: int = 1
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class OAuthLoginRequest(BaseModel):
    provider: str # 'google' | 'github'
    code: Optional[str] = None
    access_token: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    avatar_url: Optional[str] = None

class SubjectModel(BaseModel):
    id: str
    name: str
    color: str = "#3b82f6"
    icon: str = "📚"
    target_hours_per_week: int = 5
    category: Optional[str] = "Core Academic"

class TaskModel(BaseModel):
    id: str
    subject_id: str
    title: str
    description: Optional[str] = None
    estimated_minutes: int = 30
    time_spent_seconds: int = 0
    priority: str = "medium"
    completed: bool = False
    completed_at: Optional[datetime] = None
    due_date: Optional[date] = None

class StudyLogModel(BaseModel):
    id: str
    subject_id: str
    date: str
    duration_seconds: int
    timestamp: str

class DailyGoalModel(BaseModel):
    date: str
    target_minutes: int = 60
    achieved_minutes: int = 0
    goal_achieved: bool = False
    tasks_completed_count: int = 0
    reflection_note: Optional[str] = None

class SkillTreeNodeModel(BaseModel):
    id: str
    subject_id: str
    topic_name: str
    category: Optional[str] = None
    mastery_percentage: int = 0
    status: str = "locked" # 'locked', 'in_progress', 'mastered'
    tasks_covered: List[str] = []

class FlashcardModel(BaseModel):
    id: str
    subject_id: str
    topic: str
    front_prompt: str
    back_solution: str
    mermaid_diagram: Optional[str] = None
    mastery_level: str = "learning"
    repetition_interval_days: int = 1
    next_review_date: Optional[str] = None

class MindMapGenerateRequest(BaseModel):
    topic: str
    subject_name: Optional[str] = None
    depth: Optional[str] = "comprehensive" # quick, comprehensive, exam_review
    past_tasks: Optional[List[str]] = []

class MindMapResponse(BaseModel):
    topic: str
    mermaid_code: str
    summary: str
    key_takeaways: List[str]

class FlashcardDeckGenerateRequest(BaseModel):
    topic: str
    subject_name: Optional[str] = None
    count: Optional[int] = 4
    include_diagrams: bool = True
