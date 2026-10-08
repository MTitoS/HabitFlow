import { renderWithProviders } from '@/components/ui/renderUtils';
import { TodayProgress } from '@/components/feature/TodayProgress';
import { StreakCard } from '@/components/feature/dashboard/StreakCard';
import { WeeklyChart } from '@/components/feature/dashboard/WeeklyChart';
import { CompletionChart } from '@/components/feature/dashboard/CompletionChart';
import { weeklySeries, DayPoint } from '@/domain/stats/aggregate';
import { Habit } from '@/domain/habit/model';

function week(): DayPoint[] {
  const keys = ['2026-05-04', '2026-05-05', '2026-05-06', '2026-05-07', '2026-05-08', '2026-05-09', '2026-05-10'];
  return keys.map((dateKey, i) => ({
    dateKey,
    scheduled: i < 5 ? 2 : 0,
    completed: i < 5 ? 1 : 0,
    percent: i < 5 ? 0.5 : 0,
    done: i < 5 ? 1 : 0,
    skipped: 0,
    undone: i < 5 ? 1 : 0,
    monthDay: Number(dateKey.slice(8)),
    weekday: dateKey,
  }));
}

function mixed(): DayPoint[] {
  return [
    { dateKey: '2026-05-04', scheduled: 4, completed: 4, percent: 1, done: 4, skipped: 0, undone: 0, monthDay: 4, weekday: '2026-05-04' },
    { dateKey: '2026-05-05', scheduled: 2, completed: 3, percent: 1.5, done: 2, skipped: 0, undone: 0, monthDay: 5, weekday: '2026-05-05' },
    { dateKey: '2026-05-06', scheduled: 0, completed: 0, percent: 0, done: 0, skipped: 0, undone: 0, monthDay: 6, weekday: '2026-05-06' },
  ];
}

function dailyHabit(id: string): Habit {
  return {
    id,
    name: id,
    icon: 'circle',
    color: 'primary',
    type: 'binary',
    frequency: { kind: 'daily', schedule: {} },
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('dashboard', () => {
  it('TodayProgress shows X/Y and percent label', async () => {
    const { getByText } = await renderWithProviders(
      <TodayProgress completed={6} total={8} percent={0.75} />,
    );
    expect(getByText('6/8')).toBeTruthy();
    expect(getByText('75% concluído hoje')).toBeTruthy();
  });

  it('StreakCard shows current and best numbers', async () => {
    const { getByText } = await renderWithProviders(<StreakCard current={4} best={9} />);
    expect(getByText('4')).toBeTruthy();
    expect(getByText('9')).toBeTruthy();
  });

  it('WeeklyChart renders segmented bars with composed labels and legend', async () => {
    const { getByLabelText, getByText } = await renderWithProviders(<WeeklyChart series={week()} />);
    expect(getByLabelText('Seg: 1 concluídos, 0 skipados, 1 não concluídos (50%)')).toBeTruthy();
    expect(getByLabelText('Dom: 0 concluídos, 0 skipados, 0 não concluídos (0%)')).toBeTruthy();
    expect(getByText('Concluído')).toBeTruthy();
    expect(getByText('Skipado')).toBeTruthy();
    expect(getByText('Não concluído')).toBeTruthy();
  });

  it('CompletionChart renders composed labels on the same status tokens + legend', async () => {
    const { getByLabelText, getByText } = await renderWithProviders(<CompletionChart series={week()} />);
    expect(getByLabelText('Dia 4: 1 concluídos, 0 skipados, 1 não concluídos (50%)')).toBeTruthy();
    expect(getByText('Concluído')).toBeTruthy();
    expect(getByText('Skipado')).toBeTruthy();
    expect(getByText('Não concluído')).toBeTruthy();
  });

  it('FIX-c4: WeeklyChart bar fills by own composition (100% = full done, not maxScheduled)', async () => {
    const { getByLabelText, getByTestId, queryByTestId } = await renderWithProviders(
      <WeeklyChart series={mixed()} />,
    );
    expect(getByLabelText('Ter: 2 concluídos, 0 skipados, 0 não concluídos (100%)')).toBeTruthy();
    expect(getByTestId('wk-seg-2026-05-05-chartDone')).toHaveStyle({ height: '100%' });
    expect(queryByTestId('wk-seg-2026-05-06-chartDone')).toBeNull();
  });

  it('FIX-c4: CompletionChart bar fills by own composition', async () => {
    const { getByTestId } = await renderWithProviders(<CompletionChart series={mixed()} />);
    expect(getByTestId('mo-seg-2026-05-05-chartDone')).toHaveStyle({ height: '100%' });
  });

  it('FIX-c4: WeeklyChart renders future days neutral and past missing as undone', async () => {
    const now = new Date(2026, 4, 6, 9, 0, 0);
    const series = weeklySeries([dailyHabit('a')], [], now);
    const { queryByTestId } = await renderWithProviders(<WeeklyChart series={series} />);
    expect(queryByTestId('wk-seg-2026-05-07-chartUndone')).toBeNull();
    expect(queryByTestId('wk-seg-2026-05-04-chartUndone')).not.toBeNull();
  });
});