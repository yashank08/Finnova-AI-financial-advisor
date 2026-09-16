import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, CheckCircle2, AlertCircle, HelpCircle, 
  Bot, Send, Sparkles, X, ChevronRight, RotateCcw, Lightbulb, ShieldAlert 
} from 'lucide-react';
import api from '../../utils/api';
import MarkdownContent from '../MarkdownContent';

export default function BeginnerLessonView({ level, userProfile, onCompleteLevel, onClose }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const chatFeedRef = useRef(null);

  // AI Mentor Chat State for this lesson
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome_ai',
      sender: 'ai',
      text: `Hello! I'm your AI Mentor for **${level.title}**. Ask me any question or how this applies to your situation (e.g. as a ${userProfile.occupation || 'beginner'}).`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [chatMessages, isThinking]);

  const handleQuizSubmit = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === level.quiz.correctAnswer;
    setIsCorrect(correct);
    setQuizSubmitted(true);

    if (correct) {
      onCompleteLevel(level.id);
    }
  };

  const handleAskMentor = async () => {
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    try {
      const res = await api.post('/chat', {
        message: userText,
        profile: userProfile,
        levelTopic: `Level ${level.id} - ${level.title}`,
        history: chatMessages.filter(m => m.id !== 'welcome_ai' && !m.isError).slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });

      const reply = res.data?.reply || res.data?.response || "That's a great question! Keep learning step-by-step.";
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting. Please try asking again.",
        isError: true
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-[var(--card-bg)] border border-[var(--accent-gold)]/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[88vh] overflow-y-auto custom-scrollbar"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center text-xl font-bold">
            {level.icon}
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-[var(--accent-gold)] uppercase tracking-wider">
              AI Coach • Level {level.id} • {level.difficulty}
            </span>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{level.title}</h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-[var(--input-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--card-border)] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lesson Content & Quiz (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Simple Explanation */}
          <div className="bg-[var(--input-bg)] p-5 rounded-2xl border border-[var(--card-border)] space-y-2">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[var(--accent-gold)]" /> Simple Explanation
            </h3>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">{level.explanation}</p>
          </div>

          {/* 2. Real-Life Example Box */}
          <div className="bg-[var(--accent-gold)]/10 p-5 rounded-2xl border border-[var(--accent-gold)]/30 space-y-2">
            <h3 className="text-sm font-bold text-[var(--accent-gold)] flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Real-Life Example
            </h3>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed italic">{level.example}</p>
          </div>

          {/* 3. Common Mistakes Checklist */}
          <div className="bg-[var(--input-bg)] p-5 rounded-2xl border border-[var(--card-border)] space-y-3">
            <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Common Mistakes to Avoid
            </h3>
            <ul className="space-y-1.5 text-xs text-[var(--text-secondary)]">
              {level.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Interactive Small Quiz */}
          <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--accent-gold)]/40 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-gold)]" /> Lesson Checkpoint Quiz
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-gold)]">
                Pass to Complete Level
              </span>
            </div>

            <p className="text-xs font-semibold text-[var(--text-primary)]">{level.quiz.question}</p>

            <div className="space-y-2">
              {level.quiz.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                return (
                  <button
                    key={i}
                    disabled={quizSubmitted}
                    onClick={() => setSelectedOption(i)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] font-bold'
                        : 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)]" />}
                  </button>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                onClick={handleQuizSubmit}
                disabled={selectedOption === null}
                className="btn-primary text-xs py-2.5 px-5 font-bold disabled:opacity-40 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <div className={`p-4 rounded-xl border space-y-2 ${
                isCorrect
                  ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">
                    {isCorrect ? '🎉 Correct Answer! Level Unlocked.' : '❌ Incorrect. Try again!'}
                  </span>
                  {!isCorrect && (
                    <button
                      onClick={() => { setQuizSubmitted(false); setSelectedOption(null); }}
                      className="text-xs text-[var(--accent-gold)] underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Retry
                    </button>
                  )}
                </div>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">{level.quiz.explanation}</p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: STEP 9 AI Mentor Mini-Chat (1 col) */}
        <div className="bg-[var(--input-bg)] rounded-2xl border border-[var(--card-border)] p-4 flex flex-col justify-between h-[520px] shadow-inner">
          {/* Chat Header */}
          <div className="pb-3 border-b border-[var(--card-border)] flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">AI Mentor ({userProfile.occupation || 'Beginner'})</h4>
              <p className="text-[10px] text-[var(--text-secondary)]">Ask contextual follow-up questions</p>
            </div>
          </div>

          {/* Messages Feed */}
          <div ref={chatFeedRef} className="flex-1 overflow-y-auto py-3 space-y-3 custom-scrollbar">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] rounded-2xl p-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[var(--accent-gold)] text-[#000000] font-semibold rounded-tr-none'
                    : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--card-border)] rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <span>{msg.text}</span>
                  ) : (
                    <MarkdownContent content={msg.text} />
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 text-xs text-[var(--accent-gold)] italic">
                <Bot className="w-3.5 h-3.5 animate-spin" /> AI Mentor is thinking...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="pt-2 border-t border-[var(--card-border)] flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskMentor()}
              placeholder="Ask mentor how this applies to you..."
              className="flex-1 bg-[var(--card-bg)] text-[var(--text-primary)] text-xs rounded-xl py-2 px-3 border border-[var(--card-border)] focus:outline-none focus:border-[var(--accent-gold)]"
            />
            <button
              onClick={handleAskMentor}
              disabled={!chatInput.trim()}
              className="p-2 rounded-xl btn-primary text-xs disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
