import React from 'react';

export interface AvatarDisplayProps {
  name: string;
  avatarUrl: string;
  border?: string; // 'golden-nebula' | 'cyber-holo' | 'emerald-scholar' | 'flame-phoenix' | 'obsidian-void' | string;
  glow?: string;   // 'cosmic-purple' | 'solar-flare' | 'cyan-pulse' | 'emerald-zen' | string;
  badge?: string;  // e.g. '👑', '🔥', '⚡', '🧪'
  title?: string;  // e.g. 'Quantum Pioneer'
  status?: 'studying' | 'online' | 'away' | 'offline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showTitle?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  name,
  avatarUrl,
  border = 'none',
  glow = 'none',
  badge,
  title,
  status,
  size = 'md',
  showTitle = false,
  showStatus = false,
  className = '',
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);

  // Size dimensions
  const sizeMap = {
    xs: { outer: 'w-8 h-8', img: 'w-7 h-7', text: 'text-xs', badge: 'text-[9px] -top-1 -right-1', dot: 'w-2 h-2' },
    sm: { outer: 'w-10 h-10', img: 'w-8.5 h-8.5', text: 'text-sm', badge: 'text-[10px] -top-1.5 -right-1.5', dot: 'w-2.5 h-2.5' },
    md: { outer: 'w-14 h-14', img: 'w-12 h-12', text: 'text-base', badge: 'text-xs -top-2 -right-2', dot: 'w-3.5 h-3.5' },
    lg: { outer: 'w-20 h-20', img: 'w-17 h-17', text: 'text-xl', badge: 'text-base -top-2.5 -right-2.5', dot: 'w-4 h-4' },
    xl: { outer: 'w-28 h-28', img: 'w-24 h-24', text: 'text-2xl', badge: 'text-lg -top-3 -right-3', dot: 'w-5 h-5' },
    '2xl': { outer: 'w-36 h-36', img: 'w-30 h-30', text: 'text-3xl', badge: 'text-xl -top-3.5 -right-3.5', dot: 'w-6 h-6' },
  };

  const currentSize = sizeMap[size];

  // Glow Styling
  const getGlowClass = (g?: string) => {
    switch (g) {
      case 'solar-flare':
        return 'shadow-[0_0_22px_rgba(245,158,11,0.55),0_0_40px_rgba(245,158,11,0.25)]';
      case 'cosmic-purple':
        return 'shadow-[0_0_24px_rgba(168,85,247,0.6),0_0_45px_rgba(147,51,234,0.3)]';
      case 'cyan-pulse':
        return 'shadow-[0_0_22px_rgba(6,182,212,0.65),0_0_40px_rgba(14,165,233,0.3)]';
      case 'emerald-zen':
        return 'shadow-[0_0_22px_rgba(16,185,129,0.55),0_0_40px_rgba(5,150,105,0.25)]';
      default:
        return 'shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff]';
    }
  };

  // Border Frame Styling
  const getBorderContainerStyle = (b?: string) => {
    switch (b) {
      case 'golden-nebula':
        return 'p-[3px] bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 rounded-full animate-pulse-subtle';
      case 'cyber-holo':
        return 'p-[3px] bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 rounded-full';
      case 'flame-phoenix':
        return 'p-[3px] bg-gradient-to-tr from-red-500 via-orange-400 to-yellow-300 rounded-full';
      case 'emerald-scholar':
        return 'p-[3px] bg-gradient-to-tr from-emerald-600 via-teal-300 to-emerald-400 rounded-full';
      case 'obsidian-void':
        return 'p-[3px] bg-gradient-to-tr from-purple-900 via-indigo-700 to-slate-900 rounded-full';
      case 'sakura-bloom':
        return 'p-[3px] bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-500 rounded-full';
      default:
        return 'p-[2px] bg-transparent rounded-full';
    }
  };

  // Status Badge
  const getStatusColor = (s?: string) => {
    switch (s) {
      case 'studying':
        return 'bg-emerald-500 ring-2 ring-white animate-pulse';
      case 'online':
        return 'bg-blue-500 ring-2 ring-white';
      case 'away':
        return 'bg-amber-400 ring-2 ring-white';
      default:
        return 'bg-gray-400 ring-2 ring-white';
    }
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Outer Glow & Frame Wrapper */}
      <div className={`relative flex items-center justify-center ${getBorderContainerStyle(border)} ${getGlowClass(glow)} transition-all duration-300`}>
        {/* Avatar Image Container */}
        <div className={`${currentSize.outer} rounded-full overflow-hidden bg-[#e0e5ec] flex items-center justify-center relative shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff]`}>
          {!imgFailed ? (
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`}
              alt={name}
              className="w-full h-full object-cover rounded-full"
              loading="lazy"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className={`font-bold text-gray-700 ${currentSize.text}`}>{name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {/* Badge Insignia (Top Right) */}
        {badge && (
          <div
            className={`absolute ${currentSize.badge} bg-white/90 backdrop-blur-xs rounded-full shadow-md px-1 py-0.5 border border-amber-200 flex items-center justify-center transform hover:scale-110 transition-transform`}
            title={`Badge: ${badge}`}
          >
            <span>{badge}</span>
          </div>
        )}

        {/* Status Indicator Dot (Bottom Right) */}
        {showStatus && status && (
          <div
            className={`absolute bottom-0 right-0 ${currentSize.dot} rounded-full ${getStatusColor(status)} shadow-xs`}
            title={`Status: ${status}`}
          />
        )}
      </div>

      {/* Prestige Academic Title */}
      {showTitle && title && (
        <span
          className="mt-1.5 inline-block text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/90 px-2.5 py-0.5 rounded-full border border-purple-200 shadow-xs whitespace-nowrap"
          title={`Equipped Prestige Title: ${title}`}
        >
          ✨ {title}
        </span>
      )}
    </div>
  );
};
