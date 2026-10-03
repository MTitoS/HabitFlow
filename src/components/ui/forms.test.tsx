import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { Checkbox, Switch } from '@/components/ui/forms/Controls';
import { TimePicker } from '@/components/ui/forms/TimePicker';
import { ColorPicker } from '@/components/ui/forms/ColorPicker';
import { Select } from '@/components/ui/forms/Select';
import { ColorToken } from '@/theme/types';

describe('forms', () => {
  it('Checkbox toggles onChange', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Checkbox label="Lembrar" checked={false} onChange={onChange} />,
    );
    await fireEvent.press(getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Switch reflects checked state', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Switch label="Ativo" checked onChange={onChange} />,
    );
    expect(getByRole('switch').props.accessibilityState.checked).toBe(true);
    await fireEvent.press(getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('TimePicker emits HH:mm values and allows clearing', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <TimePicker label="Horário" value="08:00" onChange={onChange} />,
    );
    await fireEvent.press(getByRole('radio', { name: '08:00' }));
    expect(onChange).toHaveBeenCalledWith('08:00');
    await fireEvent.press(getByRole('radio', { name: 'Sem horário' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('ColorPicker is restricted to semantic tokens', async () => {
    const onChange = jest.fn();
    const tokens: ColorToken[] = [];
    const { getAllByRole } = await renderWithProviders(
      <ColorPicker
        label="Cor"
        value="primary"
        onChange={(t) => {
          tokens.push(t);
          onChange(t);
        }}
      />,
    );
    const radios = getAllByRole('radio');
    expect(radios.length).toBeGreaterThanOrEqual(4);
    await fireEvent.press(radios[1]);
    expect(onChange).toHaveBeenCalled();
  });

  it('Select highlights the selected option', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Select
        label="Frequência"
        options={[
          { label: 'Diário', value: 'daily' },
          { label: 'Semanal', value: 'weekly' },
        ]}
        value="daily"
        onChange={onChange}
      />,
    );
    const daily = getByRole('radio', { name: 'Diário' });
    expect(daily.props.accessibilityState.selected).toBe(true);
  });
});