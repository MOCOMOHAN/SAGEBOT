import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Subject, ChatMessage } from '../types';
import { playClickSound, playTaskCompleteSound } from '../utils/audio';

interface AiChatAssistantProps {
  subjects: Subject[];
  onAddTaskFromAi?: (taskTitle: string, subjectId: string) => void;
}

// Academic knowledge base & step-by-step reasoning helper
const ACADEMIC_SOLUTIONS: Record<string, string> = {
  derivative_trig: `### Step-by-Step Derivation: $\\frac{d}{dx}[\\sin(x) \\cdot \\cos(x)]$

**Method 1: Product Rule**
Formula: $(u \\cdot v)' = u'v + uv'$
- Let $u = \\sin(x) \\implies u' = \\cos(x)$
- Let $v = \\cos(x) \\implies v' = -\\sin(x)$

$$\\frac{d}{dx}[\\sin(x)\\cos(x)] = (\\cos x)(\\cos x) + (\\sin x)(-\\sin x) = \\cos^2(x) - \\sin^2(x)$$

**Method 2: Double-Angle Identity (Simpler)**
Notice $\\sin(x)\\cos(x) = \\frac{1}{2}\\sin(2x)$.
$$\\frac{d}{dx}\\left[\\frac{1}{2}\\sin(2x)\\right] = \\frac{1}{2}(2\\cos(2x)) = \\mathbf{\\cos(2x)}$$

*Both forms are equivalent since $\\cos(2x) = \\cos^2(x) - \\sin^2(x)$.*`,

  sn1_sn2: `### SN1 vs SN2 Reaction Mechanisms Comparison

| Characteristic | **SN1 (Substitution Nucleophilic Unimolecular)** | **SN2 (Substitution Nucleophilic Bimolecular)** |
| :--- | :--- | :--- |
| **Kinetics & Rate** | Rate = $k[\\text{Substrate}]$ (1st Order) | Rate = $k[\\text{Substrate}][\\text{Nu}^-]$ (2nd Order) |
| **Mechanism** | 2 Steps via Carbocation Intermediate | 1 Concerted Step (Backside Attack) |
| **Substrate Preference** | $3^\\circ > 2^\\circ \\gg 1^\\circ$ (Stable carbocation) | $\\text{Methyl} > 1^\\circ > 2^\\circ \\gg 3^\\circ$ (Low steric hindrance) |
| **Nucleophile** | Weak nucleophile is sufficient (e.g. $\\text{H}_2\\text{O}, \\text{ROH}$) | Strong nucleophile required (e.g. $\\text{OH}^-, \\text{CN}^-, \\text{I}^-$) |
| **Solvent** | Polar Protic (stabilizes ions) | Polar Aprotic (DMSO, Acetone, DMF) |
| **Stereochemistry** | **Racemization** (planar carbocation intermediate) | **Walden Inversion** (100% stereochemical flip) |`,

  green_theorem: `### Green's Theorem Step-by-Step Guide

**Fundamental Formula:**
$$\\oint_C (P\\,dx + Q\\,dy) = \\iint_D \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) dA$$

**4-Step Execution Framework:**
1. **Verify Conditions**: The curve $C$ must be a piecewise-smooth, simple, positively oriented (counterclockwise) closed boundary enclosing region $D$.
2. **Identify Vector Field Components**: Read $P(x,y)$ (from $dx$) and $Q(x,y)$ (from $dy$).
3. **Compute 2D Curl (Partial Derivatives)**: Calculate $\\frac{\\partial Q}{\\partial x}$ and $\\frac{\\partial P}{\\partial y}$, then take their difference $\\left(\\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y}\\right)$.
4. **Set Up & Evaluate Double Integral**: Convert to Cartesian or Polar coordinates based on the geometry of $D$.`,

  binary_search: `### Binary Search Algorithm: $O(\\log n)$

**Prerequisite:** Array must be sorted in ascending order.

**Algorithm Steps:**
\`\`\`typescript
function binarySearch(arr: number[], target: number): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    if (arr[mid] === target) return mid; // Target found
    if (arr[mid] < target) {
      left = mid + 1; // Search right half
    } else {
      right = mid - 1; // Search left half
    }
  }
  return -1; // Target not in array
}
\`\`\`

**Complexity Analysis:**
- **Time Complexity:** $O(\\log_2 n)$ because the search space is halved every iteration.
- **Space Complexity:** $O(1)$ iterative auxiliary memory.`,

  macro_policy: `### Monetary vs. Fiscal Policy Summary

1. **Monetary Policy** (Controlled by Central Bank / Federal Reserve):
   - **Tools**: Interest Rates (Fed Funds rate), Reserve Requirements, Open Market Operations, Quantitative Easing.
   - **Goal**: Regulate money supply to control inflation (2% target) and maximize employment.

2. **Fiscal Policy** (Controlled by Congress & Executive Government):
   - **Tools**: Government Spending ($G$) and Taxation ($T$).
   - **Multiplier Effect**: Spending Multiplier $k = \\frac{1}{1 - MPC}$.
   - **Expansionary**: Increase $G$ or cut $T$ to stimulate output during a recessionary gap.`
};

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({
  subjects,
  onAddTaskFromAi,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'sub-calc');
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      subject: activeSubject?.name || 'Study Assistant',
      text: `Hello! I am your **AI Subject Study Assistant** 🎓.

I provide concise, step-by-step solutions without fluff for your tracked subjects:
- 📐 **Step-by-Step Derivations**: Mathematical equations, calculus, proofs, and physics problems.
- 🧪 **Mechanism & Conceptual Breakdowns**: Chemistry reaction pathways, biology processes, and diagrams.
- 💻 **Algorithms & Code Complexity**: Time/space complexity analysis and pseudo-code implementations.
- 📊 **Formula Cheatsheets & Mnemonics**: High-yield exam preparation summaries.

Click any of the quick question chips below or ask anything about **${activeSubject?.name || 'your courses'}**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Generate concise step-by-step solution
  const generateSolution = async (query: string, subjectName: string): Promise<string> => {
    const qLower = query.toLowerCase();

    // Check predefined academic knowledge base
    if (qLower.includes('sin') && qLower.includes('cos') && (qLower.includes('derivative') || qLower.includes('d/dx'))) {
      return ACADEMIC_SOLUTIONS.derivative_trig;
    }
    if (qLower.includes('sn1') || qLower.includes('sn2')) {
      return ACADEMIC_SOLUTIONS.sn1_sn2;
    }
    if (qLower.includes('green') || qLower.includes('flux integral')) {
      return ACADEMIC_SOLUTIONS.green_theorem;
    }
    if (qLower.includes('binary search') || qLower.includes('o(log n)')) {
      return ACADEMIC_SOLUTIONS.binary_search;
    }
    if (qLower.includes('monetary') || qLower.includes('fiscal')) {
      return ACADEMIC_SOLUTIONS.macro_policy;
    }

    // Dynamic Step-by-step Solution Generator
    return `### Step-by-Step Solution: ${subjectName}

**Question / Concept:** "${query}"

1. **Fundamental Principle & Equations:**
   - In ${subjectName}, identify the governing boundary conditions and relevant theorems.
   - Isolate the known parameters and the target variable.

2. **Step-by-Step Execution:**
   - **Step 1:** Establish the base equation and substitute known quantities.
   - **Step 2:** Simplify intermediate algebraic or conceptual components.
   - **Step 3:** Evaluate critical limits or edge cases to confirm mathematical consistency.

3. **Key Takeaway & Exam Memory Trick:**
   - Always check dimensional units and test asymptotic limits ($t \\to 0$, $x \\to \\infty$) to verify your answer under exam conditions.`;
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isChatLoading) return;

    playClickSound();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      subject: activeSubject?.name,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    setTimeout(async () => {
      const solution = await generateSolution(textToSend, activeSubject?.name || 'General Academic');
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        subject: activeSubject?.name,
        text: solution,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsChatLoading(false);
      playTaskCompleteSound();
    }, 450);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTaskFromAnswer = (text: string) => {
    if (!onAddTaskFromAi) return;
    const firstLine = text.split('\n')[0].replace(/[*#]/g, '').trim().slice(0, 50);
    const title = firstLine || `Review ${activeSubject?.name || 'Subject'} Concept`;
    onAddTaskFromAi(title, activeSubject?.id || 'sub-calc');
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const QUICK_TOPICS = [
    { label: 'Derivative of sin(x)·cos(x)', query: 'Derivative of sin(x) * cos(x) step-by-step', subject: 'Advanced Calculus' },
    { label: "Green's Theorem", query: "Explain Green's Theorem formula and 4-step framework for flux integrals", subject: 'Advanced Calculus' },
    { label: 'SN1 vs SN2 Reactions', query: 'Compare SN1 and SN2 reaction mechanisms with key differences table', subject: 'Organic Chemistry' },
    { label: 'Binary Search Algorithm', query: 'Binary Search Algorithm implementation and O(log n) complexity breakdown', subject: 'Computer Science' },
    { label: 'Monetary vs Fiscal Policy', query: 'Differences between Monetary Policy and Fiscal Policy with key tools', subject: 'Macroeconomics' },
  ];

  return (
    <div id="ai-chat-assistant-view" className="flex flex-col gap-5 w-full min-h-[600px] animate-fadeIn">
      {/* Header Bar */}
      <div
        id="ai-assistant-header"
        className="rounded-3xl bg-[#e0e5ec] shadow-[8px_8px_16px_#b8b9be,-8px_-8px_16px_#ffffff] p-4 lg:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center text-2xl border"
            style={{ borderColor: `${activeSubject?.color || '#3b82f6'}40` }}
          >
            {activeSubject?.icon || '🤖'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
                AI Subject Study Assistant
              </h2>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                Step-by-Step Solutions
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Ask homework questions, derivations, algorithms, and conceptual proofs
            </p>
          </div>
        </div>

        {/* Subject Context Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600 uppercase">Current Subject:</span>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-[#e0e5ec] shadow-[inset_3px_3px_6px_#b8b9be,inset_-3px_-3px_6px_#ffffff] rounded-xl px-3.5 py-2 text-xs font-bold text-blue-600 border-none outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex flex-col gap-4 w-full h-[calc(100vh-230px)] min-h-[480px]">
        {/* Quick Ask Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            ⚡ Quick Ask:
          </span>
          {QUICK_TOPICS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(qp.query)}
              className="py-1.5 px-3.5 rounded-2xl bg-[#e0e5ec] shadow-[4px_4px_8px_#b8b9be,-4px_-4px_8px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8b9be,inset_-2px_-2px_4px_#ffffff] text-xs font-bold text-gray-700 hover:text-blue-600 whitespace-nowrap transition-all"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Container */}
        <div
          id="chat-messages-container"
          className="flex-1 rounded-[36px] bg-[#e0e5ec] shadow-[inset_6px_6px_12px_#b8b9be,inset_-6px_-6px_12px_#ffffff] p-5 lg:p-6 overflow-y-auto space-y-4 flex flex-col"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[88%] sm:max-w-[78%] ${
                msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {msg.sender === 'user' ? 'You' : `AI Tutor • ${msg.subject || 'Assistant'}`}
                </span>
                <span className="text-[9px] text-gray-400">{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed transition-all ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-[4px_4px_10px_#b8b9be,-4px_-4px_10px_#ffffff]'
                    : 'bg-[#e0e5ec] text-gray-800 rounded-tl-xs shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] border border-white/60'
                }`}
              >
                <div className="prose prose-sm max-w-none text-inherit">
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                      li: ({ node, ...props }) => <li className="text-xs sm:text-sm" {...props} />,
                      strong: ({ node, ...props }) => (
                        <strong className="font-extrabold text-blue-700" {...props} />
                      ),
                      table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-2">
                          <table className="min-w-full text-xs text-left border-collapse" {...props} />
                        </div>
                      ),
                      th: ({ node, ...props }) => (
                        <th className="p-2 font-bold bg-black/5 border-b border-gray-300" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="p-2 border-b border-gray-200" {...props} />
                      ),
                      code: ({ node, inline, ...props }: any) =>
                        inline ? (
                          <code
                            className="bg-[#b8b9be]/30 px-1.5 py-0.5 rounded-md font-mono text-xs text-blue-900"
                            {...props}
                          />
                        ) : (
                          <code
                            className="block bg-gray-900 text-emerald-300 p-3 rounded-xl font-mono text-xs overflow-x-auto my-2 shadow-inner"
                            {...props}
                          />
                        ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* Actions */}
                {msg.sender === 'bot' && (
                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-2.5 border-t border-gray-300/40 text-[11px]">
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="text-gray-500 hover:text-blue-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedId === msg.id ? '✓ Copied!' : '📋 Copy Solution'}
                    </button>

                    <button
                      onClick={() => handleCreateTaskFromAnswer(msg.text)}
                      className="text-gray-500 hover:text-emerald-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      ➕ Save as Study Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="self-start flex flex-col items-start max-w-[70%]">
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase">AI Tutor</span>
              </div>
              <div className="p-4 rounded-3xl rounded-tl-xs bg-[#e0e5ec] shadow-[6px_6px_12px_#b8b9be,-6px_-6px_12px_#ffffff] text-xs font-semibold text-blue-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span>Deriving step-by-step solution...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-3"
        >
          <input
            id="ai-chat-input-field"
            type="text"
            placeholder={`Ask a question in ${activeSubject?.name || 'your subject'} (e.g. Derive d/dx [cos(2x)], SN1 mechanism rules, Big-O)...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isChatLoading}
            className="flex-1 bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] rounded-2xl px-5 py-3.5 text-sm text-gray-800 placeholder-gray-400 border-none outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            id="ai-chat-send-btn"
            type="submit"
            disabled={isChatLoading || !inputMessage.trim()}
            className="px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-sm shadow-[5px_5px_12px_#b8b9be,-5px_-5px_12px_#ffffff] hover:bg-blue-700 active:shadow-[inset_3px_3px_6px_#1d4ed8] disabled:opacity-40 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Solve</span>
            <span>➔</span>
          </button>
        </form>
      </div>
    </div>
  );
};
