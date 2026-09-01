export interface UserProfile {
  id: string;
  name: string;
  mailId: string;
  profilePicture: string;
  age: number;
  studentEducation: string; // e.g. "Undergraduate (Year 3)"
  domainOfStudying: string; // e.g. "Computer Science & Applied Mathematics"
  university?: string;
  bio?: string;
  friendCode?: string;
  streakCount: number;
  creditsValue: number;
  bestStreak: number;
  freezeCount: number;
  isLoggedIn: boolean;
  oauthProvider?: 'google' | 'github' | 'email';
  equippedBorder?: string; // e.g. 'golden-nebula', 'cyber-holo', 'emerald-scholar', 'flame-phoenix'
  equippedGlow?: string;   // e.g. 'cosmic-purple', 'solar-flare', 'cyan-pulse', 'emerald-zen'
  equippedTitle?: string;  // e.g. 'Quantum Pioneer', 'Master of Calculus'
  equippedBadge?: string;  // e.g. '👑', '⭐', '⚡'
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon: string;
  targetHoursPerWeek: number;
  category?: string;
  topics?: string[];
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
  topicTag?: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  timestamp: string;
  taskTitle?: string;
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

export interface DailyGoalRecord {
  date: string; // YYYY-MM-DD
  targetMinutes: number;
  achievedMinutes: number;
  goalAchieved: boolean;
  tasksCompletedCount: number;
  reflectionNote?: string;
}

export interface SkillTreeNode {
  id: string;
  subjectId: string;
  subjectName: string;
  topicName: string;
  category: string;
  masteryLevel: 'Novice' | 'Proficient' | 'Advanced' | 'Mastered';
  masteryPercentage: number; // 0 to 100
  tasksCovered: string[];
  prerequisites?: string[];
  status: 'locked' | 'in_progress' | 'mastered';
  formulasOrKeyNotes: string[];
}

export interface SmartFlashcard {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  frontQuestion: string;
  backExplanation: string;
  mermaidDiagram?: string;
  diagramType?: 'flowchart' | 'mindmap' | 'sequence' | 'state';
  masteryLevel: 'Learning' | 'Reviewing' | 'Mastered';
  repetitionIntervalDays: number;
  nextReviewDate: string;
  lastReviewedAt?: string;
}

export interface MindMapItem {
  id: string;
  topic: string;
  subjectId: string;
  subjectName: string;
  mermaidCode: string;
  summary: string;
  keyTakeaways: string[];
  createdAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  category: 'badge' | 'booster' | 'soundscape' | 'avatar_frame' | 'avatar_glow' | 'avatar_title' | 'avatar_icon';
  cost: number;
  icon: string;
  unlocked: boolean;
  effect?: string;
  aestheticType?: 'border' | 'glow' | 'title' | 'avatar' | 'badge';
  aestheticValue?: string;
  previewClass?: string;
}

export interface FriendUser {
  id: string;
  name: string;
  mailId?: string;
  avatar: string;
  education: string;
  domain: string;
  university?: string;
  streak: number;
  studyMinutesThisWeek: number;
  totalCredits: number;
  equippedBorder?: string; // e.g. 'golden-nebula', 'cyber-holo', 'emerald-scholar', 'flame-phoenix'
  equippedGlow?: string;   // e.g. 'cosmic-purple', 'solar-flare', 'cyan-pulse', 'emerald-zen'
  equippedTitle?: string;  // e.g. 'Quantum Pioneer', 'Master of Calculus'
  equippedBadge?: string;
  isFriend: boolean;
  status: 'studying' | 'online' | 'away' | 'offline';
  currentStudyingSubject?: string;
  activeTask?: string;
  lastActive: string;
  bio?: string;
  cheersReceived?: number;
  tasksCompletedWeek?: number;
}

export interface FriendRequest {
  id: string;
  fromUser: FriendUser;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  subject?: string;
  text: string;
  timestamp: string;
}

export interface YouTubeVideoSuggestion {
  id: string;
  title: string;
  channelName: string;
  duration: string;
  youtubeUrl: string;
  embedUrl?: string;
  searchQuery: string;
  recommendedReason: string;
  keyTopics: string[];
  badge?: string;
}

export interface SessionCompletionData {
  sessionId: string;
  durationMinutes: number;
  creditsEarned: number;
  subjectName: string;
  subjectColor: string;
  subjectIcon: string;
  taskTitle: string;
  taskDescription?: string;
  taskId?: string;
  isTaskCompleted?: boolean;
  previousStreak: number;
  newStreak: number;
  streakIncremented: boolean;
  todayGoalMinutes: number;
  todayAchievedMinutes: number;
  timestamp: string;
}
