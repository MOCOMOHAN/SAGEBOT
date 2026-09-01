import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  HelpCircle, 
  Lightbulb, 
  BookOpen, 
  Zap 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askStudyAssistant } from '../utils/aiAssistant';
import { playClickSound, playCoinSound } from '../utils/audio';

const QUICK_PROMPTS = [
  { label: 'Derivative of sin(x) · cos(x)', subject: 'Advanced Calculus' },
  { label: 'SN1 vs SN2 Mechanism differences', subject: 'Organic Chemistry' },
  { label: 'Binary Search Algorithm O(log n)', subject: 'Computer Science' },
  { label: 'Mitosis vs Meiosis stages (PMAT)', subject: 'General' },
  { label: 'Monetary vs Fiscal Policy in Macroeconomics', subject: 'Macroeconomics' },
  { label: 'Integral of 1/x dx', subject: 'Advanced Calculus' },
];

export default function StudyAssistantChat({
  subjects,
  chatHistory,
  onAddMessage,
  onClearHistory,
  initialQuery = '',
}) {
  const [inputMessage, setInputMessage] = useState(initialQuery || '');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'General');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      setInputMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    playClickSound();

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      subject: selectedSubject,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddMessage(userMsg);
    setInputMessage('');
    setIsLoading(true);

    try {
      const solution = await askStudyAssistant({
        question: text,
        subject: selectedSubject,
      });

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: solution,
        subject: selectedSubject,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      onAddMessage(botMsg);
      playCoinSound();
    } catch (err) {
      const errorMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: '⚠️ An error occurred while generating the solution. Please try asking in a slightly different format.',
        subject: selectedSubject,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playClickSound();
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full max-h-[85vh]">
      {/* Header & Subject Context Bar */}
      <section className="p-6 rounded-[36px] neu-flat bg-[#e0e5ec] flex flex-col gap-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl neu-pressed bg-[#e0e5ec] border border-blue-400 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-800 flex items-center gap-2">
                Concise AI Study Assistant
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Instant Solutions
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Ask homework equations, concepts, or algorithms for concise, step-by-step solutions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Subject Context Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-[#e0e5ec] neu-pressed rounded-xl px-3 py-2 text-xs font-bold text-blue-600 outline-none cursor-pointer"
              >
                <option value="General">🌐 All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.name}>
                    {sub.icon} {sub.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear history */}
            <button
              onClick={() => {
                playClickSound();
                onClearHistory();
              }}
              title="Clear chat history"
              className="p-2.5 rounded-xl neu-flat-sm text-slate-400 hover:text-rose-500 hover:neu-pressed transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" /> Quick Ask:
          </span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubject(qp.subject);
                handleSendMessage(qp.label);
              }}
              className="px-3 py-1.5 rounded-xl neu-flat-sm bg-[#e0e5ec] text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:neu-pressed transition-all shrink-0 whitespace-nowrap"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </section>

      {/* Chat Messages Log Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-[36px] neu-flat bg-[#e0e5ec] flex flex-col gap-4 min-h-[380px]">
        {chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              } max-w-full`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {isUser ? 'You' : `AI Tutor (${msg.subject || 'General'})`}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
              </div>

              <div
                className={`p-4 rounded-3xl text-sm leading-relaxed max-w-2xl relative group ${
                  isUser
                    ? 'neu-pressed bg-[#e0e5ec] text-slate-800 border-l-4 border-blue-500'
                    : 'neu-flat bg-[#e0e5ec] text-slate-800 border-l-4 border-emerald-500'
                }`}
              >
                {!isUser && (
                  <button
                    onClick={() => handleCopyText(msg.id, msg.text)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg neu-flat-sm text-slate-400 opacity-60 hover:opacity-100 hover:text-blue-600 transition-all"
                    title="Copy solution"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <div className="prose prose-sm max-w-none text-slate-800 font-medium">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-4 rounded-3xl neu-flat bg-[#e0e5ec] flex items-center gap-3 border-l-4 border-blue-500">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs font-bold text-slate-600">
                Solving {selectedSubject} question concisely...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 rounded-3xl neu-flat bg-[#e0e5ec] flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask a question in ${selectedSubject}... (e.g. Solve d/dx [cos(2x)], SN1 rules, Big O)`}
          className="flex-1 bg-[#e0e5ec] neu-pressed rounded-2xl px-5 py-3 text-sm outline-none text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-400"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-6 py-3 rounded-2xl neu-btn-primary font-bold text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <span>Solve</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
