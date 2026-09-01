import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TasksTab from './components/TasksTab';
import TimerSection from './components/TimerSection';
import ProgressDashboard from './components/ProgressDashboard';
import StudyAssistantChat from './components/StudyAssistantChat';
import RewardsStoreModal from './components/RewardsStoreModal';
import SubjectModal from './components/SubjectModal';

import {
  STORAGE_KEYS,
  DEFAULT_SUBJECTS,
  DEFAULT_TASKS,
  DEFAULT_STUDY_LOGS,
  DEFAULT_STREAK,
  DEFAULT_REWARDS,
  DEFAULT_CHAT_HISTORY,
  DEFAULT_USER,
  loadFromStorage,
  saveToStorage,
} from './utils/storage';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'timer', 'progress', 'assistant'

  // Application Data States (Stored in localStorage)
  const [subjects, setSubjects] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS)
  );

  const [tasks, setTasks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS)
  );

  const [studyLogs, setStudyLogs] = useState(() =>
    loadFromStorage(STORAGE_KEYS.LOGS, DEFAULT_STUDY_LOGS)
  );

  const [streakState, setStreakState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.STREAK, DEFAULT_STREAK)
  );

  const [rewards, setRewards] = useState(() =>
    loadFromStorage(STORAGE_KEYS.REWARDS, DEFAULT_REWARDS)
  );

  const [chatHistory, setChatHistory] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CHAT_HISTORY, DEFAULT_CHAT_HISTORY)
  );

  const [userProfile, setUserProfile] = useState(() =>
    loadFromStorage(STORAGE_KEYS.USER_PROFILE, DEFAULT_USER)
  );

  // Active Timer binding state
  const [activeTimerTaskId, setActiveTimerTaskId] = useState(null);
  const [selectedTimerSubjectId, setSelectedTimerSubjectId] = useState(null);
  const [activeTimerState, setActiveTimerState] = useState({ isRunning: false, formattedTime: '', subjectName: '' });

  // Assistant Query state
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');

  // Modals
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  // Sync state changes to storage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SUBJECTS, subjects);
  }, [subjects]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  }, [tasks]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.LOGS, studyLogs);
  }, [studyLogs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.STREAK, streakState);
  }, [streakState]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REWARDS, rewards);
  }, [rewards]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CHAT_HISTORY, chatHistory);
  }, [chatHistory]);

  // Streak calculation logic for today
  const updateStreakOnActivity = (creditsBonus = 25) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setStreakState((prev) => {
      let nextStreak = prev.currentStreak;
      let nextBest = prev.bestStreak;

      if (prev.lastStudiedDate !== todayStr) {
        // New study day
        const lastDate = new Date(prev.lastStudiedDate);
        const today = new Date(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          nextStreak += 1;
        } else if (diffDays > 1) {
          // If missed day, check if streak freeze is available
          if (prev.freezeCount > 0) {
            nextStreak += 1;
          } else {
            nextStreak = 1;
          }
        }
        if (nextStreak > nextBest) {
          nextBest = nextStreak;
        }
      }

      return {
        ...prev,
        currentStreak: nextStreak,
        bestStreak: nextBest,
        lastStudiedDate: todayStr,
        credits: prev.credits + creditsBonus,
        totalTasksCompleted: prev.totalTasksCompleted + 1,
      };
    });
  };

  // Task Handlers
  const handleAddTask = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const willBeCompleted = !t.completed;
          if (willBeCompleted) {
            updateStreakOnActivity(25); // +25 Credits for task completion
          }
          return {
            ...t,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleStartTimerForTask = (task) => {
    setActiveTimerTaskId(task.id);
    setSelectedTimerSubjectId(task.subjectId);
    setActiveTab('timer');
  };

  // Subject Handlers
  const handleAddSubject = (newSubject) => {
    setSubjects((prev) => [...prev, newSubject]);
  };

  // Timer Study Time Logger
  const handleLogStudyTime = ({ subjectId, taskId, durationSeconds, creditsAwarded = 30 }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog = {
      id: `log-${Date.now()}`,
      subjectId: subjectId || subjects[0]?.id,
      taskId: taskId || undefined,
      date: todayStr,
      durationSeconds,
      timestamp: new Date().toISOString(),
    };

    setStudyLogs((prev) => [...prev, newLog]);

    // If linked to a task, update task timeSpentSeconds
    if (taskId) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, timeSpentSeconds: t.timeSpentSeconds + durationSeconds } : t))
      );
    }

    // Update streak and credits
    const mins = Math.round(durationSeconds / 60);
    setStreakState((prev) => ({
      ...prev,
      credits: prev.credits + creditsAwarded,
      totalStudyMinutes: prev.totalStudyMinutes + mins,
      lastStudiedDate: todayStr,
    }));
  };

  // Rewards Store Handler
  const handleUnlockReward = (rewardId, cost) => {
    setStreakState((prev) => ({
      ...prev,
      credits: Math.max(0, prev.credits - cost),
      freezeCount: rewardId === 'rew-1' ? prev.freezeCount + 1 : prev.freezeCount,
    }));

    setRewards((prev) =>
      prev.map((r) => (r.id === rewardId ? { ...r, unlocked: true } : r))
    );
  };

  // Quick Ask from Sidebar
  const handleQuickAsk = (questionText) => {
    setAssistantInitialQuery(questionText);
    setActiveTab('assistant');
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-[#4a5568] p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      {/* Maximum width container matching Sleek Interface Layout */}
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Global Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          streakState={streakState}
          onOpenRewards={() => setShowRewardsModal(true)}
          activeTimerState={activeTimerState}
          subjects={subjects}
        />

        {/* Main Body Grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Left Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            userProfile={userProfile}
            streakState={streakState}
            onOpenRewards={() => setShowRewardsModal(true)}
            onOpenAddSubject={() => setShowSubjectModal(true)}
            subjects={subjects}
            quickAskQuestion={handleQuickAsk}
          />

          {/* Center Main View Area */}
          <main className="flex-1 w-full min-w-0">
            {activeTab === 'tasks' && (
              <TasksTab
                subjects={subjects}
                tasks={tasks}
                onAddTask={handleAddTask}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onStartTimerForTask={handleStartTimerForTask}
                onOpenAddSubject={() => setShowSubjectModal(true)}
                streakState={streakState}
                studyLogs={studyLogs}
              />
            )}

            {activeTab === 'timer' && (
              <TimerSection
                subjects={subjects}
                tasks={tasks}
                activeTaskId={activeTimerTaskId}
                selectedSubjectId={selectedTimerSubjectId}
                onSelectSubject={(id) => setSelectedTimerSubjectId(id)}
                onLogStudyTime={handleLogStudyTime}
                onTimerTick={setActiveTimerState}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressDashboard
                subjects={subjects}
                tasks={tasks}
                studyLogs={studyLogs}
                streakState={streakState}
                userProfile={userProfile}
              />
            )}

            {activeTab === 'assistant' && (
              <StudyAssistantChat
                subjects={subjects}
                chatHistory={chatHistory}
                onAddMessage={(msg) => setChatHistory((prev) => [...prev, msg])}
                onClearHistory={() => setChatHistory([])}
                initialQuery={assistantInitialQuery}
              />
            )}
          </main>
        </div>
      </div>

      {/* Rewards Store Modal */}
      <RewardsStoreModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        rewards={rewards}
        streakState={streakState}
        onUnlockReward={handleUnlockReward}
      />

      {/* Add Subject Modal */}
      <SubjectModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onAddSubject={handleAddSubject}
      />
    </div>
  );
}
