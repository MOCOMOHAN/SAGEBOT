import React from 'react';
import { UserProfile } from '../types';
import { playClickSound } from '../utils/audio';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  onClearAllData: () => void;
  userProfile: UserProfile;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  onClearAllData,
  userProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="logout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="logout-modal-window"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-[36px] bg-[#e0e5ec] shadow-[16px_16px_32px_#b8b9be,-16px_-16px_32px_#ffffff] p-6 sm:p-8 flex flex-col gap-5 border border-white/60"
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-300/50">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-2xl text-red-500">
            🚪
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-800 tracking-tight">Account & Session</h3>
            <p className="text-xs text-gray-500 font-medium">
              Manage student sign-out or clear stored study data
            </p>
          </div>
        </div>

        {/* Current Student Profile Snapshot */}
        <div className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center gap-3.5">
          <img
            src={userProfile.profilePicture}
            alt={userProfile.name}
            className="w-12 h-12 rounded-2xl bg-white/60 p-1 shadow-inner"
          />
          <div>
            <h4 className="text-sm font-black text-gray-800">{userProfile.name}</h4>
            <p className="text-xs text-gray-500">{userProfile.mailId}</p>
            <div className="flex items-center gap-2.5 mt-1 text-[10px] font-extrabold text-gray-600">
              <span>🔥 {userProfile.streakCount} Days</span>
              <span>🪙 {userProfile.creditsValue} Credits</span>
              <span>🎓 {userProfile.studentEducation}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-1">
          <button
            onClick={() => {
              playClickSound();
              onConfirmLogout();
            }}
            className="w-full py-3 rounded-2xl bg-red-600 text-white font-extrabold text-xs shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:bg-red-700 transition-all cursor-pointer"
          >
            Sign Out of Account
          </button>

          <button
            onClick={() => {
              playClickSound();
              if (
                window.confirm(
                  'Are you sure you want to clear all mock/demo tasks and study logs? You will get a clean slate to log your own study journey.'
                )
              ) {
                onClearAllData();
                onClose();
              }
            }}
            className="w-full py-2.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-amber-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <span>🧹 Clear Mockup Data & Start Fresh</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
