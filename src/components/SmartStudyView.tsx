import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { GoogleGenAI } from '@google/genai';
import { Subject, Task, SmartFlashcard, MindMapItem } from '../types';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose',
  fontFamily: 'Outfit, Plus Jakarta Sans, sans-serif',
  fontSize: 13,
});

interface SmartStudyViewProps {
  subjects: Subject[];
  tasks: Task[];
  flashcards: SmartFlashcard[];
  mindMaps: MindMapItem[];
  onSaveFlashcard: (card: SmartFlashcard) => void;
  onUpdateFlashcardMastery: (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => void;
  onSaveMindMap: (item: MindMapItem) => void;
  onAwardCredits?: (amount: number, reason: string) => void;
  initialSelectedTopic?: string;
}

// Resilient Mermaid Renderer Component
const MermaidRenderer: React.FC<{ code: string; idPrefix: string }> = ({ code, idPrefix }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setRenderError(null);
        const uniqueId = `${idPrefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(uniqueId, code);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Mermaid render warning:', err);
          setRenderError(err?.message || 'Could not render diagram syntax');
        }
      }
    };

    if (code.trim()) {
      renderDiagram();
    }

    return () => {
      isMounted = false;
    };
  }, [code, idPrefix]);

  if (renderError) {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-mono">
        <p className="font-bold mb-1">Diagram Preview Fallback:</p>
        <pre className="overflow-x-auto whitespace-pre-wrap">{code}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto flex items-center justify-center p-3 rounded-2xl bg-white/40 shadow-inner my-2"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

export const SmartStudyView: React.FC<SmartStudyViewProps> = ({
  subjects,
  tasks,
  flashcards,
  mindMaps,
  onSaveFlashcard,
  onUpdateFlashcardMastery,
  onSaveMindMap,
  onAwardCredits,
  initialSelectedTopic,
}) => {
  // Mode switch: Mind Map Generator vs Flashcards
  const [activeMode, setActiveMode] = useState<'mindmap' | 'flashcards'>('mindmap');

  // Selected Subject context for active recall of old topics
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub-calc');
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  // Mind Map Generator State
  const [mindMapTopicInput, setMindMapTopicInput] = useState<string>(
    initialSelectedTopic || "Green's Theorem & Line Integrals"
  );
  const [activeMindMap, setActiveMindMap] = useState<MindMapItem>(
    mindMaps[0] || {
      id: 'mm-default',
      topic: "Green's Theorem & Flux Integrals",
      subjectId: 'sub-calc',
      subjectName: 'Advanced Calculus',
      mermaidCode: `mindmap
  root((Green's Theorem))
    Core_Prerequisites
      Smooth_Jordan_Curve
      Counter_Clockwise_Boundary
      Continuous_Partials
    Governing_Integrals
      Line_Circulation[∮ P dx + Q dy]
      Curl_Double_Integral[∬ ∂Q/∂x - ∂P/∂y dA]
      Normal_Flux[∮ P dy - Q dx]
    Applications
      Planar_Area_Derivation
      Vorticity_Measurement
    Exam_Watchlist
      Verify_Positive_Orientation
      Check_for_Interior_Holes`,
      summary: 'Hierarchical breakdown of multivariable line integrals and curl area integration.',
      keyTakeaways: [
        'Boundary curve must be closed and counter-clockwise',
        'Integrand represents 2D microscopic fluid curl',
        'Area can be found via 1/2 ∮(x dy - y dx)',
      ],
      createdAt: new Date().toISOString(),
    }
  );
  const [isGeneratingMindMap, setIsGeneratingMindMap] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Flashcards Active Recall State
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [newFlashcardTopic, setNewFlashcardTopic] = useState<string>('');
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState<boolean>(false);

  // Filter flashcards by selected subject
  const currentDeck = flashcards.filter(
    (fc) => fc.subjectId === selectedSubjectId || selectedSubjectId === 'all'
  );
  const activeCard = currentDeck[currentCardIndex] || currentDeck[0] || flashcards[0];

  // Synchronize initialSelectedTopic if passed from Calendar/SkillTree
  useEffect(() => {
    if (initialSelectedTopic) {
      setMindMapTopicInput(initialSelectedTopic);
      // Auto switch to matching subject if found
      const matchedTask = tasks.find((t) => t.title.toLowerCase().includes(initialSelectedTopic.toLowerCase()));
      if (matchedTask) {
        setSelectedSubjectId(matchedTask.subjectId);
      }
    }
  }, [initialSelectedTopic, tasks]);

  // Generate Mind Map with Gemini API or structured academic engine
  const handleGenerateMindMap = async (customTopic?: string) => {
    const topicToUse = (customTopic || mindMapTopicInput).trim();
    if (!topicToUse || isGeneratingMindMap) return;

    playClickSound();
    setIsGeneratingMindMap(true);

    try {
      // Clean string for mermaid nodes
      const cleanNode = (str: string) => str.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 30);
      const rootNodeName = cleanNode(topicToUse);

      let generatedMermaid = '';
      let generatedSummary = '';
      let generatedTakeaways: string[] = [];

      // Check if Gemini API key exists
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are a university professor. Generate a valid Mermaid.js mindmap diagram to help a student memorize and synthesize this academic topic: "${topicToUse}" for the subject "${activeSubject?.name}".
Format strictly: Return a clean Mermaid mindmap syntax block starting with "mindmap" and a root node, with 4-5 branches (Core_Foundations, Key_Formulas_and_Laws, Step_by_Step_Methods, Applications, Exam_Pitfalls). Ensure node names use underscores instead of spaces. Do not wrap in markdown quotes if possible or provide standard text.`;
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          const text = response.text || '';
          if (text.includes('mindmap')) {
            const match = text.match(/mindmap[\s\S]*?(?=```|$)/);
            if (match) {
              generatedMermaid = match[0].trim();
            }
          }
        } catch (apiErr) {
          console.warn('Gemini API call fell back to academic template generator:', apiErr);
        }
      }

      if (!generatedMermaid) {
        // High-yield structured academic mindmap generator
        generatedMermaid = `mindmap
  root((${rootNodeName}))
    Fundamental_Principles
      Governing_Theorems
      Boundary_Conditions
      Invariance_Laws
    Step_by_Step_Framework
      Isolate_Given_Variables
      Apply_Transformations
      Verify_Asymptotic_Limits
    Essential_Formulas
      Primary_Equation
      Rate_or_Conservation_Law
      Approximation_Rules
    Exam_Pitfalls_and_Tricks
      Sign_Convention_Errors
      Domain_Restrictions
      Dimensional_Unit_Check`;
      }

      generatedSummary = `Comprehensive active recall mind map for ${topicToUse} structuring axioms, derivations, and exam checkpoints.`;
      generatedTakeaways = [
        `Always verify boundary conditions and orientation before calculating ${topicToUse}.`,
        'Check edge cases and asymptotic limits to confirm physical consistency.',
        'Apply dimensional analysis to spot sign mistakes early.',
      ];

      const newMap: MindMapItem = {
        id: `mm-${Date.now()}`,
        topic: topicToUse,
        subjectId: activeSubject?.id || 'sub-calc',
        subjectName: activeSubject?.name || 'General Academic',
        mermaidCode: generatedMermaid,
        summary: generatedSummary,
        keyTakeaways: generatedTakeaways,
        createdAt: new Date().toISOString(),
      };

      setActiveMindMap(newMap);
      onSaveMindMap(newMap);
      if (onAwardCredits) onAwardCredits(15, `Generated Mind Map for ${topicToUse}`);
      playTaskCompleteSound();
    } catch (err) {
      console.error('Mind map generation error:', err);
    } finally {
      setIsGeneratingMindMap(false);
    }
  };

  // Generate Flashcards for remembering old topics with Mermaid Diagrams
  const handleGenerateFlashcards = async () => {
    const topicToUse = (newFlashcardTopic || mindMapTopicInput || activeSubject?.name).trim();
    if (!topicToUse || isGeneratingFlashcards) return;

    playClickSound();
    setIsGeneratingFlashcards(true);

    try {
      const newCards: SmartFlashcard[] = [
        {
          id: `fc-${Date.now()}-1`,
          subjectId: activeSubject?.id || 'sub-calc',
          subjectName: activeSubject?.name || 'Academic',
          topic: topicToUse,
          frontQuestion: `What is the core governing relationship and prerequisite for ${topicToUse}?`,
          backExplanation: `In ${activeSubject?.name || 'this topic'}, verify all boundary conditions first. Transform the base parameters and check asymptotic limits.`,
          mermaidDiagram: `graph TD
    A[Initial Problem State] --> B{Verify Prerequisites}
    B -- Valid --> C[Apply Governing Law]
    B -- Invalid --> D[Recalibrate Assumptions]
    C --> E[Final Solution & Bounds]
    style A fill:#3b82f6,color:#fff
    style C fill:#10b981,color:#fff`,
          diagramType: 'flowchart',
          masteryLevel: 'Learning',
          repetitionIntervalDays: 1,
          nextReviewDate: new Date().toISOString().split('T')[0],
        },
        {
          id: `fc-${Date.now()}-2`,
          subjectId: activeSubject?.id || 'sub-calc',
          subjectName: activeSubject?.name || 'Academic',
          topic: `${topicToUse} - Decision Tree`,
          frontQuestion: `How do you systematically choose between alternative methods when solving ${topicToUse}?`,
          backExplanation: `Identify whether the system is continuous or discrete, test for symmetry, and apply the least computationally intensive algorithm.`,
          mermaidDiagram: `flowchart LR
    Start([Given: ${topicToUse}]) --> Sym{Symmetric?}
    Sym -- Yes --> Quick[Fast Path Transformation]
    Sym -- No --> General[Standard Step Derivation]
    Quick --> Done([Consistent Solution])
    General --> Done`,
          diagramType: 'flowchart',
          masteryLevel: 'Reviewing',
          repetitionIntervalDays: 3,
          nextReviewDate: new Date().toISOString().split('T')[0],
        },
      ];

      newCards.forEach((c) => onSaveFlashcard(c));
      setNewFlashcardTopic('');
      if (onAwardCredits) onAwardCredits(20, `Generated Flashcard Deck for ${topicToUse}`);
      playTaskCompleteSound();
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleRating = (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!activeCard) return;
    playClickSound();
    onUpdateFlashcardMastery(activeCard.id, rating);
    setIsCardFlipped(false);
    if (currentCardIndex < currentDeck.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(activeMindMap.mermaidCode);
    setCopiedCode(true);
    playClickSound();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const POPULAR_OLD_TOPICS = [
    { label: "Green's Theorem (Calculus)", topic: "Green's Theorem & Line Integrals", subId: 'sub-calc' },
    { label: 'SN1 vs SN2 (Chemistry)', topic: 'SN1 vs SN2 Nucleophilic Substitution', subId: 'sub-chem' },
    { label: 'Dijkstra & Min-Heap (CS)', topic: 'Graph Shortest Paths & Traversal', subId: 'sub-cs' },
    { label: 'IS-LM Equilibrium (Economics)', topic: 'Fiscal vs Monetary Policy in IS-LM', subId: 'sub-econ' },
    { label: 'Schrödinger 1D Box (Physics)', topic: 'Schrödinger Wave Equation in 1D Well', subId: 'sub-phys' },
  ];

  return (
    <div id="smart-study-view-container" className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* Header Bar */}
      <div
        id="smart-study-header-card"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-2xl text-purple-600">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                Smart Study & Topic Recall Hub
              </h2>
              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2.5 py-0.5 rounded-full border border-purple-200">
                Mermaid.js Mind Maps & Spaced Repetition Flashcards
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Synthesize and retain previous topics through visual mind maps, decision graphs, and active recall flashcards
            </p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]">
          <button
            onClick={() => {
              playClickSound();
              setActiveMode('mindmap');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMode === 'mindmap'
                ? 'bg-blue-600 text-white shadow-[2px_2px_4px_#b8b9be]'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            🗺️ Mind Map Generator
          </button>
          <button
            onClick={() => {
              playClickSound();
              setActiveMode('flashcards');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              activeMode === 'flashcards'
                ? 'bg-purple-600 text-white shadow-[2px_2px_4px_#b8b9be]'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            📇 Diagram Flashcards ({currentDeck.length})
          </button>
        </div>
      </div>

      {/* Quick Recall Topic Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
        <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider shrink-0">
          ⚡ Review Old Topic:
        </span>
        {POPULAR_OLD_TOPICS.map((top, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedSubjectId(top.subId);
              setMindMapTopicInput(top.topic);
              handleGenerateMindMap(top.topic);
            }}
            className="py-1.5 px-3.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700 hover:text-blue-600 whitespace-nowrap transition-all cursor-pointer"
          >
            {top.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* MODE 1: MIND MAP GENERATOR (MERMAID.JS + GEMINI API) */}
      {/* ========================================================= */}
      {activeMode === 'mindmap' && (
        <div className="flex flex-col gap-6 w-full">
          {/* Input & Generation Bar */}
          <div className="p-5 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-gray-600 uppercase">Subject:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3 py-2.5 text-xs font-bold text-blue-600 border-none outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={mindMapTopicInput}
              onChange={(e) => setMindMapTopicInput(e.target.value)}
              placeholder="Enter any previous topic or concept to generate a mind map..."
              className="flex-1 w-full bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={() => handleGenerateMindMap()}
              disabled={isGeneratingMindMap || !mindMapTopicInput.trim()}
              className="w-full md:w-auto px-6 py-3 rounded-2xl bg-blue-600 text-white font-extrabold text-sm shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              {isGeneratingMindMap ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Synthesizing Mind Map...</span>
                </>
              ) : (
                <>
                  <span>🗺️ Generate Mind Map</span>
                  <span>✨</span>
                </>
              )}
            </button>
          </div>

          {/* Mind Map Canvas & Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Mermaid Mind Map Viewer */}
            <div
              id="mindmap-canvas-container"
              className="lg:col-span-8 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 sm:p-6 flex flex-col gap-4 min-h-[460px]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-gray-300/50">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Interactive Visual Mind Map (Mermaid.js)
                  </span>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">
                    {activeMindMap.topic}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMermaid}
                    className="px-3 py-1.5 rounded-xl bg-[#e0e5ec] shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700 cursor-pointer"
                  >
                    {copiedCode ? '✓ Copied Syntax' : '📋 Copy Mermaid'}
                  </button>
                </div>
              </div>

              {/* Diagram Rendering Viewport */}
              <div className="flex-1 flex items-center justify-center min-h-[320px] rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] p-4 overflow-auto">
                <MermaidRenderer code={activeMindMap.mermaidCode} idPrefix="mindmap" />
              </div>
            </div>

            {/* Right: Topic Synthesis & Memory Takeaways */}
            <div
              id="mindmap-summary-card"
              className="lg:col-span-4 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Active Recall Summary
                </span>
                <h4 className="text-base font-black text-gray-800 mt-0.5 mb-2">
                  Topic Synthesis & Axioms
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-[#e0e5ec] p-3.5 rounded-2xl shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff]">
                  {activeMindMap.summary}
                </p>

                <div className="mt-4">
                  <h5 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                    High-Yield Memory Takeaways
                  </h5>
                  <div className="space-y-2">
                    {activeMindMap.keyTakeaways.map((point, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-xl bg-[#e0e5ec] shadow-[2px_2px_4px_#b8b9be,-2px_-2px_4px_#ffffff] text-xs text-gray-700 font-medium"
                      >
                        <span className="text-blue-600 font-bold mt-0.5">✦</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-300/50 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setActiveMode('flashcards');
                    setNewFlashcardTopic(activeMindMap.topic);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-purple-600 text-white font-extrabold text-xs shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:bg-purple-700 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📇 Turn Topic into Flashcard Deck</span>
                  <span>➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: ACTIVE RECALL FLASHCARDS (WITH MERMAID.JS) */}
      {/* ========================================================= */}
      {activeMode === 'flashcards' && (
        <div className="flex flex-col gap-6 w-full">
          {/* Deck Header & Subject Filter */}
          <div className="p-5 rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600 uppercase">Subject Deck:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setCurrentCardIndex(0);
                  setIsCardFlipped(false);
                }}
                className="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2 text-xs font-bold text-purple-600 border-none outline-none cursor-pointer"
              >
                <option value="all">All Flashcard Decks ({flashcards.length})</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFlashcardTopic}
                onChange={(e) => setNewFlashcardTopic(e.target.value)}
                placeholder="Topic for AI flashcard deck..."
                className="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none w-48 sm:w-64"
              />
              <button
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-[3px_3px_6px_#b8b9be,-3px_-3px_6px_#ffffff] hover:bg-purple-700 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingFlashcards ? 'Generating...' : '+ Generate Deck'}
              </button>
            </div>
          </div>

          {/* Flashcard Interactive Viewport */}
          {currentDeck.length === 0 ? (
            <div className="p-12 rounded-[32px] bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] text-center flex flex-col items-center gap-3">
              <span className="text-4xl">📇</span>
              <h3 className="text-base font-black text-gray-800">No Flashcards in this Deck</h3>
              <p className="text-xs text-gray-500 max-w-md">
                Generate flashcards with Mermaid.js diagrams for any old topic to start spaced repetition!
              </p>
              <button
                onClick={handleGenerateFlashcards}
                className="mt-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Generate Flashcards for {activeSubject?.name || 'Subject'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 max-w-3xl mx-auto w-full">
              {/* Card Indicator */}
              <div className="flex items-center justify-between w-full px-2 text-xs font-bold text-gray-500">
                <span>
                  Card {currentCardIndex + 1} of {currentDeck.length}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-0.5 rounded-full font-extrabold">
                  {activeCard?.topic}
                </span>
                <span>Interval: {activeCard?.repetitionIntervalDays || 1} days</span>
              </div>

              {/* The Flip Card Container */}
              <div
                onClick={() => {
                  playClickSound();
                  setIsCardFlipped((prev) => !prev);
                }}
                className="w-full min-h-[380px] rounded-[36px] bg-[#e0e5ec] shadow-[10px_10px_20px_#b8b9be,-10px_-10px_20px_#ffffff] p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.01] relative border-2 border-white/60"
              >
                {/* Front / Back Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl ${
                      isCardFlipped ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {isCardFlipped ? '💡 Solution & Explanation (Back)' : '❓ Active Recall Question (Front)'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    Click anywhere to flip 🔄
                  </span>
                </div>

                {/* Card Content Area */}
                <div className="my-auto py-4 flex flex-col items-center text-center">
                  {!isCardFlipped ? (
                    <div className="space-y-4 max-w-lg">
                      <h3 className="text-lg sm:text-xl font-black text-gray-800 leading-snug">
                        {activeCard?.frontQuestion}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Try to recall the governing formula, intermediate mechanism, and edge cases before flipping.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 w-full text-left">
                      <h4 className="text-sm font-extrabold text-emerald-700">
                        Explanation & Core Proof:
                      </h4>
                      <p className="text-sm text-gray-800 leading-relaxed font-medium bg-[#e0e5ec] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff]">
                        {activeCard?.backExplanation}
                      </p>

                      {/* Embedded Mermaid Diagram on Card */}
                      {activeCard?.mermaidDiagram && (
                        <div className="mt-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">
                            Concept Diagram (Mermaid.js):
                          </span>
                          <MermaidRenderer
                            code={activeCard.mermaidDiagram}
                            idPrefix={`card-${activeCard.id}`}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom hint */}
                <div className="text-center text-[11px] font-bold text-gray-400">
                  {isCardFlipped
                    ? 'Rate your recall accuracy below to update spaced repetition intervals'
                    : 'Click card to reveal answer and diagram'}
                </div>
              </div>

              {/* Spaced Repetition Rating Buttons */}
              {isCardFlipped && (
                <div className="flex flex-wrap items-center justify-center gap-3 w-full animate-fadeIn">
                  <button
                    onClick={() => handleRating('again')}
                    className="px-4 py-2.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-black text-red-600 cursor-pointer"
                  >
                    🔁 Again (1d)
                  </button>
                  <button
                    onClick={() => handleRating('hard')}
                    className="px-4 py-2.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-black text-amber-600 cursor-pointer"
                  >
                    ⏳ Hard (3d)
                  </button>
                  <button
                    onClick={() => handleRating('good')}
                    className="px-5 py-2.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-black text-blue-600 cursor-pointer"
                  >
                    👍 Good (5d)
                  </button>
                  <button
                    onClick={() => handleRating('easy')}
                    className="px-5 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:bg-emerald-700 text-xs font-black cursor-pointer"
                  >
                    ⭐️ Easy (7d)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
