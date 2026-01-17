import { Currency, ExchangeRates, Language } from '../types';

// Mock Exchange Rates (Base USD)
const RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  COP: 3900,
  MXN: 17.5,
  GBP: 0.79,
};

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'USD': return '$';
    case 'COP': return '$';
    case 'MXN': return '$';
    default: return '$';
  }
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  const inUSD = amount / RATES[from];
  return inUSD * RATES[to];
};

export const formatCurrency = (amount: number, currency: Currency, language: Language): string => {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string, language: Language): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return date.toLocaleDateString(language, { weekday: 'long' });
  }
  return date.toLocaleDateString(language, { day: 'numeric', month: 'short' });
};

export const getGreetingKey = (): 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting_morning';
  if (hour < 18) return 'greeting_afternoon';
  return 'greeting_evening';
};
