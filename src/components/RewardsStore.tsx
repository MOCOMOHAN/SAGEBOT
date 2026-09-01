import React from 'react';
import confetti from 'canvas-confetti';
import { RewardItem, StreakState } from '../types';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface RewardsStoreProps {
  streakState: StreakState;
  rewards: RewardItem[];
  onUnlockReward: (rewardId: string) => void;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  streakState,
  rewards,
  onUnlockReward,
}) => {
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
  };

  return (
    <div id="rewards-store-view" class="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Top Banner */}
      <div
        id="rewards-header"
        class="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-6 lg:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <div class="flex items-center gap-2.5">
            <h2 class="text-xl font-bold text-gray-800 tracking-tight">
              Study Rewards & Goal Store
            </h2>
            <span class="text-xs bg-amber-100 text-amber-700 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Task Milestones
            </span>
          </div>
          <p class="text-xs text-gray-500 font-medium mt-1">
            Redeem earned currency from study streaks & completed tasks for power-ups and badges
          </p>
        </div>

        {/* Balance Card */}
        <div class="p-3.5 px-6 rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] flex items-center gap-3">
          <span class="text-2xl">🪙</span>
          <div>
            <span class="text-[10px] uppercase font-bold text-gray-500 block">Available Balance</span>
            <span class="text-xl font-extrabold text-blue-600 tracking-tight">
              {streakState.credits} Credits
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Reward Cards */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((item) => {
          const canAfford = streakState.credits >= item.cost;

          return (
            <div
              key={item.id}
              class={`rounded-[32px] p-6 flex flex-col justify-between gap-4 transition-all ${
                item.unlocked
                  ? 'bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] border border-emerald-300'
                  : 'bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#b8b9be,-10px_-10px_20px_#ffffff]'
              }`}
            >
              <div class="flex items-start justify-between gap-3">
                <div class="w-14 h-14 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-3xl shrink-0">
                  {item.icon}
                </div>

                <div class="text-right">
                  <span
                    class={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                      item.category === 'booster'
                        ? 'bg-amber-100 text-amber-800'
                        : item.category === 'badge'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              </div>

              <div>
                <h4 class="font-bold text-base text-gray-800">{item.title}</h4>
                <p class="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                {item.effect && (
                  <span class="inline-block mt-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    ✨ {item.effect}
                  </span>
                )}
              </div>

              <div class="flex items-center justify-between pt-3 border-t border-gray-300/50">
                <div class="flex items-center gap-1">
                  <span class="text-sm">🪙</span>
                  <span class="font-extrabold text-gray-800 text-sm">{item.cost}</span>
                  <span class="text-[10px] text-gray-500 font-bold">Credits</span>
                </div>

                {item.unlocked ? (
                  <span class="text-xs font-bold text-emerald-600 bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs">
                    ✓ Unlocked
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      playClickSound();
                      handlePurchase(item);
                    }}
                    disabled={!canAfford}
                    class={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                      canAfford
                        ? 'bg-blue-600 text-white shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:bg-blue-700 active:scale-95'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {canAfford ? 'Redeem Goal' : 'Need More Credits'}
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
