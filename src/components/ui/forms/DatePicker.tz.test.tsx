import { act, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import * as NativePicker from '@expo/ui/community/datetime-picker';
import { DatePicker } from '@/components/ui/forms/DatePicker';
import { toDateKeyUtc } from '@/domain/date/dateUtils';

beforeAll(() => {
  process.env.TZ = 'America/Sao_Paulo';
});

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  __esModule: true,
  default: { OS: 'android', select: (o: Record<string, unknown>) => o.android, Version: 34 },
  OS: 'android',
  select: (o: Record<string, unknown>) => o.android,
  Version: 34,
}));

const registry = (NativePicker as unknown as { __test: { registry: Record<string, unknown> } }).__test
  .registry;

async function select(date: Date) {
  const onValueChange = (registry.lastProps as { onValueChange: (e: unknown, d: Date) => void })
    .onValueChange;
  await act(async () => {
    onValueChange({ nativeEvent: { timestamp: date.getTime(), utcOffset: -180 } }, date);
  });
}

describe('DatePicker Android TZ (c5fix2)', () => {
  it('maps the native UTC-midnight millis to the selected day in UTC-3', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value={undefined} onChange={onChange} />,
    );
    await fireEvent.press(getByRole('button', { name: 'Data (opcional)' }));
    await select(new Date(Date.UTC(2026, 4, 13)));
    expect(onChange).toHaveBeenCalledWith('2026-05-13');
  });

  it('encodes the stored day as UTC midnight and roundtrips unchanged', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value="2026-05-13" onChange={onChange} />,
    );
    await fireEvent.press(getByRole('button', { name: 'Data (opcional)' }));
    const initial = (registry.lastProps as { value: Date }).value;
    expect(toDateKeyUtc(initial)).toBe('2026-05-13');
    await select(initial);
    expect(onChange).toHaveBeenCalledWith('2026-05-13');
  });
});
