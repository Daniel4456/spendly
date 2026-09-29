import { CurrencyCode, CurrencyInfo } from '../types';

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rateToNgn: 1 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToNgn: 1550 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToNgn: 1680 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToNgn: 1980 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToNgn: 1140 },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rateToNgn: 1010 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToNgn: 10.4 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rateToNgn: 12 },
  GHS: { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', rateToNgn: 102 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', rateToNgn: 86 },
};

/**
 * Formats a monetary amount into a clean, localized currency string.
 * Example: formatCurrency(245850, 'NGN') => "₦245,850.00"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currencyCode: CurrencyCode = 'NGN',
  options?: { hideDecimals?: boolean; compact?: boolean }
): string {
  const safeAmount = Number.isFinite(amount) ? (amount as number) : 0;
  const currency = CURRENCIES[currencyCode] || CURRENCIES.NGN;

  if (options?.compact && Math.abs(safeAmount) >= 1_000_000) {
    return `${currency.symbol}${(safeAmount / 1_000_000).toFixed(1)}M`;
  }
  if (options?.compact && Math.abs(safeAmount) >= 1_000) {
    return `${currency.symbol}${(safeAmount / 1_000).toFixed(1)}K`;
  }

  const fractionDigits = options?.hideDecimals ? 0 : 2;

  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Math.abs(safeAmount));

  const sign = safeAmount < 0 ? '-' : '';
  // Attach symbol with appropriate spacing if longer than 1 character
  const symbolSpacing = currency.symbol.length > 1 ? ' ' : '';
  return `${sign}${currency.symbol}${symbolSpacing}${formattedNumber}`;
}

/**
 * Returns dynamic greeting based on current local hour.
 * Good morning / Good afternoon / Good evening
 */
export function getGreeting(name?: string): { greeting: string; subtext: string } {
  const hour = new Date().getHours();
  let timeGreeting = 'Good morning';

  if (hour >= 12 && hour < 17) {
    timeGreeting = 'Good afternoon';
  } else if (hour >= 17 || hour < 4) {
    timeGreeting = 'Good evening';
  }

  const cleanName = name?.trim() ? name.trim().split(' ')[0] : 'there';
  return {
    greeting: `${timeGreeting}, ${cleanName}`,
    subtext: "Here's your financial overview.",
  };
}

/**
 * Formats a percentage with sign.
 * Example: formatPercentage(12.5) => "+12.5%"
 */
export function formatPercentage(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return '0.0%';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}
