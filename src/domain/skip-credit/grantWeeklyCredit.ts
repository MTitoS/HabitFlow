import { weekKey } from '@/domain/date/dateUtils';
import { SKIP_CREDIT_CONFIG } from '@/domain/skip-credit/config';

export interface SkipCredit {
  id: string;
  balance: number;
  lastGrantRef: string;
  updatedAt: number;
}

export function createSkipCredit(id: string, now: Date): SkipCredit {
  return {
    id,
    balance: 0,
    lastGrantRef: '',
    updatedAt: now.getTime(),
  };
}

export function grantWeeklyCredit(state: SkipCredit, now: Date): SkipCredit {
  const ref = weekKey(now, SKIP_CREDIT_CONFIG.weekStarts);
  if (state.lastGrantRef === ref) return state;
  return {
    ...state,
    balance: clamp(state.balance + SKIP_CREDIT_CONFIG.grantAmount),
    lastGrantRef: ref,
    updatedAt: now.getTime(),
  };
}

export function weekRef(now: Date): string {
  return weekKey(now, SKIP_CREDIT_CONFIG.weekStarts);
}

export function clampBalance(value: number): number {
  return clamp(value);
}

function clamp(value: number): number {
  const max = SKIP_CREDIT_CONFIG.maxBalance;
  if (value <= 0) return 0;
  return value >= max ? max : value;
}