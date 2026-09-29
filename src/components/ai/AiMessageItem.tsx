import React from 'react';
import { ChatMessage, TransactionActionPayload, BudgetActionPayload } from '../../types/ai';
import { CATEGORY_META } from '../../utils/categories';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyCode } from '../../types';
import {
  Sparkles,
  User,
  CheckCircle2,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Tag,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface AiMessageItemProps {
  message: ChatMessage;
  currency: CurrencyCode;
  onApplyAction?: (messageId: string, actionCard: any) => Promise<void>;
}

export const AiMessageItem: React.FC<AiMessageItemProps> = ({
  message,
  currency,
  onApplyAction,
}) => {
  const isAssistant = message.sender === 'assistant';

  // Basic formatting helper for simple markdown
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900 mt-2 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-accent-primary mt-2 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Bullet point
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const content = line.substring(2);
        return (
          <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm my-0.5 ml-1">
            <span className="text-accent-primary mt-1 shrink-0">•</span>
            <span>{parseBold(content)}</span>
          </div>
        );
      }
      // Numbered list
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="text-xs sm:text-sm my-1 pl-1">
            {parseBold(line)}
          </div>
        );
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed">
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-text-primary dark:text-text-primary light:text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-text-secondary">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`flex items-start gap-3 sm:gap-4 ${
        isAssistant ? 'justify-start' : 'justify-end'
      } animate-fade-in`}
    >
      {/* Bot Avatar */}
      {isAssistant && (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-accent-primary via-indigo-500 to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary shrink-0 mt-0.5">
          <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
          </div>
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 ${
          isAssistant
            ? 'bg-card-dark/95 dark:bg-card-dark/95 light:bg-white border border-spendlyBorder-dark/70 dark:border-spendlyBorder-dark/70 light:border-slate-200 text-text-secondary dark:text-text-secondary light:text-slate-700'
            : 'bg-accent-primary text-white ml-auto'
        }`}
      >
        {/* Message Text */}
        <div className="space-y-1">{renderFormattedText(message.text)}</div>

        {/* Action Card: CREATE TRANSACTION */}
        {message.actionCard && message.actionCard.type === 'create_transaction' && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-background-dark/80 dark:bg-background-dark/80 light:bg-slate-50 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary">
                <Sparkles className="w-3.5 h-3.5" /> AI Action Prepared
              </span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  (message.actionCard.payload as TransactionActionPayload).type === 'income'
                    ? 'bg-financial-income/15 text-financial-income'
                    : 'bg-financial-expense/15 text-financial-expense'
                }`}
              >
                {(message.actionCard.payload as TransactionActionPayload).type}
              </span>
            </div>

            {/* Transaction Details */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      CATEGORY_META[(message.actionCard.payload as TransactionActionPayload).category]?.bgColor ||
                      'rgba(108, 99, 255, 0.15)',
                    color:
                      CATEGORY_META[(message.actionCard.payload as TransactionActionPayload).category]?.color ||
                      '#6C63FF',
                  }}
                >
                  {(message.actionCard.payload as TransactionActionPayload).type === 'income' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-text-primary dark:text-text-primary light:text-slate-900 truncate">
                    {(message.actionCard.payload as TransactionActionPayload).title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {(message.actionCard.payload as TransactionActionPayload).category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {(message.actionCard.payload as TransactionActionPayload).date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p
                  className={`text-base font-extrabold ${
                    (message.actionCard.payload as TransactionActionPayload).type === 'income'
                      ? 'text-financial-income'
                      : 'text-financial-expense'
                  }`}
                >
                  {(message.actionCard.payload as TransactionActionPayload).type === 'income' ? '+' : '-'}
                  {formatCurrency((message.actionCard.payload as TransactionActionPayload).amount, currency)}
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-1 border-t border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-200">
              {message.actionCard.status === 'applied' ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-financial-income bg-financial-income/10 px-3 py-2 rounded-lg justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to your transactions!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onApplyAction && onApplyAction(message.id, message.actionCard)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold shadow-glow-primary transition-all duration-150 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Confirm & Add to Records</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Card: UPSERT BUDGET */}
        {message.actionCard && message.actionCard.type === 'upsert_budget' && (
          <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-background-dark/80 dark:bg-background-dark/80 light:bg-slate-50 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary">
                <Sparkles className="w-3.5 h-3.5" /> Budget Setup
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent-primary/15 text-accent-primary uppercase tracking-wider">
                Monthly Limit
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-sm font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                  {(message.actionCard.payload as BudgetActionPayload).category}
                </p>
                <p className="text-[11px] text-text-secondary">Monthly target limit</p>
              </div>
              <p className="text-base font-extrabold text-accent-primary">
                {formatCurrency((message.actionCard.payload as BudgetActionPayload).monthlyLimit, currency)}
              </p>
            </div>

            <div className="pt-1 border-t border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-200">
              {message.actionCard.status === 'applied' ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-financial-income bg-financial-income/10 px-3 py-2 rounded-lg justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Budget target saved successfully!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onApplyAction && onApplyAction(message.id, message.actionCard)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-accent-primary hover:bg-accent-primary-hover text-white text-xs font-bold shadow-glow-primary transition-all duration-150 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Save This Budget Target</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={`text-[10px] pt-1 ${
            isAssistant ? 'text-text-secondary/70' : 'text-white/70 text-right'
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-white/10 dark:bg-white/10 light:bg-slate-200 text-text-primary dark:text-text-primary light:text-slate-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
