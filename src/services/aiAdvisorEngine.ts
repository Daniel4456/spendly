import { Transaction, Budget, CurrencyCode } from '../types';
import { ActionCard, AiSettings, TransactionActionPayload, BudgetActionPayload } from '../types/ai';
import { formatCurrency } from '../utils/formatters';

export interface FinancialContext {
  transactions: Transaction[];
  budgets: Budget[];
  totalIncome: number;
  totalExpenses: number;
  totalBalance: number;
  savings: number;
  savingsRate: number;
  trendPercentage: number;
  categoryExpenses: Record<string, number>;
  currency: CurrencyCode;
  userName: string;
}

export interface AiResponse {
  text: string;
  actionCard?: ActionCard;
}

// Category keyword mappings for natural language detection
const EXPENSE_KEYWORD_MAP: Record<string, string[]> = {
  Food: ['food', 'lunch', 'dinner', 'breakfast', 'eat', 'restaurant', 'groceries', 'grocery', 'snack', 'coffee', 'supermarket', 'burger', 'pizza', 'shawarma', 'drinks', 'bar', 'cooking'],
  Transport: ['transport', 'fuel', 'petrol', 'gas', 'uber', 'bolt', 'taxi', 'bus', 'train', 'flight', 'fare', 'mechanic', 'car', 'parking', 'toll'],
  Bills: ['bill', 'bills', 'electricity', 'nepa', 'power', 'water', 'internet', 'wifi', 'data', 'dstv', 'gotv', 'netflix', 'cable', 'utility', 'utilities', 'phone bill', 'recharge'],
  Shopping: ['shopping', 'clothes', 'shoes', 'dress', 'shirt', 'jacket', 'gadget', 'phone', 'laptop', 'amazon', 'store', 'mall', 'electronics', 'furniture'],
  Entertainment: ['entertainment', 'movie', 'cinema', 'game', 'gaming', 'concert', 'club', 'party', 'outing', 'vacation', 'trip', 'steam', 'playstation', 'cinema ticket'],
  Health: ['health', 'hospital', 'medicine', 'pharmacy', 'drugs', 'doctor', 'clinic', 'dentist', 'gym', 'fitness', 'workout', 'checkup'],
  Education: ['education', 'course', 'tuition', 'school', 'books', 'book', 'udemy', 'coursera', 'training', 'exam', 'tutorial'],
  Rent: ['rent', 'house rent', 'apartment', 'landlord', 'housing', 'lease'],
};

const INCOME_KEYWORD_MAP: Record<string, string[]> = {
  Salary: ['salary', 'paycheck', 'wage', 'wages', 'work', 'job', 'monthly pay'],
  Freelance: ['freelance', 'client', 'gig', 'upwork', 'fiverr', 'contract', 'consulting'],
  Business: ['business', 'sales', 'profit', 'revenue', 'store sales', 'trade', 'shop sales'],
  Investment: ['investment', 'dividend', 'dividends', 'crypto', 'stocks', 'interest', 'shares'],
  Gift: ['gift', 'present', 'donation', 'allowance', 'pocket money', 'from dad', 'from mom', 'dash'],
};

/**
 * Extracts a numeric amount from a query string.
 * Supports "$50", "₦4,500", "5000", "12.5k", "2.5m"
 */
function extractAmount(text: string): number | null {
  // Check for k / m multiplier (e.g. 5k, 10.5k, 2m)
  const multiplierRegex = /(\d+(?:\.\d+)?)\s*(k|m)\b/i;
  const multMatch = text.match(multiplierRegex);
  if (multMatch) {
    const val = parseFloat(multMatch[1]);
    const unit = multMatch[2].toLowerCase();
    if (unit === 'k') return val * 1000;
    if (unit === 'm') return val * 1000000;
  }

  // Look for currency symbols or naked numbers
  const numberRegex = /(?:[₦$€£]|ngn|usd|eur|gbp|ghs|kes|zar)?\s*(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?)/i;
  const match = text.match(numberRegex);
  if (match) {
    const cleanNum = match[1].replace(/,/g, '');
    const parsed = parseFloat(cleanNum);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  }

  return null;
}

