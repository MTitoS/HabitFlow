import { createSkipCredit, grantWeeklyCredit } from '@/domain/skip-credit/grantWeeklyCredit';
import { undoSkip, useSkip } from '@/domain/skip-credit/useSkip';

const singletonId = 'skip_credit';

describe('skip credit', () => {
  const mon = new Date(2026, 4, 4, 9, 0, 0);
  const nextMon = new Date(2026, 4, 11, 9, 0, 0);

  it('starts at balance 0', () => {
    const state = createSkipCredit(singletonId, mon);
    expect(state.balance).toBe(0);
    expect(state.lastGrantRef).toBe('');
  });

  it('grants 1 per calendar week', () => {
    let state = createSkipCredit(singletonId, mon);
    state = grantWeeklyCredit(state, mon);
    expect(state.balance).toBe(1);
    state = grantWeeklyCredit(state, nextMon);
    expect(state.balance).toBe(2);
    expect(state.lastGrantRef).toBe('2026-05-11');
  });

  it('does not grant twice in the same week', () => {
    let state = createSkipCredit(singletonId, mon);
    state = grantWeeklyCredit(state, mon);
    state = grantWeeklyCredit(state, new Date(2026, 4, 8, 9, 0, 0));
    expect(state.balance).toBe(1);
  });

  it('caps balance at 3', () => {
    let state = createSkipCredit(singletonId, mon);
    for (let i = 0; i < 5; i += 1) {
      state = grantWeeklyCredit(state, new Date(2026, 3, 6 + 7 * i, 9, 0, 0));
    }
    expect(state.balance).toBe(3);
  });

  it('useSkip consumes credit and produces a skipped record', () => {
    let state = createSkipCredit(singletonId, mon);
    state = grantWeeklyCredit(state, mon);
    const result = useSkip(state, mon, 'h1', '2026-05-04');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.balance).toBe(0);
      expect(result.record.status).toBe('skipped');
      expect(result.record.habitId).toBe('h1');
      expect(result.record.date).toBe('2026-05-04');
    }
  });

  it('refuses skip without credit', () => {
    const state = createSkipCredit(singletonId, mon);
    const result = useSkip(state, mon, 'h1', '2026-05-04');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('no_credit');
  });

  it('refuses skip for a past date', () => {
    let state = createSkipCredit(singletonId, mon);
    state = grantWeeklyCredit(state, mon);
    const result = useSkip(state, mon, 'h1', '2026-05-03');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_today');
  });

  it('balance never drops below 0', () => {
    let state = createSkipCredit(singletonId, mon);
    state = grantWeeklyCredit(state, mon);
    const r1 = useSkip(state, mon, 'h1', '2026-05-04');
    expect(r1.ok).toBe(true);
    state = r1.ok ? r1.state : state;
    const r2 = useSkip(state, mon, 'h2', '2026-05-04');
    expect(r2.ok).toBe(false);
  });

  it('T6: undoSkip restores the spent credit and reverts record to pending (today only)', () => {
    let state = createSkipCredit(singletonId, mon);
    state = grantWeeklyCredit(state, mon);
    const skip = useSkip(state, mon, 'h1', '2026-05-04');
    expect(skip.ok).toBe(true);
    if (!skip.ok) return;
    const result = undoSkip(skip.state, mon, 'h1', '2026-05-04');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.state.balance).toBe(1);
      expect(result.record.status).toBe('pending');
      expect(result.record.habitId).toBe('h1');
      expect(result.record.date).toBe('2026-05-04');
    }
  });

  it('T6: undoSkip never exceeds the hard cap of 3', () => {
    let state = createSkipCredit(singletonId, mon);
    for (let i = 0; i < 7; i += 1) {
      state = grantWeeklyCredit(state, new Date(2026, 3, 6 + 7 * i, 9, 0, 0));
    }
    expect(state.balance).toBe(3);
    const result = undoSkip(state, mon, 'h1', '2026-05-04');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state.balance).toBe(3);
  });

  it('T6: undoSkip refuses to act on a past date', () => {
    const state = createSkipCredit(singletonId, mon);
    const result = undoSkip(state, mon, 'h1', '2026-05-03');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('not_today');
  });
});