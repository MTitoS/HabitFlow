import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { EmptyState } from '@/components/feature/EmptyState';

describe('EmptyState no-todos (D5)', () => {
  it('renders no-todos copy and emoji', async () => {
    const { getByText } = await renderWithProviders(<EmptyState kind="no-todos" />);
    expect(getByText('Sem tarefas')).toBeTruthy();
    expect(getByText('Crie uma tarefa para organizar o dia.')).toBeTruthy();
  });

  it('fires the create action when provided', async () => {
    const onAction = jest.fn();
    const { getByRole } = await renderWithProviders(
      <EmptyState kind="no-todos" onAction={onAction} />,
    );
    await fireEvent.press(getByRole('button', { name: 'Criar tarefa' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});