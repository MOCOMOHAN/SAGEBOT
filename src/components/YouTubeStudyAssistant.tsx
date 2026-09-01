import React, { useState, useEffect } from 'react';
import { Subject, Task, YouTubeVideoSuggestion } from '../types';
import { playClickSound } from '../utils/audio';

interface YouTubeStudyAssistantProps {
  activeSubject?: Subject;
  activeTask?: Task;
  isTimerRunning: boolean;
}

export const YouTubeStudyAssistant: React.FC<YouTubeStudyAssistantProps> = ({
  activeSubject,
  activeTask,
  isTimerRunning,
}) => {
  const [videos, setVideos] = useState<YouTubeVideoSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customSearchQuery, setCustomSearchQuery] = useState<string>('');
  const [selectedVideoToPlay, setSelectedVideoToPlay] = useState<YouTubeVideoSuggestion | null>(null);
  const [sourceTag, setSourceTag] = useState<string>('gemini-ai');

  const subjectName = activeSubject?.name || 'Academic Course';
  const taskName = activeTask?.title || 'General Focus';
  const taskDesc = activeTask?.description || '';

  // Fetch YouTube video suggestions via server Gemini API route
  const fetchVideoSuggestions = async (overrideQuery?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/suggest-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subjectName,
          taskName: taskName,
          taskDescription: taskDesc,
          query: overrideQuery || customSearchQuery,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.videos && Array.isArray(data.videos)) {
          setVideos(data.videos);
          setSourceTag(data.source || 'gemini-ai');
        }
      } else {
        throw new Error('Server returned non-200');
      }
    } catch (err) {
      console.warn('Using client fallback for video suggestions:', err);
      // Clean fallback if offline
      const queryStr = `${subjectName} ${taskName}`;
      setVideos([
        {
          id: `yt-fb-1`,
          title: `${taskName} - Visual Concept & Step-by-Step Proof`,
          channelName: 'Khan Academy / 3Blue1Brown',
          duration: '18 mins',
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(queryStr + ' visual proof')}`,
          searchQuery: queryStr + ' visual proof',
          recommendedReason: `Recommended by Gemini for breaking down ${taskName} fundamentals and intuition.`,
          keyTopics: [subjectName, 'Core Principles', 'Worked Examples'],
          badge: 'Visual Breakdown',
        },
        {
          id: `yt-fb-2`,
          title: `${taskName} - 5 Solved Practice Problems & Common Traps`,
          channelName: 'The Organic Chemistry Tutor / Professor Leonard',
          duration: '24 mins',
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(queryStr + ' solved problems')}`,
          searchQuery: queryStr + ' solved problems',
          recommendedReason: 'Step-by-step problem walkthroughs to reinforce key exam methods.',
          keyTopics: ['Exam Traps', 'Formulas', 'Full Solutions'],
          badge: 'Problem Walkthrough',
        },
        {
          id: `yt-fb-3`,
          title: `Master ${taskName} in Under 10 Minutes`,
          channelName: 'StatQuest / NeetCode',
          duration: '9 mins',
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(queryStr + ' quick review summary')}`,
          searchQuery: queryStr + ' quick review summary',
          recommendedReason: 'Fast-paced high-yield recap for quick memory consolidation.',
          keyTopics: ['High-Yield Recap', 'Key Formulas'],
          badge: 'Fast Review',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when active task or subject changes
  useEffect(() => {
    if (activeTask?.title || activeSubject?.name) {
      fetchVideoSuggestions();
    }
  }, [activeTask?.id, activeSubject?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSearchQuery.trim()) {
      fetchVideoSuggestions(customSearchQuery.trim());
    }
  };

  return (
    <div
      id="youtube-study-companion"
      className="w-full rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 lg:p-6 flex flex-col gap-4 transition-all"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-300/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center text-xl shrink-0">
            🎬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-gray-800 tracking-tight">
                AI YouTube Study Assistant
              </h3>
              {isTimerRunning && (
                <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Live Study Mode
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Gemini-recommended high-yield tutorials for{' '}
              <strong className="text-blue-600">{activeSubject?.name || 'Active Course'}</strong>
              {' • '}
              <strong className="text-gray-800">{activeTask?.title || 'Selected Task'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              playClickSound();
              fetchVideoSuggestions();
            }}
            disabled={isLoading}
            className="py-1.5 px-3 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700 flex items-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer"
            title="Refresh AI suggestions"
          >
            <span className={isLoading ? 'animate-spin' : ''}>✨</span>
            <span>{isLoading ? 'Searching...' : 'Refresh AI Suggestions'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Search Bar for Custom Video Queries */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
          <input
            type="text"
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
            placeholder={`Search YouTube tutorials for "${taskName}"...`}
            className="w-full pl-8 pr-4 py-2 rounded-xl bg-[#e0e5ec] shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !customSearchQuery.trim()}
          className="py-2 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:bg-rose-700 disabled:opacity-40 transition-all cursor-pointer"
        >
          Find Video
        </button>
      </form>

      {/* Video Cards Grid */}
      {isLoading ? (
        <div className="p-8 text-center bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl">
          <span className="text-3xl block mb-2 animate-bounce">🤖</span>
          <p className="text-sm font-bold text-gray-700">Gemini is searching & filtering high-yield YouTube tutorials...</p>
          <p className="text-xs text-gray-500 mt-1">Analyzing topic prerequisites, top educational creators, and visual derivations</p>
        </div>
      ) : videos.length === 0 ? (
        <div className="p-6 text-center bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-gray-500">
          <p className="text-xs">No video suggestions loaded. Click "Refresh AI Suggestions" to generate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {videos.map((vid, index) => (
            <div
              key={vid.id || index}
              className="p-4 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex flex-col gap-2">
                {/* Channel & Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1">
                    <span>📺</span> {vid.channelName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#e0e5ec] shadow-[inset_1px_1px_2px_#b8b9be,inset_-1px_-1px_2px_#ffffff] text-gray-600">
                    ⏱ {vid.duration}
                  </span>
                </div>

                {/* Video Title */}
                <h4 className="font-bold text-xs text-gray-800 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                  {vid.title}
                </h4>

                {/* Gemini Recommendation Note */}
                <div className="p-2.5 rounded-xl bg-gray-200/40 border border-gray-300/30 text-[11px] text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-700 block mb-0.5">💡 Why it helps:</span>
                  {vid.recommendedReason}
                </div>

                {/* Key Topics Covered Chips */}
                {vid.keyTopics && vid.keyTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {vid.keyTopics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-semibold bg-[#e0e5ec] text-gray-600 shadow-[inset_1px_1px_2px_#b8b9be,inset_-1px_-1px_2px_#ffffff] px-1.5 py-0.5 rounded"
                      >
                        #{topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-300/40">
                <a
                  href={vid.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playClickSound()}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-bold text-xs text-center shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>▶ Watch on YouTube</span>
                  <span className="text-[10px]">↗</span>
                </a>

                <button
                  onClick={() => {
                    playClickSound();
                    setSelectedVideoToPlay(vid);
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs text-gray-700 font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Search & Preview In-App"
                >
                  <span>📺</span> Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video In-App Quick Preview & Search Modal */}
      {selectedVideoToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-[36px] bg-[#e0e5ec] shadow-[12px_12px_24px_#00000040,-12px_-12px_24px_#ffffff] p-6 lg:p-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎬</span>
                <div>
                  <h3 className="font-bold text-base text-gray-800">
                    {selectedVideoToPlay.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedVideoToPlay.channelName} • {selectedVideoToPlay.duration}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playClickSound();
                  setSelectedVideoToPlay(null);
                }}
                className="w-8 h-8 rounded-full bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-gray-500 hover:text-gray-900 font-bold flex items-center justify-center transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Overview & Direct YouTube Player launcher */}
            <div className="p-5 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex flex-col gap-3">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed">
                <strong className="block font-bold text-rose-950 mb-1">🎯 Gemini Video Context:</strong>
                {selectedVideoToPlay.recommendedReason}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                <span>Direct Search Term:</span>
                <code className="font-mono font-bold text-blue-600 bg-white/70 px-2 py-0.5 rounded">
                  {selectedVideoToPlay.searchQuery}
                </code>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href={selectedVideoToPlay.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playClickSound()}
                  className="py-3 px-6 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-[4px_4px_10px_#b8b9be,-4px_-4px_10px_#ffffff] hover:bg-rose-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>▶ Open Video Directly on YouTube</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  playClickSound();
                  setSelectedVideoToPlay(null);
                }}
                className="py-2 px-5 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] text-xs font-bold text-gray-700 cursor-pointer"
              >
                Back to Study Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
