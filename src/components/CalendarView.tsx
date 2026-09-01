import React, { useState } from 'react';
import { Subject, Task, StudyLog, DailyGoalRecord } from '../types';
import { playClickSound } from '../utils/audio';

interface CalendarViewProps {
  subjects: Subject[];
  tasks: Task[];
  logs: StudyLog[];
  dailyGoals: DailyGoalRecord[];
  onUpdateDailyGoal: (record: DailyGoalRecord) => void;
  onNavigateToSmartStudy?: (topic?: string) => void;
  onAddTaskForDate?: (title: string, subjectId: string, dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  subjects,
  tasks,
  logs,
  dailyGoals,
  onUpdateDailyGoal,
  onNavigateToSmartStudy,
  onAddTaskForDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [targetMinsInput, setTargetMinsInput] = useState<number>(60);
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickTaskSubject, setQuickTaskSubject] = useState(subjects[0]?.id || 'sub-calc');

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    playClickSound();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    playClickSound();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToToday = () => {
    playClickSound();
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format date string
  const formatDateStr = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Build grid days
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const dateStr = formatDateStr(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, d);
    calendarCells.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(year, month, d);
    calendarCells.push({ dayNumber: d, dateStr, isCurrentMonth: true });
  }

  // Next month leading days to complete grid
  const remainingCells = 42 - calendarCells.length; // 6 rows * 7 cols
  for (let d = 1; d <= (remainingCells >= 7 ? remainingCells % 7 + 7 : remainingCells); d++) {
    const dateStr = formatDateStr(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, d);
    calendarCells.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Get data for selected date
  const selectedGoal = dailyGoals.find((g) => g.date === selectedDateStr);
  const selectedLogs = logs.filter((l) => l.date === selectedDateStr);
  const selectedTasksCompleted = tasks.filter((t) => {
    if (!t.completed) return false;
    if (t.completedAt) return t.completedAt.startsWith(selectedDateStr);
    return false;
  });

  const totalMinutesStudiedOnSelectedDate = Math.round(
    selectedLogs.reduce((acc, log) => acc + log.durationSeconds / 60, 0)
  );

  const targetMinutes = selectedGoal?.targetMinutes || 60;
  const isGoalMet =
    selectedGoal?.goalAchieved || totalMinutesStudiedOnSelectedDate >= targetMinutes;
  const percentageMet = Math.min(
    Math.round((totalMinutesStudiedOnSelectedDate / (targetMinutes || 1)) * 100),
    400
  );

  const handleSaveGoalNote = () => {
    playClickSound();
    onUpdateDailyGoal({
      date: selectedDateStr,
      targetMinutes: targetMinsInput,
      achievedMinutes: totalMinutesStudiedOnSelectedDate,
      goalAchieved: totalMinutesStudiedOnSelectedDate >= targetMinsInput,
      tasksCompletedCount: selectedTasksCompleted.length,
      reflectionNote: noteText || selectedGoal?.reflectionNote,
    });
    setIsEditingNote(false);
  };

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    if (onAddTaskForDate) {
      onAddTaskForDate(quickTaskTitle.trim(), quickTaskSubject, selectedDateStr);
    }
    setQuickTaskTitle('');
  };

  return (
    <div id="calendar-view-container" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Header Bar */}
      <div
        id="calendar-header-card"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-2xl text-blue-600">
            📅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                Daily Study & Goal Achievement Calendar
              </h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                Daily Goals & History
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Select any date to view goal milestones, completed tasks, and studied subjects
            </p>
          </div>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-700 font-bold transition-all cursor-pointer"
            title="Previous Month"
          >
            ‹
          </button>
          <span className="text-sm font-extrabold text-gray-800 px-3 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="w-10 h-10 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-700 font-bold transition-all cursor-pointer"
            title="Next Month"
          >
            ›
          </button>
          <button
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-blue-600 transition-all cursor-pointer"
          >
            Today
          </button>
        </div>
      </div>

