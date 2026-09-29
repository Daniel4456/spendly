import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Maximize2,
  Trash2,
  SlidersHorizontal,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ChatMessage, AiSettings } from '../../types/ai';
import { AiMessageItem } from './AiMessageItem';
import { AiQuickPrompts } from './AiQuickPrompts';
import { AiSettingsModal } from './AiSettingsModal';
import {
  generateLocalAiResponse,
  queryGeminiApi,
  FinancialContext,
} from '../../services/aiAdvisorEngine';

const DEFAULT_SETTINGS: AiSettings = {
  engine: 'local',
  voiceEnabled: true,
  geminiModel: 'gemini-1.5-flash',
};

export const AiFloatingDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const {
    transactions,
    budgets,
    totalIncome,
    totalExpenses,
    totalBalance,
    savings,
    savingsRate,
    trendPercentage,
    categoryExpenses,
    addTransaction,
    upsertBudget,
  } = useTransactions();

  const { profile, user } = useAuth();
  const { showToast } = useToast();

  const currency = profile?.currency || 'NGN';
  const userName = profile?.displayName || user?.displayName || 'Friend';

  // Load chat history from localStorage or start fresh
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('spendly_ai_chat');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load chat history:', e);
    }
    return [
      {
        id: 'welcome_msg',
        sender: 'assistant',
        text: `👋 **Hi ${userName}! I'm Spendly AI.**\n\nI can analyze your spending, check budgets, or log any expense in seconds.\n\n*Try saying: "Spent ₦4,500 on groceries"* or tap a quick question below!`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // Settings from localStorage
  const [settings, setSettings] = useState<AiSettings>(() => {
    try {
      const saved = localStorage.getItem('spendly_ai_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isThinking]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem('spendly_ai_chat', JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // If currently on the dedicated AI advisor page, do not render floating widget to avoid duplicate UI
  if (location.pathname === '/ai-advisor') {
    return null;
  }

  const getFinancialContext = (): FinancialContext => ({
    transactions,
    budgets,
    totalIncome,
    totalExpenses,
    totalBalance,
    savings,
    savingsRate,
    trendPercentage,
    categoryExpenses,
    currency,
    userName,
  });

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || isThinking) return;

    setInputQuery('');

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const ctx = getFinancialContext();
      let aiResult;

      if (settings.engine === 'gemini' && settings.geminiApiKey) {
        aiResult = await queryGeminiApi(textToSend, ctx, settings.geminiApiKey, settings.geminiModel);
      } else {
        // Natural local engine
        aiResult = generateLocalAiResponse(textToSend, ctx);
      }

      const botMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: aiResult.text,
        actionCard: aiResult.actionCard,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Error generating AI response:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ I encountered an issue analyzing that request. Please try again or rephrase.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleApplyAction = async (messageId: string, actionCard: any) => {
    try {
      if (actionCard.type === 'create_transaction') {
        const payload = actionCard.payload;
        await addTransaction({
          type: payload.type,
          amount: payload.amount,
          category: payload.category,
          title: payload.title,
          date: payload.date,
          description: payload.description,
        });

        showToast(`Transaction "${payload.title}" added to records!`, 'success');
      } else if (actionCard.type === 'upsert_budget') {
        const payload = actionCard.payload;
        await upsertBudget(payload.category, payload.monthlyLimit);
        showToast(`Budget for ${payload.category} set to ${payload.monthlyLimit}`, 'success');
      }

      // Mark action card as applied
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId && msg.actionCard
            ? { ...msg, actionCard: { ...msg.actionCard, status: 'applied' } }
            : msg
        )
      );
    } catch (err: any) {
      console.error('Failed to apply action card:', err);
      showToast('Could not save item. Please try again.', 'error');
    }
  };

  const handleClearHistory = () => {
    const welcome: ChatMessage = {
      id: `welcome_${Date.now()}`,
      sender: 'assistant',
      text: `Chat cleared! How can I assist your financial journey today, ${userName}?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    localStorage.removeItem('spendly_ai_chat');
    showToast('AI conversation reset.', 'info');
  };

  // Voice dictation toggle
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your expense or question.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Voice error:', e);
      setIsListening(false);
    }
  };

  const saveSettings = (newSettings: AiSettings) => {
    setSettings(newSettings);
    localStorage.setItem('spendly_ai_settings', JSON.stringify(newSettings));
    showToast('AI preferences saved.', 'success');
  };

  return (
    <>
      {/* Floating Action Button (Visible on screens when closed) */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-accent-primary via-[#795290] to-accent-primary hover:opacity-95 text-white font-bold text-xs shadow-xl shadow-accent-primary/30 transition-all duration-200 hover:scale-105 active:scale-95 border border-white/20"
            aria-label="Open Spendly AI Financial Copilot"
          >
            <div className="relative">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-financial-income animate-ping" />
            </div>
            <span className="hidden sm:inline">Spendly AI</span>
            <span className="inline-block px-1.5 py-0.5 rounded-full bg-white/20 text-[9px] font-black uppercase tracking-wider">
              AI
            </span>
          </button>
        </div>
      )}

      {/* Floating Drawer / Slide-Over Window */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] max-w-full bg-background-dark/95 dark:bg-background-dark/95 light:bg-white/95 backdrop-blur-xl border-l border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-2xl flex flex-col animate-slide-left transition-all">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-200 flex items-center justify-between bg-card-dark/60 dark:bg-card-dark/60 light:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent-primary via-indigo-500 to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary">
                <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[14px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-accent-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm sm:text-base text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
                    Spendly AI Copilot
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-financial-income/15 text-financial-income text-[10px] font-bold">
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary truncate max-w-[200px]">
                  {settings.engine === 'gemini' ? 'Google Gemini 1.5' : 'Instant Local Engine'}
                </p>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/ai-advisor');
                }}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
                title="Expand to Fullscreen Page"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
                title="AI Settings"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-xl text-text-secondary hover:text-financial-expense hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-slate-200 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => (
              <AiMessageItem
                key={msg.id}
                message={msg}
                currency={currency}
                onApplyAction={handleApplyAction}
              />
            ))}

            {isThinking && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-2xl bg-accent-primary/20 text-accent-primary flex items-center justify-center p-0.5 shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="p-3.5 rounded-2xl bg-card-dark/80 dark:bg-card-dark/80 light:bg-slate-100 border border-spendlyBorder-dark/60 text-xs text-text-secondary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
                  <span>Analyzing your financial data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Suggestions & Input */}
          <div className="p-3 sm:p-4 border-t border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-200 bg-card-dark/70 dark:bg-card-dark/70 light:bg-slate-50 space-y-3">
            <AiQuickPrompts onSelectPrompt={(p) => handleSend(p)} disabled={isThinking} />

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Log an expense or ask about your finances..."
                disabled={isThinking}
                className="flex-1 pl-4 pr-11 py-3 rounded-2xl bg-background-dark dark:bg-background-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-xs sm:text-sm text-text-primary dark:text-text-primary light:text-slate-900 placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-primary transition-all shadow-inner"
              />

              {/* Voice Dictation Button */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-12 p-2 rounded-xl transition-colors ${
                  isListening
                    ? 'text-financial-expense bg-financial-expense/15 animate-pulse'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title={isListening ? 'Stop listening' : 'Speak your query'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isThinking}
                className="w-10 h-10 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-40 text-white flex items-center justify-center shadow-glow-primary transition-all active:scale-95 shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={saveSettings}
      />
    </>
  );
};
