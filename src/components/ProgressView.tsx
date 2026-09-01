import React, { useState, useMemo } from 'react';
import { Subject, Task, StudyLog, StreakState } from '../types';
import { playClickSound } from '../utils/audio';

interface ProgressViewProps {
  subjects: Subject[];
  tasks: Task[];
  logs: StudyLog[];
  streakState: StreakState;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  subjects,
  tasks,
  logs,
  streakState,
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  // Compute 7 days breakdown
  const dailySubjectData = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const now = new Date();
    const result = [];

    const numDays = timeRange === 'week' ? 7 : 14;

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = shortDays[d.getDay()];
      const fullDay = days[d.getDay()];

      const dayLogs = logs.filter((l) => {
        const matchesDate = l.date === dateStr;
        if (selectedSubjectId === 'all') return matchesDate;
        return matchesDate && l.subjectId === selectedSubjectId;
      });

      const totalSeconds = dayLogs.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      const totalMinutes = Math.round(totalSeconds / 60);
      const hours = (totalMinutes / 60).toFixed(1);

      // breakdown per subject
      const subjectBreakdown: Record<string, number> = {};
      subjects.forEach((s) => {
        const sLogs = dayLogs.filter((l) => l.subjectId === s.id);
        subjectBreakdown[s.id] = Math.round(sLogs.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);
      });