      {/* Main Calendar + Inspector Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Left / Top: Interactive Calendar Grid */}
        <div
          id="calendar-grid-card"
          className="lg:col-span-7 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 sm:p-6 flex flex-col gap-4"
        >
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center gap-1 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-300/60">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {calendarCells.map((cell, idx) => {
              const dateLogs = logs.filter((l) => l.date === cell.dateStr);
              const dayMins = Math.round(
                dateLogs.reduce((a, c) => a + c.durationSeconds / 60, 0)
              );
              const goalRec = dailyGoals.find((g) => g.date === cell.dateStr);
              const target = goalRec?.targetMinutes || 60;
              const met = (goalRec && goalRec.goalAchieved) || dayMins >= target;
              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];

              // Unique subject colors studied on this day
              const activeSubIds = Array.from(new Set(dateLogs.map((l) => l.subjectId)));

              return (
                <button
                  key={idx}
                  onClick={() => {
                    playClickSound();
                    setSelectedDateStr(cell.dateStr);
                    if (goalRec?.reflectionNote) setNoteText(goalRec.reflectionNote);
                    if (goalRec?.targetMinutes) setTargetMinsInput(goalRec.targetMinutes);
                  }}
                  className={`relative flex flex-col justify-between p-2 rounded-2xl min-h-[76px] sm:min-h-[88px] text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] ring-2 ring-blue-500 scale-[1.02]'
                      : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
                  } ${!cell.isCurrentMonth ? 'opacity-35' : 'opacity-100'}`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-extrabold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-blue-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Goal Met Indicator Badge */}
                    {dayMins > 0 && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          met
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                        title={met ? `Goal Achieved! (${dayMins}m / ${target}m)` : `${dayMins}m studied`}
                      >
                        {met ? '🎯 Met' : `${dayMins}m`}
                      </span>
                    )}
                  </div>

                  {/* Bottom Subject Indicators */}
                  <div className="flex items-center gap-1 mt-auto pt-1 flex-wrap">
                    {activeSubIds.slice(0, 3).map((subId) => {
                      const sub = subjects.find((s) => s.id === subId);
                      return (
                        <span
                          key={subId}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: sub?.color || '#3b82f6' }}
                          title={sub?.name}
                        />
                      );
                    })}
                    {activeSubIds.length > 3 && (
                      <span className="text-[8px] text-gray-400 font-bold">
                        +{activeSubIds.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-300/50 text-[11px] font-bold text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Goal Achieved (🎯)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                Partial Study Time
              </span>
            </div>
            <span className="text-gray-400">Click any day to inspect details</span>
          </div>
        </div>

        {/* Right / Bottom: Selected Day Goals & Achievements Inspector */}
        <div
          id="day-goal-inspector-card"
          className="lg:col-span-5 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 sm:p-6 flex flex-col gap-5 justify-between"
        >
          {/* Header for Selected Date */}
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-300/50">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Goal Milestones for
                </span>
                <h3 className="text-lg font-black text-gray-800 tracking-tight">
                  {new Date(`${selectedDateStr}T12:00:00`).toLocaleDateString(undefined, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
              </div>

              <div
                className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 ${
                  isGoalMet
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : totalMinutesStudiedOnSelectedDate > 0
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span>{isGoalMet ? '🎯' : '⏳'}</span>
                <span>
                  {isGoalMet
                    ? 'Goal Achieved'
                    : totalMinutesStudiedOnSelectedDate > 0
                    ? 'In Progress'
                    : 'No Activity Logged'}
                </span>
              </div>
            </div>

            {/* Goal Progress Ring / Stat Box */}
            <div className="mt-4 p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-gray-500">Daily Study Target</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-gray-800">
                    {totalMinutesStudiedOnSelectedDate}m
                  </span>
                  <span className="text-xs font-bold text-gray-400">/ {targetMinutes}m target</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-xl">
                  {percentageMet}% Target
                </span>
                <p className="text-[10px] text-gray-400 font-medium mt-1">
                  {selectedTasksCompleted.length} tasks finished
                </p>
              </div>
            </div>

            {/* Subject Distribution on This Date */}
            <div className="mt-4">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Study Time by Subject
              </h4>
              {selectedLogs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-center text-xs text-gray-400">
                  No focus sessions logged on this date.
                </div>
              ) : (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {selectedLogs.map((log) => {
                    const sub = subjects.find((s) => s.id === log.subjectId);
                    const mins = Math.round(log.durationSeconds / 60);
                    return (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{sub?.icon || '📚'}</span>
                          <div>
                            <span className="font-bold text-gray-800">{sub?.name || 'Subject'}</span>
                            {log.taskTitle && (
                              <p className="text-[10px] text-gray-500 truncate max-w-[180px]">
                                {log.taskTitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-extrabold text-blue-600">{mins} mins</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Tasks on This Date */}
            <div className="mt-4">
              <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Tasks Completed on this Date
              </h4>
              {selectedTasksCompleted.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No tasks completed on this date.</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedTasksCompleted.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 p-2 rounded-xl bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700"
                    >
                      <span className="text-emerald-600">✓</span>
                      <span className="line-through text-gray-500">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reflection Note / Target Adjuster */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Daily Goal & Reflection Note
                </h4>
                <button
                  onClick={() => setIsEditingNote((prev) => !prev)}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  {isEditingNote ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>

              {isEditingNote ? (
                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-600">Target Goal (mins):</span>
                    <input
                      type="number"
                      value={targetMinsInput}
                      onChange={(e) => setTargetMinsInput(Number(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] font-bold text-blue-600 outline-none text-xs"
                      min={10}
                      max={480}
                    />
                  </div>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Reflect on today's breakthroughs, challenges, or goals..."
                    className="w-full h-16 p-2 rounded-xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs text-gray-700 outline-none resize-none"
                  />
                  <button
                    onClick={handleSaveGoalNote}
                    className="self-end px-4 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:bg-blue-700 cursor-pointer"
                  >
                    Save Goal Record
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-600 bg-[#e0e5ec] p-3 rounded-2xl shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] italic">
                  {selectedGoal?.reflectionNote ||
                    'No reflection note recorded yet for this date. Click Edit to add notes.'}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Footer */}
          <div className="pt-3 border-t border-gray-300/50 flex flex-col gap-2">
            {onNavigateToSmartStudy && (
              <button
                onClick={() => {
                  playClickSound();
                  onNavigateToSmartStudy(selectedLogs[0]?.taskTitle || 'Multivariable Integration');
                }}
                className="w-full py-2.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-extrabold text-blue-600 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>🧠 Review This Day's Topics in Smart Study</span>
                <span>➔</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
