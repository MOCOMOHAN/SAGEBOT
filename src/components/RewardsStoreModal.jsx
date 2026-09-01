import React from 'react';
import { 
  Trophy, 
  Sparkles, 
  Check, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Award,
  Flame,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playCoinSound, playChime, playClickSound } from '../utils/audio';

export default function RewardsStoreModal({
  isOpen,
  onClose,
  rewards,
  streakState,
  onUnlockReward,
}) {
  if (!isOpen) return null;

  const handlePurchase = (reward) => {
    if (reward.unlocked) return;
    if (streakState.credits < reward.cost) {
      alert(`You need ${reward.cost - streakState.credits} more Study Credits! Complete more tasks or timer sessions to earn credits.`);
      return;
    }

    onUnlockReward(reward.id, reward.cost);
    playCoinSound();
    playChime();

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#10b981', '#fbbf24', '#3b82f6'],
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl p-6 sm:p-8 rounded-[40px] neu-flat bg-[#e0e5ec] border border-white/60 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-300/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] neu-pressed flex items-center justify-center text-2xl text-emerald-600">
              🏆
            </div>
            <div>
              <h3 className="font-bold text-xl font-heading text-slate-800 flex items-center gap-2">
                Study Goals & Rewards Store
              </h3>
              <p className="text-xs text-slate-500">
                Redeem your hard-earned study currency for focus boosters and badges.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl neu-flat-sm text-slate-500 font-bold hover:neu-pressed flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Currency Balance Ribbon */}
        <div className="p-4 rounded-2xl neu-pressed bg-[#e0e5ec] flex items-center justify-between border border-emerald-300/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🪙</span>
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 block">
                Your Balance
              </span>
              <span className="text-xl font-extrabold text-emerald-600 font-heading">
                {streakState.credits} Study Credits
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" /> {streakState.currentStreak} Day Streak
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> {streakState.freezeCount} Shields
            </span>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rewards.map((rew) => {
            const canAfford = streakState.credits >= rew.cost;

            return (
              <div
                key={rew.id}
                className={`p-4 rounded-3xl flex flex-col justify-between gap-3 transition-all ${
                  rew.unlocked
                    ? 'neu-pressed bg-[#e0e5ec] border border-emerald-400/40'
                    : 'neu-flat bg-[#e0e5ec]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-2xl neu-pressed-sm bg-[#e0e5ec]">
                      {rew.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{rew.title}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {rew.category}
                      </span>
                    </div>
                  </div>

                  {rew.unlocked && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {rew.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-300/30">
                  <span className="text-xs font-extrabold text-emerald-600 flex items-center gap-1">
                    🪙 {rew.cost} Credits
                  </span>

                  {rew.unlocked ? (
                    <button
                      disabled
                      className="px-4 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-800 text-xs font-bold cursor-default"
                    >
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePurchase(rew)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'neu-btn-primary'
                          : 'neu-flat-sm text-slate-400 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {canAfford ? 'Redeem' : 'Need Credits'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl neu-flat-sm text-slate-600 font-bold text-xs hover:neu-pressed"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