      result.push({
        dateStr,
        dayName,
        fullDay,
        totalMinutes,
        hours,
        subjectBreakdown,
        isToday: i === 0,
      });
    }

    const maxMins = Math.max(...result.map((r) => r.totalMinutes), 120);

    return result.map((r) => ({
      ...r,
      fillPercentage: Math.min(100, (r.totalMinutes / maxMins) * 100),
    }));
  }, [logs, subjects, timeRange, selectedSubjectId]);

  // Aggregate totals
  const overallStats = useMemo(() => {
    const totalMinutes = Math.round(logs.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Subject breakdown
    const subjectStats = subjects.map((sub) => {
      const subLogs = logs.filter((l) => l.subjectId === sub.id);
      const subMinutes = Math.round(subLogs.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);
      const subHours = (subMinutes / 60).toFixed(1);
      const targetWeeklyMinutes = sub.targetHoursPerWeek * 60;
      const progressPercent = Math.min(100, Math.round((subMinutes / targetWeeklyMinutes) * 100));

      return {
        subject: sub,
        minutes: subMinutes,
        hours: subHours,
        targetHours: sub.targetHoursPerWeek,
        progressPercent,
      };
    });

    const completedTasksCount = tasks.filter((t) => t.completed).length;

    return {
      totalHours,
      totalMinutes,
      completedTasksCount,
      totalTasksCount: tasks.length,
      subjectStats,
    };
  }, [logs, subjects, tasks]);

  const streakMilestones = [
    { days: 3, label: 'Starter Spark', icon: '⚡', reward: 50, achieved: streakState.currentStreak >= 3 },
    { days: 7, label: '7-Day Momentum', icon: '🔥', reward: 100, achieved: streakState.currentStreak >= 7 },
    { days: 14, label: '2-Week Scholar', icon: '🌟', reward: 250, achieved: streakState.currentStreak >= 14 },
    { days: 30, label: 'Master of Habit', icon: '👑', reward: 500, achieved: streakState.currentStreak >= 30 },
  ];

  return (
    <div id="progress-view" class="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Metric Cards Row - Tricolored Neumorphism */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Study Hours */}
        <div class="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex items-center justify-between">
          <div>
            <span class="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
              Total Studied
            </span>
            <h3 class="text-2xl font-extrabold text-blue-600 tracking-tight mt-0.5">
              {overallStats.totalHours} hrs
            </h3>
            <p class="text-[10px] text-gray-500 mt-1">{overallStats.totalMinutes} total minutes</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-xl text-blue-600">
            ⏳
          </div>
        </div>

        {/* Card 2: Current Streak & Multiplier */}
        <div class="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex items-center justify-between border-l-4 border-orange-500">
          <div>
            <span class="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
              Study Streak
            </span>
            <h3 class="text-2xl font-extrabold text-orange-500 tracking-tight mt-0.5 flex items-center gap-1">
              🔥 {streakState.currentStreak} Days
            </h3>
            <p class="text-[10px] text-gray-500 mt-1">Best record: {streakState.bestStreak} days</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-xl text-orange-500">
            ⚡
          </div>
        </div>

        {/* Card 3: Currency & Credits */}
        <div class="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex items-center justify-between">
          <div>
            <span class="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
              Goal Credits
            </span>
            <h3 class="text-2xl font-extrabold text-emerald-600 tracking-tight mt-0.5">
              🪙 {streakState.credits}
            </h3>
            <p class="text-[10px] text-gray-500 mt-1">+25 per task • +10 per session</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-xl text-emerald-600">
            💰
          </div>
        </div>

        {/* Card 4: Tasks Completion Rate */}
        <div class="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex items-center justify-between">
          <div>
            <span class="text-[11px] uppercase font-bold text-gray-500 tracking-wider">
              Tasks Cleared
            </span>
            <h3 class="text-2xl font-extrabold text-purple-600 tracking-tight mt-0.5">
              {overallStats.completedTasksCount} / {overallStats.totalTasksCount}
            </h3>
            <p class="text-[10px] text-gray-500 mt-1">
              {overallStats.totalTasksCount > 0
                ? `${Math.round((overallStats.completedTasksCount / overallStats.totalTasksCount) * 100)}% completion`
                : '0%'}
            </p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-xl text-purple-600">
            🎯
          </div>
        </div>
      </div>

      {/* Main Chart Section: Hours Spent Per Subject Per Day */}
      <section
        id="daily-hours-chart-section"
        class="rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-8 flex flex-col gap-6"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800 tracking-tight">
              Hours Spent Per Subject Per Day
            </h3>
            <p class="text-xs text-gray-500 font-medium mt-0.5">
              Daily time investment visualization and breakdown
            </p>
          </div>

          {/* Controls: Subject Filter & Range Toggle */}
          <div class="flex items-center gap-3">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              class="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3 py-1.5 text-xs font-bold text-gray-700 border-none outline-none"
            >
              <option value="all">All Subjects (Combined)</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>

            <div class="flex bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff] p-1 rounded-xl">
              <button
                onClick={() => {
                  playClickSound();
                  setTimeRange('week');
                }}
                class={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === 'week' ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600' : 'text-gray-500'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setTimeRange('month');
                }}
                class={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  timeRange === 'month' ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600' : 'text-gray-500'
                }`}
              >
                14 Days
              </button>
            </div>
          </div>
        </div>

        {/* Visual Multi-Bar Inset Chart */}
        <div class="h-64 sm:h-72 w-full flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-6 pt-4 pb-2 border-b border-gray-300/60">
          {dailySubjectData.map((day, idx) => (
            <div key={idx} class="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
              {/* Tooltip / Hours badge */}
              <div class="text-[11px] font-bold text-gray-600 bg-white/70 px-2 py-0.5 rounded-md shadow-xs opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all">
                {day.hours}h
              </div>

              {/* Inset Pill Track with Stacked Subject Bars */}
              <div class="w-full max-w-[48px] h-48 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] rounded-2xl relative overflow-hidden flex flex-col justify-end p-1">
                {selectedSubjectId === 'all' ? (
                  // Multi-subject stacked slices
                  <div class="w-full flex flex-col-reverse rounded-xl overflow-hidden shadow-sm">
                    {subjects.map((sub) => {
                      const subMins = day.subjectBreakdown[sub.id] || 0;
                      if (subMins === 0) return null;
                      const maxDaily = 180;
                      const sliceHeight = Math.min(100, (subMins / maxDaily) * 100);

                      return (
                        <div
                          key={sub.id}
                          style={{
                            height: `${sliceHeight}%`,
                            minHeight: '6px',
                            backgroundColor: sub.color,
                          }}
                          title={`${sub.name}: ${subMins}m`}
                          class="w-full transition-all duration-500 hover:brightness-110"
                        />
                      );
                    })}
                  </div>
                ) : (
                  // Single Subject Bar
                  <div
                    class="w-full rounded-xl transition-all duration-700 ease-out shadow-sm"
                    style={{
                      height: `${day.fillPercentage}%`,
                      backgroundColor: subjects.find((s) => s.id === selectedSubjectId)?.color || '#3b82f6',
                    }}
                  />
                )}
              </div>

              {/* Day Label */}
              <div class="text-center">
                <span
                  class={`text-[11px] font-bold uppercase tracking-tight block ${
                    day.isToday ? 'text-blue-600 font-extrabold scale-110' : 'text-gray-500'
                  }`}
                >
                  {day.dayName}
                </span>
                <span class="text-[9px] text-gray-400 block">{day.dateStr.slice(5)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div class="flex flex-wrap items-center justify-center gap-4 pt-2">
          {subjects.map((sub) => (
            <div key={sub.id} class="flex items-center gap-1.5 text-xs font-bold text-gray-600">
              <span class="w-3 h-3 rounded-md shadow-xs" style={{ backgroundColor: sub.color }}></span>
              <span>{sub.icon} {sub.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Split Grid: Subject Goals Breakdown & Streak Rewards Ladder */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Subject Targets & Progress */}
        <section
          id="subject-goals-breakdown"
          class="lg:col-span-7 rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col gap-4"
        >
          <div>
            <h3 class="text-lg font-bold text-gray-800 tracking-tight">
              Subject Study Goals vs. Actual Hours
            </h3>
            <p class="text-xs text-gray-500 font-medium">
              Weekly progress toward target mastery hours
            </p>
          </div>

          <div class="space-y-4 flex-1">
            {overallStats.subjectStats.map((item) => (
              <div
                key={item.subject.id}
                class="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col gap-2"
              >
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-base">{item.subject.icon}</span>
                    <strong class="font-bold text-gray-800 text-sm">{item.subject.name}</strong>
                  </div>
                  <div class="font-bold text-gray-700">
                    <span class="text-blue-600 font-extrabold">{item.hours}h</span> / {item.targetHours}h target ({item.progressPercent}%)
                  </div>
                </div>

                {/* Neumorphic Inset Meter Bar */}
                <div class="w-full h-3 bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] rounded-full overflow-hidden p-0.5">
                  <div
                    class="h-full rounded-full transition-all duration-800 ease-out"
                    style={{
                      width: `${item.progressPercent}%`,
                      backgroundColor: item.subject.color,
                      boxShadow: `0 0 8px ${item.subject.color}80`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right (5 cols): Streak Achievements & Milestones */}
        <section
          id="streak-milestones-section"
          class="lg:col-span-5 rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col gap-4"
        >
          <div>
            <h3 class="text-lg font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span>🔥</span> Streak Milestones & Rewards
            </h3>
            <p class="text-xs text-gray-500 font-medium">
              Complete daily goals to maintain streaks and unlock currency
            </p>
          </div>

          <div class="space-y-3 flex-1">
            {streakMilestones.map((ms, idx) => (
              <div
                key={idx}
                class={`p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                  ms.achieved
                    ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] border-l-4 border-orange-500'
                    : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] opacity-75'
                }`}
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{ms.icon}</span>
                  <div>
                    <h4 class="font-bold text-xs text-gray-800">{ms.label}</h4>
                    <p class="text-[10px] text-gray-500">{ms.days} Days Streak Goal</p>
                  </div>
                </div>

                <div class="text-right">
                  <span class={`text-xs font-bold ${ms.achieved ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {ms.achieved ? '✓ Unlocked' : `+${ms.reward}🪙`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div class="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200 text-center text-xs text-orange-900 font-medium shadow-sm">
            🔥 Keep studying 15+ minutes or clear 1 task daily to preserve your streak!
          </div>
        </section>
      </div>
    </div>
  );
};
