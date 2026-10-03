import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';

function ShowToast() {
  const { showToast } = useToast();
  return <Button label="Mostrar" onPress={() => showToast('success', 'Tudo feito')} />;
}

function ErrorToast() {
  const { showToast } = useToast();
  return <Button label="Erro" onPress={() => showToast('error', 'Falhou')} />;
}

describe('Toast', () => {
  it('renders a toast with icon, color and label after trigger', async () => {
    const { getByRole, getByText } = await renderWithProviders(
      <ToastProvider>
        <ShowToast />
      </ToastProvider>,
    );
    await fireEvent.press(getByRole('button', { name: 'Mostrar' }));
    expect(getByText('Tudo feito')).toBeTruthy();
    expect(getByText('✓')).toBeTruthy();
  });

  it('supports error variant with a distinct symbol and label', async () => {
    const { getByRole, getByText } = await renderWithProviders(
      <ToastProvider>
        <ErrorToast />
      </ToastProvider>,
    );
    await fireEvent.press(getByRole('button', { name: 'Erro' }));
    expect(getByText('Falhou')).toBeTruthy();
    expect(getByText('✕')).toBeTruthy();
  });
});