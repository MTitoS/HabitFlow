import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { TodoForm } from '@/features/todo/todo-form';
import { Todo } from '@/domain/todo/model';

jest.mock('@/domain/date/dateUtils', () => ({ toDateKey: () => '2026-05-05' }));

async function renderForm(over: Partial<React.ComponentProps<typeof TodoForm>> = {}) {
  const onSubmit = jest.fn(async () => {});
  const utils = await renderWithProviders(<TodoForm onSubmit={onSubmit} {...over} />);
  return { ...utils, onSubmit };
}

const DRAFT_LABEL = 'Salvar tarefa';

describe('TodoForm (D8)', () => {
  it('does not submit an empty title (validation)', async () => {
    const { getByRole, onSubmit } = await renderForm();
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(getByRole('button', { name: DRAFT_LABEL })).toBeTruthy();
  });

  it('submits a dated todo', async () => {
    const { getByLabelText, getByRole, onSubmit } = await renderForm();
    await fireEvent.changeText(getByLabelText('Título'), 'Comprar leite');
    await fireEvent.press(getByRole('radio', { name: '2026-05-05' }));
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Comprar leite', date: '2026-05-05' });
  });

  it('submits an undated todo (Algum dia)', async () => {
    const { getByLabelText, getByRole, onSubmit } = await renderForm();
    await fireEvent.changeText(getByLabelText('Título'), 'Comprar leite');
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Comprar leite', date: undefined });
  });

  it('removes the chosen date back to "Algum dia"', async () => {
    const { getByLabelText, getByRole, onSubmit } = await renderForm();
    await fireEvent.changeText(getByLabelText('Título'), 'Comprar leite');
    await fireEvent.press(getByRole('radio', { name: '2026-05-05' }));
    await fireEvent.press(getByRole('button', { name: 'Remover data' }));
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Comprar leite', date: undefined });
  });

  it('prefills an initial todo and submits edits', async () => {
    const initial: Todo = { id: 't1', title: 'Lavar carro', completed: false, createdAt: 1, updatedAt: 1 };
    const { getByLabelText, getByRole, onSubmit } = await renderForm({ initial });
    await fireEvent.changeText(getByLabelText('Título'), 'Lavar moto');
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Lavar moto', date: undefined });
  });
});