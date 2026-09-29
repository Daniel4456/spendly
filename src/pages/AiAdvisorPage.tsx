import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Trash2,
  SlidersHorizontal,
  Bot,
  PieChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Cpu,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ChatMessage, AiSettings } from '../types/ai';
import { AiMessageItem } from '../components/ai/AiMessageItem';
import { AiQuickPrompts } from '../components/ai/AiQuickPrompts';
import { AiSettingsModal } from '../components/ai/AiSettingsModal';
import { formatCurrency } from '../utils/formatters';
import {
  generateLocalAiResponse,
  queryGeminiApi,
  FinancialContext,
} from '../services/aiAdvisorEngine';

const DEFAULT_SETTINGS: AiSettings = {
  engine: 'local',
  voiceEnabled: true,
  geminiModel: 'gemini-1.5-flash',
};

export const AiAdvisorPage: React.FC = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  // Load chat messages
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
        text: `👋 **Welcome to your AI Financial Agent, ${userName}!**\n\nI have direct access to your live Spendly financial records. Here are a few things I can do for you:\n\n- 📊 **Audit your spending:** *"Analyze my monthly spending and show me where my money is going"*\n- ⚡ **Log expenses instantly:** *"Spent ₦4,500 on groceries today"*\n- 🎯 **Check your budgets:** *"Am I over budget this month?"*\n- 💡 **Savings strategies:** *"How can I save 20% more?"*\n\nTap any suggested question below or type your request!`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  // Settings
  const [settings, setSettings] = useState<AiSettings>(() => {
    try {
      const saved = localStorage.getItem('spendly_ai_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    try {
      localStorage.setItem('spendly_ai_chat', JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages]);

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
          text: `⚠️ I encountered an error processing your query. Please try again.`,
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

        showToast(`Transaction "${payload.title}" recorded successfully!`, 'success');
      } else if (actionCard.type === 'upsert_budget') {
        const payload = actionCard.payload;
        await upsertBudget(payload.category, payload.monthlyLimit);
        showToast(`Budget for ${payload.category} set to ${formatCurrency(payload.monthlyLimit, currency)}`, 'success');
      }

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
      text: `Chat cleared! How can I help you manage your finances today, ${userName}?`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcome]);
    localStorage.removeItem('spendly_ai_chat');
    showToast('AI conversation reset.', 'info');
  };

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
        showToast('Listening... Speak now.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleSend(transcript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Voice error:', e);
      setIsListening(false);
    }
  };

  // Top category calculation
  const entries = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);
  const topCategoryName = entries[0] ? entries[0][0] : 'None';
  const topCategoryAmount = entries[0] ? entries[0][1] : 0;

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] md:h-[calc(100vh-6.5rem)] space-y-4 animate-fade-in">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent-primary via-indigo-500 to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary">
            <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-accent-primary" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
                Spendly AI Advisor
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-financial-income/15 text-financial-income border border-financial-income/20">
                <span className="w-1.5 h-1.5 rounded-full bg-financial-income animate-pulse" />
                Active Copilot
              </span>
            </div>
            <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500">
              Your autonomous personal finance agent connected to your live records
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-dark/80 dark:bg-card-dark/80 light:bg-slate-100 hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-slate-200 border border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-300 text-xs font-semibold text-text-primary dark:text-text-primary light:text-slate-900 transition-all"
            title="AI Engine Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent-primary" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-dark/80 dark:bg-card-dark/80 light:bg-slate-100 hover:bg-financial-expense/10 border border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-300 text-xs font-semibold text-text-secondary hover:text-financial-expense transition-all"
            title="Reset Chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Main Body: Chat Window + Side Telemetry Panel */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Central Chat Container */}
        <div className="flex-1 flex flex-col rounded-3xl bg-card-dark/60 dark:bg-card-dark/60 light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 overflow-hidden shadow-sm">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                <div className="w-9 h-9 rounded-2xl bg-accent-primary/20 text-accent-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="p-4 rounded-2xl bg-card-dark/90 dark:bg-card-dark/90 light:bg-slate-100 border border-spendlyBorder-dark/60 text-xs text-text-secondary flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-ping" />
                  <span>Spendly AI is crunching your numbers...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Bar & Input */}
          <div className="p-4 sm:p-5 border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-200 bg-card-dark/80 dark:bg-card-dark/80 light:bg-slate-50 space-y-3">
            <AiQuickPrompts onSelectPrompt={(p) => handleSend(p)} disabled={isThinking} />

            {/* Input Form */}
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
                placeholder='e.g., "Spent ₦4,500 on groceries" or "Where am I overspending?"'
                disabled={isThinking}
                className="flex-1 pl-4 pr-12 py-3.5 rounded-2xl bg-background-dark dark:bg-background-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-xs sm:text-sm text-text-primary dark:text-text-primary light:text-slate-900 placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-primary transition-all shadow-inner"
              />

              {/* Speech-to-text mic */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`absolute right-14 p-2 rounded-xl transition-colors ${
                  isListening
                    ? 'text-financial-expense bg-financial-expense/15 animate-pulse'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                title={isListening ? 'Stop listening' : 'Voice input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputQuery.trim() || isThinking}
                className="w-11 h-11 rounded-2xl bg-accent-primary hover:bg-accent-primary-hover disabled:opacity-40 text-white flex items-center justify-center shadow-glow-primary transition-all active:scale-95 shrink-0"
                aria-label="Send query to AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Desktop Telemetry Sidebar */}
        <div className="hidden lg:flex flex-col w-80 shrink-0 space-y-4 overflow-y-auto">
          {/* Card 1: Live Financial Context */}
          <div className="p-5 rounded-3xl bg-card-dark/60 dark:bg-card-dark/60 light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary dark:text-text-primary light:text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-accent-primary" /> AI Telemetry
              </span>
              <span className="text-[10px] font-semibold text-financial-income bg-financial-income/10 px-2 py-0.5 rounded-full">
                Synced
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <p className="text-[11px] text-text-secondary">Current Balance</p>
                <p className="text-xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900">
                  {formatCurrency(totalBalance, currency)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-100">
                <div>
                  <p className="text-[10px] text-text-secondary">Savings Rate</p>
                  <p
                    className={`text-sm font-bold ${
                      savingsRate >= 20 ? 'text-financial-income' : 'text-amber-400'
                    }`}
                  >
                    {savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary">Top Expense</p>
                  <p className="text-sm font-bold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
                    {topCategoryName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Active AI Agent Capabilities */}
          <div className="p-5 rounded-3xl bg-card-dark/60 dark:bg-card-dark/60 light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-text-primary dark:text-text-primary light:text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-financial-income" /> Agent Capabilities
            </h4>
            <div className="space-y-2 text-xs text-text-secondary">
              <div className="flex items-start gap-2">
                <span className="text-accent-primary font-bold">✓</span>
                <span>Natural language transaction logging with 1-click execution.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-primary font-bold">✓</span>
                <span>Category overspending detection and budget limits check.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-primary font-bold">✓</span>
                <span>Personalized savings blueprint based on real income.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-accent-primary font-bold">✓</span>
                <span>Month-end burn rate forecasting.</span>
              </div>
            </div>
          </div>

          {/* Card 3: Privacy & Security Badge */}
          <div className="p-4 rounded-2xl bg-financial-income/10 border border-financial-income/20 text-xs text-text-secondary flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-financial-income shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
                100% Private & Safe
              </p>
              <p className="text-[11px] leading-relaxed">
                Spendly AI never touches or requests your bank credentials. All data belongs strictly to you.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <AiSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          localStorage.setItem('spendly_ai_settings', JSON.stringify(newSettings));
          showToast('AI preferences updated.', 'success');
        }}
      />
    </div>
  );
};
