-- =========================================================================
-- StudyOrbit PostgreSQL Database Schema
-- Storing User Profiles, Education Domains, Subjects, Tasks, Study Logs,
-- Visual Skill Trees, Spaced Repetition Flashcards, and Mermaid Mind Maps
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
-- Stores student profiles, authentication credentials, academic background, streak count, and currency credits
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    mail_id VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
    age INTEGER CHECK (age >= 10 AND age <= 120),
    student_education VARCHAR(100) DEFAULT 'Undergraduate', -- e.g., High School, Undergraduate, Graduate, PhD, Self-Taught
    domain_of_studying VARCHAR(100) DEFAULT 'Computer Science & Mathematics', -- Academic major/specialization
    streak_count INTEGER DEFAULT 0 CHECK (streak_count >= 0),
    credits_value INTEGER DEFAULT 100 CHECK (credits_value >= 0),
    best_streak INTEGER DEFAULT 0,
    freeze_count INTEGER DEFAULT 1,
    oauth_provider VARCHAR(50), -- 'google', 'github', 'email'
    oauth_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUBJECTS TABLE
-- Tracks subjects enrolled/created by the student
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NOT NULL DEFAULT '#3b82f6',
    icon VARCHAR(10) NOT NULL DEFAULT '📚',
    target_hours_per_week INTEGER DEFAULT 5 CHECK (target_hours_per_week > 0),
    category VARCHAR(50) DEFAULT 'Core Academic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TASKS TABLE
-- Track planned and completed academic assignments, derivations, problem sets, and topics
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_minutes INTEGER DEFAULT 30 CHECK (estimated_minutes > 0),
    time_spent_seconds INTEGER DEFAULT 0 CHECK (time_spent_seconds >= 0),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STUDY_LOGS TABLE
-- Granular record of study sessions logged per subject and date for analytics & calendar views
CREATE TABLE IF NOT EXISTS study_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DAILY_GOALS TABLE
-- Tracks whether daily study targets/goals were achieved on particular dates for the Calendar View
CREATE TABLE IF NOT EXISTS daily_goals (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    target_minutes INTEGER DEFAULT 60,
    achieved_minutes INTEGER DEFAULT 0,
    goal_achieved BOOLEAN DEFAULT FALSE,
    tasks_completed_count INTEGER DEFAULT 0,
    reflection_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, date)
);

-- 6. SKILL_TREE_NODES TABLE
-- Stores hierarchical skill tree nodes linking User -> Subject -> Topics/Skills Covered
CREATE TABLE IF NOT EXISTS skill_tree_nodes (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_name VARCHAR(150) NOT NULL,
    category VARCHAR(80),
    mastery_percentage INTEGER DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
    status VARCHAR(30) DEFAULT 'locked' CHECK (status IN ('locked', 'in_progress', 'mastered')),
    prerequisite_node_id VARCHAR(50) REFERENCES skill_tree_nodes(id) ON DELETE SET NULL,
    tasks_covered_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. FLASHCARDS TABLE
-- Spaced repetition flashcards with Mermaid.js diagrams for remembering old topics
CREATE TABLE IF NOT EXISTS flashcards (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic VARCHAR(200) NOT NULL,
    front_prompt TEXT NOT NULL,
    back_solution TEXT NOT NULL,
    mermaid_diagram TEXT, -- Mermaid code (flowchart, sequenceDiagram, mindmap)
    mastery_level VARCHAR(30) DEFAULT 'learning' CHECK (mastery_level IN ('learning', 'reviewing', 'mastered')),
    repetition_interval_days INTEGER DEFAULT 1,
    ease_factor NUMERIC(3,2) DEFAULT 2.50,
    next_review_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MIND_MAPS TABLE
-- Mermaid.js mind maps generated for remembering and synthesizing subjects
CREATE TABLE IF NOT EXISTS mind_maps (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE SET NULL,
    topic VARCHAR(200) NOT NULL,
    mermaid_syntax TEXT NOT NULL, -- Mermaid mindmap / graph TD script
    summary_markdown TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. REWARDS TABLE
-- Badges, boosters, and audio soundscapes unlockable with student study credits
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(30) CHECK (category IN ('badge', 'booster', 'soundscape')),
    cost INTEGER NOT NULL CHECK (cost >= 0),
    icon VARCHAR(10) NOT NULL,
    unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE
);

-- =========================================================================
-- INDEXES FOR FAST QUERYING AND ANALYTICS
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_mail ON users(mail_id);
CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_subject ON tasks(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_study_logs_user_date ON study_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_date ON daily_goals(user_id, date);
CREATE INDEX IF NOT EXISTS idx_skill_tree_user_subject ON skill_tree_nodes(user_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_review ON flashcards(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_mind_maps_user ON mind_maps(user_id);

-- =========================================================================
-- INITIAL SEED MOCK DATA (Optional demonstration template)
-- =========================================================================
INSERT INTO users (id, name, password_hash, mail_id, profile_picture, age, student_education, domain_of_studying, streak_count, credits_value)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Alex Vance',
    '$2b$12$e8YqJ2mO4Kq9uEaK0l0V..dummy_hashed_password',
    'tjx2931@gmail.com',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
    21,
    'Undergraduate (Year 3)',
    'Computer Science & Applied Mathematics',
    12,
    450
) ON CONFLICT (mail_id) DO NOTHING;
