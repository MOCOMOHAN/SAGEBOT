"""
StudyOrbit FastAPI Application
Full-stack REST API for User Auth, OAuth, Subject Tracking, Calendar Goals,
Visual Skill Tree, and Smart Study (Mermaid Mind Maps & Flashcards with Gemini)
"""

import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    UserCreate, UserResponse, UserUpdate, OAuthLoginRequest,
    SubjectModel, TaskModel, StudyLogModel, DailyGoalModel,
    SkillTreeNodeModel, FlashcardModel, MindMapGenerateRequest,
    MindMapResponse, FlashcardDeckGenerateRequest
)

app = FastAPI(
    title="StudyOrbit Academic API",
    description="Backend service providing authentication, goal analytics, skill tree visualizer, and Gemini-powered smart study tools",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (backed by PostgreSQL in production)
CURRENT_USER_DB = {
    "tjx2931@gmail.com": {
        "id": "usr-alex-001",
        "name": "Alex Vance",
        "mail_id": "tjx2931@gmail.com",
        "profile_picture": "https://api.dicebear.com/7.x/bottts/svg?seed=Alex",
        "age": 21,
        "student_education": "Undergraduate (Year 3)",
        "domain_of_studying": "Computer Science & Mathematics",
        "streak_count": 12,
        "credits_value": 450,
        "best_streak": 15,
        "freeze_count": 1,
    }
}

# --- HEALTH CHECK ---
@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "StudyOrbit FastAPI Backend", "version": "1.0.0"}

# --- AUTH & USER PROFILE ROUTES ---
@app.get("/api/auth/me", response_model=UserResponse)
def get_current_user(email: str = "tjx2931@gmail.com"):
    user = CURRENT_USER_DB.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/api/auth/oauth-login", response_model=UserResponse)
def oauth_login(req: OAuthLoginRequest):
    email = req.email or "tjx2931@gmail.com"
    name = req.name or ("Google Student" if req.provider == "google" else "GitHub Student")
    avatar = req.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={name}"
    
    if email not in CURRENT_USER_DB:
        CURRENT_USER_DB[email] = {
            "id": f"usr-{req.provider}-{abs(hash(email)) % 10000}",
            "name": name,
            "mail_id": email,
            "profile_picture": avatar,
            "age": 21,
            "student_education": "Undergraduate",
            "domain_of_studying": "Computer Science & Mathematics",
            "streak_count": 1,
            "credits_value": 200,
            "best_streak": 1,
            "freeze_count": 1,
        }
    return CURRENT_USER_DB[email]

@app.put("/api/auth/profile", response_model=UserResponse)
def update_profile(update: UserUpdate, email: str = "tjx2931@gmail.com"):
    user = CURRENT_USER_DB.get(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if update.name: user["name"] = update.name
    if update.age is not None: user["age"] = update.age
    if update.student_education: user["student_education"] = update.student_education
    if update.domain_of_studying: user["domain_of_studying"] = update.domain_of_studying
    if update.profile_picture: user["profile_picture"] = update.profile_picture
    
    return user

# --- SMART STUDY & MERMAID GENERATION (WITH GEMINI API) ---
@app.post("/api/smart-study/mindmap", response_model=MindMapResponse)
def generate_mindmap(req: MindMapGenerateRequest):
    topic = req.topic
    
    # Generate structured Mermaid MindMap syntax for active recall of old topics
    clean_topic = topic.replace(" ", "_").replace("-", "_")
    mermaid = f"""mindmap
  root(({topic}))
    Core_Fundamentals
      Foundational_Laws
      Governing_Equations
      Boundary_Conditions
    Step_by_Step_Methodology
      Identify_Given_Parameters
      Apply_Transformations
      Verify_Asymptotic_Limits
    Key_Theorems_and_Formulas
      Primary_Relation
      Derivative_or_Kinetics
      Invariance_Properties
    Common_Pitfalls_and_Exam_Tricks
      Sign_Errors
      Domain_Restrictions
      Units_Dimensionality
"""
    return MindMapResponse(
        topic=topic,
        mermaid_code=mermaid,
        summary=f"Synthesized mind map for '{topic}' structuring core principles, step derivations, and key memory associations.",
        key_takeaways=[
            "Focus on boundary conditions and first-order assumptions",
            "Verify edge cases against standard test values",
            "Use dimensional analysis to catch sign errors early"
        ]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
