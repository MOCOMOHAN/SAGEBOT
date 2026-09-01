import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { FriendUser, UserProfile, StreakState } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface FriendsLeaderboardProps {
  currentUser: UserProfile;
  streakState: StreakState;
  friends: FriendUser[];
  onOpenAddFriend: () => void;
  onSendCheer: (friendId: string) => void;
}

type LeaderboardMetric = 'weeklyTime' | 'streak' | 'credits' | 'tasks';

export const FriendsLeaderboard: React.FC<FriendsLeaderboardProps> = ({
  currentUser,
  streakState,
  friends,
  onOpenAddFriend,
  onSendCheer,
}) => {
  const [activeMetric, setActiveMetric] = useState<LeaderboardMetric>('weeklyTime');
  const [selectedFriendForCompare, setSelectedFriendForCompare] = useState<FriendUser | null>(null);
  const [cheeredFriendIds, setCheeredFriendIds] = useState<Record<string, boolean>>({});

  // Merge current user into leaderboard entries
  const currentLeaderboardUser: FriendUser = useMemo(() => ({
    id: currentUser.id,
    name: `${currentUser.name} (You)`,
    mailId: currentUser.mailId,
    avatar: currentUser.profilePicture,
    education: currentUser.studentEducation,
    domain: currentUser.domainOfStudying,
    university: currentUser.university || 'Stanford / Tech Institute',
    streak: currentUser.streakCount || streakState.currentStreak,
    // Weekly minutes calculation from streakState or current user stats
    studyMinutesThisWeek: Math.max(720, streakState.totalStudyMinutes % 1800 + 420), // approx 12-16 hrs
    totalCredits: currentUser.creditsValue || streakState.credits,
    equippedBorder: currentUser.equippedBorder,
    equippedGlow: currentUser.equippedGlow,
    equippedTitle: currentUser.equippedTitle,
    equippedBadge: currentUser.equippedBadge || '👑',
    isFriend: true,
    status: 'studying',
    currentStudyingSubject: 'Advanced Calculus',
    activeTask: "Green's Theorem Review",
    lastActive: 'Active now',
    bio: currentUser.bio || 'Crushing goals with StudyOrbit.',
    cheersReceived: 24,
    tasksCompletedWeek: streakState.totalTasksCompleted > 0 ? streakState.totalTasksCompleted : 14,
  }), [currentUser, streakState]);

  // Combined sorted leaderboard
  const rankedUsers = useMemo(() => {
    const all = [currentLeaderboardUser, ...friends.filter(f => f.isFriend)];

    return all.sort((a, b) => {
      if (activeMetric === 'weeklyTime') {
        return b.studyMinutesThisWeek - a.studyMinutesThisWeek;
      }
      if (activeMetric === 'streak') {
        return b.streak - a.streak;
      }
      if (activeMetric === 'credits') {
        return b.totalCredits - a.totalCredits;
      }
      if (activeMetric === 'tasks') {
        return (b.tasksCompletedWeek || 0) - (a.tasksCompletedWeek || 0);
      }
      return 0;
    });
  }, [currentLeaderboardUser, friends, activeMetric]);

  const handleCheerClick = (friend: FriendUser) => {
    if (friend.id === currentUser.id) return;
    playTaskCompleteSound();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
    });
    setCheeredFriendIds(prev => ({ ...prev, [friend.id]: true }));
    onSendCheer(friend.id);

    // Auto reset cheer animation state after 3 seconds
    setTimeout(() => {
      setCheeredFriendIds(prev => ({ ...prev, [friend.id]: false }));
    }, 3500);
  };

  const getMetricValueDisplay = (user: FriendUser) => {
    switch (activeMetric) {
      case 'weeklyTime': {
        const hours = (user.studyMinutesThisWeek / 60).toFixed(1);
        return `${hours} hrs`;
      }
      case 'streak':
        return `${user.streak} days 🔥`;
      case 'credits':
        return `${user.totalCredits} 🪙`;
      case 'tasks':
        return `${user.tasksCompletedWeek || 0} tasks ✅`;
      default:
        return '';
    }
  };

  // Top 3 Podium
  const top1 = rankedUsers[0];
  const top2 = rankedUsers[1];
  const top3 = rankedUsers[2];

  return (
    <div id="friends-leaderboard-container" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Header & Filter Controls */}
      <div
        id="leaderboard-header"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              🏆 Campus Friends Leaderboard
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
              Live Rankings
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Compete, cheer each other on, and showcase your unlocked Avatar Aesthetics!
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Add Friend Action */}
          <button
            id="add-friend-top-btn"
            onClick={() => {
              playClickSound();
              onOpenAddFriend();
            }}
            className="py-2 px-4 rounded-xl font-bold text-xs bg-[#e0e5ec] shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] text-blue-600 hover:text-blue-700 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>➕</span> Add Study Friend
          </button>
        </div>
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'weeklyTime', label: '⏱️ Weekly Study Time', desc: 'Hours this week' },
          { key: 'streak', label: '🔥 Streak Champions', desc: 'Consecutive days' },
          { key: 'credits', label: '🪙 Total Credits Earned', desc: 'Currency balance' },
          { key: 'tasks', label: '✅ Tasks Completed', desc: 'Academic milestone goals' },
        ].map((tab) => {
          const isActive = activeMetric === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                playClickSound();
                setActiveMetric(tab.key as LeaderboardMetric);
              }}
              className={`py-2.5 px-4 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600 border border-blue-200/60'
                  : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Top 3 Podium Cards */}
      {rankedUsers.length >= 3 && (
        <div id="leaderboard-podium" className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex flex-col items-center justify-between text-center relative border border-slate-300/40">
            <div className="absolute top-3 left-3 bg-slate-200 text-slate-700 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-slate-300">
              🥈 2nd Place
            </div>

            <div className="mt-4 flex flex-col items-center">
              <AvatarDisplay
                name={top2.name}
                avatarUrl={top2.avatar}
                border={top2.equippedBorder}
                glow={top2.equippedGlow}
                title={top2.equippedTitle}
                badge={top2.equippedBadge}
                status={top2.status}
                size="lg"
                showTitle={true}
                showStatus={true}
              />
              <h4 className="font-bold text-sm text-gray-800 mt-2">
                {top2.name}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium">
                {top2.domain}
              </p>
            </div>

            <div className="w-full mt-4 p-2.5 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold text-[11px]">Score</span>
              <span className="font-extrabold text-blue-600">
                {getMetricValueDisplay(top2)}
              </span>
            </div>

            {top2.id !== currentUser.id && (
              <button
                onClick={() => handleCheerClick(top2)}
                className={`w-full mt-3 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  cheeredFriendIds[top2.id]
                    ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                    : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-700 hover:text-blue-600'
                }`}
              >
                {cheeredFriendIds[top2.id] ? '🎉 Cheer Sent!' : '⚡ High-Five Cheer'}
              </button>
            )}
          </div>

          {/* Rank 1 (Gold Champion) */}
          <div className="order-1 md:order-2 rounded-3xl bg-[#e0e5ec] shadow-[10px_10px_20px_#b8b9be,-10px_-10px_20px_#ffffff] p-6 flex flex-col items-center justify-between text-center relative border-2 border-amber-300 transform md:-translate-y-2">
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
              👑 1st Champion
            </div>

            <div className="mt-4 flex flex-col items-center">
              <AvatarDisplay
                name={top1.name}
                avatarUrl={top1.avatar}
                border={top1.equippedBorder}
                glow={top1.equippedGlow}
                title={top1.equippedTitle}
                badge={top1.equippedBadge || '👑'}
                status={top1.status}
                size="xl"
                showTitle={true}
                showStatus={true}
              />
              <h4 className="font-extrabold text-base text-gray-900 mt-2">
                {top1.name}
              </h4>
              <p className="text-xs text-amber-700 font-bold">
                {top1.university} • {top1.domain}
              </p>
            </div>

            <div className="w-full mt-4 p-3 rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">🏆 Top Performance</span>
              <span className="font-black text-base text-amber-600">
                {getMetricValueDisplay(top1)}
              </span>
            </div>

            {top1.id !== currentUser.id && (
              <button
                onClick={() => handleCheerClick(top1)}
                className={`w-full mt-3 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  cheeredFriendIds[top1.id]
                    ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                    : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-amber-900 hover:text-amber-700 font-extrabold'
                }`}
              >
                {cheeredFriendIds[top1.id] ? '🎉 Cheer Sent!' : '👑 Send Champion Cheer'}
              </button>
            )}
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex flex-col items-center justify-between text-center relative border border-amber-600/30">
            <div className="absolute top-3 left-3 bg-amber-100 text-amber-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-300">
              🥉 3rd Place
            </div>

            <div className="mt-4 flex flex-col items-center">
              <AvatarDisplay
                name={top3.name}
                avatarUrl={top3.avatar}
                border={top3.equippedBorder}
                glow={top3.equippedGlow}
                title={top3.equippedTitle}
                badge={top3.equippedBadge}
                status={top3.status}
                size="lg"
                showTitle={true}
                showStatus={true}
              />
              <h4 className="font-bold text-sm text-gray-800 mt-2">
                {top3.name}
              </h4>
              <p className="text-[10px] text-gray-500 font-medium">
                {top3.domain}
              </p>
            </div>

            <div className="w-full mt-4 p-2.5 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between text-xs">
              <span className="text-gray-500 font-semibold text-[11px]">Score</span>
              <span className="font-extrabold text-blue-600">
                {getMetricValueDisplay(top3)}
              </span>
            </div>

            {top3.id !== currentUser.id && (
              <button
                onClick={() => handleCheerClick(top3)}
                className={`w-full mt-3 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  cheeredFriendIds[top3.id]
                    ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                    : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-700 hover:text-blue-600'
                }`}
              >
                {cheeredFriendIds[top3.id] ? '🎉 Cheer Sent!' : '⚡ High-Five Cheer'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Full Ranking Table List */}
      <div
        id="leaderboard-full-list"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-300/60">
          <h3 className="font-bold text-sm text-gray-700">Full Campus Rankings</h3>
          <span className="text-xs text-gray-500 font-medium">
            {rankedUsers.length} Students Active
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {rankedUsers.map((user, idx) => {
            const isMe = user.id === currentUser.id;
            const rank = idx + 1;

            return (
              <div
                key={user.id}
                className={`p-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all ${
                  isMe
                    ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] border-2 border-blue-400/80'
                    : 'bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-800'
                        : rank === 3
                        ? 'bg-amber-200 text-amber-900'
                        : 'text-gray-500 bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
                    }`}
                  >
                    {rank}
                  </div>

                  {/* Avatar Display */}
                  <AvatarDisplay
                    name={user.name}
                    avatarUrl={user.avatar}
                    border={user.equippedBorder}
                    glow={user.equippedGlow}
                    badge={user.equippedBadge}
                    status={user.status}
                    size="sm"
                    showStatus={true}
                  />

                  {/* Name & Academic Meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-xs truncate ${isMe ? 'text-blue-700' : 'text-gray-800'}`}>
                        {user.name}
                      </span>
                      {user.equippedTitle && (
                        <span className="text-[9px] font-bold text-purple-700 bg-purple-100 px-2 py-0.2 rounded-full border border-purple-200">
                          ✨ {user.equippedTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">
                      {user.domain} • <span className="text-orange-500 font-bold">🔥 {user.streak}d streak</span>
                    </p>
                  </div>
                </div>

                {/* Right: Score and Action */}
                <div className="flex items-center gap-3 shrink-0">
                  {user.status === 'studying' && user.currentStudyingSubject && (
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{user.currentStudyingSubject}</span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="font-extrabold text-sm text-gray-800 block">
                      {getMetricValueDisplay(user)}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">
                      {activeMetric === 'weeklyTime' ? 'This Week' : 'Score'}
                    </span>
                  </div>

                  {!isMe ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCheerClick(user)}
                        title="Send high-five cheer"
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cheeredFriendIds[user.id]
                            ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                            : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-amber-500 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]'
                        }`}
                      >
                        {cheeredFriendIds[user.id] ? '🎉' : '⚡'}
                      </button>

                      <button
                        onClick={() => {
                          playClickSound();
                          setSelectedFriendForCompare(user);
                        }}
                        title="Compare study statistics"
                        className="p-2 rounded-xl text-xs font-bold bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600 hover:text-blue-800 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] cursor-pointer"
                      >
                        📊
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200">
                      You
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compare Modal */}
      {selectedFriendForCompare && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#e0e5ec] shadow-[12px_12px_24px_#b8b9be,-12px_-12px_24px_#ffffff] p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-gray-300">
              <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                <span>📊</span> Study Orbit Comparison
              </h3>
              <button
                onClick={() => setSelectedFriendForCompare(null)}
                className="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] flex items-center justify-center text-gray-600 hover:text-gray-900 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              {/* You */}
              <div className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col items-center text-center">
                <AvatarDisplay
                  name={currentLeaderboardUser.name}
                  avatarUrl={currentLeaderboardUser.avatar}
                  border={currentLeaderboardUser.equippedBorder}
                  glow={currentLeaderboardUser.equippedGlow}
                  badge={currentLeaderboardUser.equippedBadge}
                  size="md"
                />
                <h4 className="font-bold text-xs text-blue-700 mt-2">You ({currentUser.name})</h4>
                <p className="text-[10px] text-gray-500">{currentUser.domainOfStudying}</p>

                <div className="w-full mt-3 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Streak:</span>
                    <span className="font-bold text-orange-600">{currentLeaderboardUser.streak} days</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Weekly Time:</span>
                    <span className="font-bold text-blue-600">{(currentLeaderboardUser.studyMinutesThisWeek / 60).toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Credits:</span>
                    <span className="font-bold text-amber-600">{currentLeaderboardUser.totalCredits} 🪙</span>
                  </div>
                </div>
              </div>

              {/* Friend */}
              <div className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col items-center text-center">
                <AvatarDisplay
                  name={selectedFriendForCompare.name}
                  avatarUrl={selectedFriendForCompare.avatar}
                  border={selectedFriendForCompare.equippedBorder}
                  glow={selectedFriendForCompare.equippedGlow}
                  badge={selectedFriendForCompare.equippedBadge}
                  size="md"
                />
                <h4 className="font-bold text-xs text-gray-800 mt-2">{selectedFriendForCompare.name}</h4>
                <p className="text-[10px] text-gray-500">{selectedFriendForCompare.domain}</p>

                <div className="w-full mt-3 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Streak:</span>
                    <span className="font-bold text-orange-600">{selectedFriendForCompare.streak} days</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Weekly Time:</span>
                    <span className="font-bold text-blue-600">{(selectedFriendForCompare.studyMinutesThisWeek / 60).toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500">Credits:</span>
                    <span className="font-bold text-amber-600">{selectedFriendForCompare.totalCredits} 🪙</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedFriendForCompare(null)}
                className="py-2 px-5 rounded-xl font-bold text-xs bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
