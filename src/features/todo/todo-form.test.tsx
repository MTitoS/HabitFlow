import { act, fireEvent, RenderResult } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { TodoForm } from '@/features/todo/todo-form';
import { Todo } from '@/domain/todo/model';
import * as NativePicker from '@expo/ui/community/datetime-picker';

const pickerRegistry = (NativePicker as unknown as { __test: { registry: Record<string, unknown> } })
  .__test.registry;

async function pickDate(getByRole: RenderResult['getByRole'], date: Date) {
  await fireEvent.press(getByRole('button', { name: 'Data (opcional)' }));
  const onValueChange = (pickerRegistry.lastProps as { onValueChange: (e: unknown, d: Date) => void })
    .onValueChange;
  await act(async () => {
    onValueChange({ nativeEvent: { timestamp: date.getTime(), utcOffset: 0 } }, date);
  });
}

async function renderForm(over: Partial<React.ComponentProps<typeof TodoForm>> = {}) {
  const onSubmit = jest.fn(async () => {});
  const utils = await renderWithProviders(<TodoForm onSubmit={onSubmit} {...over} />);
  return { ...utils, onSubmit };
}

const DRAFT_LABEL = 'Salvar tarefa';

describe('TodoForm (D8 / c5fix1)', () => {
  it('does not submit an empty title (validation)', async () => {
    const { getByRole, onSubmit } = await renderForm();
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(getByRole('button', { name: DRAFT_LABEL })).toBeTruthy();
  });

  it('submits a dated todo picked from the calendar', async () => {
    const { getByLabelText, getByRole, onSubmit } = await renderForm();
    await fireEvent.changeText(getByLabelText('Título'), 'Comprar leite');
    await pickDate(getByRole, new Date(2026, 4, 5));
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
    await pickDate(getByRole, new Date(2026, 4, 5));
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

  it('keeps the initial date when editing and saving', async () => {
    const initial: Todo = {
      id: 't1',
      title: 'Lavar carro',
      date: '2026-05-05',
      completed: false,
      createdAt: 1,
      updatedAt: 1,
    };
    const { getByText, getByRole, onSubmit } = await renderForm({ initial });
    getByText('05 de mai. de 2026');
    await fireEvent.press(getByRole('button', { name: DRAFT_LABEL }));
    expect(onSubmit).toHaveBeenCalledWith({ title: 'Lavar carro', date: '2026-05-05' });
  });
});