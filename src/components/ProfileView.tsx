import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, StreakState, RewardItem, FriendUser, FriendRequest } from '../types';
import { AvatarDisplay } from './AvatarDisplay';
import { FriendsLeaderboard } from './FriendsLeaderboard';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface ProfileViewProps {
  userProfile: UserProfile;
  streakState: StreakState;
  rewards: RewardItem[];
  friends: FriendUser[];
  friendRequests: FriendRequest[];
  suggestions: FriendUser[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onUnlockReward: (rewardId: string) => void;
  onAddFriend: (friend: FriendUser) => void;
  onRemoveFriend: (friendId: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onDeclineRequest: (requestId: string) => void;
  onSendCheer: (friendId: string) => void;
  onNavigateToTab: (tab: any) => void;
}

type ProfileSubTab = 'aesthetics' | 'friends' | 'leaderboard' | 'edit';

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  streakState,
  rewards,
  friends,
  friendRequests,
  suggestions,
  onUpdateProfile,
  onUnlockReward,
  onAddFriend,
  onRemoveFriend,
  onAcceptRequest,
  onDeclineRequest,
  onSendCheer,
  onNavigateToTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ProfileSubTab>('aesthetics');
  const [copiedCode, setCopiedCode] = useState(false);
  const [friendInput, setFriendInput] = useState('');
  const [addFriendFeedback, setAddFriendFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Edit Profile Form State
  const [editName, setEditName] = useState(userProfile.name);
  const [editDomain, setEditDomain] = useState(userProfile.domainOfStudying);
  const [editEducation, setEditEducation] = useState(userProfile.studentEducation);
  const [editUniversity, setEditUniversity] = useState(userProfile.university || 'Stanford / Tech Institute');
  const [editBio, setEditBio] = useState(userProfile.bio || 'Crushing study sessions and multivariable proofs.');
  const [editAvatarSeed, setEditAvatarSeed] = useState(userProfile.name);
  const [isSaved, setIsSaved] = useState(false);

  // Aesthetics filter in wardrobe
  const [aestheticTab, setAestheticTab] = useState<'borders' | 'glows' | 'titles' | 'badges'>('borders');

  // Categorize aesthetic rewards
  const frameRewards = rewards.filter((r) => r.category === 'avatar_frame' || r.aestheticType === 'border');
  const glowRewards = rewards.filter((r) => r.category === 'avatar_glow' || r.aestheticType === 'glow');
  const titleRewards = rewards.filter((r) => r.category === 'avatar_title' || r.aestheticType === 'title');
  const badgeRewards = rewards.filter((r) => r.category === 'badge' || r.aestheticType === 'badge');

  // Handle Equipping Aesthetics
  const handleEquipAesthetic = (type: 'border' | 'glow' | 'title' | 'badge', value: string, rewardItem?: RewardItem) => {
    if (rewardItem && !rewardItem.unlocked) {
      // Check if user can buy it directly
      if (streakState.credits >= rewardItem.cost) {
        if (confirm(`Unlock "${rewardItem.title}" for ${rewardItem.cost} credits and equip immediately?`)) {
          onUnlockReward(rewardItem.id);
          playTaskCompleteSound();
          confetti({ particleCount: 50, spread: 60 });
        } else {
          return;
        }
      } else {
        alert(`This aesthetic is locked! It costs ${rewardItem.cost} credits (you have ${streakState.credits}). Complete focus sessions or buy it in the Reward Store!`);
        return;
      }
    }

    playClickSound();
    if (type === 'border') {
      onUpdateProfile({ equippedBorder: value === userProfile.equippedBorder ? undefined : value });
    } else if (type === 'glow') {
      onUpdateProfile({ equippedGlow: value === userProfile.equippedGlow ? undefined : value });
    } else if (type === 'title') {
      onUpdateProfile({ equippedTitle: value === userProfile.equippedTitle ? undefined : value });
    } else if (type === 'badge') {
      onUpdateProfile({ equippedBadge: value === userProfile.equippedBadge ? undefined : value });
    }
  };

  // Copy Friend Code
  const handleCopyCode = () => {
    const code = userProfile.friendCode || 'ALEX-7821';
    navigator.clipboard.writeText(code);
    playClickSound();
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Add Friend submission
  const handleAddFriendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = friendInput.trim().toLowerCase();
    if (!query) return;

    // Check if matching suggestion or new friend
    const foundInSuggestions = suggestions.find(
      (s) => s.mailId?.toLowerCase().includes(query) || s.name.toLowerCase().includes(query) || query.includes(s.name.toLowerCase().split(' ')[0])
    );

    if (foundInSuggestions) {
      onAddFriend(foundInSuggestions);
      setAddFriendFeedback({ type: 'success', msg: `Added ${foundInSuggestions.name} to your friends list!` });
      setFriendInput('');
      playTaskCompleteSound();
      confetti({ particleCount: 40, spread: 50 });
      return;
    }

    // Check existing friends
    const alreadyFriend = friends.find(
      (f) => f.mailId?.toLowerCase() === query || f.name.toLowerCase() === query
    );
    if (alreadyFriend) {
      setAddFriendFeedback({ type: 'error', msg: `${alreadyFriend.name} is already in your friends list!` });
      return;
    }

    // Create custom peer friend
    const newFriend: FriendUser = {
      id: `usr-custom-${Date.now()}`,
      name: friendInput.includes('@') ? friendInput.split('@')[0] : friendInput,
      mailId: friendInput.includes('@') ? friendInput : `${friendInput.toLowerCase().replace(/\s+/g, '')}@campus.edu`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(friendInput)}`,
      education: 'Undergraduate (Year 3)',
      domain: 'Computer Science & Engineering',
      university: 'Campus Study Network',
      streak: Math.floor(Math.random() * 10) + 3,
      studyMinutesThisWeek: Math.floor(Math.random() * 400) + 300,
      totalCredits: Math.floor(Math.random() * 300) + 200,
      equippedBorder: 'cyber-holo',
      equippedGlow: 'cyan-pulse',
      equippedTitle: 'Quantum Pioneer',
      equippedBadge: '⚡',
      isFriend: true,
      status: 'online',
      lastActive: 'Just now',
      bio: 'New study friend from campus network.',
      cheersReceived: 5,
      tasksCompletedWeek: 7,
    };

    onAddFriend(newFriend);
    setAddFriendFeedback({ type: 'success', msg: `Friend invite sent & added ${newFriend.name}!` });
    setFriendInput('');
    playTaskCompleteSound();
    confetti({ particleCount: 40, spread: 50 });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    playTaskCompleteSound();
    onUpdateProfile({
      name: editName,
      domainOfStudying: editDomain,
      studentEducation: editEducation,
      university: editUniversity,
      bio: editBio,
      profilePicture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editAvatarSeed)}`,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div id="profile-view" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Banner Card with Student Passport & Avatar Preview */}
      <div
        id="profile-hero-card"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        {/* Left: Avatar Display + Identity */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Big Interactive Avatar with Equipped Aesthetics */}
          <div className="relative group">
            <AvatarDisplay
              name={userProfile.name}
              avatarUrl={userProfile.profilePicture}
              border={userProfile.equippedBorder}
              glow={userProfile.equippedGlow}
              badge={userProfile.equippedBadge}
              status="studying"
              size="xl"
              showStatus={true}
            />
            <button
              onClick={() => setActiveSubTab('aesthetics')}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-md text-xs hover:bg-blue-700 cursor-pointer transition-transform group-hover:scale-110"
              title="Customize Avatar Aesthetics"
            >
              🎨
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {userProfile.name}
              </h2>
              {userProfile.equippedTitle && (
                <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 shadow-xs">
                  ✨ {userProfile.equippedTitle}
                </span>
              )}
            </div>

            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">
              {userProfile.studentEducation} • {userProfile.university || 'Stanford / Tech Institute'}
            </p>
            <p className="text-xs font-semibold text-gray-600">
              {userProfile.domainOfStudying}
            </p>
            {userProfile.bio && (
              <p className="text-xs text-gray-500 italic max-w-md mt-1 leading-relaxed">
                "{userProfile.bio}"
              </p>
            )}

            {/* Friend Code Pill */}
            <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
              <div className="py-1 px-3 rounded-xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-mono font-bold text-gray-700 flex items-center gap-2">
                <span className="text-[10px] text-gray-400 font-sans font-bold uppercase">Friend Code:</span>
                <span className="text-blue-600">{userProfile.friendCode || 'ALEX-7821'}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="py-1 px-3 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-xs font-bold text-gray-700 hover:text-blue-600 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] cursor-pointer transition-all flex items-center gap-1"
              >
                {copiedCode ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats Cluster */}
        <div className="grid grid-cols-3 gap-3 shrink-0 w-full sm:w-auto">
          <div className="p-3.5 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col items-center justify-center text-center">
            <span className="text-xl">🔥</span>
            <span className="font-black text-base text-orange-600 mt-1">
              {userProfile.streakCount || streakState.currentStreak}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Streak</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col items-center justify-center text-center">
            <span className="text-xl">🪙</span>
            <span className="font-black text-base text-blue-600 mt-1">
              {userProfile.creditsValue || streakState.credits}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Credits</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col items-center justify-center text-center">
            <span className="text-xl">👥</span>
            <span className="font-black text-base text-emerald-600 mt-1">
              {friends.length}
            </span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Friends</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
        {[
          { key: 'aesthetics', label: '✨ Avatar Aesthetics Studio', icon: '🎨' },
          { key: 'friends', label: '👥 Study Friends & Add Peers', icon: '🤝' },
          { key: 'leaderboard', label: '🏆 Campus Leaderboard', icon: '📊' },
          { key: 'edit', label: '✏️ Edit Profile Info', icon: '📝' },
        ].map((tab) => {
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                playClickSound();
                setActiveSubTab(tab.key as ProfileSubTab);
              }}
              className={`py-3 px-5 rounded-2xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] text-blue-600 border border-blue-200/80'
                  : 'bg-[#e0e5ec] shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] text-gray-700 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: AVATAR AESTHETICS STUDIO */}
      {activeSubTab === 'aesthetics' && (
        <div id="avatar-aesthetics-studio" className="flex flex-col gap-6">
          {/* Aesthetics Header & Store Promo */}
          <div className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                <span>✨</span> Equippable Avatar Aesthetics
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Customize your glowing rings, celestial borders, and academic titles purchased in the Reward Store!
              </p>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onNavigateToTab('rewards');
              }}
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700 cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>🎁</span> Open Reward Store
            </button>
          </div>

          {/* Aesthetic Category Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { key: 'borders', label: '💫 Borders & Frames', count: frameRewards.length },
              { key: 'glows', label: '☀️ Auras & Glows', count: glowRewards.length },
              { key: 'titles', label: '📜 Prestige Titles', count: titleRewards.length },
              { key: 'badges', label: '👑 Crests & Badges', count: badgeRewards.length },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  playClickSound();
                  setAestheticTab(cat.key as any);
                }}
                className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  aestheticTab === cat.key
                    ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600'
                    : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-600'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          {/* Grid of Aesthetic Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Frames / Borders */}
            {aestheticTab === 'borders' && (
              <>
                {/* None Option */}
                <div
                  onClick={() => handleEquipAesthetic('border', '')}
                  className={`p-5 rounded-3xl cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    !userProfile.equippedBorder
                      ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-blue-500'
                      : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-400 font-bold text-lg">
                      ∅
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">Standard Minimal Ring</h4>
                      <p className="text-[11px] text-gray-500">Default clean avatar without custom effects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {!userProfile.equippedBorder ? (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-xl">✓ Equipped</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-500">Click to Equip</span>
                    )}
                  </div>
                </div>

                {frameRewards.map((reward) => {
                  const val = reward.aestheticValue || '';
                  const isEquipped = userProfile.equippedBorder === val;

                  return (
                    <div
                      key={reward.id}
                      className={`p-5 rounded-3xl flex flex-col justify-between gap-3 transition-all ${
                        isEquipped
                          ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-emerald-400'
                          : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <AvatarDisplay
                          name="Preview"
                          avatarUrl={userProfile.profilePicture}
                          border={val}
                          size="md"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                            <span>{reward.icon}</span>
                            <span className="truncate">{reward.title}</span>
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{reward.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-300/60">
                        <div className="flex items-center gap-1 text-xs">
                          {reward.unlocked ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              ✓ In Wardrobe
                            </span>
                          ) : (
                            <span className="text-gray-600 font-bold flex items-center gap-1">
                              🪙 {reward.cost} Credits
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleEquipAesthetic('border', val, reward)}
                          className={`py-1.5 px-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            isEquipped
                              ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                              : reward.unlocked
                              ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600 hover:text-blue-800'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                          }`}
                        >
                          {isEquipped ? '✓ Active Frame' : reward.unlocked ? 'Equip Frame' : 'Unlock & Equip'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* 2. Glows / Auras */}
            {aestheticTab === 'glows' && (
              <>
                {/* None Option */}
                <div
                  onClick={() => handleEquipAesthetic('glow', '')}
                  className={`p-5 rounded-3xl cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    !userProfile.equippedGlow
                      ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-blue-500'
                      : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-400 font-bold text-lg">
                      ∅
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">No Aura Effect</h4>
                      <p className="text-[11px] text-gray-500">Subtle default background shadow</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {!userProfile.equippedGlow ? (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-xl">✓ Equipped</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-500">Click to Equip</span>
                    )}
                  </div>
                </div>

                {glowRewards.map((reward) => {
                  const val = reward.aestheticValue || '';
                  const isEquipped = userProfile.equippedGlow === val;

                  return (
                    <div
                      key={reward.id}
                      className={`p-5 rounded-3xl flex flex-col justify-between gap-3 transition-all ${
                        isEquipped
                          ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-emerald-400'
                          : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <AvatarDisplay
                          name="Preview"
                          avatarUrl={userProfile.profilePicture}
                          glow={val}
                          size="md"
                        />

                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                            <span>{reward.icon}</span>
                            <span className="truncate">{reward.title}</span>
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{reward.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-300/60">
                        <div className="flex items-center gap-1 text-xs">
                          {reward.unlocked ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">✓ In Wardrobe</span>
                          ) : (
                            <span className="text-gray-600 font-bold flex items-center gap-1">🪙 {reward.cost} Credits</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleEquipAesthetic('glow', val, reward)}
                          className={`py-1.5 px-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            isEquipped
                              ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                              : reward.unlocked
                              ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600 hover:text-blue-800'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                          }`}
                        >
                          {isEquipped ? '✓ Active Aura' : reward.unlocked ? 'Equip Aura' : 'Unlock & Equip'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* 3. Prestige Titles */}
            {aestheticTab === 'titles' && (
              <>
                {/* None Option */}
                <div
                  onClick={() => handleEquipAesthetic('title', '')}
                  className={`p-5 rounded-3xl cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                    !userProfile.equippedTitle
                      ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-blue-500'
                      : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-gray-400 font-bold text-lg">
                      ∅
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">No Equipped Title</h4>
                      <p className="text-[11px] text-gray-500">Shows standard name only</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {!userProfile.equippedTitle ? (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-xl">✓ Equipped</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-500">Click to Equip</span>
                    )}
                  </div>
                </div>

                {titleRewards.map((reward) => {
                  const val = reward.aestheticValue || '';
                  const isEquipped = userProfile.equippedTitle === val;

                  return (
                    <div
                      key={reward.id}
                      className={`p-5 rounded-3xl flex flex-col justify-between gap-3 transition-all ${
                        isEquipped
                          ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-emerald-400'
                          : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] hover:shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff]'
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{reward.icon}</span>
                          <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
                            ✨ {val}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-800">{reward.title}</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{reward.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-300/60">
                        <div className="flex items-center gap-1 text-xs">
                          {reward.unlocked ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">✓ In Wardrobe</span>
                          ) : (
                            <span className="text-gray-600 font-bold flex items-center gap-1">🪙 {reward.cost} Credits</span>
                          )}
                        </div>

                        <button
                          onClick={() => handleEquipAesthetic('title', val, reward)}
                          className={`py-1.5 px-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            isEquipped
                              ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                              : reward.unlocked
                              ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600 hover:text-blue-800'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                          }`}
                        >
                          {isEquipped ? '✓ Active Title' : reward.unlocked ? 'Equip Title' : 'Unlock & Equip'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* 4. Badges */}
            {aestheticTab === 'badges' && (
              <>
                {badgeRewards.map((reward) => {
                  const icon = reward.icon;
                  const isEquipped = userProfile.equippedBadge === icon;

                  return (
                    <div
                      key={reward.id}
                      className={`p-5 rounded-3xl flex flex-col justify-between gap-3 transition-all ${
                        isEquipped
                          ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border-2 border-emerald-400'
                          : 'bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff]'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-2xl shrink-0">
                          {icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-800">{reward.title}</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">{reward.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-300/60">
                        <span className="text-xs font-bold text-gray-600">
                          {reward.unlocked ? '✓ Unlocked' : `🪙 ${reward.cost} Credits`}
                        </span>

                        <button
                          onClick={() => handleEquipAesthetic('badge', icon, reward)}
                          className={`py-1.5 px-3.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                            isEquipped
                              ? 'bg-emerald-100 text-emerald-700 shadow-inner'
                              : reward.unlocked
                              ? 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-blue-600'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          {isEquipped ? '✓ Pin Equipped' : reward.unlocked ? 'Pin Badge' : 'Unlock & Pin'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: STUDY FRIENDS & ADD PEERS */}
      {activeSubTab === 'friends' && (
        <div id="study-friends-section" className="flex flex-col gap-6">
          {/* Add Friend Form */}
          <div
            id="add-friend-box"
            className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">➕</span>
              <h3 className="font-bold text-base text-gray-800">Add Study Friend to Orbit</h3>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-4">
              Enter a peer's campus email or their 8-character StudyOrbit Friend Code (e.g. <span className="font-mono font-bold text-blue-600">MAYA-8821</span>)
            </p>

            <form onSubmit={handleAddFriendSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Enter email or Friend Code (e.g. MAYA-8821 or name@campus.edu)..."
                value={friendInput}
                onChange={(e) => {
                  setFriendInput(e.target.value);
                  setAddFriendFeedback(null);
                }}
                className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full sm:w-auto py-3 px-6 rounded-2xl font-bold text-xs bg-blue-600 text-white shadow-md hover:bg-blue-700 active:scale-98 cursor-pointer transition-all shrink-0"
              >
                Send Friend Request
              </button>
            </form>

            {addFriendFeedback && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-bold ${
                  addFriendFeedback.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {addFriendFeedback.msg}
              </div>
            )}
          </div>

          {/* Pending Friend Requests */}
          {friendRequests.length > 0 && (
            <div
              id="pending-requests-box"
              className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 flex flex-col gap-4 border-2 border-amber-300/70"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <span className="text-amber-600 text-base">📩</span>
                  <span>Incoming Friend Requests ({friendRequests.length})</span>
                </h4>
                <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Action Needed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friendRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <AvatarDisplay
                        name={req.fromUser.name}
                        avatarUrl={req.fromUser.avatar}
                        border={req.fromUser.equippedBorder}
                        glow={req.fromUser.equippedGlow}
                        size="md"
                      />
                      <div>
                        <h5 className="font-bold text-xs text-gray-800">{req.fromUser.name}</h5>
                        <p className="text-[10px] text-gray-500">{req.fromUser.domain}</p>
                        <span className="text-[9px] text-orange-500 font-bold">🔥 {req.fromUser.streak}d streak</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playTaskCompleteSound();
                          onAcceptRequest(req.id);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          playClickSound();
                          onDeclineRequest(req.id);
                        }}
                        className="py-1.5 px-3 rounded-xl bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] text-gray-600 font-bold text-xs hover:text-rose-600 cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Study Friends List */}
          <div
            id="active-friends-list"
            className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-300/60">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <span>🤝</span> My Study Friends ({friends.length})
              </h4>
              <span className="text-xs text-emerald-600 font-bold">
                {friends.filter((f) => f.status === 'studying').length} currently studying
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] flex flex-col justify-between gap-3 hover:shadow-[7px_7px_14px_#b8b9be,-7px_-7px_14px_#ffffff] transition-all"
                >
                  <div className="flex items-start gap-3">
                    <AvatarDisplay
                      name={friend.name}
                      avatarUrl={friend.avatar}
                      border={friend.equippedBorder}
                      glow={friend.equippedGlow}
                      badge={friend.equippedBadge}
                      status={friend.status}
                      size="md"
                      showStatus={true}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h5 className="font-bold text-xs text-gray-800 truncate">{friend.name}</h5>
                        {friend.equippedTitle && (
                          <span className="text-[8px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full">
                            {friend.equippedTitle}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{friend.domain}</p>
                      <p className="text-[10px] text-blue-600 font-bold">{friend.university}</p>
                    </div>
                  </div>

                  {/* Study Status Pill */}
                  {friend.status === 'studying' && friend.currentStudyingSubject ? (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold truncate">Studying: {friend.currentStudyingSubject}</span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-xl bg-gray-100/70 text-[10px] text-gray-500 flex items-center justify-between">
                      <span>Last active: {friend.lastActive}</span>
                      <span>🔥 {friend.streak}d streak</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-300/50 text-xs">
                    <button
                      onClick={() => {
                        playTaskCompleteSound();
                        confetti({ particleCount: 30, spread: 60 });
                        onSendCheer(friend.id);
                      }}
                      className="py-1 px-3 rounded-lg bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] text-amber-700 font-bold hover:text-amber-900 active:shadow-[inset_1px_1px_2px_#b8b9be,inset_-1px_-1px_2px_#ffffff] cursor-pointer flex items-center gap-1"
                    >
                      ⚡ High-Five
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Remove ${friend.name} from your study friends?`)) {
                          onRemoveFriend(friend.id);
                        }
                      }}
                      className="text-[10px] text-gray-400 hover:text-rose-600 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Campus Study Buddies */}
          <div
            id="suggested-friends-box"
            className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-300/60">
              <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <span>💡</span> Suggested Study Peers from Your Campus Domain
              </h4>
              <span className="text-xs text-gray-500">Based on academic curriculum</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {suggestions.map((peer) => (
                <div
                  key={peer.id}
                  className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff] flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <AvatarDisplay
                      name={peer.name}
                      avatarUrl={peer.avatar}
                      border={peer.equippedBorder}
                      glow={peer.equippedGlow}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h5 className="font-bold text-xs text-gray-800 truncate">{peer.name}</h5>
                      <p className="text-[10px] text-gray-500 truncate">{peer.domain}</p>
                      <span className="text-[9px] text-orange-600 font-bold">🔥 {peer.streak}d streak</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed italic">
                    "{peer.bio}"
                  </p>

                  <button
                    onClick={() => {
                      onAddFriend(peer);
                      playTaskCompleteSound();
                      confetti({ particleCount: 30, spread: 50 });
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>➕</span> Add Study Buddy
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CAMPUS LEADERBOARD */}
      {activeSubTab === 'leaderboard' && (
        <FriendsLeaderboard
          currentUser={userProfile}
          streakState={streakState}
          friends={friends}
          onOpenAddFriend={() => setActiveSubTab('friends')}
          onSendCheer={onSendCheer}
        />
      )}

      {/* SUB-TAB 4: EDIT PROFILE */}
      {activeSubTab === 'edit' && (
        <div
          id="edit-profile-card"
          className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 max-w-2xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-300">
            <div>
              <h3 className="font-bold text-base text-gray-800">Edit Student Profile Details</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Update your academic degree, domain of studying, university, and bio.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6 flex flex-col gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Student Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 focus:outline-hidden"
              />
            </div>

            {/* Academic Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Education / Degree Level</label>
                <input
                  type="text"
                  value={editEducation}
                  onChange={(e) => setEditEducation(e.target.value)}
                  placeholder="e.g. Undergraduate (Year 3)"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">University / Institution</label>
                <input
                  type="text"
                  value={editUniversity}
                  onChange={(e) => setEditUniversity(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Domain of Study */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Domain of Studying / Major</label>
              <input
                type="text"
                value={editDomain}
                onChange={(e) => setEditDomain(e.target.value)}
                placeholder="e.g. Computer Science & Applied Mathematics"
                className="w-full py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 focus:outline-hidden"
              />
            </div>

            {/* Avatar Seed */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Avatar Seed Style</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={editAvatarSeed}
                  onChange={(e) => setEditAvatarSeed(e.target.value)}
                  placeholder="Type any word to generate a unique avatar..."
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setEditAvatarSeed(`Student${Math.floor(Math.random() * 9999)}`)}
                  className="py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-xs font-bold text-gray-700 hover:text-blue-600 cursor-pointer"
                >
                  🎲 Randomize
                </button>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Personal Academic Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                rows={3}
                placeholder="Write a short motto or study focus area..."
                className="w-full py-2.5 px-4 rounded-xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-xs font-semibold text-gray-800 focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-300 mt-2">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl">
                  ✓ Profile Details Updated!
                </span>
              ) : (
                <span />
              )}

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-blue-600 text-white shadow-md hover:bg-blue-700 cursor-pointer"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
