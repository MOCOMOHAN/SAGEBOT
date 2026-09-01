import React, { useMemo } from 'react';
import { Subject, Task, StudyLog, StreakState } from '../types';
import { playClickSound } from '../utils/audio';

interface DashboardViewProps {
  subjects: Subject[];
  tasks: Task[];
  logs: StudyLog[];
  streakState: StreakState;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  timerSeconds: number;
  timerTotal: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onToggleTaskComplete: (taskId: string) => void;
  onNavigateToTasks: () => void;
  onNavigateToProgress: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  tasks,
  logs,
  streakState,
  activeTaskId,
  setActiveTaskId,
  timerSeconds,
  timerTotal,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onToggleTaskComplete,
  onNavigateToTasks,
  onNavigateToProgress,
}) => {
  // Compute past 7 days breakdown for Weekly Overview
  const weeklyData = useMemo(() => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];

      // sum all study logs for this date
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const totalMinutes = dayLogs.reduce((acc, curr) => acc + curr.durationSeconds / 60, 0);

      // determine dominant subject color
      let primaryColor = '#3b82f6';
      if (dayLogs.length > 0) {
        const topSubjectId = dayLogs.sort((a, b) => b.durationSeconds - a.durationSeconds)[0].subjectId;
        const sub = subjects.find((s) => s.id === topSubjectId);
        if (sub) primaryColor = sub.color;
      }

      const isToday = i === 0;

      result.push({
        dateStr,
        dayName,
        totalMinutes: Math.round(totalMinutes),
        hours: (totalMinutes / 60).toFixed(1),
        color: primaryColor,
        isToday,
      });
    }

    const maxMinutes = Math.max(...result.map((r) => r.totalMinutes), 180); // baseline scale

    return result.map((r) => ({
      ...r,
      fillPercentage: Math.min(100, Math.max(r.totalMinutes > 0 ? 15 : 0, (r.totalMinutes / maxMinutes) * 100)),
    }));
  }, [logs, subjects]);

  // Today stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTotalMinutes = useMemo(() => {
    return Math.round(
      logs.filter((l) => l.date === todayStr).reduce((acc, curr) => acc + curr.durationSeconds / 60, 0)
    );
  }, [logs, todayStr]);

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks.find((t) => !t.completed) || tasks[0];

  // Timer format
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgressFraction = timerTotal > 0 ? (timerTotal - timerSeconds) / timerTotal : 0;
  const strokeRadius = 88;
  const strokeCircumference = 2 * Math.PI * strokeRadius; // ~552.9
  const strokeDashoffset = strokeCircumference * (1 - timerProgressFraction);

  // Format spent time
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div id="dashboard-view" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Banner / Weekly Overview Card - Sleek Neumorphic Layout */}
      <section
        id="weekly-overview-section"
        className="rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col transition-all"
      >
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-xl lg:text-2xl text-gray-800 tracking-tight">
                Weekly Study Overview
              </h3>
              <span className="text-xs bg-blue-100/90 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                {todayTotalMinutes}m Studied Today
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Daily time investment per subject across the current cycle
            </p>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onNavigateToProgress();
            }}
            className="py-1.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-blue-600 flex items-center gap-1.5 transition-all"
          >
            <span>Detailed Analytics</span>
            <span>➔</span>
          </button>
        </div>

        {/* 7-Day Inset Pill Bars */}
        <div
          id="weekly-bars-container"
          className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 py-2"
        >
          {weeklyData.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
              {/* Tooltip on hover */}
              <div className="text-[10px] font-bold text-gray-600 opacity-80 group-hover:opacity-100 transition-opacity">
                {day.hours}h
              </div>

              {/* Inset Neumorphic Pill Track */}
              <div className="w-8 sm:w-11 h-28 sm:h-32 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] rounded-2xl relative overflow-hidden flex flex-col justify-end p-1">
                <div
                  className="w-full rounded-xl transition-all duration-700 ease-out shadow-sm"
                  style={{
                    height: `${day.fillPercentage}%`,
                    backgroundColor: day.color,
                    boxShadow: `0 0 10px ${day.color}66`,
                  }}
                ></div>
              </div>

              {/* Day Label */}
              <span
                className={`text-[11px] font-bold tracking-tight uppercase ${
                  day.isToday ? 'text-blue-600 font-extrabold scale-110' : 'text-gray-500'
                }`}
              >
                {day.dayName}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Main Lower Split Grid: Focus Tasks & Neumorphic Focus Timer */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Focus Tasks Section */}
        <section
          id="focus-tasks-section"
          className="flex-1 rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col"
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-bold text-lg text-gray-800 tracking-tight">Focus Tasks</h3>
              <p className="text-xs text-gray-500">Select a subject task to track study hours</p>
            </div>
            <button
              id="dashboard-add-task-btn"
              onClick={() => {
                playClickSound();
                onNavigateToTasks();
              }}
              className="w-9 h-9 rounded-full bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-blue-600 font-extrabold text-lg transition-all"
              title="Add New Subject Task"
            >
              +
            </button>
          </div>

          {/* Tasks List */}
          <div id="focus-tasks-list" className="space-y-3.5 flex-1 overflow-y-auto max-h-[340px] pr-1">
            {tasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              const isActive = activeTaskId === task.id;

              return (
                <div
                  key={task.id}
                  onClick={() => setActiveTaskId(task.id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-l-4 border-blue-500'
                      : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskComplete(task.id);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        task.completed
                          ? 'bg-emerald-500 text-white shadow-[2px_2px_5px_#10b981]'
                          : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-transparent hover:text-gray-400'
                      }`}
                      title={task.completed ? 'Completed (+25 Credits)' : 'Mark task complete'}
                    >
                      ✓
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: subject?.color || '#3b82f6' }}
                        ></span>
                        <h4
                          className={`font-bold text-sm truncate ${
                            task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}
                        >
                          {task.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                        <span className="font-medium text-gray-700">{subject?.name || 'Subject'}</span>
                        <span>•</span>
                        <span>
                          Time spent: <strong className="text-gray-700">{formatDuration(task.timeSpentSeconds)}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {task.completed ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-xl border border-emerald-200 shadow-sm">
                        ✓ Done (+25🪙)
                      </span>
                    ) : isActive ? (
                      <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-1 rounded-xl border border-blue-200 animate-pulse-subtle">
                        Active ⏱
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-200/60 font-semibold px-2 py-0.5 rounded-lg">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right: Sleek Neumorphic Focus Timer Widget */}
        <section
          id="neumorphic-timer-widget"
          className="w-full lg:w-84 xl:w-92 rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-7 flex flex-col items-center justify-center gap-6"
        >
          <div className="text-center w-full">
            <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider">
              {activeTask ? activeTask.title : 'Focus Study Session'}
            </span>
          </div>

          {/* Dial SVG + Extruded Outer Ring + Inset Inner Display */}
          <div className="relative flex items-center justify-center">
            {/* Outer Neumorphic Extruded Circle */}
            <div className="w-52 h-52 rounded-full bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              {/* Inner Inset Neumorphic Display */}
              <div className="w-42 h-42 rounded-full bg-[#e0e5ec] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center flex-col select-none">
                <span className="text-3xl font-mono font-extrabold text-blue-600 tracking-tight">
                  {formatTime(timerSeconds)}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {isTimerRunning ? 'Session In Progress' : 'Focus Time'}
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 mt-1">
                  +10 🪙 per 25 min
                </span>
              </div>
            </div>

            {/* Circular SVG Gauge matching Sleek Interface design */}
            <svg className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="104"
                cy="104"
                r={strokeRadius}
                fill="none"
                stroke="#b8b9be"
                strokeWidth="5"
                strokeOpacity="0.25"
              />
              <circle
                cx="104"
                cy="104"
                r={strokeRadius}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="7"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
          </div>

          {/* Neumorphic Control Buttons: Pause, Play, Reset */}
          <div id="timer-controls-row" className="flex items-center gap-4">
            <button
              id="timer-pause-btn"
              onClick={() => {
                playClickSound();
                if (isTimerRunning) onToggleTimer();
              }}
              disabled={!isTimerRunning}
              className="w-13 h-13 rounded-full bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center text-lg text-gray-700 hover:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] active:shadow-inner disabled:opacity-40 transition-all"
              title="Pause Timer"
            >
              ⏸
            </button>

            <button
              id="timer-play-btn"
              onClick={() => {
                playClickSound();
                onToggleTimer();
              }}
              className={`w-15 h-15 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-[6px_6px_14px_#b8b9be,-6px_-6px_14px_#ffffff] transition-all transform active:scale-95 ${
                isTimerRunning
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-[0_0_16px_rgba(249,115,22,0.4)]'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_16px_rgba(59,130,246,0.4)]'
              }`}
              title={isTimerRunning ? 'Pause Focus' : 'Start Focus'}
            >
              {isTimerRunning ? '❚❚' : '▶'}
            </button>

            <button
              id="timer-reset-btn"
              onClick={() => {
                playClickSound();
                onResetTimer();
              }}
              className="w-13 h-13 rounded-full bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center text-lg text-gray-700 hover:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] active:shadow-inner transition-all"
              title="Reset Timer"
            >
              🔄
            </button>
          </div>

          {/* Current Goal Box - Inset Neumorphic */}
          <div
            id="current-goal-box"
            className="w-full p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-center"
          >
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">
              Current Goal
            </p>
            <p className="text-xs font-bold text-gray-800">
              Complete Focus Sessions (+50 Credits & Streak)
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
