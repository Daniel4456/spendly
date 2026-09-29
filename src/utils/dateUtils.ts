import { TimeRangeFilter, Transaction } from '../types';

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterTransactionsByRange(
  transactions: Transaction[],
  range: TimeRangeFilter
): Transaction[] {
  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case '7d':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      cutoffDate.setDate(now.getDate() - 30);
      break;
    case '3m':
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case '1y':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      cutoffDate.setDate(now.getDate() - 30);
  }

  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  return transactions.filter((t) => t.date >= cutoffStr);
}

/**
 * Builds aggregated points for Recharts based on selected time range.
 */
export function buildSpendingChartData(
  transactions: Transaction[],
  range: TimeRangeFilter
): Array<{ date: string; displayDate: string; spending: number; income: number }> {
  const pointsMap = new Map<string, { date: string; displayDate: string; spending: number; income: number }>();
  const now = new Date();

  let days = 30;
  if (range === '7d') days = 7;
  else if (range === '30d') days = 30;
  else if (range === '3m') days = 90;
  else if (range === '1y') days = 365;

  // For 7d and 30d, group by each day.
  // For 3m, group by every 3-5 days or week.
  // For 1y, group by month.
  if (range === '7d' || range === '30d') {
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const displayDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(d);

      pointsMap.set(iso, {
        date: iso,
        displayDate,
        spending: 0,
        income: 0,
      });
    }
  } else if (range === '3m') {
    // Generate ~12 weekly buckets
    for (let i = 12; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * 7);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const displayDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
      }).format(d);

      pointsMap.set(iso, {
        date: iso,
        displayDate,
        spending: 0,
        income: 0,
      });
    }
  } else {
    // 1 year: 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
      const displayDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
      }).format(d);

      pointsMap.set(iso, {
        date: iso,
        displayDate,
        spending: 0,
        income: 0,
      });
    }
  }

  // Populate actual user data
  transactions.forEach((tx) => {
    if (range === '7d' || range === '30d') {
      const point = pointsMap.get(tx.date);
      if (point) {
        if (tx.type === 'expense') point.spending += tx.amount;
        if (tx.type === 'income') point.income += tx.amount;
      }
    } else if (range === '1y') {
      // Find matching year-month
      const monthPrefix = tx.date.substring(0, 7) + '-01';
      const point = pointsMap.get(monthPrefix);
      if (point) {
        if (tx.type === 'expense') point.spending += tx.amount;
        if (tx.type === 'income') point.income += tx.amount;
      }
    } else {
      // 3m: assign to closest bucket
      const txTime = new Date(tx.date).getTime();
      let closestKey = '';
      let minDiff = Infinity;
      pointsMap.forEach((_, key) => {
        const diff = Math.abs(txTime - new Date(key).getTime());
        if (diff < minDiff) {
          minDiff = diff;
          closestKey = key;
        }
      });
      if (closestKey && pointsMap.has(closestKey)) {
        const pt = pointsMap.get(closestKey)!;
        if (tx.type === 'expense') pt.spending += tx.amount;
        if (tx.type === 'income') pt.income += tx.amount;
      }
    }
  });

  return Array.from(pointsMap.values());
}
