import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { RewardItem, StreakState, UserProfile } from '../types';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface RewardsStoreProps {
  streakState: StreakState;
  rewards: RewardItem[];
  userProfile?: UserProfile;
  onUnlockReward: (rewardId: string) => void;
  onEquipAesthetic?: (type: 'border' | 'glow' | 'title' | 'badge', value: string) => void;
  onNavigateToProfile?: () => void;
}

type RewardFilter = 'all' | 'aesthetics' | 'badge' | 'booster' | 'soundscape';

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  streakState,
  rewards,
  userProfile,
  onUnlockReward,
  onEquipAesthetic,
  onNavigateToProfile,
}) => {
  const [activeFilter, setActiveFilter] = useState<RewardFilter>('all');

  const handlePurchase = (item: RewardItem) => {
    if (item.unlocked) return;
    if (streakState.credits < item.cost) {
      alert(`You need ${item.cost - streakState.credits} more credits. Complete tasks and study timer sessions to earn credits!`);
      return;
    }

    playTaskCompleteSound();
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
    onUnlockReward(item.id);

    // If it's an aesthetic, prompt or auto-equip
    if (item.aestheticType && item.aestheticValue && onEquipAesthetic) {
      if (confirm(`Unlocked "${item.title}"! Would you like to equip it to your student profile right now?`)) {
        onEquipAesthetic(item.aestheticType, item.aestheticValue);
      }
    }
  };

  const filteredRewards = rewards.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'aesthetics') {
      return item.category === 'avatar_frame' || item.category === 'avatar_glow' || item.category === 'avatar_title' || item.category === 'avatar_icon';
    }
    return item.category === activeFilter;
  });

  return (
    <div id="rewards-store-view" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Banner */}
      <div
        id="rewards-header"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
              <span>🎁</span> Study Rewards & Avatar Aesthetics Store
            </h2>
            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Goal Milestones
            </span>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Redeem earned study credits for Avatar Frames, Aura Glows, Prestige Titles, and focus boosters!
          </p>
        </div>

        {/* Balance Card & Profile Button */}
        <div className="flex items-center gap-3">
          {onNavigateToProfile && (
            <button
              onClick={() => {
                playClickSound();
                onNavigateToProfile();
              }}
              className="py-2.5 px-4 rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] text-xs font-bold text-purple-700 hover:text-purple-900 active:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] cursor-pointer flex items-center gap-1.5"
            >
              <span>🎨</span> Open Avatar Studio
            </button>
          )}

          <div className="p-3 px-5 rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
            <span className="text-2xl">🪙</span>
            <div>
              <span className="text-[9px] uppercase font-bold text-gray-400 block">Available Balance</span>
              <span className="text-lg font-black text-blue-600 tracking-tight">
                {streakState.credits} Credits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: '🌟 All Store Items' },
          { key: 'aesthetics', label: '✨ Avatar Aesthetics (Frames, Glows, Titles)' },
          { key: 'badge', label: '👑 Badges & Crests' },
          { key: 'booster', label: '🛡️ Boosters & Shields' },
          { key: 'soundscape', label: '🎵 Focus Soundscapes' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              playClickSound();
              setActiveFilter(f.key as RewardFilter);
            }}
            className={`py-2 px-4 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === f.key
                ? 'bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] text-blue-600 border border-blue-200/60'
                : 'bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-gray-600 hover:text-gray-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Reward Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRewards.map((item) => {
          const canAfford = streakState.credits >= item.cost;
          const isAesthetic = item.aestheticType !== undefined;
          
          let isEquipped = false;
          if (userProfile && item.aestheticType) {
            if (item.aestheticType === 'border') isEquipped = userProfile.equippedBorder === item.aestheticValue;
            if (item.aestheticType === 'glow') isEquipped = userProfile.equippedGlow === item.aestheticValue;
            if (item.aestheticType === 'title') isEquipped = userProfile.equippedTitle === item.aestheticValue;
            if (item.aestheticType === 'badge') isEquipped = userProfile.equippedBadge === item.icon;
          }

          return (
            <div
              key={item.id}
              className={`rounded-[32px] p-6 flex flex-col justify-between gap-4 transition-all ${
                item.unlocked
                  ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border border-emerald-300'
                  : 'bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#b8b9be,-10px_-10px_20px_#ffffff]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-3xl shrink-0">
                  {item.icon}
                </div>

                <div className="text-right">
                  <span
                    className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                      item.category.includes('avatar')
                        ? 'bg-purple-100 text-purple-800'
                        : item.category === 'booster'
                        ? 'bg-amber-100 text-amber-800'
                        : item.category === 'badge'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.category.replace('avatar_', 'Avatar ')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-base text-gray-800">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                {item.effect && (
                  <span className="inline-block mt-2 text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                    ✨ {item.effect}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-300/50">
                <div className="flex items-center gap-1">
                  <span className="text-sm">🪙</span>
                  <span className="font-extrabold text-gray-800 text-sm">{item.cost}</span>
                  <span className="text-[10px] text-gray-500 font-bold">Credits</span>
                </div>

                {item.unlocked ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100/90 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                      ✓ Owned
                    </span>
                    {isAesthetic && onEquipAesthetic && item.aestheticType && item.aestheticValue && (
                      <button
                        onClick={() => {
                          playClickSound();
                          onEquipAesthetic(item.aestheticType!, item.aestheticValue!);
                        }}
                        className={`py-1 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] text-purple-700 hover:text-purple-900'
                        }`}
                      >
                        {isEquipped ? '✓ Active' : 'Equip'}
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      playClickSound();
                      handlePurchase(item);
                    }}
                    disabled={!canAfford}
                    className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-blue-600 text-white shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:bg-blue-700 active:scale-95'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {canAfford ? 'Redeem Item' : 'Need More Credits'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
