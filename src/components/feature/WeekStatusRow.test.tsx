import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { WeekStatusRow } from '@/components/feature/WeekStatusRow';

const days = [
  { key: '2026-05-04', status: 'missed' as const },
  { key: '2026-05-05', status: null },
  { key: '2026-05-06', status: 'completed' as const },
];

const labelFor = (key: string) => `Marcar Ler como concluído em ${key.slice(8)}`;

describe('WeekStatusRow', () => {
  it('renders an eligible cell as a pressable button that completes it', async () => {
    const onRetroComplete = jest.fn();
    const { getByRole } = await renderWithProviders(
      <WeekStatusRow
        days={days}
        isRetroEligible={(key) => key === '2026-05-04'}
        onRetroComplete={onRetroComplete}
        accessibilityLabelFor={labelFor}
      />,
    );
    const cell = getByRole('button', { name: 'Marcar Ler como concluído em 04' });
    await fireEvent.press(cell);
    expect(onRetroComplete).toHaveBeenCalledWith('2026-05-04');
  });

  it('keeps ineligible cells read-only without affordance', async () => {
    const onRetroComplete = jest.fn();
    const { queryByRole, getAllByRole, getByText } = await renderWithProviders(
      <WeekStatusRow
        days={days}
        isRetroEligible={(key) => key === '2026-05-04'}
        onRetroComplete={onRetroComplete}
        accessibilityLabelFor={labelFor}
      />,
    );
    expect(queryByRole('button', { name: 'Marcar Ler como concluído em 05' })).toBeNull();
    expect(getAllByRole('button')).toHaveLength(1);
    expect(onRetroComplete).not.toHaveBeenCalled();
    getByText('✕');
  });

  it('shows no affordance at all when nothing is eligible (switch off)', async () => {
    const { queryAllByRole } = await renderWithProviders(
      <WeekStatusRow days={days} isRetroEligible={() => false} onRetroComplete={jest.fn()} />,
    );
    expect(queryAllByRole('button')).toHaveLength(0);
  });
});
