import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Trash2, 
  ShieldCheck, 
  RotateCcw,
  Zap,
  Mic,
  MicOff
} from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const EXAMPLE_QUESTIONS = [
  "How can I cut monthly expenses by 15%?",
  "What is the best 80C tax saving strategy?",
  "Compare SIP vs Lumpsum investment",
  "How to build a 6-month emergency reserve?"
];

function renderFormattedText(text, isDark) {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className={`font-bold ${isDark ? 'text-[#D4AF37]' : 'text-[#B8860B]'}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function MarkdownContent({ content }) {
  const { isDark } = useTheme();
  if (!content) return null;
  const lines = content.split('\n');
  return (
    <div className={`space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}>
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;
        
        if (line.startsWith('### ')) {
          return <h3 key={idx} className={`text-sm font-bold mt-2 mb-1 ${isDark ? 'text-[#D4AF37]' : 'text-[#B8860B]'}`}>{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className={`text-sm font-bold mt-2 mb-1 ${isDark ? 'text-[#D4AF37]' : 'text-[#B8860B]'}`}>{line.replace('## ', '')}</h2>;
        }
        
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const bulletText = line.trim().substring(2);
          return (
            <div key={idx} className={`flex items-start gap-2 pl-2 ${isDark ? 'text-[#B5B5B5]' : 'text-[#4B5563]'}`}>
              <span className={`text-[10px] shrink-0 mt-1 ${isDark ? 'text-[#D4AF37]' : 'text-[#B8860B]'}`}>•</span>
              <span>{renderFormattedText(bulletText, isDark)}</span>
            </div>
          );
        }

        return <p key={idx} className={`text-xs ${isDark ? 'text-[#FFFFFF]' : 'text-[#111111]'}`}>{renderFormattedText(line, isDark)}</p>;
      })}
    </div>
  );
}

