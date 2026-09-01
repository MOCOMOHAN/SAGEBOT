import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  currentUser?: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  const [authMode, setAuthMode] = useState<'oauth' | 'email_login' | 'register'>('oauth');
  const [emailInput, setEmailInput] = useState<string>(currentUser?.mailId || 'tjx2931@gmail.com');
  const [passwordInput, setPasswordInput] = useState<string>('••••••••');
  const [nameInput, setNameInput] = useState<string>(currentUser?.name || 'Alex Vance');
  const [ageInput, setAgeInput] = useState<number>(currentUser?.age || 21);
  const [educationInput, setEducationInput] = useState<string>(
    currentUser?.studentEducation || 'Undergraduate (Year 3)'
  );
  const [domainInput, setDomainInput] = useState<string>(
    currentUser?.domainOfStudying || 'Computer Science & Mathematics'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle Google OAuth Popup Flow
  const handleGoogleOAuth = () => {
    playClickSound();
    setIsLoading(true);

    // AI Studio popup OAuth mechanism following OAuth guidelines
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Simulate standard OAuth provider authorization response
    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: UserProfile = {
        id: `usr-google-${Date.now()}`,
        name: nameInput || 'Alex Vance',
        mailId: emailInput || 'tjx2931@gmail.com',
        profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexVanceGoogle',
        age: ageInput,
        studentEducation: educationInput,
        domainOfStudying: domainInput,
        streakCount: currentUser?.streakCount || 12,
        creditsValue: currentUser?.creditsValue || 450,
        bestStreak: currentUser?.bestStreak || 15,
        freezeCount: currentUser?.freezeCount || 1,
        isLoggedIn: true,
        oauthProvider: 'google',
      };

      playTaskCompleteSound();
      onLoginSuccess(authenticatedUser);
      onClose();
    }, 600);
  };

  // Handle GitHub OAuth Popup Flow
  const handleGitHubOAuth = () => {
    playClickSound();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: UserProfile = {
        id: `usr-github-${Date.now()}`,
        name: nameInput || 'GitHub Student',
        mailId: emailInput || 'tjx2931@gmail.com',
        profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=GithubStudent',
        age: ageInput,
        studentEducation: educationInput,
        domainOfStudying: domainInput,
        streakCount: currentUser?.streakCount || 12,
        creditsValue: currentUser?.creditsValue || 450,
        bestStreak: currentUser?.bestStreak || 15,
        freezeCount: currentUser?.freezeCount || 1,
        isLoggedIn: true,
        oauthProvider: 'github',
      };

      playTaskCompleteSound();
      onLoginSuccess(authenticatedUser);
      onClose();
    }, 600);
  };

  // Handle Email Submit
  const handleEmailAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;

    playClickSound();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser: UserProfile = {
        id: `usr-email-${Date.now()}`,
        name: nameInput || emailInput.split('@')[0],
        mailId: emailInput,
        profilePicture: `https://api.dicebear.com/7.x/bottts/svg?seed=${nameInput || emailInput}`,
        age: ageInput,
        studentEducation: educationInput,
        domainOfStudying: domainInput,
        streakCount: currentUser?.streakCount || 1,
        creditsValue: currentUser?.creditsValue || 150,
        bestStreak: currentUser?.bestStreak || 1,
        freezeCount: 1,
        isLoggedIn: true,
        oauthProvider: 'email',
      };

      playTaskCompleteSound();
      onLoginSuccess(authenticatedUser);
      onClose();
    }, 500);
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="auth-modal-window"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-[36px] bg-[#e0e5ec] shadow-[16px_16px_32px_#b8b9be,-16px_-16px_32px_#ffffff] p-6 sm:p-8 flex flex-col gap-5 border border-white/60"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-300/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-xl text-blue-600">
              🔐
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800 tracking-tight">
                {authMode === 'register'
                  ? 'Create Student Account'
                  : 'Student Authentication & OAuth'}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                Log in to sync your skills, study calendar, and credits
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-xs font-bold text-gray-500 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* OAuth Provider Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogleOAuth}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center gap-3 text-xs font-black text-gray-800 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google OAuth</span>
          </button>

          <button
            onClick={handleGitHubOAuth}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#e0e5ec] shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center gap-3 text-xs font-black text-gray-800 transition-all cursor-pointer"
          >
            <span className="text-base">🐙</span>
            <span>Continue with GitHub OAuth</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-[10px] font-extrabold text-gray-400 uppercase">
            Or Use Student Profile Credentials
          </span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Student Profile Form */}
        <form onSubmit={handleEmailAuthSubmit} className="flex flex-col gap-3.5">
          <div>
            <label className="text-[11px] font-bold text-gray-600 mb-1 block">Full Student Name</label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none"
              placeholder="e.g. Alex Vance"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 mb-1 block">Student Mail ID</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none"
              placeholder="e.g. tjx2931@gmail.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-600 mb-1 block">Age</label>
              <input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(Number(e.target.value))}
                className="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none"
                min={12}
                max={99}
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-600 mb-1 block">Education Level</label>
              <select
                value={educationInput}
                onChange={(e) => setEducationInput(e.target.value)}
                className="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-2.5 py-2.5 text-xs text-gray-800 outline-none cursor-pointer"
              >
                <option>High School</option>
                <option>Undergraduate (Year 1)</option>
                <option>Undergraduate (Year 2)</option>
                <option>Undergraduate (Year 3)</option>
                <option>Undergraduate (Year 4)</option>
                <option>Master's Degree</option>
                <option>PhD Candidate</option>
                <option>Self-Taught / Professional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-600 mb-1 block">Domain of Studying</label>
            <input
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              className="w-full bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none"
              placeholder="e.g. Computer Science & Mathematics"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-xs shadow-[5px_5px_12px_#b8b9be,-5px_-5px_12px_#ffffff] hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Authenticating...' : 'Sign In / Save Student Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
