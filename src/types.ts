export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  targetHoursPerWeek: number;
}

export interface Task {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  estimatedMinutes: number;
  timeSpentSeconds: number;
  completed: boolean;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  timestamp: string;
}

export interface DayProgress {
  date: string;
  dayName: string;
  totalMinutes: number;
  subjectMinutes: Record<string, number>;
}

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastStudiedDate: string;
  credits: number;
  totalStudyMinutes: number;
  totalTasksCompleted: number;
  freezeCount: number;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  category: 'badge' | 'booster' | 'soundscape';
  cost: number;
  icon: string;
  unlocked: boolean;
  effect?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'open';
  options?: string[]; // 4 options for MCQ
  correctAnswerIndex?: number; // 0-3 for MCQ
  modelAnswer: string;
  explanation: string;
  hint?: string;
  subjectName: string;
  topic?: string;
  difficulty?: 'foundational' | 'intermediate' | 'advanced';
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  scorePercentage: number; // 0 to 100
  grade: 'Excellent' | 'Good' | 'Needs Review' | 'Incorrect';
  feedback: string;
  keyStrengths?: string[];
  missedConcepts?: string[];
  modelExplanation: string;
  creditsAwarded: number;
}

export interface Flashcard {
  id: string;
  subjectId: string;
  subjectName: string;
  front: string; // Question or Concept
  back: string; // Concise explanation, formula, or steps
  hint?: string;
  tag?: string;
  mastered?: boolean;
}

export interface FlashcardDeck {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  subject?: string;
  text: string;
  timestamp: string;
  quizQuestion?: QuizQuestion;
  flashcards?: Flashcard[];
  evaluation?: AnswerEvaluation;
}
