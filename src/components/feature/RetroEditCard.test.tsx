import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { RetroEditCard } from '@/components/feature/RetroEditCard';

describe('RetroEditCard', () => {
  it('renders the retroactive switch off with the exception text', async () => {
    const onChange = jest.fn();
    const { getByRole, getByText } = await renderWithProviders(
      <RetroEditCard enabled={false} onChange={onChange} />,
    );
    const toggle = getByRole('switch', { name: 'Permitir edição retroativa' });
    expect(toggle.props.accessibilityState.checked).toBe(false);
    getByText(/Exceção:/);
    getByText(/janela de 2 dias/);
  });

  it('fires onChange when toggled', async () => {
    const onChange = jest.fn();
    const { getByRole } = await renderWithProviders(
      <RetroEditCard enabled={false} onChange={onChange} />,
    );
    await fireEvent.press(getByRole('switch', { name: 'Permitir edição retroativa' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
