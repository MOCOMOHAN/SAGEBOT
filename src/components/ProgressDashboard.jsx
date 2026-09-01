import React, { useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  Trophy, 
  Target, 
  Calendar, 
  TrendingUp, 
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

export default function ProgressDashboard({
  subjects,
  tasks,
  studyLogs,
  streakState,
  userProfile,
}) {
  const [timeframe, setTimeframe] = useState('week'); // week, all

  // Helper to get past 7 days dates and day labels
  const getDaysArray = () => {
    const days = [];
    const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayLabels[d.getDay()];
      days.push({ date: dateStr, label: dayName, isToday: i === 0 });
    }
    return days;
  };

  const daysList = getDaysArray();

  // Aggregate hours spent per subject per day
  const dailyData = daysList.map((day) => {
    const dayLogs = studyLogs.filter((l) => l.date === day.date);
    const subjectMap = {};
    let totalSecs = 0;

    subjects.forEach((sub) => {
      subjectMap[sub.id] = 0;
    });

    dayLogs.forEach((log) => {
      totalSecs += log.durationSeconds || 0;
      subjectMap[log.subjectId] = (subjectMap[log.subjectId] || 0) + (log.durationSeconds || 0);
    });

    const totalMinutes = Math.round(totalSecs / 60);
    const totalHours = (totalSecs / 3600).toFixed(1);

    return {
      ...day,
      totalSeconds: totalSecs,
      totalMinutes,
      totalHours,
      subjectMap,
    };
  });

  // Find max daily hours for proportional bar height
  const maxDaySeconds = Math.max(
    ...dailyData.map((d) => d.totalSeconds),
    10800 // default minimum scale 3 hours
  );

  // Overall aggregates
  const totalStudySeconds = studyLogs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const totalStudyHours = (totalStudySeconds / 3600).toFixed(1);

  // Subject breakdowns
  const subjectTotals = subjects.map((sub) => {
    const logs = studyLogs.filter((l) => l.subjectId === sub.id);
    const secs = logs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const hours = (secs / 3600).toFixed(1);
    const percentage = totalStudySeconds > 0 ? Math.round((secs / totalStudySeconds) * 100) : 0;
    return {
      ...sub,
      totalSeconds: secs,
      hours,
      percentage,
    };
  }).sort((a, b) => b.totalSeconds - a.totalSeconds);

  // Completed tasks count
  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Metric Cards Row (Tricolored Neumorphic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Study Hours */}
        <div className="p-5 rounded-3xl neu-flat bg-[#e0e5ec] flex flex-col justify-between gap-3 border-b-4 border-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Total Hours</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-slate-800">
              {totalStudyHours} <span className="text-sm font-normal text-slate-500">hrs</span>
            </span>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
              Across {subjects.length} academic subjects
            </p>
          </div>
        </div>

        {/* Metric 2: Current Streak */}
        <div className="p-5 rounded-3xl neu-flat bg-[#e0e5ec] flex flex-col justify-between gap-3 border-b-4 border-orange-500">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Study Streak</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-orange-600">
              {streakState.currentStreak} <span className="text-sm font-normal text-slate-500">Days</span>
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Personal Best: {streakState.bestStreak} days
            </p>
          </div>
        </div>

        {/* Metric 3: Credits Earned */}
        <div className="p-5 rounded-3xl neu-flat bg-[#e0e5ec] flex flex-col justify-between gap-3 border-b-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Study Credits</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-emerald-600">
              🪙 {streakState.credits}
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Available to redeem rewards
            </p>
          </div>
        </div>

        {/* Metric 4: Task Completion Rate */}
        <div className="p-5 rounded-3xl neu-flat bg-[#e0e5ec] flex flex-col justify-between gap-3 border-b-4 border-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-400">Task Completion</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-heading text-purple-700">
              {completionRate}%
            </span>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
              {completedTasksCount} of {totalTasksCount} tasks done
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Overview Section (Matching Sleek Interface Design with Neumorphic Stacked Bars) */}
      <section className="rounded-[40px] neu-flat bg-[#e0e5ec] p-6 sm:p-7 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-xl font-heading text-slate-800 flex items-center gap-2">
              <span>📈</span> Weekly Study Overview & Daily Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Hours spent for each subject per day (Past 7 Days)
            </p>
          </div>

          {/* Subject Color Legend */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {subjects.slice(0, 4).map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Neumorphic Vertical Bar Columns matching the Sleek Design */}
        <div className="flex items-end justify-between px-2 sm:px-6 pt-4 pb-2 h-64 gap-2 sm:gap-6 border-b border-slate-300/40">
          {dailyData.map((day) => {
            const heightPercent = Math.min(100, Math.round((day.totalSeconds / maxDaySeconds) * 100));

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold px-2 py-1 rounded-md bg-slate-800 text-white shadow-sm pointer-events-none mb-1 text-center whitespace-nowrap">
                  {day.totalHours} hrs ({day.totalMinutes}m)
                </div>

                {/* Sunken Neumorphic Column Container */}
                <div className="w-full max-w-[48px] h-48 bg-[#e0e5ec] neu-pressed rounded-2xl relative overflow-hidden flex flex-col justify-end">
                  {/* Stacked Subject Fills */}
                  {day.totalSeconds > 0 ? (
                    subjects.map((sub) => {
                      const subSecs = day.subjectMap[sub.id] || 0;
                      if (subSecs === 0) return null;
                      const segmentHeightPercent = Math.round((subSecs / maxDaySeconds) * 100);

                      return (
                        <div
                          key={sub.id}
                          className="w-full transition-all duration-500"
                          style={{
                            height: `${segmentHeightPercent}%`,
                            backgroundColor: sub.color || '#3b82f6',
                          }}
                          title={`${sub.name}: ${(subSecs / 3600).toFixed(1)} hrs`}
                        />
                      );
                    })
                  ) : (
                    <div className="w-full h-1 bg-slate-300/30 self-end" />
                  )}
                </div>

                {/* Day Label */}
                <span
                  className={`text-[11px] font-bold ${
                    day.isToday
                      ? 'text-blue-600 underline font-extrabold'
                      : 'text-slate-500'
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two Column Section: Subject Distribution & Recent Session Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Progress & Distribution */}
        <section className="lg:col-span-6 p-6 rounded-[36px] neu-flat bg-[#e0e5ec] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-heading text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> Overall Subject Progress
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Distribution</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {subjectTotals.map((sub) => (
              <div key={sub.id} className="p-3.5 rounded-2xl neu-pressed bg-[#e0e5ec] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{sub.icon}</span>
                    <span className="font-bold text-xs text-slate-800">{sub.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-extrabold">
                    <span className="text-slate-700">{sub.hours} hrs</span>
                    <span className="text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md text-[10px]">
                      {sub.percentage}%
                    </span>
                  </div>
                </div>

                {/* Neumorphic progress bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-300/40 overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.max(5, sub.percentage)}%`,
                      backgroundColor: sub.color || '#3b82f6',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Study Session History Table */}
        <section className="lg:col-span-6 p-6 rounded-[36px] neu-flat bg-[#e0e5ec] flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-heading text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" /> Recent Study Sessions
            </h3>
            <span className="text-xs text-slate-400 font-semibold">{studyLogs.length} Sessions Logged</span>
          </div>

          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {studyLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No study sessions recorded yet.</p>
            ) : (
              studyLogs.slice(-8).reverse().map((log) => {
                const sub = subjects.find((s) => s.id === log.subjectId) || {
                  name: 'General',
                  icon: '📚',
                  color: '#3b82f6',
                };
                const minutes = Math.round((log.durationSeconds || 0) / 60);

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl neu-flat-sm bg-[#e0e5ec] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{sub.icon}</span>
                      <div>
                        <span className="font-bold text-slate-800 block">{sub.name}</span>
                        <span className="text-[10px] text-slate-400">{log.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200/50">
                        {minutes} mins
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
