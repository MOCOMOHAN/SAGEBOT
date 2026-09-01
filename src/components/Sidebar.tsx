import React, { useState } from 'react';
import { StreakState, Subject, UserProfile } from '../types';
import { playClickSound } from '../utils/audio';
import { AvatarDisplay } from './AvatarDisplay';

export type TabType =
  | 'dashboard'
  | 'calendar'
  | 'skilltree'
  | 'smartstudy'
  | 'tasks'
  | 'progress'
  | 'assistant'
  | 'rewards'
  | 'profile';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  streakState: StreakState;
  subjects: Subject[];
  userProfile: UserProfile;
  onOpenAuthModal: () => void;
  onOpenLogoutModal: () => void;
  onQuickAskAi?: (question: string, subject?: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  streakState,
  subjects,
  userProfile,
  onOpenAuthModal,
  onOpenLogoutModal,
  onQuickAskAi,
}) => {
  const [quickQuestion, setQuickQuestion] = useState('');
  const [miniChatLogs, setMiniChatLogs] = useState<Array<{ q: string; a: string; loading?: boolean }>>([
    {
      q: 'What is the divergence theorem?',
      a: 'The divergence theorem equates the flux of a vector field through a closed surface to the volume integral of the divergence over the region inside.',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  const handleNav = (tab: TabType) => {
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
            ? {
                q: query,
                a: 'Could not fetch solution. Open the AI Tutor tab for full assistance.',
                loading: false,
              }
            : item
        )
      );
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <aside id="sidebar-container" className="w-full lg:w-68 xl:w-72 flex flex-col gap-5 shrink-0">
      {/* Student Profile Card - Sleek Neumorphic Extruded with Equipped Aesthetics */}
      <div
        id="profile-card"
        className="p-5 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex flex-col items-center gap-3 transition-all relative border border-white/40"
      >
        {/* Auth / Logout trigger button */}
        <button
          onClick={() => {
            playClickSound();
            if (userProfile.isLoggedIn) {
              onOpenLogoutModal();
            } else {
              onOpenAuthModal();
            }
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-[11px] font-bold text-blue-600 transition-all cursor-pointer"
          title={userProfile.isLoggedIn ? 'Account & Sign Out' : 'OAuth Sign In'}
        >
          {userProfile.isLoggedIn ? '🚪' : '🔐'}
        </button>

        {/* Avatar Display with equipped border & glow */}
        <div
          id="student-avatar-btn"
          onClick={() => handleNav('profile')}
          className="cursor-pointer group flex flex-col items-center"
          title="Open Profile & Avatar Aesthetics Studio"
        >
          <AvatarDisplay
            name={userProfile.name}
            avatarUrl={userProfile.profilePicture}
            border={userProfile.equippedBorder}
            glow={userProfile.equippedGlow}
            badge={userProfile.equippedBadge}
            status="studying"
            size="md"
            showStatus={true}
          />
        </div>

        <div
          onClick={() => handleNav('profile')}
          className="text-center w-full px-1 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <h2 className="font-black text-base text-gray-800 tracking-tight truncate">
              {userProfile.name}
            </h2>
          </div>

          {userProfile.equippedTitle && (
            <span className="inline-block mt-0.5 text-[9px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.2 rounded-full border border-purple-200 truncate max-w-[190px]">
              ✨ {userProfile.equippedTitle}
            </span>
          )}

          <p className="text-[11px] text-gray-500 font-semibold truncate mt-1">
            {userProfile.domainOfStudying}
          </p>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
            {userProfile.studentEducation}
          </p>
        </div>

        {/* Streak & Currency Pill Stats */}
        <div
          id="profile-stats-row"
          className="flex items-center justify-around w-full mt-1 py-2 px-3 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]"
        >
          <div
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => handleNav('calendar')}
          >
            <span className="text-orange-500 font-extrabold text-base flex items-center gap-1">
              🔥 {userProfile.streakCount || streakState.currentStreak}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-orange-600 transition-colors">
              Streak
            </span>
          </div>

          <div className="w-[1px] bg-[#b8b9be] h-7 opacity-60" />

          <div
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => handleNav('rewards')}
          >
            <span className="text-blue-600 font-extrabold text-base flex items-center gap-1">
              🪙 {userProfile.creditsValue || streakState.credits}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
              Credits
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu Buttons */}
      <nav id="main-navigation" className="flex flex-col gap-2">
        {/* 1. Dashboard */}
        <button
          id="nav-dashboard-btn"
          onClick={() => handleNav('dashboard')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">📊</span>
            <span className="text-xs tracking-tight">Dashboard</span>
          </div>
          {activeTab === 'dashboard' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          )}
        </button>

        {/* 2. Profile & Friends (NEW TAB) */}
        <button
          id="nav-profile-btn"
          onClick={() => handleNav('profile')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-purple-700'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-purple-700 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">👤</span>
            <span className="text-xs tracking-tight">Profile & Friends</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.2 rounded-full border border-purple-200">
              Leaderboard
            </span>
            {activeTab === 'profile' && (
              <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
            )}
          </div>
        </button>

        {/* 3. Calendar View (Goal Achieved per Date) */}
        <button
          id="nav-calendar-btn"
          onClick={() => handleNav('calendar')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">📅</span>
            <span className="text-xs tracking-tight">Study Calendar</span>
          </div>
          {activeTab === 'calendar' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          )}
        </button>

        {/* 4. Visualized Skill Tree (User -> Subject -> Topics Covered) */}
        <button
          id="nav-skilltree-btn"
          onClick={() => handleNav('skilltree')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'skilltree'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">🌳</span>
            <span className="text-xs tracking-tight">Visual Skill Tree</span>
          </div>
          {activeTab === 'skilltree' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          )}
        </button>

        {/* 5. Smart Study (Mermaid.js Mind Map & Flashcards) */}
        <button
          id="nav-smartstudy-btn"
          onClick={() => handleNav('smartstudy')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'smartstudy'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-purple-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-purple-600 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">🧠</span>
            <span className="text-xs tracking-tight">Smart Study Hub</span>
          </div>
          {activeTab === 'smartstudy' && (
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
          )}
        </button>

        {/* 6. Tasks & Timer */}
        <button
          id="nav-tasks-btn"
          onClick={() => handleNav('tasks')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">📝</span>
            <span className="text-xs tracking-tight">Tasks & Timer</span>
          </div>
          {activeTab === 'tasks' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          )}
        </button>

        {/* 7. Progress & Analytics */}
        <button
          id="nav-progress-btn"
          onClick={() => handleNav('progress')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'progress'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">📈</span>
            <span className="text-xs tracking-tight">Analytics & Stats</span>
          </div>
          {activeTab === 'progress' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          )}
        </button>

        {/* 8. AI Subject Tutor */}
        <button
          id="nav-assistant-btn"
          onClick={() => handleNav('assistant')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">🤖</span>
            <span className="text-xs tracking-tight">AI Subject Tutor</span>
          </div>
          <span className="text-[9px] bg-blue-100 text-blue-600 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
            Gemini
          </span>
        </button>

        {/* 9. Reward Store */}
        <button
          id="nav-rewards-btn"
          onClick={() => handleNav('rewards')}
          className={`w-full py-2.5 px-4 rounded-2xl font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
            activeTab === 'rewards'
              ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600'
              : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">🎁</span>
            <span className="text-xs tracking-tight">Reward Store</span>
          </div>
          {activeTab === 'rewards' && (
            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          )}
        </button>
      </nav>

      {/* Mini Study Assistant Widget */}
      <div
        id="sidebar-mini-assistant"
        className="p-4 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex flex-col mt-auto"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-tight text-gray-700">
              Quick Concept Solver
            </span>
          </div>
          <button
            onClick={() => handleNav('assistant')}
            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Expand ↗
          </button>
        </div>

        <div className="max-h-28 overflow-y-auto mb-3 space-y-2 pr-1 text-xs">
          {miniChatLogs.slice(-2).map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="font-bold text-blue-600 text-[11px] truncate">Q: {item.q}</div>
              <div className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] p-2 rounded-xl">
                {item.loading ? (
                  <span className="animate-pulse text-gray-400">Synthesizing explanation...</span>
                ) : (
                  item.a
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleMiniSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask quick question..."
            value={quickQuestion}
            onChange={(e) => setQuickQuestion(e.target.value)}
            disabled={isAsking}
            className="w-full text-xs py-2 px-3 rounded-xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-gray-700 placeholder-gray-400 focus:outline-hidden disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isAsking || !quickQuestion.trim()}
            className="p-2 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600 hover:text-blue-700 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
          >
            🚀
          </button>
        </form>
      </div>
    </aside>
  );
};