/**
 * Detects if the intent is to log an expense or income.
 */
function detectTransactionType(text: string): 'expense' | 'income' {
  const lower = text.toLowerCase();
  const incomeIndicators = ['received', 'earned', 'got paid', 'salary', 'income', 'deposit', 'sold', 'bonus', 'gift from', 'freelance'];
  for (const ind of incomeIndicators) {
    if (lower.includes(ind)) return 'income';
  }
  return 'expense'; // default is expense for finance logging
}

/**
 * Detects appropriate category based on keywords.
 */
function detectCategory(text: string, type: 'expense' | 'income'): string {
  const lower = text.toLowerCase();
  const map = type === 'income' ? INCOME_KEYWORD_MAP : EXPENSE_KEYWORD_MAP;

  for (const [category, keywords] of Object.entries(map)) {
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(lower)) {
        return category;
      }
    }
  }

  return type === 'income' ? 'Other' : 'Other';
}

/**
 * Cleans user message to create a crisp transaction title.
 */
function extractTransactionTitle(text: string, category: string, amount: number): string {
  let cleaned = text
    .replace(/(?:please\s+)?(?:log|add|record|track|i\s+spent|i\s+paid|spent|paid|bought|purchased|received|earned|got)\s*/i, '')
    .replace(/(?:an?\s+)?(?:expense|income|transaction)\s*(?:of)?/i, '')
    .replace(/(?:[₦$€£]|ngn|usd|eur|gbp|ghs|kes|zar)?\s*\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:k|m)?/gi, '')
    .replace(/\b(?:for|on|at|today|yesterday|now|this morning|this afternoon)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || cleaned.length < 2) {
    cleaned = category === 'Other' ? 'Miscellaneous' : category;
  }

  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Primary Local Intelligence Engine for Spendly AI.
 * Runs instantly in the browser without network latency or external API keys.
 */
