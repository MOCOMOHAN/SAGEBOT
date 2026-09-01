import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SessionCompletionData } from '../types';
import { playTaskCompleteSound, playClickSound, playLevelUpSound } from '../utils/audio';

interface SessionCompletionModalProps {
  data: SessionCompletionData;
  onClose: () => void;
  onStartNextSession: (minutes: number) => void;
  onMarkTaskCompleted?: (taskId: string) => void;
  onSaveReflection?: (note: string) => void;
}

export const SessionCompletionModal: React.FC<SessionCompletionModalProps> = ({
  data,
  onClose,
  onStartNextSession,
  onMarkTaskCompleted,
  onSaveReflection,
}) => {
  const [reflectionNote, setReflectionNote] = useState<string>('');
  const [isTaskMarkedDone, setIsTaskMarkedDone] = useState<boolean>(data.isTaskCompleted || false);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);
  const [streakDisplayCount, setStreakDisplayCount] = useState<number>(data.previousStreak);
  const [isStreakAnimating, setIsStreakAnimating] = useState<boolean>(true);

  // Trigger streak visual animation & confetti upon mount
  const triggerStreakCelebration = () => {
    setIsStreakAnimating(true);
    playLevelUpSound();

    // Multistage Confetti Blast
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f97316', '#eab308', '#3b82f6', '#10b981', '#ec4899'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f97316', '#fbbf24', '#ffedd5'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd'],
      });
    }, 250);

    // Counter tick-up animation
    setStreakDisplayCount(data.previousStreak);
    setTimeout(() => {
      setStreakDisplayCount(data.newStreak);
      playTaskCompleteSound();
    }, 600);
  };

  useEffect(() => {
    triggerStreakCelebration();
  }, [data]);

  const handleMarkComplete = () => {
    if (data.taskId && onMarkTaskCompleted) {
      playTaskCompleteSound();
      onMarkTaskCompleted(data.taskId);
      setIsTaskMarkedDone(true);
    }
  };

  const handleSaveReflection = () => {
    if (reflectionNote.trim() && onSaveReflection) {
      playClickSound();
      onSaveReflection(reflectionNote.trim());
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 3000);
    }
  };

  const todayProgressPercent = Math.min(
    100,
    Math.round((data.todayAchievedMinutes / (data.todayGoalMinutes || 120)) * 100)
  );

  return (
    <div
      id="session-completion-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn overflow-y-auto"
    >
      <div className="w-full max-w-xl rounded-[40px] bg-[#e0e5ec] shadow-[16px_16px_32px_#00000050,-16px_-16px_32px_#ffffff] p-6 lg:p-8 flex flex-col gap-6 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header & Close */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                Focus Session Completed!
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                High-yield study time logged to your academic record
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-gray-500 hover:text-gray-900 font-bold flex items-center justify-center transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 'STREAK STREAK' VISUAL ANIMATION SHOWCASE */}
        <div
          id="streak-streak-animation-card"
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/15 to-rose-500/10 border-2 border-orange-400/40 p-5 shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex flex-col items-center justify-center text-center gap-3"
        >
          {/* Pulsing Energy Aura Behind Flame */}
          <div className="absolute w-36 h-36 rounded-full bg-orange-400/20 blur-xl animate-pulse pointer-events-none" />

          {/* Animated Flame Icon Container */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#e0e5ec] shadow-[6px_6px_14px_#b8b9be,-6px_-6px_14px_#ffffff] flex items-center justify-center transform transition-transform hover:scale-110">
              <span className="text-4xl animate-bounce">🔥</span>
            </div>
            {/* Orbiting particles */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-extrabold flex items-center justify-center shadow-md animate-ping">
              ✨
            </div>
          </div>

          {/* Animated Streak Counter */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600 tracking-tight font-mono">
                {streakDisplayCount} DAYS
              </span>
              <span className="text-xs font-black uppercase px-2.5 py-1 rounded-full bg-orange-500 text-white shadow-sm tracking-wider animate-pulse">
                STREAK ACTIVE!
              </span>
            </div>

            <p className="text-xs font-bold text-orange-900 mt-1">
              🔥 You're on fire! Unstoppable study momentum!
            </p>
          </div>

          {/* Streak Boost Multiplier Banner */}
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-white/60 backdrop-blur-xs px-4 py-1.5 rounded-2xl border border-orange-200">
            <span>⚡ 1.5x Multiplier Active</span>
            <span>•</span>
            <span className="text-emerald-700 font-extrabold">+{data.creditsEarned} Study Credits</span>
          </div>

          {/* Replay Streak Animation button */}
          <button
            onClick={() => {
              triggerStreakCelebration();
            }}
            className="text-[11px] font-bold text-orange-700 hover:text-orange-900 underline flex items-center gap-1 cursor-pointer mt-1"
          >
            <span>🔄 Replay Streak Effect</span>
          </button>
        </div>

        {/* SESSION SUMMARY METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Time Studied */}
          <div className="p-3.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Session Time</span>
            <span className="text-xl font-extrabold text-blue-600 mt-0.5">
              {data.durationMinutes} mins
            </span>
            <span className="text-[10px] text-gray-400 font-medium">100% Focused</span>
          </div>

          {/* 2. Credits Earned */}
          <div className="p-3.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Credits Earned</span>
            <span className="text-xl font-extrabold text-amber-600 mt-0.5 flex items-center gap-1">
              <span>🪙</span> +{data.creditsEarned}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Ready in Store</span>
          </div>

          {/* 3. Daily Goal Progress */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] flex flex-col items-center text-center">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Daily Goal</span>
            <span className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {todayProgressPercent}%
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              {data.todayAchievedMinutes}/{data.todayGoalMinutes || 120}m
            </span>
          </div>
        </div>

        {/* TASKS WORKED ON BREAKDOWN */}
        <div className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>📝</span> Tasks Worked On in this Session
            </h4>
            <span
              className="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white shadow-xs"
              style={{ backgroundColor: data.subjectColor || '#3b82f6' }}
            >
              {data.subjectIcon} {data.subjectName}
            </span>
          </div>

          {/* Task Item */}
          <div className="p-3.5 rounded-xl bg-white/70 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <h5 className="font-bold text-sm text-gray-900 leading-snug">
                {data.taskTitle}
              </h5>
              {data.taskDescription && (
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                  {data.taskDescription}
                </p>
              )}
            </div>

            {/* Quick Completion Action */}
            {data.taskId && (
              <button
                onClick={handleMarkComplete}
                disabled={isTaskMarkedDone}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isTaskMarkedDone
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                }`}
              >
                <span>{isTaskMarkedDone ? '✓ Completed' : '✓ Mark Task Done'}</span>
                {!isTaskMarkedDone && <span className="text-[10px] opacity-80">(+25 XP)</span>}
              </button>
            )}
          </div>

          {/* Quick Post-Study Reflection Notes */}
          <div className="flex flex-col gap-1.5 pt-1">
            <label className="text-[11px] font-bold text-gray-600">
              💡 Quick Reflection / Key Formula Learned (Optional):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                placeholder="e.g. Mastered Green's Theorem curl proof, remember counterclockwise rule..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={handleSaveReflection}
                className="py-1.5 px-3 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-blue-600 cursor-pointer"
              >
                {noteSaved ? '✓ Saved!' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={() => {
              playClickSound();
              onStartNextSession(5); // 5 min break
              onClose();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] font-bold text-xs text-gray-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>☕</span> Take a 5m Break
          </button>

          <button
            onClick={() => {
              playClickSound();
              onStartNextSession(25); // next 25m session
              onClose();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-[4px_4px_10px_#b8b9be,-4px_-4px_10px_#ffffff] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>⚡</span> Start Next 25m Focus Session
          </button>
        </div>
      </div>
    </div>
  );
};
