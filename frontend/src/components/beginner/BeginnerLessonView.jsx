import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, CheckCircle2, AlertCircle, HelpCircle, 
  Bot, Send, Sparkles, X, ChevronRight, RotateCcw, Lightbulb, ShieldAlert 
} from 'lucide-react';
import api from '../../utils/api';
import MarkdownContent from '../MarkdownContent';

export default function BeginnerLessonView({ level, userProfile, onCompleteLevel, onNextLevel, onClose }) {
  // Extract questions array cleanly with fallback
  const questions = Array.isArray(level.quiz?.questions)
    ? level.quiz.questions
    : Array.isArray(level.quiz)
    ? level.quiz
    : [level.quiz];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState({}); // { [qIdx]: { selectedOption, isCorrect } }
  const [quizCompleted, setQuizCompleted] = useState(false);
  const chatFeedRef = useRef(null);

  const currentQ = questions[currentQIndex] || questions[0];
  const isCurrentSubmitted = submittedAnswers[currentQIndex] !== undefined;
  const currentResult = submittedAnswers[currentQIndex];

  const correctCount = Object.values(submittedAnswers).filter(a => a.isCorrect).length;
  const totalQuestions = questions.length;
  const passingScore = Math.ceil(totalQuestions * 0.6); // 60% passing requirement

  // AI Mentor Chat State for this lesson
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome_ai',
      sender: 'ai',
      text: `Hello! I'm your AI Mentor for **${level.title}**. Ask me any question or how this applies to your situation (e.g. as a ${userProfile?.occupation || 'beginner'}).`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Reset quiz & chat states whenever level.id changes
  useEffect(() => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setSubmittedAnswers({});
    setQuizCompleted(false);
    setChatMessages([
      {
        id: 'welcome_ai',
        sender: 'ai',
        text: `Hello! I'm your AI Mentor for **${level.title}**. Ask me any question or how this applies to your situation (e.g. as a ${userProfile?.occupation || 'beginner'}).`
      }
    ]);
    setChatInput('');
    setIsThinking(false);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [level.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [chatMessages, isThinking]);

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    const correct = selectedOption === currentQ.correctAnswer;

    const newAnswers = {
      ...submittedAnswers,
      [currentQIndex]: {
        selectedOption,
        isCorrect: correct
      }
    };
    setSubmittedAnswers(newAnswers);

    // Check level completion requirement when all questions answered
    if (Object.keys(newAnswers).length === totalQuestions) {
      const finalCorrect = Object.values(newAnswers).filter(a => a.isCorrect).length;
      if (finalCorrect >= passingScore) {
        onCompleteLevel(level.id);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < totalQuestions - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setSelectedOption(submittedAnswers[nextIdx]?.selectedOption ?? null);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setSubmittedAnswers({});
    setQuizCompleted(false);
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
      ref={containerRef}
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

          {/* 4. Interactive Quiz (Multi-Question Supported) */}
          <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--accent-gold)]/40 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--accent-gold)]" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Lesson Checkpoint Quiz
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent-gold)] px-2.5 py-1 rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20">
                Question {currentQIndex + 1} of {totalQuestions}
              </span>
            </div>

            {/* Quiz Step Progress Bar */}
            <div className="w-full bg-[var(--input-bg)] h-1.5 rounded-full overflow-hidden border border-[var(--card-border)]">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent-gold)] to-[#F59E0B] transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {!quizCompleted ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed">
                  <span className="text-[var(--accent-gold)] font-mono font-bold mr-1">Q{currentQIndex + 1}.</span>
                  {currentQ.question}
                </p>

                <div className="space-y-2">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrectOption = i === currentQ.correctAnswer;
                    
                    let optionStyle = 'border-[var(--card-border)] bg-[var(--input-bg)] text-[var(--text-primary)] hover:border-[var(--accent-gold)]/40';

                    if (isCurrentSubmitted) {
                      if (isCorrectOption) {
                        optionStyle = 'border-[#22C55E]/60 bg-[#22C55E]/15 text-[#22C55E] font-bold shadow-sm';
                      } else if (isSelected && !currentResult?.isCorrect) {
                        optionStyle = 'border-rose-500/60 bg-rose-500/15 text-rose-400 font-bold';
                      } else {
                        optionStyle = 'border-[var(--card-border)]/50 bg-[var(--input-bg)]/50 text-[var(--text-secondary)] opacity-60';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] font-bold';
                    }

                    return (
                      <button
                        key={i}
                        disabled={isCurrentSubmitted}
                        onClick={() => setSelectedOption(i)}
                        className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opt}</span>
                          {isCurrentSubmitted && isCorrectOption && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] uppercase border border-[#22C55E]/30">
                              Correct Answer
                            </span>
                          )}
                        </div>
                        {isCurrentSubmitted ? (
                          isCorrectOption ? (
                            <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                          ) : (
                            isSelected && <X className="w-4 h-4 text-rose-400" />
                          )
                        ) : (
                          isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--accent-gold)]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {!isCurrentSubmitted ? (
                  <button
                    onClick={handleAnswerSubmit}
                    disabled={selectedOption === null}
                    className="btn-primary text-xs py-2.5 px-5 font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Submit Answer</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-4 rounded-xl border space-y-2.5 ${
                      currentResult?.isCorrect
                        ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          {currentResult?.isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect Answer'}
                        </span>
                      </div>

                      {!currentResult?.isCorrect && (
                        <div className="p-2.5 rounded-lg bg-[var(--card-bg)]/80 border border-rose-500/20 text-xs">
                          <span className="text-[var(--text-secondary)]">Correct Option: </span>
                          <strong className="text-[#22C55E] font-bold">{currentQ.options[currentQ.correctAnswer]}</strong>
                        </div>
                      )}

                      <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{currentQIndex < totalQuestions - 1 ? 'Next Question' : 'View Quiz Score'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Quiz Scorecard View */
              <div className="p-5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] mx-auto flex items-center justify-center text-2xl font-bold">
                  {correctCount >= passingScore ? '🏆' : '📚'}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">
                    {correctCount >= passingScore ? 'Quiz Passed! Level Unlocked' : 'Keep Practicing!'}
                  </h4>
                  <p className="text-xs text-[var(--text-secondary)]">
                    You scored <strong className="text-[var(--accent-gold)] font-mono">{correctCount} / {totalQuestions}</strong> correct answers ({Math.round((correctCount / totalQuestions) * 100)}%).
                  </p>
                </div>

                {correctCount >= passingScore ? (
                  <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-semibold">
                    ✨ Great job! You have unlocked Level {level.id} badges and roadmap progress.
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                    Score at least {passingScore} out of {totalQuestions} to complete this level.
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRetryQuiz}
                    className="btn-secondary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>Retry Quiz</span>
                  </button>

                  {correctCount >= passingScore && level.id < 10 && onNextLevel && (
                    <button
                      onClick={() => {
                        onNextLevel(level.id + 1);
                      }}
                      className="btn-primary text-xs py-2 px-5 font-bold flex items-center gap-1.5 cursor-pointer shadow-lg animate-bounce"
                    >
                      <span>Next Level (Level {level.id + 1})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: STEP 9 AI Mentor Mini-Chat (1 col) */}
        <div className="bg-[var(--input-bg)] rounded-2xl border border-[var(--card-border)] p-4 flex flex-col justify-between h-[520px] shadow-inner">
          {/* Chat Header */}
          <div className="pb-3 border-b border-[var(--card-border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] flex items-center justify-center relative">
                <Bot className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#22C55E] rounded-full border border-[var(--card-bg)] animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">AI Mentor ({userProfile?.occupation || 'Beginner'})</h4>
                  <span className="px-1.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] text-[9px] font-bold border border-[#22C55E]/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-secondary)]">Ask contextual follow-up questions</p>
              </div>
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
            <div ref={messagesEndRef} />
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
