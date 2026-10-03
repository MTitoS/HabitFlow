import { toDateKey } from '@/domain/date/dateUtils';
import { SkipCredit, clampBalance } from '@/domain/skip-credit/grantWeeklyCredit';
import { skipped as makeSkippedRecord } from '@/domain/record/transitions';
import { HabitRecord } from '@/domain/record/model';

export type SkipResult =
  | { ok: true; state: SkipCredit; record: HabitRecord }
  | { ok: false; reason: 'no_credit' | 'not_today' };

export function useSkip(state: SkipCredit, now: Date, habitId: string, dateKey?: string): SkipResult {
  const targetDate = dateKey ?? toDateKey(now);

  if (toDateKey(now) !== targetDate) {
    return { ok: false, reason: 'not_today' };
  }

  if (state.balance <= 0) {
    return { ok: false, reason: 'no_credit' };
  }

  const nextState: SkipCredit = {
    ...state,
    balance: clampBalance(state.balance - 1),
    updatedAt: now.getTime(),
  };

  return { ok: true, state: nextState, record: makeSkippedRecord(habitId, targetDate, now) };
}