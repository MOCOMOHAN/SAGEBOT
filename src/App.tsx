import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Subject, Task, StudyLog, StreakState, RewardItem } from './types';
import {
  INITIAL_SUBJECTS,
  INITIAL_TASKS,
  INITIAL_REWARDS,
  generateInitialStudyLogs,
  loadStoredData,
  saveStoredData,
  calculateStreakUpdate,
} from './utils/storage';
import { playTaskCompleteSound, playTimerFinishSound, playClickSound } from './utils/audio';

import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { TasksTimerView } from './components/TasksTimerView';
import { ProgressView } from './components/ProgressView';
import { AiChatAssistant } from './components/AiChatAssistant';
import { RewardsStore } from './components/RewardsStore';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'progress' | 'assistant' | 'rewards'>('dashboard');

  // Core App State
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

  // Active Task & Timer State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(tasks[0]?.id || null);
  const [timerTotal, setTimerTotal] = useState<number>(25 * 60); // default 25 mins
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Notification Banner
  const [notification, setNotification] = useState<{ message: string; type: 'streak' | 'credit' | 'info' } | null>(null);

  // Persistence effects
  useEffect(() => saveStoredData('studyorbit_subjects', subjects), [subjects]);
  useEffect(() => saveStoredData('studyorbit_tasks', tasks), [tasks]);
  useEffect(() => saveStoredData('studyorbit_logs', logs), [logs]);
  useEffect(() => saveStoredData('studyorbit_streak', streakState), [streakState]);
  useEffect(() => saveStoredData('studyorbit_rewards', rewards), [rewards]);

  // Show temporary toast notification
  const showToast = (message: string, type: 'streak' | 'credit' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Timer Tick Mechanism (increments task time & logs study seconds)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prevSecs) => {
          if (prevSecs <= 1) {
            // Timer Finished!
            setIsTimerRunning(false);
            playTimerFinishSound();
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

            // Reward +10 Credits
            setStreakState((prev) => ({
              ...prev,
              credits: prev.credits + 10,
              totalStudyMinutes: prev.totalStudyMinutes + Math.round(timerTotal / 60),
            }));

            showToast('🎉 Focus Session Completed! +10 Credits awarded!', 'credit');
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
  }, [isTimerRunning, timerTotal, activeTaskId, tasks, subjects]);

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

            // Calculate streak and credit rewards
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

            // Award task completion credits (+25🪙)
            const finalCredits = updatedStreak.credits + 25;
            setStreakState({
              ...updatedStreak,
              credits: finalCredits,
              totalTasksCompleted: streakState.totalTasksCompleted + 1,
            });

            if (earnedNewStreak) {
              showToast(`🔥 Daily Streak Extended to ${updatedStreak.currentStreak} Days! (+50🪙 bonus)`, 'streak');
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

  return (
    <div
      id="app-root-container"
      class="min-h-screen bg-[#e0e5ec] text-[#4a5568] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start selection:bg-blue-500 selection:text-white"
    >
      {/* Toast Notification Banner */}
      {notification && (
        <div
          id="toast-notification"
          class="fixed top-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] border border-white text-sm font-bold text-gray-800 animate-bounce"
        >
          <span>{notification.type === 'streak' ? '🔥' : notification.type === 'credit' ? '🪙' : '✨'}</span>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Responsive App Frame Container matching Sleek Interface specification */}
      <div
        id="sleek-app-canvas"
        class="w-full max-w-[1440px] flex flex-col lg:flex-row gap-6 min-h-[768px]"
      >
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          streakState={streakState}
          subjects={subjects}
        />

        {/* Main View Area */}
        <main id="main-content-viewport" class="flex-1 flex flex-col gap-6 min-w-0">
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
            />
          )}

          {activeTab === 'progress' && (
            <ProgressView
              subjects={subjects}
              tasks={tasks}
              logs={logs}
              streakState={streakState}
            />
          )}

          {activeTab === 'assistant' && (
            <AiChatAssistant
              subjects={subjects}
              onAddTaskFromAi={handleAddTaskFromAi}
            />
          )}

          {activeTab === 'rewards' && (
            <RewardsStore
              streakState={streakState}
              rewards={rewards}
              onUnlockReward={handleUnlockReward}
            />
          )}
        </main>
      </div>
    </div>
  );
}
