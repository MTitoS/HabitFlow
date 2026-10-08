export const OPEN = {
  SKIP_GRANT_POLICY: 'calendar-week' as 'calendar-week' | 'rolling-7d',
  WEEK_STARTS: 1,
  SKIP_GRANT_AMOUNT: 1,
  SKIP_MAX_BALANCE: 3,
  SKIP_CREDIT_SINGLETON_ID: 'skip_credit',

  COMPLETION_RATE_SKIP: 'neutral' as 'neutral' | 'counts-as-completed',

  ADD_HABIT_FAB_MOBILE: true,
  ADD_HABIT_HEADER_DESKTOP: true,

  LATE_NOTIFICATION: false,

  TOAST_POSITION: 'top' as 'top' | 'bottom',

  MATERIALIZE_MISSED: 'derived' as 'derived' | 'persisted',

  FREQ_WEEK_STARTS: 1,
};

// janela de produto "48h" = dia-calendário {today-1, today-2}
export const RETROACTIVE_WINDOW_DAYS = 2;

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Todos os dias',
  weekdays: 'Dias da semana',
  x_per_week: 'X vezes por semana',
  x_per_month: 'X vezes por mês',
};