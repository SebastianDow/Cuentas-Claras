import { Currency, ExchangeRates, Language, Frequency, Debt, Account, InterestFrequency } from '../types';

// Mock Exchange Rates (Base USD)
const RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  COP: 3900,
  MXN: 17.5,
  GBP: 0.79,
};

// --- HAPTIC FEEDBACK ---
export const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

// --- MATH HELPER ---
export const evaluateMathExpression = (expression: string): number => {
    try {
        // Sanitize: allow only numbers, +, -, ., and spaces
        const sanitized = expression.replace(/[^0-9+\-.]/g, '');
        if (!sanitized) return 0;
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + sanitized)();
        return isFinite(result) ? result : 0;
    } catch (e) {
        return 0;
    }
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

export const formatNumber = (amount: number, language: Language): string => {
    return new Intl.NumberFormat(language, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Helper for dynamic font sizing based on string length
export const fitText = (text: string, baseSizeClass: string = 'text-4xl'): string => {
    if (!text) return baseSizeClass;
    const len = text.length;
    if (len > 20) return 'text-lg'; // Very long
    if (len > 15) return 'text-xl';
    if (len > 12) return 'text-2xl';
    if (len > 10) return 'text-3xl';
    return baseSizeClass;
};

// --- INTEREST LOGIC CORE ---

const calculateCompoundInterest = (principal: number, rate: number, frequency: InterestFrequency, startDateStr: string): number => {
    if (!startDateStr || rate === 0) return principal;
    
    const startDate = new Date(startDateStr);
    const now = new Date();
    startDate.setHours(0,0,0,0);
    now.setHours(0,0,0,0);

    const diffTime = now.getTime() - startDate.getTime();
    if (diffTime < 0) return principal;

    const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let periods = 0;
    
    switch (frequency) {
        case 'daily': periods = daysElapsed; break;
        case 'weekly': periods = daysElapsed / 7; break;
        case 'monthly': periods = daysElapsed / 30.44; break;
        case 'yearly': periods = daysElapsed / 365.25; break;
        default: periods = daysElapsed / 30.44;
    }

    const rateDecimal = rate / 100;
    const total = principal * Math.pow((1 + rateDecimal), periods);
    
    return total;
};

// --- ENTITY CALCULATIONS ---

export const calculateDebtDetails = (debt: Debt): { principal: number; interest: number; total: number } => {
    if (!debt.enableInterest || !debt.interestRate || !debt.startDate) {
        return { principal: debt.amount, interest: 0, total: debt.amount };
    }

    const total = calculateCompoundInterest(
        debt.amount, 
        debt.interestRate, 
        debt.interestFrequency || 'monthly', 
        debt.startDate
    );

    return {
        principal: debt.amount,
        interest: total - debt.amount,
        total: total
    };
};

export const calculateAccountDetails = (account: Account): { principal: number; interest: number; total: number } => {
    if (!account.enableInterest || !account.interestRate || !account.startDate || account.type === 'cash') {
        return { principal: account.balance, interest: 0, total: account.balance };
    }

    const total = calculateCompoundInterest(
        account.balance, 
        account.interestRate, 
        account.interestFrequency || 'monthly', 
        account.startDate
    );

    return {
        principal: account.balance,
        interest: total - account.balance,
        total: total
    };
};

// --- DATE LOGIC ---

export const toLocalISOString = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000; 
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
  return localISOTime;
};

export const toLocalDateString = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 10);
  return localISOTime;
};

// Robust helper to create a date from YYYY-MM-DD input without shifting timezone
export const dateFromInput = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();
    const [year, month, day] = dateString.split('-').map(Number);
    // Create date at noon (12:00) local time to be safe against DST/Timezone shifts
    const date = new Date(year, month - 1, day, 12, 0, 0); 
    return date.toISOString();
};

export const formatSmartDate = (dateString: string, language: Language): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const compareDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffTime = today.getTime() - compareDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' };

  if (diffDays === 0) {
      const timeStr = date.toLocaleTimeString(language, timeOptions);
      const todayStr = language === 'es' ? 'Hoy' : (language === 'fr' ? 'Aujourd\'hui' : (language === 'pt' ? 'Hoje' : 'Today'));
      return `${todayStr}, ${timeStr}`;
  }

  if (diffDays === 1) {
      const timeStr = date.toLocaleTimeString(language, timeOptions);
      const yestStr = language === 'es' ? 'Ayer' : (language === 'fr' ? 'Hier' : (language === 'pt' ? 'Ontem' : 'Yesterday'));
      return `${yestStr}, ${timeStr}`;
  }

  if (diffDays > 1 && diffDays < 7) {
      const day = date.toLocaleDateString(language, { weekday: 'short' });
      return day.charAt(0).toUpperCase() + day.slice(1);
  }

  if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString(language, { day: 'numeric', month: 'short' });
  }

  return date.toLocaleDateString(language, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getRecurringFrequencyLabel = (frequency: Frequency, dateString: string, language: Language): string => {
    const date = new Date(dateString);
    const timeStr = date.toLocaleTimeString(language, { hour: 'numeric', minute: '2-digit' });
    
    const map = {
        es: { daily: 'Todos los días', weekly: 'Todos los', monthly: 'Todos los días', yearly: 'Cada' },
        en: { daily: 'Every day', weekly: 'Every', monthly: 'Every', yearly: 'Every' },
        fr: { daily: 'Tous les jours', weekly: 'Tous les', monthly: 'Le', yearly: 'Chaque' },
        pt: { daily: 'Todos os dias', weekly: 'Toda', monthly: 'Todo dia', yearly: 'Todo' }
    };
    
    const l = map[language] || map.en;

    switch (frequency) {
        case 'daily':
            return `${l.daily} (${timeStr})`;
        case 'weekly':
            const weekday = date.toLocaleDateString(language, { weekday: 'long' });
            return `${l.weekly} ${weekday}`;
        case 'monthly':
             return `${l.monthly} ${date.getDate()}`;
        case 'yearly':
            const monthDay = date.toLocaleDateString(language, { month: 'long', day: 'numeric' });
            return `${l.yearly} ${monthDay}`;
        default:
            return frequency;
    }
};

export const getGreetingKey = (): 'greeting_morning' | 'greeting_afternoon' | 'greeting_evening' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'greeting_morning';
  if (hour < 18) return 'greeting_afternoon';
  return 'greeting_evening';
};

export const calculateNextDate = (currentDate: string, frequency: Frequency): string => {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
  return date.toISOString();
};
