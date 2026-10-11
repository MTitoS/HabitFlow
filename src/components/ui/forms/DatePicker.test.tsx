import { act, fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import * as NativePicker from '@expo/ui/community/datetime-picker';
import { DatePicker } from '@/components/ui/forms/DatePicker';

const pickerRegistry = (NativePicker as unknown as { __test: { registry: Record<string, unknown> } })
  .__test.registry;

function lastPickerProps(): Record<string, unknown> {
  return pickerRegistry.lastProps as Record<string, unknown>;
}

async function selectDate(date: Date) {
  const onValueChange = lastPickerProps().onValueChange as (event: unknown, selected: Date) => void;
  await act(async () => {
    onValueChange({ nativeEvent: { timestamp: date.getTime(), utcOffset: 0 } }, date);
  });
}

describe('DatePicker (c5fix1)', () => {
  it('renders the label and an "Algum dia" placeholder when no date is set', async () => {
    const { getByText } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value={undefined} onChange={jest.fn()} />,
    );
    getByText('Data (opcional)');
    getByText('Algum dia');
  });

  it('shows an existing date formatted in pt-BR', async () => {
    const { getByText } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value="2026-05-05" onChange={jest.fn()} />,
    );
    getByText('05 de mai. de 2026');
  });

  it('opens the native date picker when the field is pressed', async () => {
    const { getByRole, getByTestId } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value={undefined} onChange={jest.fn()} />,
    );
    expect(lastPickerProps()).toBeUndefined();
    await fireEvent.press(getByRole('button', { name: 'Data (opcional)' }));
    expect(getByTestId('todo-date-picker')).toBeTruthy();
    expect(lastPickerProps().mode).toBe('date');
  });

  it('reports the picked date as a YYYY-MM-DD key and closes the picker', async () => {
    const onChange = jest.fn();
    const { getByRole, queryByTestId } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value={undefined} onChange={onChange} />,
    );
    await fireEvent.press(getByRole('button', { name: 'Data (opcional)' }));
    await selectDate(new Date(2026, 4, 6));
    expect(onChange).toHaveBeenCalledWith('2026-05-06');
    expect(queryByTestId('todo-date-picker')).toBeNull();
  });

  it('keeps the current value when the picker is dismissed', async () => {
    const onChange = jest.fn();
    const { getByRole, queryByTestId } = await renderWithProviders(
      <DatePicker label="Data (opcional)" value="2026-05-05" onChange={onChange} />,
    );
    await fireEvent.press(getByRole('button', { name: 'Data (opcional)' }));
    const onDismiss = lastPickerProps().onDismiss as () => void;
    await act(async () => {
      onDismiss();
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(queryByTestId('todo-date-picker')).toBeNull();
  });
});