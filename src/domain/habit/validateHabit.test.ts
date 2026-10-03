import { validateHabit } from '@/domain/habit/validateHabit';

const base = {
  name: 'Ler',
  type: 'binary' as const,
  frequency: { kind: 'daily' as const, schedule: {} },
};

const quant = {
  name: 'Beber água',
  type: 'quantitative' as const,
  frequency: { kind: 'daily' as const, schedule: {} },
};

describe('validateHabit', () => {
  it('accepts a valid binary habit', () => {
    const result = validateHabit(base);
    expect(result.ok).toBe(true);
  });

  it('rejects empty name', () => {
    const result = validateHabit({ ...base, name: '   ' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain('name_required');
  });

  it('rejects quantitative without target', () => {
    const result = validateHabit(quant);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain('quant_requires_target');
  });

  it('rejects quantitative without unit', () => {
    const result = validateHabit({ ...quant, targetValue: 8 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain('quant_requires_unit');
  });

  it('accepts quantitative with predefined unit', () => {
    const result = validateHabit({ ...quant, targetValue: 8, unit: 'litros' });
    expect(result.ok).toBe(true);
  });

  it('accepts quantitative with custom unit', () => {
    const result = validateHabit({ ...quant, targetValue: 3, customUnit: 'copos' });
    expect(result.ok).toBe(true);
  });

  it('requires countPerPeriod for x_per_week', () => {
    const result = validateHabit({
      ...base,
      frequency: { kind: 'x_per_week', schedule: {} },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors).toContain('count_required');
  });

  it('accepts x_per_week with count', () => {
    const result = validateHabit({
      ...base,
      frequency: { kind: 'x_per_week', schedule: { countPerPeriod: 3 } },
    });
    expect(result.ok).toBe(true);
  });

  it('rejects weekdays without days', () => {
    const result = validateHabit({
      ...base,
      frequency: { kind: 'weekdays', schedule: { days: [] } },
    });
    expect(result.ok).toBe(false);
  });
});