export function generateLocalAiResponse(query: string, ctx: FinancialContext): AiResponse {
  const lower = query.toLowerCase().trim();
  const todayStr = new Date().toISOString().split('T')[0];

  // -------------------------------------------------------------
  // 1. INTENT: LOG TRANSACTION (e.g., "spent 4500 on groceries")
  // -------------------------------------------------------------
  const isLoggingCommand =
    /(?:spent|paid|bought|purchased|cost|received|earned|got paid|deposit|add (?:expense|income)|log (?:expense|income)|track)/i.test(lower) ||
    (/(?:food|transport|fuel|lunch|dinner|groceries|salary|wifi|uber|bill)/i.test(lower) && /\d+/.test(lower));

  const amountFound = extractAmount(lower);

  if (isLoggingCommand && amountFound && amountFound > 0) {
    const type = detectTransactionType(lower);
    const category = detectCategory(lower, type);
    const title = extractTransactionTitle(query, category, amountFound);

    const payload: TransactionActionPayload = {
      type,
      amount: amountFound,
      category,
      title,
      date: todayStr,
      description: `Logged via Spendly AI Agent: "${query}"`,
    };

    const formattedAmt = formatCurrency(amountFound, ctx.currency);

    const text = type === 'expense'
      ? `I've prepared this expense of **${formattedAmt}** for **${title}** under **${category}**.\n\nClick **Confirm & Add** below to record it into your transactions immediately!`
      : `I've recognized your incoming payment of **${formattedAmt}** for **${title}** under **${category}**.\n\nClick **Confirm & Add** to update your account balance!`;

    return {
      text,
      actionCard: {
        type: 'create_transaction',
        payload,
        status: 'pending',
      },
    };
  }

  // -------------------------------------------------------------
  // 2. INTENT: SET OR ADJUST BUDGET (e.g., "budget 50000 for food")
  // -------------------------------------------------------------
  if (/(?:budget|limit|allocate|cap)/i.test(lower) && amountFound && amountFound > 0) {
    const category = detectCategory(lower, 'expense');
    if (category !== 'Other' || /(?:budget for|limit for)/i.test(lower)) {
      const targetCat = category === 'Other' ? 'Shopping' : category;
      const formattedAmt = formatCurrency(amountFound, ctx.currency);

      const payload: BudgetActionPayload = {
        category: targetCat,
        monthlyLimit: amountFound,
      };

      return {
        text: `I'm ready to set your monthly **${targetCat}** budget limit to **${formattedAmt}**.\n\nWould you like me to apply this budget now?`,
        actionCard: {
          type: 'upsert_budget',
          payload,
          status: 'pending',
        },
      };
    }
  }

  // -------------------------------------------------------------
  // 3. INTENT: SPENDING AUDIT & ANALYSIS ("analyze spending", "where is my money going")
  // -------------------------------------------------------------
  if (/(?:analy[sz]e|audit|breakdown|summary|overview|where did (?:all )?my money go|how am i doing|spending report)/i.test(lower)) {
    if (ctx.transactions.length === 0) {
      return {
        text: `Hello ${ctx.userName}! You don't have any logged transactions yet.\n\nYou can log your first expense right now by saying: *"Spent ₦3,500 on lunch"* or click **Load Sample Data** on your Dashboard to explore!`,
      };
    }

    // Identify top category
    const entries = Object.entries(ctx.categoryExpenses).sort((a, b) => b[1] - a[1]);
    const topCat = entries[0] ? entries[0][0] : 'None';
    const topAmt = entries[0] ? entries[0][1] : 0;
    const topPercent = ctx.totalExpenses > 0 ? ((topAmt / ctx.totalExpenses) * 100).toFixed(1) : '0';

    let healthAssessment = '';
    if (ctx.savingsRate >= 20) {
      healthAssessment = `🌟 **Superb Financial Health**: You have a strong savings rate of **${ctx.savingsRate.toFixed(1)}%**. You're retaining a healthy portion of your earnings.`;
    } else if (ctx.savingsRate > 0) {
      healthAssessment = `⚖️ **Moderate Pace**: You're currently saving **${ctx.savingsRate.toFixed(1)}%**. The recommended target is at least 20%.`;
    } else {
      healthAssessment = `🚨 **Attention Needed**: Your expenses exceed your income by **${formatCurrency(Math.abs(ctx.savings), ctx.currency)}** this period.`;
    }

    const text = `### 📊 Real-Time Financial Audit for ${ctx.userName}

Here is what your actual numbers reveal:

- **Net Balance:** ${formatCurrency(ctx.totalBalance, ctx.currency)}
- **Total Inflow:** ${formatCurrency(ctx.totalIncome, ctx.currency)}
- **Total Outflow:** ${formatCurrency(ctx.totalExpenses, ctx.currency)}
- **Net Savings:** ${formatCurrency(ctx.savings, ctx.currency)} (${ctx.savingsRate.toFixed(1)}% savings rate)

${healthAssessment}

#### 🔍 Top Expense Drain
Your biggest spending category is **${topCat}** at **${formatCurrency(topAmt, ctx.currency)}**, which accounts for **${topPercent}%** of your total spending.

${entries.length > 1 ? `**Other noticeable categories:**\n` + entries.slice(1, 3).map(([cat, amt]) => `• **${cat}:** ${formatCurrency(amt, ctx.currency)} (${((amt / ctx.totalExpenses) * 100).toFixed(0)}%)`).join('\n') : ''}

💡 **AI Recommendation:** Check your ${topCat} category. Trimming just 15% from ${topCat} will save you **${formatCurrency(topAmt * 0.15, ctx.currency)}** each month!`;

    return { text };
  }

  // -------------------------------------------------------------
  // 4. INTENT: BUDGET CHECK ("am i over budget", "check budgets")
  // -------------------------------------------------------------
  if (/(?:budget|budgets|over budget|budget status|limit)/i.test(lower)) {
    if (ctx.budgets.length === 0) {
      return {
        text: `You haven't set up any budget targets yet!\n\nSetting a budget is the easiest way to prevent overspending. Try saying:\n👉 *"Set a budget of ₦50,000 for Food"* or visit the **Budgets** tab to set monthly limits.`,
      };
    }

    const budgetStatusLines: string[] = [];
    let overBudgetCount = 0;

    for (const b of ctx.budgets) {
      const spent = ctx.categoryExpenses[b.category] || 0;
      const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const remaining = b.monthlyLimit - spent;

      if (spent > b.monthlyLimit) {
        overBudgetCount++;
        budgetStatusLines.push(`🔴 **${b.category}**: Over by ${formatCurrency(Math.abs(remaining), ctx.currency)} (${pct.toFixed(0)}% used)`);
      } else if (pct >= 80) {
        budgetStatusLines.push(`🟡 **${b.category}**: Caution — ${pct.toFixed(0)}% used (${formatCurrency(remaining, ctx.currency)} left)`);
      } else {
        budgetStatusLines.push(`🟢 **${b.category}**: Safe — ${pct.toFixed(0)}% used (${formatCurrency(remaining, ctx.currency)} left)`);
      }
    }

    const text = `### 🎯 Budget Health Report

${overBudgetCount > 0 ? `⚠️ You have **${overBudgetCount}** budget(s) that exceeded their target!` : '🎉 Great job! None of your budgets have been exceeded.'}

${budgetStatusLines.join('\n\n')}

💡 **Tip:** To adjust any limit, just tell me: *"Increase my ${ctx.budgets[0]?.category || 'Food'} budget to ₦..."*`;

    return { text };
  }

  // -------------------------------------------------------------
  // 5. INTENT: HOW TO SAVE MORE / SAVINGS TIPS
  // -------------------------------------------------------------
  if (/(?:how to save|save more|savings advice|cut expenses|reduce spending|save money)/i.test(lower)) {
    const entries = Object.entries(ctx.categoryExpenses).sort((a, b) => b[1] - a[1]);
    const topDiscretionary = entries.find(([cat]) => ['Food', 'Shopping', 'Entertainment', 'Other'].includes(cat)) || entries[0];

    const catName = topDiscretionary ? topDiscretionary[0] : 'discretionary purchases';
    const catAmt = topDiscretionary ? topDiscretionary[1] : 0;
    const potentialSavings = catAmt * 0.2;

    const text = `### 💡 3 Actionable Steps to Boost Your Savings

Based on your current transaction history:

1. **Target Your ${catName} Spending:**
   You spent **${formatCurrency(catAmt, ctx.currency)}** on ${catName}. By trimming just 20% (e.g. cooking twice more per week or deferring non-essential purchases), you will immediately keep **${formatCurrency(potentialSavings, ctx.currency)}** in your bank account!

2. **The 50/30/20 Blueprint for Your Income:**
   With your current income of **${formatCurrency(ctx.totalIncome, ctx.currency)}**, ideal monthly allocation looks like:
   - 🏠 **Needs (50%):** ${formatCurrency(ctx.totalIncome * 0.5, ctx.currency)} *(Rent, Utilities, Basic Food)*
   - ☕ **Wants (30%):** ${formatCurrency(ctx.totalIncome * 0.3, ctx.currency)} *(Dining out, Subscriptions, Entertainment)*
   - 💰 **Savings & Investments (20%):** ${formatCurrency(ctx.totalIncome * 0.2, ctx.currency)} *(Goal target)*

3. **Log Micro-Expenses Daily:**
   Small unseen expenses like snacks, rides, and impulsive transfers drain up to 25% of cash flow. Keep asking me to log them as they happen!`;

    return { text };
  }

  // -------------------------------------------------------------
  // 6. INTENT: MONTH-END PREDICTION / FORECAST
  // -------------------------------------------------------------
  if (/(?:predict|forecast|month end|burn rate|will i run out|run out of money)/i.test(lower)) {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = totalDaysInMonth - dayOfMonth;

    const dailyBurnRate = dayOfMonth > 0 ? ctx.totalExpenses / dayOfMonth : 0;
    const projectedTotalExpenses = dailyBurnRate * totalDaysInMonth;
    const projectedSurplus = ctx.totalIncome - projectedTotalExpenses;

    const text = `### 🔮 End-of-Month Financial Forecast

- **Current Day:** Day ${dayOfMonth} of ${totalDaysInMonth} (${daysRemaining} days remaining)
- **Current Daily Burn Rate:** ${formatCurrency(dailyBurnRate, ctx.currency)} / day
- **Projected Total Expenses by Month-End:** ${formatCurrency(projectedTotalExpenses, ctx.currency)}
- **Projected Net Month-End Balance:** ${formatCurrency(projectedSurplus, ctx.currency)}

${
  projectedSurplus >= 0
    ? `✅ **Positive Trajectory:** You are on track to end this month with a net surplus of **${formatCurrency(projectedSurplus, ctx.currency)}** if you maintain your current daily burn rate.`
    : `🚨 **Deficit Warning:** At your current spending rate of **${formatCurrency(dailyBurnRate, ctx.currency)}/day**, you will exceed your earnings by **${formatCurrency(Math.abs(projectedSurplus), ctx.currency)}** before the month finishes. Try capping daily discretionary spends to ${formatCurrency(daysRemaining > 0 ? (ctx.totalBalance / daysRemaining) : 0, ctx.currency)}/day.`
}`;

    return { text };
  }

  // -------------------------------------------------------------
  // 7. INTENT: FINANCIAL EDUCATION (50/30/20, Emergency Fund, etc.)
  // -------------------------------------------------------------
  if (/(?:50\/30\/20|rule of 72|emergency fund|compound interest)/i.test(lower)) {
    if (lower.includes('emergency fund')) {
      const threeMonthsNeeds = (ctx.totalExpenses > 0 ? ctx.totalExpenses : 100000) * 3;
      return {
        text: `### 🛡️ Building an Emergency Fund

An Emergency Fund is your financial safety net for unexpected occurrences (medical emergencies, car repairs, sudden job transition).

- **Rule of Thumb:** Aim to store **3 to 6 months of essential living expenses**.
- **Your Target:** Based on your current spending rate, a 3-month safety buffer for you is roughly **${formatCurrency(threeMonthsNeeds, ctx.currency)}**.
- **Where to keep it:** In a secure, high-yield liquid account or separate bank savings bucket that you don't touch for daily shopping.`,
      };
    }

    return {
      text: `### 📚 The 50/30/20 Budgeting Rule

This is the world's most popular personal finance framework:

- **50% Needs:** Essential bills you cannot avoid (Rent, Groceries, Electricity, Healthcare).
- **30% Wants:** Lifestyle expenses that make life fun (Dining out, Entertainment, Hobbies).
- **20% Savings & Debt Repayment:** Emergency fund, retirement, and investments.

Spendly helps you automate this by tagging every expense so you can monitor your ratios in real time!`,
    };
  }

  // -------------------------------------------------------------
  // 8. GREETINGS & GENERAL CONVERSATION
  // -------------------------------------------------------------
  if (/(?:hello|hi|hey|good morning|good afternoon|good evening|who are you|what can you do|help)/i.test(lower)) {
    return {
      text: `👋 **Hi ${ctx.userName}! I'm your Spendly AI Financial Copilot.**

I have real-time access to your actual Spendly records to help you master your money. Here is what I can do for you:

1. **⚡ Fast Natural Language Logging:**
   *Say "Spent ₦4,500 on lunch"* or *"Received $500 freelance payment"* and I'll create a 1-click transaction card!

2. **📊 Deep Financial Audits:**
   *Ask "Where is all my money going?"* or *"Analyze my spending"* for instant breakdown of your numbers.

3. **🎯 Budget & Pace Checks:**
   *Ask "Am I over budget?"* or *"Set a budget of ₦50,000 for Food"*.

4. **🔮 Month-End Forecasts:**
   *Ask "Predict my balance"* to calculate your burn rate.

What would you like to check today?`,
    };
  }

  // -------------------------------------------------------------
  // 9. DEFAULT INTELLIGENT FALLBACK
  // -------------------------------------------------------------
  return {
    text: `I'm analyzing your request: *"${query}"*.

Here is a quick snapshot of your finances:
- **Available Balance:** ${formatCurrency(ctx.totalBalance, ctx.currency)}
- **Savings Rate:** ${ctx.savingsRate.toFixed(1)}%
- **Transactions Recorded:** ${ctx.transactions.length}

You can ask me to log an expense (e.g. *"Spent ₦5,000 on groceries"*), analyze your categories (*"Where am I spending most?"*), or audit your monthly budget!`,
  };
}

