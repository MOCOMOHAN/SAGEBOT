import { Subject, Task, StudyLog, DayProgress, StreakState, RewardItem } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-calc', name: 'Advanced Calculus', color: '#3b82f6', icon: '📐', targetHoursPerWeek: 10 },
  { id: 'sub-chem', name: 'Organic Chemistry', color: '#10b981', icon: '🧪', targetHoursPerWeek: 8 },
  { id: 'sub-econ', name: 'Macroeconomics', color: '#f97316', icon: '📊', targetHoursPerWeek: 6 },
  { id: 'sub-phys', name: 'Quantum Physics', color: '#8b5cf6', icon: '⚛️', targetHoursPerWeek: 8 },
  { id: 'sub-hist', name: 'World History', color: '#ec4899', icon: '📜', targetHoursPerWeek: 4 },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    subjectId: 'sub-calc',
    title: 'Multivariable Integration & Green\'s Theorem',
    description: 'Solve problem set 4 and write down notes on flux integrals.',
    estimatedMinutes: 60,
    timeSpentSeconds: 8100, // 2h 15m
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    subjectId: 'sub-chem',
    title: 'SN1 vs SN2 Reaction Mechanisms Review',
    description: 'Study reaction stereochemistry and nucleophilic substitution kinetics.',
    estimatedMinutes: 45,
    timeSpentSeconds: 0,
    completed: false,
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    subjectId: 'sub-econ',
    title: 'IS-LM Model Equilibrium Analysis',
    description: 'Complete practice exam equations on fiscal and monetary policy shifts.',
    estimatedMinutes: 45,
    timeSpentSeconds: 2700, // 45m
    completed: true,
    completedAt: new Date().toISOString(),
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'task-4',
    subjectId: 'sub-phys',
    title: 'Schrödinger Wave Equation in 1D Box',
    description: 'Derive wave functions and energy eigenstates for particle barriers.',
    estimatedMinutes: 50,
    timeSpentSeconds: 1500, // 25m
    completed: false,
    priority: 'high',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rw-badge-focus',
    title: 'Hyperfocus Master Badge',
    description: 'Display an exclusive holographic focus crown in your student card.',
    category: 'badge',
    cost: 150,
    icon: '👑',
    unlocked: true,
  },
  {
    id: 'rw-streak-freeze',
    title: 'Emergency Streak Shield',
    description: 'Safeguard your streak even if you miss study goals for a whole day.',
    category: 'booster',
    cost: 200,
    icon: '🛡️',
    unlocked: false,
    effect: '+1 Streak Freeze',
  },
  {
    id: 'rw-soundscape-rain',
    title: 'Binaural Deep Rain Soundscape',
    description: 'Unlock calming lo-fi rain and 40Hz alpha waves for deep focus.',
    category: 'soundscape',
    cost: 250,
    icon: '🌧️',
    unlocked: true,
  },
  {
    id: 'rw-booster-2x',
    title: '2x Double Credit Elixir',
    description: 'Earn 2x currency on all completed focus sessions for the next 24 hours.',
    category: 'booster',
    cost: 300,
    icon: '🧪',
    unlocked: false,
  },
  {
    id: 'rw-badge-olympian',
    title: 'Academic Olympian Crest',
    description: 'Gold level prestige symbol showing 50+ total hours studied.',
    category: 'badge',
    cost: 500,
    icon: '🏅',
    unlocked: false,
  },
  {
    id: 'rw-soundscape-cafe',
    title: 'Midnight Library Atmosphere',
    description: 'Cozy fireplace crackle, soft page turns, and ambient jazz.',
    category: 'soundscape',
    cost: 220,
    icon: '☕',
    unlocked: false,
  },
];

// Helper to generate last 7 days of realistic logs for the current week
export function generateInitialStudyLogs(): StudyLog[] {
  const logs: StudyLog[] = [];
  const now = new Date();
  
  // Seed past 7 days
  const dailyDistribution = [
    { dayOffset: 6, subId: 'sub-calc', mins: 120 },
    { dayOffset: 6, subId: 'sub-econ', mins: 45 },
    { dayOffset: 5, subId: 'sub-chem', mins: 90 },
    { dayOffset: 5, subId: 'sub-phys', mins: 75 },
    { dayOffset: 4, subId: 'sub-calc', mins: 80 },
    { dayOffset: 4, subId: 'sub-econ', mins: 60 },
    { dayOffset: 3, subId: 'sub-phys', mins: 110 },
    { dayOffset: 3, subId: 'sub-hist', mins: 45 },
    { dayOffset: 2, subId: 'sub-calc', mins: 95 },
    { dayOffset: 2, subId: 'sub-chem', mins: 50 },
    { dayOffset: 1, subId: 'sub-econ', mins: 45 },
    { dayOffset: 0, subId: 'sub-calc', mins: 135 },
    { dayOffset: 0, subId: 'sub-econ', mins: 45 },
    { dayOffset: 0, subId: 'sub-phys', mins: 25 },
  ];

  dailyDistribution.forEach((item, index) => {
    const logDate = new Date(now);
    logDate.setDate(now.getDate() - item.dayOffset);
    const dateStr = logDate.toISOString().split('T')[0];

    logs.push({
      id: `log-seed-${index}`,
      subjectId: item.subId,
      date: dateStr,
      durationSeconds: item.mins * 60,
      timestamp: logDate.toISOString(),
    });
  });

  return logs;
}

export function loadStoredData<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

export function saveStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// Calculate streak updates
export function calculateStreakUpdate(
  currentStreakState: StreakState,
  minutesStudiedToday: number,
  tasksDoneToday: number
): { streakState: StreakState; earnedNewStreak: boolean; earnedCredits: number } {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDate = currentStreakState.lastStudiedDate;
  
  let newStreak = currentStreakState.currentStreak;
  let earnedNewStreak = false;
  let earnedCredits = 0;

  // If already studied today and incrementing
  if (lastDate !== todayStr && (minutesStudiedToday >= 15 || tasksDoneToday >= 1)) {
    // Check if yesterday or first time
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      newStreak += 1;
    } else if (!lastDate) {
      newStreak = 1;
    } else {
      // missed a day, check if freeze available
      if (currentStreakState.freezeCount > 0) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }
    earnedNewStreak = true;
    earnedCredits += 50; // Daily streak bonus
  }

  const updatedState: StreakState = {
    ...currentStreakState,
    currentStreak: newStreak,
    bestStreak: Math.max(newStreak, currentStreakState.bestStreak),
    lastStudiedDate: todayStr,
    credits: currentStreakState.credits + earnedCredits,
  };

  return { streakState: updatedState, earnedNewStreak, earnedCredits };
}
