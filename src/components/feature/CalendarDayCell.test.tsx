import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { CalendarDayCell } from '@/components/feature/CalendarDayCell';
import { CalendarDayInfo } from '@/domain/streak/overallStreak';

const info = (overrides: Partial<CalendarDayInfo> = {}): CalendarDayInfo => ({
  dateKey: '2026-05-08',
  mark: 'pending',
  scheduled: 2,
  done: 0,
  skipped: 0,
  ...overrides,
});

describe('CalendarDayCell', () => {
  it('renders a conquered day with a strong check and semantic label', async () => {
    const { getByText, getByLabelText } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info({ mark: 'conquered', done: 1, skipped: 1 })} isToday={false} onPress={jest.fn()} />,
    );
    expect(getByText('✓')).toBeTruthy();
    getByLabelText('2026-05-08: Vencido (2/2)');
  });

  it('renders a partial day', async () => {
    const { getByText, getByLabelText } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info({ mark: 'partial', done: 1 })} isToday={false} onPress={jest.fn()} />,
    );
    expect(getByText('◐')).toBeTruthy();
    getByLabelText('2026-05-08: Parcial (1/2)');
  });

  it('renders a skip-only day with its number and a skip marker', async () => {
    const { getByText, getByTestId, getByLabelText } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info({ mark: 'skip', skipped: 1 })} isToday={false} onPress={jest.fn()} />,
    );
    expect(getByText('8')).toBeTruthy();
    expect(getByTestId('cal-skip-2026-05-08')).toBeTruthy();
    getByLabelText('2026-05-08: Com pulados (1 pulado)');
  });

  it('flags skips on a partial day too (skip is not a failure)', async () => {
    const { getByTestId } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info({ mark: 'partial', done: 1, skipped: 1 })} isToday={false} onPress={jest.fn()} />,
    );
    expect(getByTestId('cal-skip-2026-05-08')).toBeTruthy();
  });

  it('does not flag skips on a conquered day', async () => {
    const { queryByTestId } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info({ mark: 'conquered', done: 1, skipped: 1 })} isToday={false} onPress={jest.fn()} />,
    );
    expect(queryByTestId('cal-skip-2026-05-08')).toBeNull();
  });

  it('renders a pending scheduled day neutral with its number', async () => {
    const { getByText, getByLabelText } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info()} isToday onPress={jest.fn()} />,
    );
    expect(getByText('8')).toBeTruthy();
    getByLabelText('2026-05-08: Pendente');
  });

  it('renders an unscheduled day as empty', async () => {
    const { getByText, getByLabelText } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-09" info={info({ dateKey: '2026-05-09', scheduled: 0 })} isToday={false} onPress={jest.fn()} />,
    );
    expect(getByText('9')).toBeTruthy();
    getByLabelText('2026-05-09: Sem hábitos');
  });

  it('presses with its dateKey', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await renderWithProviders(
      <CalendarDayCell dateKey="2026-05-08" info={info()} isToday={false} onPress={onPress} />,
    );
    await fireEvent.press(getByTestId('cal-day-2026-05-08'));
    expect(onPress).toHaveBeenCalledWith('2026-05-08');
  });
});
