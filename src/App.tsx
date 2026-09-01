import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  Task,
  StudyLog,
  StreakState,
  RewardItem,
  UserProfile,
  DailyGoalRecord,
  SkillTreeNode,
  SmartFlashcard,
  MindMapItem,
  SessionCompletionData,
  FriendUser,
  FriendRequest,
} from './types';
import {
  INITIAL_USER_PROFILE,
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_REWARDS,
  INITIAL_DAILY_GOALS,
  INITIAL_SKILL_TREE,
  INITIAL_SMART_FLASHCARDS,
  INITIAL_MIND_MAPS,
  INITIAL_FRIENDS,
  INITIAL_CAMPUS_SUGGESTIONS,
  INITIAL_FRIEND_REQUESTS,
  generateInitialStudyLogs,
  loadStoredData,
  saveStoredData,
  calculateStreakUpdate,
} from './utils/storage';
import { playTaskCompleteSound, playTimerFinishSound, playClickSound } from './utils/audio';

import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksTimerView } from './components/TasksTimerView';
import { ProgressView } from './components/ProgressView';
import { AiChatAssistant } from './components/AiChatAssistant';
import { RewardsStore } from './components/RewardsStore';
import { CalendarView } from './components/CalendarView';
import { SkillTreeView } from './components/SkillTreeView';
import { SmartStudyView } from './components/SmartStudyView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { LogoutModal } from './components/LogoutModal';
import { SessionCompletionModal } from './components/SessionCompletionModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [smartStudyInitialTopic, setSmartStudyInitialTopic] = useState<string>('');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);
  const [sessionCompletionData, setSessionCompletionData] = useState<SessionCompletionData | null>(null);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    loadStoredData('studyorbit_user_profile', INITIAL_USER_PROFILE)
  );

  // Core Academic Data
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadStoredData('studyorbit_subjects', INITIAL_SUBJECTS)
  );

  const [tasks, setTasks] = useState<Task[]>(() =>
    loadStoredData('studyorbit_tasks', INITIAL_TASKS)
  );

  const [logs, setLogs] = useState<StudyLog[]>(() =>
    loadStoredData('studyorbit_logs', generateInitialStudyLogs())
  );

  const [streakState, setStreakState] = useState<StreakState>(() =>
    loadStoredData('studyorbit_streak', {
      currentStreak: 12,
      bestStreak: 15,
      lastStudiedDate: new Date().toISOString().split('T')[0],
      credits: 450,
      totalStudyMinutes: 720,
      totalTasksCompleted: 18,
      freezeCount: 1,
    })
  );

  const [rewards, setRewards] = useState<RewardItem[]>(() =>
    loadStoredData('studyorbit_rewards', INITIAL_REWARDS)
  );

  // Calendar Goals State
  const [dailyGoals, setDailyGoals] = useState<DailyGoalRecord[]>(() =>
    loadStoredData('studyorbit_daily_goals', INITIAL_DAILY_GOALS)
  );

  // Skill Tree Nodes State
  const [skillTreeNodes, setSkillTreeNodes] = useState<SkillTreeNode[]>(() =>
    loadStoredData('studyorbit_skill_tree', INITIAL_SKILL_TREE)
  );

  // Smart Study (Flashcards & Mind Maps) State
  const [flashcards, setFlashcards] = useState<SmartFlashcard[]>(() =>
    loadStoredData('studyorbit_smart_flashcards', INITIAL_SMART_FLASHCARDS)
  );

  const [mindMaps, setMindMaps] = useState<MindMapItem[]>(() =>
    loadStoredData('studyorbit_mind_maps', INITIAL_MIND_MAPS)
  );

  // Friends & Social Network State
  const [friends, setFriends] = useState<FriendUser[]>(() =>
    loadStoredData('studyorbit_friends', INITIAL_FRIENDS)
  );

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() =>
    loadStoredData('studyorbit_friend_requests', INITIAL_FRIEND_REQUESTS)
  );

  const [suggestions, setSuggestions] = useState<FriendUser[]>(() =>
    loadStoredData('studyorbit_campus_suggestions', INITIAL_CAMPUS_SUGGESTIONS)
  );

  // Active Task & Timer State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [timerTotal, setTimerTotal] = useState<number>(25 * 60);
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Notification Banner
  const [notification, setNotification] = useState<{
    message: string;
    type: 'streak' | 'credit' | 'info';
  } | null>(null);

  // Persistence effects
  useEffect(() => saveStoredData('studyorbit_user_profile', userProfile), [userProfile]);
  useEffect(() => saveStoredData('studyorbit_subjects', subjects), [subjects]);
  useEffect(() => saveStoredData('studyorbit_tasks', tasks), [tasks]);
  useEffect(() => saveStoredData('studyorbit_logs', logs), [logs]);
  useEffect(() => saveStoredData('studyorbit_streak', streakState), [streakState]);
  useEffect(() => saveStoredData('studyorbit_rewards', rewards), [rewards]);
  useEffect(() => saveStoredData('studyorbit_daily_goals', dailyGoals), [dailyGoals]);
  useEffect(() => saveStoredData('studyorbit_skill_tree', skillTreeNodes), [skillTreeNodes]);
  useEffect(() => saveStoredData('studyorbit_smart_flashcards', flashcards), [flashcards]);
  useEffect(() => saveStoredData('studyorbit_mind_maps', mindMaps), [mindMaps]);
  useEffect(() => saveStoredData('studyorbit_friends', friends), [friends]);
  useEffect(() => saveStoredData('studyorbit_friend_requests', friendRequests), [friendRequests]);
  useEffect(() => saveStoredData('studyorbit_campus_suggestions', suggestions), [suggestions]);

  // Show temporary toast notification
  const showToast = (message: string, type: 'streak' | 'credit' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Session Completion Flow: triggers modal, streak animation, and credit awards
  const triggerSessionCompletion = (customMinutes?: number) => {
    setIsTimerRunning(false);
    playTimerFinishSound();

    const actualMins = customMinutes || Math.round(timerTotal / 60);
    const earnedCreds = Math.max(10, Math.round(actualMins * 1.5));
    const todayStr = new Date().toISOString().split('T')[0];

    // Calculate updated achieved minutes today
    const currentAchievedToday = logs
      .filter((l) => l.date === todayStr)
      .reduce((sum, log) => sum + Math.round(log.durationSeconds / 60), 0);
    const updatedAchievedMinutes = currentAchievedToday + actualMins;

    // Check Daily Goal match
    const todayGoal = dailyGoals.find((g) => g.date === todayStr);
    const goalTarget = todayGoal ? todayGoal.targetMinutes : 120;
    const isGoalAchieved = updatedAchievedMinutes >= goalTarget;

    // Update Daily Goals
    setDailyGoals((prev) => {
      const idx = prev.findIndex((g) => g.date === todayStr);
      if (idx >= 0) {
        return prev.map((g, i) =>
          i === idx
            ? {
                ...g,
                achievedMinutes: updatedAchievedMinutes,
                isCompleted: isGoalAchieved,
              }
            : g
        );
      } else {
        return [
          ...prev,
          {
            date: todayStr,
            targetMinutes: 120,
            achievedMinutes: updatedAchievedMinutes,
            isCompleted: isGoalAchieved,
            tasksTargetCount: 3,
            tasksCompletedCount: tasks.filter((t) => t.completed).length,
          },
        ];
      }
    });

    // Update Streak and Credits
    const tasksDoneToday = tasks.filter((t) => t.completed).length;
    const { streakState: updatedStreak, earnedNewStreak, isNewDayStreak } = calculateStreakUpdate(
      streakState,
      updatedAchievedMinutes,
      tasksDoneToday
    );

    const prevStreak = streakState.currentStreak;
    const newStreak = updatedStreak.currentStreak;

    setStreakState((prev) => ({
      ...prev,
      currentStreak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      lastStudiedDate: todayStr,
      credits: prev.credits + earnedCreds,
      totalStudyMinutes: prev.totalStudyMinutes + actualMins,
    }));

    setUserProfile((prev) => ({
      ...prev,
      streakCount: newStreak,
      creditsValue: prev.creditsValue + earnedCreds,
    }));

    // Find current task & subject details for modal
    const curTaskId = activeTaskId || tasks[0]?.id;
    const curTask = tasks.find((t) => t.id === curTaskId);
    const curSubject = subjects.find((s) => s.id === curTask?.subjectId) || subjects[0];

    // Trigger Session Completion Summary Modal
    setSessionCompletionData({
      sessionId: `sess-${Date.now()}`,
      durationMinutes: actualMins,
      creditsEarned: earnedCreds,
      subjectName: curSubject?.name || 'General Focus',
      subjectColor: curSubject?.color || '#3b82f6',
      subjectIcon: curSubject?.icon || '📚',
      taskTitle: curTask?.title || 'Academic Study Session',
      taskDescription: curTask?.description,
      taskId: curTaskId || undefined,
      isTaskCompleted: curTask?.completed,
      previousStreak: prevStreak,
      newStreak: newStreak,
      streakIncremented: isNewDayStreak,
      todayGoalMinutes: todayGoal?.targetMinutes || 120,
      todayAchievedMinutes: updatedAchievedMinutes,
      timestamp: new Date().toISOString(),
    });
  };

  // Timer Tick Mechanism
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prevSecs) => {
          if (prevSecs <= 1) {
            triggerSessionCompletion();
            return timerTotal;
          }

          // Accumulate 1 second to active task & daily study log
          const todayStr = new Date().toISOString().split('T')[0];
          const curTaskId = activeTaskId || tasks[0]?.id;
          const curTask = tasks.find((t) => t.id === curTaskId);
          const curSubjectId = curTask?.subjectId || subjects[0]?.id || 'sub-calc';

          // Update task time spent
          if (curTaskId) {
            setTasks((prevTasks) =>
              prevTasks.map((t) =>
                t.id === curTaskId ? { ...t, timeSpentSeconds: t.timeSpentSeconds + 1 } : t
              )
            );
          }

          // Update study log
          setLogs((prevLogs) => {
            const existingTodayLogIndex = prevLogs.findIndex(
              (l) => l.date === todayStr && l.subjectId === curSubjectId
            );

            if (existingTodayLogIndex >= 0) {
              return prevLogs.map((l, i) =>
                i === existingTodayLogIndex ? { ...l, durationSeconds: l.durationSeconds + 1 } : l
              );
            } else {
              return [
                ...prevLogs,
                {
                  id: `log-${Date.now()}`,
                  subjectId: curSubjectId,
                  taskTitle: curTask?.title,
                  date: todayStr,
                  durationSeconds: 1,
                  timestamp: new Date().toISOString(),
                },
              ];
            }
          });

          return prevSecs - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerTotal, activeTaskId, tasks, subjects, streakState, dailyGoals]);

  // Timer Handlers
  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerTotal);
  };

  const handleSetTimerDuration = (minutes: number) => {
    setIsTimerRunning(false);
    setTimerTotal(minutes * 60);
    setTimerSeconds(minutes * 60);
  };

  // Task & Streak & Currency Handlers
  const handleToggleTaskComplete = (taskId: string) => {
    playClickSound();

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const willBeCompleted = !task.completed;

          if (willBeCompleted) {
            playTaskCompleteSound();
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.6 },
            });

            const todayStr = new Date().toISOString().split('T')[0];
            const tasksDoneToday = prev.filter((t) => t.completed || t.id === taskId).length;
            const minutesToday = Math.round(
              logs.filter((l) => l.date === todayStr).reduce((a, c) => a + c.durationSeconds / 60, 0)
            );

            const { streakState: updatedStreak, earnedNewStreak } = calculateStreakUpdate(
              streakState,
              minutesToday,
              tasksDoneToday
            );

            const finalCredits = updatedStreak.credits + 25;
            setStreakState({
              ...updatedStreak,
              credits: finalCredits,
              totalTasksCompleted: streakState.totalTasksCompleted + 1,
            });

            setUserProfile((prevUser) => ({
              ...prevUser,
              creditsValue: finalCredits,
              streakCount: updatedStreak.currentStreak,
            }));

            // Mark topic in skill tree if matching
            setSkillTreeNodes((prevNodes) =>
              prevNodes.map((node) => {
                if (
                  node.subjectId === task.subjectId ||
                  task.title.toLowerCase().includes(node.topicName.toLowerCase())
                ) {
                  return {
                    ...node,
                    status: 'mastered',
                    masteryPercentage: Math.min(node.masteryPercentage + 20, 100),
                    masteryLevel: 'Mastered',
                    tasksCovered: Array.from(new Set([...node.tasksCovered, task.title])),
                  };
                }
                return node;
              })
            );

            if (earnedNewStreak) {
              showToast(
                `🔥 Daily Streak Extended to ${updatedStreak.currentStreak} Days! (+50🪙 bonus)`,
                'streak'
              );
            } else {
              showToast('✓ Task Completed! +25 Credits Earned!', 'credit');
            }

            return {
              ...task,
              completed: true,
              completedAt: new Date().toISOString(),
            };
          } else {
            return {
              ...task,
              completed: false,
              completedAt: undefined,
            };
          }
        }
        return task;
      })
    );
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'timeSpentSeconds'>) => {
    playClickSound();
    const created: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      timeSpentSeconds: 0,
    };
    setTasks((prev) => [created, ...prev]);
    setActiveTaskId(created.id);
    showToast(`Task "${created.title}" added to planner!`, 'info');
  };

  const handleAddSubject = (newSubject: Omit<Subject, 'id'>) => {
    playClickSound();
    const created: Subject = {
      ...newSubject,
      id: `sub-${Date.now()}`,
    };
    setSubjects((prev) => [...prev, created]);
    showToast(`Subject "${created.name}" created!`, 'info');
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId(tasks.find((t) => t.id !== taskId)?.id || null);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setTasks((prev) => prev.filter((t) => t.subjectId !== subjectId));
  };

  const handleUnlockReward = (rewardId: string) => {
    const item = rewards.find((r) => r.id === rewardId);
    if (!item) return;

    setStreakState((prev) => {
      let extraFreezes = prev.freezeCount;
      if (item.effect?.includes('Streak Freeze')) {
        extraFreezes += 1;
      }
      return {
        ...prev,
        credits: prev.credits - item.cost,
        freezeCount: extraFreezes,
      };
    });

    setUserProfile((prev) => ({
      ...prev,
      creditsValue: Math.max(0, prev.creditsValue - item.cost),
    }));

    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, unlocked: true } : r))
    );

    showToast(`🎉 Unlocked ${item.title}!`, 'info');
  };

  const handleAwardCredits = (amount: number, reason: string) => {
    setStreakState((prev) => ({
      ...prev,
      credits: prev.credits + amount,
    }));
    setUserProfile((prev) => ({
      ...prev,
      creditsValue: prev.creditsValue + amount,
    }));
    showToast(`+${amount}🪙 Earned: ${reason}`, 'credit');
  };

  const handleAddTaskFromAi = (title: string, subjectId: string) => {
    handleAddTask({
      title,
      subjectId,
      estimatedMinutes: 30,
      completed: false,
      priority: 'medium',
      description: 'Generated from AI Assistant concise solution review.',
    });
    setActiveTab('tasks');
  };

  // Calendar Daily Goal Handler
  const handleUpdateDailyGoal = (record: DailyGoalRecord) => {
    setDailyGoals((prev) => {
      const idx = prev.findIndex((g) => g.date === record.date);
      if (idx >= 0) {
        return prev.map((g, i) => (i === idx ? record : g));
      }
      return [...prev, record];
    });
    showToast(`Goal record for ${record.date} updated!`, 'info');
  };

  // Smart Study Flashcard & Mind Map Handlers
  const handleSaveFlashcard = (card: SmartFlashcard) => {
    setFlashcards((prev) => {
      const idx = prev.findIndex((c) => c.id === card.id);
      if (idx >= 0) {
        return prev.map((c, i) => (i === idx ? card : c));
      }
      return [card, ...prev];
    });
  };

  const handleUpdateFlashcardMastery = (
    cardId: string,
    rating: 'again' | 'hard' | 'good' | 'easy'
  ) => {
    setFlashcards((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          let interval = card.repetitionIntervalDays || 1;
          let level = card.masteryLevel;
          if (rating === 'again') {
            interval = 1;
            level = 'Learning';
          } else if (rating === 'hard') {
            interval = Math.max(2, Math.round(interval * 1.2));
            level = 'Reviewing';
          } else if (rating === 'good') {
            interval = Math.round(interval * 1.8) + 1;
            level = 'Proficient';
          } else if (rating === 'easy') {
            interval = Math.round(interval * 2.5) + 3;
            level = 'Mastered';
          }
          return {
            ...card,
            repetitionIntervalDays: interval,
            masteryLevel: level,
          };
        }
        return card;
      })
    );
    handleAwardCredits(5, 'Flashcard Active Recall');
  };

  const handleSaveMindMap = (item: MindMapItem) => {
    setMindMaps((prev) => {
      const idx = prev.findIndex((m) => m.id === item.id);
      if (idx >= 0) {
        return prev.map((m, i) => (i === idx ? item : m));
      }
      return [item, ...prev];
    });
  };

  // Profile and Avatar Aesthetics Handlers
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updated,
    }));
    showToast('Student Profile & Wardrobe updated!', 'info');
  };

  const handleEquipAesthetic = (type: 'border' | 'glow' | 'title' | 'badge', value: string) => {
    if (type === 'border') {
      setUserProfile((prev) => ({ ...prev, equippedBorder: value }));
      showToast('Avatar Frame equipped!', 'info');
    } else if (type === 'glow') {
      setUserProfile((prev) => ({ ...prev, equippedGlow: value }));
      showToast('Avatar Glow equipped!', 'info');
    } else if (type === 'title') {
      setUserProfile((prev) => ({ ...prev, equippedTitle: value }));
      showToast(`Prestige Title "${value}" equipped!`, 'info');
    } else if (type === 'badge') {
      setUserProfile((prev) => ({ ...prev, equippedBadge: value }));
      showToast('Avatar Badge equipped!', 'info');
    }
  };

  // Friends & Social Network Handlers
  const handleAddFriend = (friend: FriendUser) => {
    setFriends((prev) => {
      if (prev.some((f) => f.id === friend.id)) return prev;
      return [...prev, { ...friend, isFriend: true }];
    });
    setSuggestions((prev) => prev.filter((s) => s.id !== friend.id));
    showToast(`Added ${friend.name} to your study friends!`, 'info');
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    showToast('Friend removed from your orbit.', 'info');
  };

  const handleAcceptFriendRequest = (requestId: string) => {
    const req = friendRequests.find((r) => r.id === requestId);
    if (req) {
      handleAddFriend(req.fromUser);
      setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
      showToast(`Accepted friend request from ${req.fromUser.name}!`, 'info');
    }
  };

  const handleDeclineFriendRequest = (requestId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    showToast('Friend request declined.', 'info');
  };

  const handleSendCheer = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, cheersReceived: (f.cheersReceived || 0) + 1 } : f))
    );
    showToast('⚡ High-five sent! Boosted your friend\'s study energy!', 'info');
  };

  // Navigate to Smart Study with preloaded topic
  const handleNavigateToSmartStudyWithTopic = (topicName?: string) => {
    if (topicName) {
      setSmartStudyInitialTopic(topicName);
    }
    setActiveTab('smartstudy');
  };

  // Clear mockup data and start completely fresh
  const handleClearAllData = () => {
    localStorage.clear();
    setTasks([]);
    setLogs([]);
    setDailyGoals([]);
    setFlashcards([]);
    setMindMaps([]);
    setFriends([]);
    setFriendRequests([]);
    setStreakState({
      currentStreak: 1,
      bestStreak: 1,
      lastStudiedDate: new Date().toISOString().split('T')[0],
      credits: 100,
      totalStudyMinutes: 0,
      totalTasksCompleted: 0,
      freezeCount: 1,
    });
    setUserProfile((prev) => ({
      ...prev,
      streakCount: 1,
      creditsValue: 100,
      equippedBorder: undefined,
      equippedGlow: undefined,
      equippedTitle: undefined,
      equippedBadge: undefined,
    }));
    showToast('✨ Clean slate ready! All mock data removed.', 'info');
  };

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-[#e0e5ec] text-[#4a5568] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start selection:bg-blue-500 selection:text-white"
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div
          id="toast-notification"
          className="fixed top-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] border border-white text-sm font-bold text-gray-800 animate-bounce"
        >
          <span>
            {notification.type === 'streak' ? '🔥' : notification.type === 'credit' ? '🪙' : '✨'}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Responsive Frame Container */}
      <div
        id="sleek-app-canvas"
        className="w-full max-w-[1440px] flex flex-col lg:flex-row gap-6 min-h-[768px]"
      >
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          streakState={streakState}
          subjects={subjects}
          userProfile={userProfile}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        {/* Main Viewport */}
        <main id="main-content-viewport" className="flex-1 flex flex-col gap-6 min-w-0">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardView
              subjects={subjects}
              tasks={tasks}
              logs={logs}
              streakState={streakState}
              activeTaskId={activeTaskId}
              setActiveTaskId={setActiveTaskId}
              timerSeconds={timerSeconds}
              timerTotal={timerTotal}
              isTimerRunning={isTimerRunning}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onToggleTaskComplete={handleToggleTaskComplete}
              onNavigateToTasks={() => setActiveTab('tasks')}
              onNavigateToProgress={() => setActiveTab('progress')}
            />
          )}

          {/* TAB 2: PROFILE & FRIENDS & LEADERBOARD (NEW) */}
          {activeTab === 'profile' && (
            <ProfileView
              userProfile={userProfile}
              streakState={streakState}
              rewards={rewards}
              friends={friends}
              friendRequests={friendRequests}
              suggestions={suggestions}
              onUpdateProfile={handleUpdateProfile}
              onUnlockReward={handleUnlockReward}
              onAddFriend={handleAddFriend}
              onRemoveFriend={handleRemoveFriend}
              onAcceptRequest={handleAcceptFriendRequest}
              onDeclineRequest={handleDeclineFriendRequest}
              onSendCheer={handleSendCheer}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* TAB 3: CALENDAR VIEW (Daily Goal Achieved per Date) */}
          {activeTab === 'calendar' && (
            <CalendarView
              subjects={subjects}
              tasks={tasks}
              logs={logs}
              dailyGoals={dailyGoals}
              onUpdateDailyGoal={handleUpdateDailyGoal}
              onNavigateToSmartStudy={handleNavigateToSmartStudyWithTopic}
              onAddTaskForDate={(title, subjectId) => {
                handleAddTask({
                  title,
                  subjectId,
                  estimatedMinutes: 45,
                  completed: false,
                  priority: 'high',
                  description: 'Added from Study Calendar goal planner.',
                });
              }}
            />
          )}

          {/* TAB 4: VISUALIZED SKILL TREE (User -> Subject -> Topics Covered) */}
          {activeTab === 'skilltree' && (
            <SkillTreeView
              userProfile={userProfile}
              subjects={subjects}
              tasks={tasks}
              skillTreeNodes={skillTreeNodes}
              onSelectTopicForSmartStudy={handleNavigateToSmartStudyWithTopic}
              onAddTaskForSkill={(taskTitle, subjectId) => {
                handleAddTask({
                  title: taskTitle,
                  subjectId,
                  estimatedMinutes: 40,
                  completed: false,
                  priority: 'medium',
                  description: 'Academic topic practice from Skill Tree.',
                });
                setActiveTab('tasks');
              }}
            />
          )}

          {/* TAB 5: SMART STUDY (Mermaid.js Mind Maps & Diagram Flashcards + Gemini API) */}
          {activeTab === 'smartstudy' && (
            <SmartStudyView
              subjects={subjects}
              tasks={tasks}
              flashcards={flashcards}
              mindMaps={mindMaps}
              onSaveFlashcard={handleSaveFlashcard}
              onUpdateFlashcardMastery={handleUpdateFlashcardMastery}
              onSaveMindMap={handleSaveMindMap}
              onAwardCredits={handleAwardCredits}
              initialSelectedTopic={smartStudyInitialTopic}
            />
          )}

          {/* TAB 6: TASKS & TIMER */}
          {activeTab === 'tasks' && (
            <TasksTimerView
              subjects={subjects}
              tasks={tasks}
              streakState={streakState}
              activeTaskId={activeTaskId}
              setActiveTaskId={setActiveTaskId}
              timerSeconds={timerSeconds}
              timerTotal={timerTotal}
              isTimerRunning={isTimerRunning}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onSetTimerDuration={handleSetTimerDuration}
              onAddTask={handleAddTask}
              onAddSubject={handleAddSubject}
              onToggleTaskComplete={handleToggleTaskComplete}
              onDeleteTask={handleDeleteTask}
              onDeleteSubject={handleDeleteSubject}
              onFinishSessionEarly={() =>
                triggerSessionCompletion(Math.max(1, Math.round((timerTotal - timerSeconds) / 60)))
              }
            />
          )}

          {/* TAB 7: PROGRESS & ANALYTICS */}
          {activeTab === 'progress' && (
            <ProgressView
              subjects={subjects}
              tasks={tasks}
              logs={logs}
              streakState={streakState}
            />
          )}

          {/* TAB 8: AI SUBJECT TUTOR */}
          {activeTab === 'assistant' && (
            <AiChatAssistant
              subjects={subjects}
              onAddTaskFromAi={handleAddTaskFromAi}
            />
          )}

          {/* TAB 9: REWARD STORE */}
          {activeTab === 'rewards' && (
            <RewardsStore
              streakState={streakState}
              rewards={rewards}
              userProfile={userProfile}
              onUnlockReward={handleUnlockReward}
              onEquipAesthetic={handleEquipAesthetic}
              onNavigateToProfile={() => setActiveTab('profile')}
            />
          )}
        </main>
      </div>

      {/* Post-Timer Completion & Streak Animation Modal Window */}
      {sessionCompletionData && (
        <SessionCompletionModal
          data={sessionCompletionData}
          onClose={() => setSessionCompletionData(null)}
          onStartNextSession={(mins) => {
            setTimerTotal(mins * 60);
            setTimerSeconds(mins * 60);
            setIsTimerRunning(true);
            setSessionCompletionData(null);
            showToast(`Started new ${mins}m focus session!`, 'info');
          }}
          onMarkTaskCompleted={(tId) => {
            handleToggleTaskComplete(tId);
            showToast('Task marked complete! +25 XP', 'credit');
          }}
          onSaveReflection={(note) => {
            const todayStr = new Date().toISOString().split('T')[0];
            setDailyGoals((prev) =>
              prev.map((g) => (g.date === todayStr ? { ...g, reflectionNote: note } : g))
            );
            showToast('Session reflection saved to calendar record!', 'info');
          }}
        />
      )}

      {/* OAuth & Student Profile Authentication Modal Window */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={userProfile}
        onLoginSuccess={(newProfile) => {
          setUserProfile(newProfile);
          showToast(`Welcome, ${newProfile.name}! Profile authenticated.`, 'info');
        }}
      />

      {/* Logout & Session Management Modal Window */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        userProfile={userProfile}
        onConfirmLogout={() => {
          setUserProfile((prev) => ({
            ...prev,
            isLoggedIn: false,
          }));
          setIsLogoutModalOpen(false);
          showToast('Signed out of student account.', 'info');
        }}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}
