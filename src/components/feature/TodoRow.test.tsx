import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { TodoRow } from '@/components/feature/TodoRow';
import { Todo } from '@/domain/todo/model';

function makeTodo(over: Partial<Todo> = {}): Todo {
  return { id: 't1', title: 'Comprar leite', completed: false, createdAt: 0, updatedAt: 0, ...over };
}

async function renderRow(over: Partial<React.ComponentProps<typeof TodoRow>> = {}) {
  const onToggle = jest.fn();
  const onPress = jest.fn();
  const utils = await renderWithProviders(
    <TodoRow todo={makeTodo()} checked={false} onToggle={onToggle} {...over} />,
  );
  return { ...utils, onToggle, onPress };
}

describe('TodoRow', () => {
  it('pending state labels the checkbox "Marcar ... como concluída"', async () => {
    const { getByRole } = await renderRow();
    expect(getByRole('checkbox', { name: 'Marcar Comprar leite como concluída' })).toBeTruthy();
  });

  it('completed state strikes the title through and labels "…: concluída"', async () => {
    const { getByRole, getByText } = await renderRow({ todo: makeTodo({ completed: true }), checked: true });
    getByRole('checkbox', { name: 'Comprar leite: concluída' });
    expect(getByText('Comprar leite')).toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('fires onToggle with the todo id', async () => {
    const { getByRole, onToggle } = await renderRow();
    await fireEvent.press(getByRole('checkbox', { name: 'Marcar Comprar leite como concluída' }));
    expect(onToggle).toHaveBeenCalledWith('t1');
  });

  it('shows an overdue badge (danger) when overdue and open, not when completed', async () => {
    const overdue = await renderRow({ overdue: true });
    expect(overdue.getByText('atrasada')).toBeTruthy();
    const done = await renderRow({ todo: makeTodo({ completed: true }), checked: true, overdue: true });
    expect(done.queryByText('atrasada')).toBeNull();
  });

  it('exposes a stable row testID', async () => {
    const { getByTestId } = await renderRow();
    expect(getByTestId('todo-row-t1')).toBeTruthy();
  });

  it('offers an edit affordance that fires onPress with the id', async () => {
    const { getByRole, onPress } = await renderRow({ onPress: (id) => onPress(id) });
    await fireEvent.press(getByRole('button', { name: 'Editar Comprar leite' }));
    expect(onPress).toHaveBeenCalledWith('t1');
  });

  it('keeps the edit affordance tappable (min 44x44) and visibly sized (icon >= 20)', async () => {
    const { getByRole, getByText, onPress } = await renderRow({ onPress: (id) => onPress(id) });
    const edit = getByRole('button', { name: 'Editar Comprar leite' });
    expect(edit).toHaveStyle({ minWidth: 44, minHeight: 44 });
    expect(getByText('›')).toHaveStyle({ fontSize: 22 });
    await fireEvent.press(edit);
    expect(onPress).toHaveBeenCalledWith('t1');
  });
});