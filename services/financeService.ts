

import { Currency, ExchangeRates, Language, Frequency, Debt, Account, InterestFrequency } from '../types';
import { CATEGORY_KEYWORDS, REGION_CURRENCY_MAP } from '../constants';

// Fallback Rates (Approximate)
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  COP: 3900,
  MXN: 17.5,
  BRL: 5.0,
  ARS: 850,
  CLP: 950,
  PEN: 3.7,
  JPY: 150,
  CNY: 7.2,
  INR: 83,
  KRW: 1330,
  CAD: 1.35,
  AUD: 1.52,
  CHF: 0.88
};

// --- AUTO DETECT CURRENCY ---
export const detectDefaultCurrency = (): Currency => {
    if (typeof navigator === 'undefined') return 'USD';
    
    // Try to get region from locale (e.g. 'es-CO' -> 'CO')
    const region = navigator.language.split('-')[1];
    if (region && REGION_CURRENCY_MAP[region]) {
        return REGION_CURRENCY_MAP[region];
    }
    
    // Fallback based on language only (less accurate but helpful)
    const lang = navigator.language.split('-')[0];
    if (lang === 'ja') return 'JPY';
    if (lang === 'de' || lang === 'it') return 'EUR';
    if (lang === 'hi') return 'INR';
    if (lang === 'zh') return 'CNY';

    return 'USD';
};

// --- API: FETCH REAL RATES ---
export const fetchExchangeRates = async (base: Currency = 'USD'): Promise<ExchangeRates> => {
    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);
        const data = await response.json();
        if (data && data.rates) {
            return data.rates;
        }
        return FALLBACK_RATES;
    } catch (error) {
        console.warn('Failed to fetch rates, using fallback', error);
        return FALLBACK_RATES;
    }
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
        const sanitized = expression.replace(/,/g, '.').replace(/[^0-9+\-.]/g, '');
        if (!sanitized) return 0;
        if (/[+\-.]$/.test(sanitized)) return parseFloat(sanitized) || 0;
        // eslint-disable-next-line no-new-func
        const result = new Function('return ' + sanitized)();
        return isFinite(result) ? result : 0;
    } catch (e) {
        return parseFloat(expression) || 0;
    }
};

// --- VOICE PARSING ---
export const parseVoiceInput = (transcript: string): { amount?: string, title?: string, category?: string } => {
    const amountMatch = transcript.match(/(\d+([.,]\d{1,2})?)/);
    let amount = undefined;
    if (amountMatch) {
        amount = amountMatch[0].replace(',', '.');
    }

    const lowerTranscript = transcript.toLowerCase();
    let category = undefined;
    for (const [catKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => lowerTranscript.includes(k))) {
            category = catKey;
            break;
        }
    }

    let title = transcript;
    if (amountMatch) {
         title = title.replace(amountMatch[0], '');
    }
    title = title.replace(/\b(gasto|de|en|spent|on|in|para|for|un|una|a)\b/gi, ' ').trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);

    if (title.length < 2 && category) {
        title = ""; 
    }

    return { amount, title, category };
};

export const getCurrencySymbol = (currency: Currency): string => {
  switch (currency) {
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'BRL': return 'R$';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'INR': return '₹';
    case 'KRW': return '₩';
    case 'CHF': return 'Fr';
    case 'ARS': return '$'; // Ambiguous signs use $ generally
    case 'COP': return '$';
    case 'MXN': return '$';
    case 'CLP': return '$';
    case 'USD': return '$';
    case 'CAD': return '$';
    case 'AUD': return '$';
    case 'PEN': return 'S/';
    default: return '$';
  }
};

export const convertCurrency = (amount: number, from: Currency, to: Currency, rates: ExchangeRates = FALLBACK_RATES): number => {
  if (from === to) return amount;
  const rateFrom = rates[from] || 1;
  const rateTo = rates[to] || 1;
  if (rateFrom === 0) return amount;
  const inBase = amount / rateFrom;
  return inBase * rateTo;
};

export const formatCurrency = (amount: number, currency: Currency, language: Language): string => {
  // Use Intl with specific locales to ensure correct formatting
  let locale: string = language;
  // Adjust locale for specific currencies to match regional expectations if needed
  if (currency === 'COP') locale = 'es-CO';
  else if (currency === 'EUR' && language === 'de') locale = 'de-DE';
  else if (currency === 'JPY') locale = 'ja-JP';
  
  return new Intl.NumberFormat(locale, {
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

export const fitText = (text: string, baseSizeClass: string = 'text-5xl'): string => {
    if (!text) return baseSizeClass;
    const len = text.length;
    if (len > 20) return 'text-xl'; 
    if (len > 15) return 'text-2xl';
    if (len > 12) return 'text-3xl';
    if (len > 9) return 'text-4xl';
    if (len <= 6) return 'text-6xl'; // Massive for small numbers
    return baseSizeClass;
};

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

export const dateFromInput = (dateString: string): string => {
    if (!dateString) return new Date().toISOString();
    const [year, month, day] = dateString.split('-').map(Number);
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
      return timeStr; // Just time for today
  }

  if (diffDays === 1) {
      const timeStr = date.toLocaleTimeString(language, timeOptions);
      const yestStr = language === 'es' ? 'Ayer' : (language === 'fr' ? 'Hier' : (language === 'pt' ? 'Ontem' : (language === 'de' ? 'Gestern' : (language === 'it' ? 'Ieri' : 'Yesterday'))));
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
    
    // Fallback map, but Intl usually handles logic better if implemented fully. Keeping map for specific phrasing.
    const map: any = {
        es: { daily: 'Todos los días', weekly: 'Todos los', monthly: 'Todos los días', yearly: 'Cada' },
        en: { daily: 'Every day', weekly: 'Every', monthly: 'Every', yearly: 'Every' },
        fr: { daily: 'Tous les jours', weekly: 'Tous les', monthly: 'Le', yearly: 'Chaque' },
        pt: { daily: 'Todos os dias', weekly: 'Toda', monthly: 'Todo dia', yearly: 'Todo' },
        de: { daily: 'Täglich', weekly: 'Jeden', monthly: 'Am', yearly: 'Jedes Jahr' },
        it: { daily: 'Ogni giorno', weekly: 'Ogni', monthly: 'Il', yearly: 'Ogni' },
        ja: { daily: '毎日', weekly: '毎週', monthly: '毎月', yearly: '毎年' }
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
