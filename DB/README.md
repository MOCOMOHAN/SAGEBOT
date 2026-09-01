# StudyOrbit PostgreSQL Database Documentation

This directory contains the database design and schema migrations for the **StudyOrbit** full-stack academic study planner and assistant.

## Entities & Table Structures

### 1. `users`
- Stores authentication credentials, profile data, education level, domain of study, active streaks, and credits balance.
- **Fields**: `id`, `name`, `password_hash`, `mail_id`, `profile_picture`, `age`, `student_education`, `domain_of_studying`, `streak_count`, `credits_value`, `best_streak`, `freeze_count`, `oauth_provider`, `oauth_id`, `created_at`, `updated_at`.

### 2. `subjects`
- Tracks tracked courses (e.g. Advanced Calculus, Organic Chemistry, Computer Science).
- **Fields**: `id`, `user_id`, `name`, `color`, `icon`, `target_hours_per_week`, `category`.

### 3. `tasks`
- Homework, assignments, derivations, and practice problem sets.
- **Fields**: `id`, `user_id`, `subject_id`, `title`, `description`, `estimated_minutes`, `time_spent_seconds`, `priority`, `completed`, `completed_at`, `due_date`.

### 4. `study_logs`
- Granular timer sessions for analytics and daily goal computation.
- **Fields**: `id`, `user_id`, `subject_id`, `date`, `duration_seconds`, `timestamp`.

### 5. `daily_goals`
- Powering the **Calendar View**, recording daily target minutes, achieved minutes, goals achieved flag, and reflection notes.

### 6. `skill_tree_nodes`
- Storing the visual hierarchical skill tree: **User ➔ Subject ➔ Topic/Skill Covered** with prerequisite connections and mastery percentages.

### 7. `flashcards`
- Active recall flashcards with embedded **Mermaid.js** diagrams (reaction pathways, data structures, state charts) and spaced repetition schedules.

### 8. `mind_maps`
- Synthesized Mermaid mindmaps for reviewing old topics with AI generation.

### 9. `rewards`
- Badges, audio soundscapes, and streak shields unlockable with student study credits.

## Setup Instructions

To deploy to PostgreSQL:
```bash
psql -U postgres -d studyorbit_db -f /DB/schema.sql
```
