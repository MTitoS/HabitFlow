import { renderWithProviders } from '@/components/ui/renderUtils';
import { MonthView } from '@/components/feature/dashboard/MonthView';
import { DayPoint } from '@/domain/stats/aggregate';
import { MonthDayState } from '@/domain/streak/overallStreak';

function monthSeries(): DayPoint[] {
  return Array.from({ length: 31 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return {
      dateKey: `2026-05-${day}`,
      scheduled: 1,
      completed: i < 2 ? 1 : 0,
      percent: i < 2 ? 1 : 0,
      monthDay: i + 1,
      weekday: `2026-05-${day}`,
    };
  });
}

const STATUSES: { dateKey: string; state: MonthDayState }[] = [
  { dateKey: '2026-05-01', state: 'conquered' },
  { dateKey: '2026-05-02', state: 'conquered' },
  { dateKey: '2026-05-03', state: 'partial' },
  { dateKey: '2026-05-04', state: 'neutral' },
];

describe('MonthView', () => {
  it('renders the overall streak headline', async () => {
    const { getByText, getByLabelText } = await renderWithProviders(
      <MonthView series={monthSeries()} statuses={STATUSES} streakCurrent={7} />,
    );
    expect(getByText('7')).toBeTruthy();
    expect(getByText('dias vencidos seguidos')).toBeTruthy();
    getByLabelText(/Sequência geral: 7 dias vencidos/);
  });

  it('renders the three-state legend', async () => {
    const { getByText } = await renderWithProviders(
      <MonthView series={monthSeries()} statuses={STATUSES} streakCurrent={0} />,
    );
    expect(getByText('Vencido')).toBeTruthy();
    expect(getByText('Parcial')).toBeTruthy();
    expect(getByText('Neutro')).toBeTruthy();
  });

  it('renders the month summary with conquered days and rate', async () => {
    const { getByText } = await renderWithProviders(
      <MonthView series={monthSeries()} statuses={STATUSES} streakCurrent={0} />,
    );
    expect(getByText('2 dias vencidos')).toBeTruthy();
    expect(getByText('6% no mês')).toBeTruthy();
  });

  it('labels each day cell with its state', async () => {
    const { getByLabelText } = await renderWithProviders(
      <MonthView series={monthSeries()} statuses={STATUSES} streakCurrent={0} />,
    );
    getByLabelText('2026-05-01: Vencido');
    getByLabelText('2026-05-03: Parcial');
  });
});
