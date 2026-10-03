import { fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/ui/Button';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { Icon } from '@/components/ui/Icon';

describe('Button', () => {
  it('renders label and fires onPress', async () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = await renderWithProviders(
      <Button label="Completar" onPress={onPress} />,
    );
    const button = getByRole('button');
    expect(getByText('Completar')).toBeTruthy();
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('respects disabled and loading states', async () => {
    const onPress = jest.fn();
    const { getByRole } = await renderWithProviders(
      <Button label="Salvar" onPress={onPress} disabled />,
    );
    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes an accessible label', async () => {
    const { getByRole } = await renderWithProviders(<Button label="Meu botão" onPress={() => {}} />);
    expect(getByRole('button').props.accessibilityLabel).toBe('Meu botão');
  });
});

describe('Icon', () => {
  it('renders a lucide component for known names', async () => {
    const { getByTestId, queryByTestId } = await renderWithProviders(<Icon name="fire" />);
    expect(getByTestId('habit-icon')).toBeTruthy();
    expect(queryByTestId('habit-icon-emoji')).toBeNull();
  });

  it('falls back to emoji text for unknown names', async () => {
    const { getByTestId, getByText } = await renderWithProviders(<Icon name="🦄" />);
    expect(getByTestId('habit-icon-emoji')).toBeTruthy();
    expect(getByText('🦄')).toBeTruthy();
  });
});