/**
 * Handles communication with Google Gemini API when the user enables it with their API Key.
 */
export async function queryGeminiApi(
  query: string,
  ctx: FinancialContext,
  apiKey: string,
  model: string = 'gemini-1.5-flash'
): Promise<AiResponse> {
  const systemInstruction = `You are "Spendly AI", an intelligent, empathetic, and sharp personal financial advisor embedded inside the Spendly personal finance application.
The user is ${ctx.userName}. Their active currency is ${ctx.currency}.

LIVE FINANCIAL CONTEXT:
- Net Balance: ${ctx.totalBalance}
- Total Income: ${ctx.totalIncome}
- Total Expenses: ${ctx.totalExpenses}
- Net Savings: ${ctx.savings} (${ctx.savingsRate.toFixed(1)}% savings rate)
- Category Expenses: ${JSON.stringify(ctx.categoryExpenses)}
- Active Budgets: ${JSON.stringify(ctx.budgets)}
- Recent Transactions Count: ${ctx.transactions.length}

RULES:
1. Speak in friendly, clear, concise Markdown. Do not use overly complicated accounting jargon.
2. If the user mentions logging an expense or income (e.g. "I spent 4000 on fuel", "Got 50000 salary"), detect the amount, type ('income' or 'expense'), category (Food, Transport, Bills, Shopping, Entertainment, Health, Education, Rent, Salary, Freelance, Gift, Other), and title.
At the very end of your response, output a single JSON block on its own line:
ACTION_JSON:{"action":"create_transaction","type":"expense","amount":4000,"category":"Transport","title":"Fuel"}

3. If the user asks about their finances, use their actual data provided above.
4. Keep answers encouraging and actionable.`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${query}` }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1000,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Gemini API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Check if ACTION_JSON was produced
    const actionMatch = rawText.match(/ACTION_JSON:(\{.*?\})/);
    let actionCard: ActionCard | undefined;
    let cleanText = rawText;

    if (actionMatch) {
      cleanText = rawText.replace(/ACTION_JSON:\{.*?\}/, '').trim();
      try {
        const parsed = JSON.parse(actionMatch[1]);
        if (parsed.action === 'create_transaction') {
          actionCard = {
            type: 'create_transaction',
            payload: {
              type: parsed.type || 'expense',
              amount: Number(parsed.amount) || 0,
              category: parsed.category || 'Other',
              title: parsed.title || 'Transaction',
              date: new Date().toISOString().split('T')[0],
              description: `Logged via Gemini AI: "${query}"`,
            },
            status: 'pending',
          };
        }
      } catch (err) {
        console.warn('Failed to parse Gemini ACTION_JSON:', err);
      }
    }

    return {
      text: cleanText,
      actionCard,
    };
  } catch (error: any) {
    console.warn('Gemini API call failed, falling back to local engine:', error);
    // Graceful fallback to local engine
    const fallback = generateLocalAiResponse(query, ctx);
    fallback.text = `*(Note: Gemini connection unavailable, answered by Spendly Local Engine)*\n\n` + fallback.text;
    return fallback;
  }
}
