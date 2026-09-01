import React, { useState } from 'react';
import { StreakState, Subject } from '../types';
import { playClickSound } from '../utils/audio';

interface SidebarProps {
  activeTab: 'dashboard' | 'tasks' | 'progress' | 'assistant' | 'rewards';
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'progress' | 'assistant' | 'rewards') => void;
  streakState: StreakState;
  subjects: Subject[];
  onQuickAskAi?: (question: string, subject?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  streakState,
  subjects,
  onQuickAskAi,
}) => {
  const [quickQuestion, setQuickQuestion] = useState('');
  const [miniChatLogs, setMiniChatLogs] = useState<Array<{ q: string; a: string; loading?: boolean }>>([
    {
      q: 'What is the derivative of sin(x)?',
      a: 'The derivative is cos(x). Need a step-by-step breakdown?',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const handleNav = (tab: 'dashboard' | 'tasks' | 'progress' | 'assistant' | 'rewards') => {
    playClickSound();
    setActiveTab(tab);
  };

  const handleMiniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestion.trim() || isAsking) return;

    const query = quickQuestion.trim();
    setQuickQuestion('');
    setIsAsking(true);

    const tempIndex = miniChatLogs.length;
    setMiniChatLogs((prev) => [...prev, { q: query, a: 'Thinking...', loading: true }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          subject: subjects[0]?.name || 'General',
        }),
      });
      const data = await res.json();
      const answer = data.reply || 'Here is the solution.';

      setMiniChatLogs((prev) =>
        prev.map((item, idx) => (idx === tempIndex ? { q: query, a: answer, loading: false } : item))
      );
    } catch {
      setMiniChatLogs((prev) =>
        prev.map((item, idx) =>
          idx === tempIndex
            ? { q: query, a: 'Could not fetch solution. Open the AI Assistant tab for full tutor support.', loading: false }
            : item
        )
      );
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <aside id="sidebar-container" class="w-full lg:w-68 xl:w-72 flex flex-col gap-5 shrink-0">
      {/* Student Profile Card - Sleek Neumorphic Extruded */}
      <div
        id="profile-card"
        class="p-5 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex flex-col items-center gap-3 transition-all"
      >
        <div
          id="student-avatar"
          class="w-16 h-16 rounded-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center border-2 border-blue-400 relative"
        >
          <span class="text-2xl select-none">🎓</span>
          <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#e0e5ec] flex items-center justify-center">
            <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
          </div>
        </div>

        <div class="text-center">
          <h2 class="font-bold text-lg text-gray-800 tracking-tight">Alex Carter</h2>
          <p class="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
            Senior Student • Honor Roll
          </p>
        </div>

        {/* Streak & Currency Pill Stats */}
        <div
          id="profile-stats-row"
          class="flex items-center justify-around w-full mt-1 py-2 px-3 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]"
        >
          <div class="flex flex-col items-center cursor-pointer group" onClick={() => handleNav('progress')}>
            <span class="text-orange-500 font-extrabold text-base flex items-center gap-1">
              🔥 {streakState.currentStreak}
            </span>
            <span class="text-[10px] uppercase font-bold text-gray-500 group-hover:text-orange-600 transition-colors">
              Day Streak
            </span>
          </div>

          <div class="w-[1px] bg-[#b8b9be] h-7 opacity-60"></div>

          <div class="flex flex-col items-center cursor-pointer group" onClick={() => handleNav('rewards')}>
            <span class="text-blue-600 font-extrabold text-base flex items-center gap-1">
              🪙 {streakState.credits}
            </span>
            <span class="text-[10px] uppercase font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
              Credits
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <nav id="main-navigation" class="flex flex-col gap-3">
        <button
          id="nav-dashboard-btn"
          onClick={() => handleNav('dashboard')}
          class={`w-full py-3.5 px-5 rounded-2xl font-semibold text-left flex items-center justify-between transition-all ${
            activeTab === 'dashboard'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-gray-600 hover:text-gray-900 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
          }`}
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">📊</span>
            <span class="text-sm tracking-tight">Dashboard</span>
          </div>
          {activeTab === 'dashboard' && (
            <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
          )}
        </button>

        <button
          id="nav-tasks-btn"
          onClick={() => handleNav('tasks')}
          class={`w-full py-3.5 px-5 rounded-2xl font-semibold text-left flex items-center justify-between transition-all ${
            activeTab === 'tasks'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-gray-600 hover:text-gray-900 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
          }`}
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">📝</span>
            <span class="text-sm tracking-tight">Tasks & Timer</span>
          </div>
          {activeTab === 'tasks' && (
            <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
          )}
        </button>

        <button
          id="nav-progress-btn"
          onClick={() => handleNav('progress')}
          class={`w-full py-3.5 px-5 rounded-2xl font-semibold text-left flex items-center justify-between transition-all ${
            activeTab === 'progress'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-gray-600 hover:text-gray-900 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
          }`}
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">📈</span>
            <span class="text-sm tracking-tight">Progress & Hours</span>
          </div>
          {activeTab === 'progress' && (
            <span class="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
          )}
        </button>

        <button
          id="nav-assistant-btn"
          onClick={() => handleNav('assistant')}
          class={`w-full py-3.5 px-5 rounded-2xl font-semibold text-left flex items-center justify-between transition-all ${
            activeTab === 'assistant'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-gray-600 hover:text-gray-900 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
          }`}
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">🤖</span>
            <span class="text-sm tracking-tight">AI Subject Tutor</span>
          </div>
          <span class="text-[10px] bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-200">
            Gemini
          </span>
        </button>

        <button
          id="nav-rewards-btn"
          onClick={() => handleNav('rewards')}
          class={`w-full py-3.5 px-5 rounded-2xl font-semibold text-left flex items-center justify-between transition-all ${
            activeTab === 'rewards'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-gray-600 hover:text-gray-900 active:shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]'
          }`}
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">🎁</span>
            <span class="text-sm tracking-tight">Reward Store</span>
          </div>
          <span class="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
            Goals
          </span>
        </button>
      </nav>

      {/* Mini Study Assistant Widget matching Sleek Interface design */}
      <div
        id="sidebar-mini-assistant"
        class="p-4 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex flex-col mt-auto"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span class="text-xs font-bold uppercase tracking-tight text-gray-700">
              Study Assistant
            </span>
          </div>
          <button
            onClick={() => handleNav('assistant')}
            class="text-[10px] font-bold text-blue-600 hover:underline"
          >
            Full Tutor ↗
          </button>
        </div>

        <div class="max-h-36 overflow-y-auto space-y-2 mb-3 pr-1 text-[11px] leading-relaxed">
          {miniChatLogs.slice(-2).map((item, index) => (
            <div key={index} class="space-y-1.5">
              <div class="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] p-2 rounded-xl text-gray-700 font-medium">
                Q: {item.q}
              </div>
              <div class="bg-blue-50/90 text-blue-900 p-2 rounded-xl border border-blue-200/80 shadow-[2px_2px_5px_#b8b9be]">
                {item.loading ? (
                  <span class="inline-flex items-center gap-1 text-blue-600 font-medium animate-pulse">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Generating concise answer...
                  </span>
                ) : (
                  <span>💡 {item.a}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleMiniSubmit} class="flex gap-2">
          <input
            id="sidebar-quick-ask-input"
            type="text"
            placeholder="Ask quick question..."
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            disabled={isAsking}
            class="flex-1 bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            id="sidebar-quick-ask-btn"
            type="submit"
            disabled={isAsking || !quickQuestion.trim()}
            class="w-8 h-8 shrink-0 rounded-xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] flex items-center justify-center text-blue-600 font-bold hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] disabled:opacity-40 active:translate-y-0.5 transition-all"
          >
            ➜
          </button>
        </form>
      </div>
    </aside>
  );
};
