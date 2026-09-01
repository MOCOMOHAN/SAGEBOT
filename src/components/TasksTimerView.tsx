import React, { useState } from 'react';
import { Subject, Task, StreakState } from '../types';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface TasksTimerViewProps {
  subjects: Subject[];
  tasks: Task[];
  streakState: StreakState;
  activeTaskId: string | null;
  setActiveTaskId: (id: string | null) => void;
  timerSeconds: number;
  timerTotal: number;
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSetTimerDuration: (minutes: number) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'timeSpentSeconds'>) => void;
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onToggleTaskComplete: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteSubject: (subjectId: string) => void;
}

export const TasksTimerView: React.FC<TasksTimerViewProps> = ({
  subjects,
  tasks,
  streakState,
  activeTaskId,
  setActiveTaskId,
  timerSeconds,
  timerTotal,
  isTimerRunning,
  onToggleTimer,
  onResetTimer,
  onSetTimerDuration,
  onAddTask,
  onAddSubject,
  onToggleTaskComplete,
  onDeleteTask,
  onDeleteSubject,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubjectId, setNewTaskSubjectId] = useState(subjects[0]?.id || '');
  const [newTaskEstMinutes, setNewTaskEstMinutes] = useState(45);
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDescription, setNewTaskDescription] = useState('');

  // New subject form state
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#3b82f6');
  const [newSubIcon, setNewSubIcon] = useState('📚');
  const [newSubTargetHours, setNewSubTargetHours] = useState(6);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs === 0) return `${mins}m ${secs}s`;
    return `${hrs}h ${mins}m`;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      subjectId: newTaskSubjectId || subjects[0]?.id || '',
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim(),
      estimatedMinutes: Number(newTaskEstMinutes) || 30,
      completed: false,
      priority: newTaskPriority,
    });

    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowAddTaskModal(false);
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    onAddSubject({
      name: newSubName.trim(),
      color: newSubColor,
      icon: newSubIcon || '📖',
      targetHoursPerWeek: Number(newSubTargetHours) || 5,
    });

    setNewSubName('');
    setShowAddSubjectModal(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (selectedSubjectFilter === 'all') return true;
    return t.subjectId === selectedSubjectFilter;
  });

  const activeTask = tasks.find((t) => t.id === activeTaskId) || tasks[0];
  const activeSubject = subjects.find((s) => s.id === activeTask?.subjectId);

  // Timer SVG math
  const timerProgressFraction = timerTotal > 0 ? (timerTotal - timerSeconds) / timerTotal : 0;
  const strokeRadius = 92;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference * (1 - timerProgressFraction);

  const colorPalette = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'];
  const iconOptions = ['📚', '📐', '🧪', '📊', '⚛️', '📜', '💻', '🎨', '🌐', '🧠'];

  return (
    <div id="tasks-timer-view" class="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Header & Quick Subject Badges */}
      <div
        id="subjects-bar"
        class="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div class="flex-1">
          <h2 class="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
            <span>📚</span> Study Subjects & Task Management
          </h2>
          <p class="text-xs text-gray-500 font-medium mt-0.5">
            Organize coursework, assign time estimates, and track active study hours
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            id="open-add-subject-btn"
            onClick={() => {
              playClickSound();
              setShowAddSubjectModal(true);
            }}
            class="py-2 px-4 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-all"
          >
            <span>+</span> Add Subject
          </button>

          <button
            id="open-add-task-btn"
            onClick={() => {
              playClickSound();
              setShowAddTaskModal(true);
            }}
            class="py-2 px-4 rounded-xl bg-blue-600 text-white shadow-[4px_4px_10px_#b8b9be,-4px_-4px_10px_#ffffff] hover:bg-blue-700 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span>+</span> New Task
          </button>
        </div>
      </div>

      {/* Subject Filter Chips */}
      <div id="subject-chips-row" class="flex items-center gap-2 overflow-x-auto pb-1 px-1">
        <button
          onClick={() => {
            playClickSound();
            setSelectedSubjectFilter('all');
          }}
          class={`py-2 px-4 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            selectedSubjectFilter === 'all'
              ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600 border border-blue-200'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-600 hover:text-gray-900'
          }`}
        >
          All Subjects ({tasks.length})
        </button>

        {subjects.map((sub) => {
          const subTaskCount = tasks.filter((t) => t.subjectId === sub.id).length;
          const subTimeSpent = tasks
            .filter((t) => t.subjectId === sub.id)
            .reduce((acc, curr) => acc + curr.timeSpentSeconds, 0);

          return (
            <button
              key={sub.id}
              onClick={() => {
                playClickSound();
                setSelectedSubjectFilter(sub.id);
              }}
              class={`py-2 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedSubjectFilter === sub.id
                  ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600 border border-blue-200'
                  : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-600 hover:text-gray-900'
              }`}
            >
              <span class="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sub.color }}></span>
              <span>{sub.icon} {sub.name}</span>
              <span class="text-[10px] opacity-70 bg-[#b8b9be]/20 px-1.5 py-0.5 rounded-md">
                {formatDuration(subTimeSpent)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Split Grid: Interactive Timer Station & Tasks Workspace */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (7 cols): Tasks Manager & Subject Tracker */}
        <section
          id="tasks-manager-section"
          class="lg:col-span-7 rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col"
        >
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="font-bold text-lg text-gray-800 tracking-tight">
                Subject Tasks ({filteredTasks.length})
              </h3>
              <p class="text-xs text-gray-500">
                Click a task to connect to the focus timer
              </p>
            </div>

            <div class="text-xs font-bold text-gray-500 bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] px-3 py-1.5 rounded-xl">
              Completed: {tasks.filter((t) => t.completed).length}/{tasks.length}
            </div>
          </div>

          {/* Task Cards List */}
          <div id="tasks-scroll-list" class="space-y-3.5 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {filteredTasks.length === 0 ? (
              <div class="p-8 text-center bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-gray-500">
                <span class="text-3xl block mb-2">📝</span>
                <p class="text-sm font-bold text-gray-700">No tasks in this category yet</p>
                <p class="text-xs text-gray-500 mt-1">Click "+ New Task" to create one and start studying</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const sub = subjects.find((s) => s.id === task.subjectId);
                const isSelected = activeTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      playClickSound();
                      setActiveTaskId(task.id);
                    }}
                    class={`p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col gap-2.5 ${
                      isSelected
                        ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-l-4 border-blue-500'
                        : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                    }`}
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-start gap-3 flex-1">
                        {/* Completion Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTaskComplete(task.id);
                          }}
                          class={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                            task.completed
                              ? 'bg-emerald-500 text-white shadow-[2px_2px_5px_#10b981]'
                              : 'bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-transparent hover:text-gray-400'
                          }`}
                          title={task.completed ? 'Mark incomplete' : 'Complete task (+25 Credits & Streak)'}
                        >
                          ✓
                        </button>

                        <div class="flex-1">
                          <div class="flex flex-wrap items-center gap-2">
                            <span
                              class="text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white shadow-sm"
                              style={{ backgroundColor: sub?.color || '#3b82f6' }}
                            >
                              {sub?.icon} {sub?.name || 'Subject'}
                            </span>
                            <span
                              class={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                task.priority === 'high'
                                  ? 'bg-rose-100 text-rose-700'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {task.priority} Priority
                            </span>
                          </div>

                          <h4
                            class={`font-bold text-sm mt-1.5 ${
                              task.completed ? 'line-through text-gray-400' : 'text-gray-800'
                            }`}
                          >
                            {task.title}
                          </h4>

                          {task.description && (
                            <p class="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete Task */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this task?')) {
                            onDeleteTask(task.id);
                          }
                        }}
                        class="text-gray-400 hover:text-rose-500 text-xs p-1 opacity-60 hover:opacity-100 transition-opacity"
                        title="Delete Task"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Footer Row with Time Spent and Timer Action */}
                    <div class="flex items-center justify-between pt-2 border-t border-gray-300/40 text-xs text-gray-600">
                      <div class="flex items-center gap-2">
                        <span class="font-medium">
                          Spent: <strong class="text-gray-900 font-bold">{formatDuration(task.timeSpentSeconds)}</strong>
                        </span>
                        <span class="text-gray-400">/</span>
                        <span class="text-gray-500">{task.estimatedMinutes}m est.</span>
                      </div>

                      <div class="flex items-center gap-2">
                        {isSelected && isTimerRunning ? (
                          <span class="text-orange-600 font-bold text-[11px] animate-pulse flex items-center gap-1">
                            <span>⏱</span> Tracking...
                          </span>
                        ) : (
                          <span class="text-blue-600 font-bold text-[11px] hover:underline">
                            {isSelected ? 'Ready on Timer' : 'Select Timer'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right (5 cols): Dedicated Neumorphic Focus Station */}
        <section
          id="focus-station-section"
          class="lg:col-span-5 rounded-[36px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col items-center justify-between gap-6"
        >
          <div class="w-full text-center">
            <h3 class="font-bold text-lg text-gray-800 tracking-tight">
              Focus Study Timer
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              Active Task: <strong class="text-gray-800">{activeTask?.title || 'General Focus'}</strong>
            </p>
          </div>

          {/* Preset Duration Buttons */}
          <div class="flex items-center justify-center gap-2 w-full">
            {[
              { label: '25m', mins: 25 },
              { label: '50m', mins: 50 },
              { label: '5m Break', mins: 5 },
              { label: '15m Break', mins: 15 },
            ].map((preset) => (
              <button
                key={preset.mins}
                onClick={() => {
                  playClickSound();
                  onSetTimerDuration(preset.mins);
                }}
                class={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  timerTotal === preset.mins * 60
                    ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600 font-extrabold'
                    : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-900'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Large Neumorphic SVG Circular Timer */}
          <div class="relative flex items-center justify-center my-2">
            <div class="w-56 h-56 rounded-full bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex items-center justify-center">
              <div class="w-44 h-44 rounded-full bg-[#e0e5ec] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] flex items-center justify-center flex-col select-none">
                <span class="text-4xl font-mono font-extrabold text-blue-600 tracking-tight">
                  {formatTime(timerSeconds)}
                </span>
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {isTimerRunning ? 'Studying...' : 'Ready'}
                </span>
                <span
                  class="text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full text-white shadow-sm"
                  style={{ backgroundColor: activeSubject?.color || '#3b82f6' }}
                >
                  {activeSubject?.icon} {activeSubject?.name || 'Study'}
                </span>
              </div>
            </div>

            <svg class="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="112"
                cy="112"
                r={strokeRadius}
                fill="none"
                stroke="#b8b9be"
                strokeWidth="6"
                strokeOpacity="0.25"
              />
              <circle
                cx="112"
                cy="112"
                r={strokeRadius}
                fill="none"
                stroke={activeSubject?.color || '#3b82f6'}
                strokeWidth="8"
                strokeDasharray={strokeCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                class="transition-all duration-300"
              />
            </svg>
          </div>

          {/* Main Action Buttons */}
          <div class="flex items-center gap-4">
            <button
              onClick={() => {
                playClickSound();
                if (isTimerRunning) onToggleTimer();
              }}
              disabled={!isTimerRunning}
              class="w-14 h-14 rounded-full bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center text-xl text-gray-700 hover:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] active:shadow-inner disabled:opacity-40 transition-all"
              title="Pause Timer"
            >
              ⏸
            </button>

            <button
              id="focus-timer-main-toggle"
              onClick={() => {
                playClickSound();
                onToggleTimer();
              }}
              class={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-[6px_6px_14px_#b8b9be,-6px_-6px_14px_#ffffff] transition-all transform active:scale-95 ${
                isTimerRunning
                  ? 'bg-orange-500 hover:bg-orange-600 shadow-[0_0_16px_rgba(249,115,22,0.4)]'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_16px_rgba(59,130,246,0.4)]'
              }`}
              title={isTimerRunning ? 'Pause Focus Session' : 'Start Focus Session'}
            >
              {isTimerRunning ? '❚❚' : '▶'}
            </button>

            <button
              onClick={() => {
                playClickSound();
                onResetTimer();
              }}
              class="w-14 h-14 rounded-full bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] flex items-center justify-center text-xl text-gray-700 hover:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] active:shadow-inner transition-all"
              title="Reset Timer"
            >
              🔄
            </button>
          </div>

          {/* Reward Reminder Card */}
          <div class="w-full p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-center">
            <div class="flex items-center justify-center gap-2 text-xs font-bold text-gray-700">
              <span class="text-orange-500">🔥 Day Streak +1</span>
              <span>•</span>
              <span class="text-blue-600">+10 Credits / session</span>
            </div>
            <p class="text-[10px] text-gray-500 mt-1 font-medium">
              Time elapsed automatically logs to your subject analytics
            </p>
          </div>
        </section>
      </div>

      {/* Modal: Add Task */}
      {showAddTaskModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div class="w-full max-w-lg rounded-[36px] bg-[#e0e5ec] shadow-[12px_12px_24px_#00000040,-12px_-12px_24px_#ffffff] p-6 lg:p-8 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-800">Add New Subject Task</h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                class="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Multivariable Integration problem set..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  class="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-sm text-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={newTaskSubjectId}
                    onChange={(e) => setNewTaskSubjectId(e.target.value)}
                    class="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-3 py-3 text-sm text-gray-800 border-none outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                    Est. Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={newTaskEstMinutes}
                    onChange={(e) => setNewTaskEstMinutes(Number(e.target.value))}
                    class="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-sm text-gray-800 border-none outline-none"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Priority
                </label>
                <div class="flex gap-3">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      class={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        newTaskPriority === p
                          ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600 border border-blue-300'
                          : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Description / Study Objectives (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Key theorems, textbook chapters, formula review..."
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  class="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl p-3 text-sm text-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  class="py-2.5 px-5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="py-2.5 px-6 rounded-2xl bg-blue-600 text-white shadow-[4px_4px_10px_#b8b9be,-4px_-4px_10px_#ffffff] hover:bg-blue-700 text-xs font-bold"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Subject */}
      {showAddSubjectModal && (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div class="w-full max-w-md rounded-[36px] bg-[#e0e5ec] shadow-[12px_12px_24px_#00000040,-12px_-12px_24px_#ffffff] p-6 lg:p-8 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-800">Add New Subject</h3>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                class="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubject} class="space-y-4">
              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Computer Science, Biochemistry..."
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  class="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-sm text-gray-800 border-none outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Subject Icon
                </label>
                <div class="flex flex-wrap gap-2">
                  {iconOptions.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewSubIcon(ic)}
                      class={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                        newSubIcon === ic
                          ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] scale-110 border border-blue-400'
                          : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Theme Color
                </label>
                <div class="flex items-center gap-3">
                  {colorPalette.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubColor(c)}
                      class={`w-8 h-8 rounded-full transition-all ${
                        newSubColor === c
                          ? 'ring-4 ring-offset-2 ring-blue-500 scale-110 shadow-lg'
                          : 'shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff]'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase text-gray-600 mb-1.5">
                  Target Study Hours / Week
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={newSubTargetHours}
                  onChange={(e) => setNewSubTargetHours(Number(e.target.value))}
                  class="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl px-4 py-3 text-sm text-gray-800 border-none outline-none"
                />
              </div>

              <div class="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  class="py-2.5 px-5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="py-2.5 px-6 rounded-2xl bg-blue-600 text-white shadow-[4px_4px_10px_#b8b9be,-4px_-4px_10px_#ffffff] hover:bg-blue-700 text-xs font-bold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