export function FinancialAssistant({ initialPrompt }) {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userHasScrolledUpRef = useRef(false);

  const isNearBottom = () => {
    const el = containerRef.current;
    if (!el) return true;
    const threshold = 100;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  };

  const handleScroll = () => {
    if (isNearBottom()) {
      userHasScrolledUpRef.current = false;
    } else {
      userHasScrolledUpRef.current = true;
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isThinking]);

  const handleSend = async (customPrompt = null, isRetry = false, retryText = '') => {
    const queryText = customPrompt || retryText || inputText;
    if (!queryText.trim()) return;

    if (!isRetry) {
      const userMsg = {
        id: Date.now().toString(),
        sender: 'user',
        text: queryText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      setInputText('');
    }

    userHasScrolledUpRef.current = false;
    setIsThinking(true);
    setTimeout(() => scrollToBottom(true), 50);

    const historyPayload = messages.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    let storedProfile = null;
    try {
      const p = localStorage.getItem('finnova_financial_compass_profile') || localStorage.getItem('finnova_beginner_profile');
      if (p) storedProfile = JSON.parse(p);
    } catch (_) {}

    try {
      // Attempt SSE Streaming first
      const token = localStorage.getItem('finnova_token') || sessionStorage.getItem('finnova_token');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: queryText,
          history: historyPayload,
          profile: storedProfile,
          stream: true
        })
      });

      if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
        const aiMsgId = (Date.now() + 1).toString();
        const initialAiMsg = {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, initialAiMsg]);
        setIsThinking(false);

        if (!userHasScrolledUpRef.current && isNearBottom()) {
          scrollToBottom(true);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let streamBuffer = '';
        let isFirstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          streamBuffer += decoder.decode(value, { stream: true });
          const lines = streamBuffer.split('\n');
          streamBuffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;
            if (trimmed === 'data: [DONE]') break;

            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                if (parsed.content) {
                  accumulatedText += parsed.content;
                  setMessages(prev =>
                    prev.map(m => (m.id === aiMsgId ? { ...m, text: accumulatedText } : m))
                  );

                  // Smart auto-scroll during stream:
                  // Only auto-scroll if user has NOT manually scrolled upward!
                  if (!userHasScrolledUpRef.current) {
                    if (isFirstChunk) {
                      scrollToBottom(true);
                      isFirstChunk = false;
                    } else {
                      scrollToBottom(false);
                    }
                  }
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (_) {}
            }
          }
        }

        if (!accumulatedText.trim()) {
          throw new Error("Received empty stream response.");
        }
        return;
      }

      // Fallback to standard JSON response
      const res = await api.post('/chat', {
        message: queryText,
        history: historyPayload,
        profile: storedProfile
      });

      const aiText = res.data?.reply || res.data?.response || "Here is your calculated financial strategy.";
      const cards = res.data?.cards || [];

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        cards: cards,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      if (!userHasScrolledUpRef.current) {
        setTimeout(() => scrollToBottom(true), 50);
      }
    } catch (err) {
      const serverErrMsg = err?.response?.data?.message || err?.message || "I'm having trouble connecting to FinNova AI servers. Please ensure the backend service is running.";
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: serverErrMsg,
        isError: true,
        failedQuery: queryText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      if (!userHasScrolledUpRef.current) {
        setTimeout(() => scrollToBottom(true), 50);
      }
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';

    if (!isListening) {
      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="w-full">
      {/* SINGLE UNIFIED CHAT CONTAINER (70vh height) */}
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] shadow-2xl h-[70vh] min-h-[500px] max-h-[750px] flex flex-col overflow-hidden relative transition-colors duration-300">
        
        {/* 1. HEADER */}
        <div className="px-5 py-3.5 border-b border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center shrink-0 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  FinNova AI Assistant
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-ping" />
                  Active
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-xs">
                Institutional wealth intelligence
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-rose-500/10 text-[var(--text-secondary)] hover:text-rose-400 border border-[var(--card-border)] text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>

        {/* 2. SCROLLABLE CONVERSATION AREA */}
        <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col items-center justify-center text-center px-4 py-4 space-y-4"
            >
              {/* Icon Header */}
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] flex items-center justify-center shadow-xl">
                  <Bot className="w-7 h-7" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-gold)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[var(--accent-gold)]"></span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="max-w-xl space-y-1">
                <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Welcome back 👋
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  I'm your personal AI wealth advisor. I can help you with: <span className="text-[var(--accent-gold)] font-semibold">Budget Planning, Investment Advice, Tax Saving, Mutual Funds, Insurance, and Retirement Planning</span>.
                </p>
              </div>

              {/* 6 Clickable Suggestion Cards (2x3 Grid) */}
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {[
                  { icon: '💳', prompt: 'Budget Planning' },
                  { icon: '📈', prompt: 'Investment Advice' },
                  { icon: '🏦', prompt: 'Tax Saving' },
                  { icon: '📊', prompt: 'Mutual Funds' },
                  { icon: '🛡️', prompt: 'Insurance' },
                  { icon: '🎯', prompt: 'Retirement Planning' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(`Give me institutional guidance on ${item.prompt}`)}
                    className="bg-[var(--input-bg)] hover:bg-[var(--card-hover)] border border-[var(--input-border)] hover:border-[var(--accent-gold)]/50 rounded-xl p-3 text-left transition-all duration-200 group flex items-start gap-2.5 shadow-sm hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span className="text-base shrink-0 leading-none mt-0.5">{item.icon}</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)] leading-snug">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl p-4 ${
                      msg.sender === 'user'
                        ? isDark
                          ? 'bg-[#FFFFFF] text-[#000000] rounded-tr-none font-semibold text-xs sm:text-sm shadow-md'
                          : 'bg-[#FFF8E6] text-[#111111] border border-[#B8860B]/30 rounded-tr-none font-semibold text-xs sm:text-sm shadow-sm'
                        : msg.isError
                        ? 'bg-[var(--input-bg)] border border-rose-500/40 text-[var(--text-primary)] rounded-tl-none'
                        : isDark
                        ? 'bg-[#181818] border border-[rgba(255,255,255,0.08)] text-[#FFFFFF] rounded-tl-none shadow-sm'
                        : 'bg-[#F3F4F6] border border-[#E5E7EB] text-[#111111] rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="leading-relaxed">{msg.text}</p>
                    ) : (
                      <MarkdownContent content={msg.text} />
                    )}

                    {msg.isError && (
                      <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex items-center justify-between">
                        <span className="text-[11px] text-rose-400 font-medium">Failed to fetch response</span>
                        <button
                          onClick={() => handleSend(null, true, msg.failedQuery)}
                          className="px-3 py-1.5 rounded-xl bg-[var(--accent-gold)]/15 hover:bg-[var(--accent-gold)]/25 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`text-[10px] text-[var(--text-muted)] px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold ${isDark ? 'bg-[#FFFFFF] text-[#000000]' : 'bg-[#111111] text-[#FFFFFF]'}`}>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))
          )}

          {/* THINKING STATE: FinNova is analyzing... */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 justify-start"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              
              <div className="bg-[var(--ai-msg-bg)] border border-[var(--card-border)] text-[var(--text-secondary)] rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                <span className="text-xs font-semibold text-[var(--accent-gold)]">FinNova is analyzing...</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. STICKY INPUT CONTROLS */}
        <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md shrink-0 space-y-3">
          
          {/* Popular Inquiry Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--accent-gold)] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[var(--accent-gold)]" />
              <span>Suggested Questions</span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto custom-scrollbar">
              {EXAMPLE_QUESTIONS.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(question)}
                  className="chip text-[11px] font-medium py-1 px-3"
                >
                  <span>{question}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sticky Input Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about spending, investments, taxes, budgeting..."
              className="w-full bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm rounded-2xl py-3 pl-4 pr-28 border border-[var(--input-border)] focus:border-[var(--accent-gold)] focus:ring-2 focus:ring-[var(--accent-gold)]/20 focus:outline-none transition-all shadow-inner"
            />
            
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleVoiceInput}
                title="Voice Input"
                className={`p-2 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-500/10 border-rose-500 text-rose-400 animate-pulse'
                    : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--text-secondary)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/40'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="px-4 py-2 rounded-xl btn-primary font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-rose-400 text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening to your prompt... Speak now.
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
              256-Bit Encrypted Financial Intelligence
            </span>
            <span>Powered by OpenRouter AI</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default FinancialAssistant;
