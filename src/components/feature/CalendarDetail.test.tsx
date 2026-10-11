import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { CalendarDetail } from '@/components/feature/CalendarDetail';
import { Habit } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';
import { Todo } from '@/domain/todo/model';

const DAY = '2026-05-05';

const HABIT: Habit = {
  id: 'h1',
  name: 'Ler',
  icon: 'book',
  color: 'primary',
  type: 'binary',
  frequency: { kind: 'daily', schedule: {} },
  createdAt: 0,
  updatedAt: 0,
};

const DONE: HabitRecord = { id: 'h1__2026-05-05', habitId: 'h1', date: DAY, status: 'completed' };

function todo(over: Partial<Todo>): Todo {
  return { id: 't', title: 'Tarefa', completed: false, createdAt: 0, updatedAt: 0, date: DAY, ...over };
}

async function renderDetail(over: Partial<React.ComponentProps<typeof CalendarDetail>> = {}) {
  const onToggleTodo = jest.fn();
  const utils = await renderWithProviders(
    <CalendarDetail
      dateKey={DAY}
      habits={[HABIT]}
      records={[DONE]}
      todos={[todo({ id: 'a', title: 'Comprar leite' })]}
      now={new Date(2026, 4, 5, 10)}
      onToggleTodo={onToggleTodo}
      {...over}
    />,
  );
  return { ...utils, onToggleTodo };
}

describe('CalendarDetail (D10)', () => {
  it('shows per-habit status read-only (no habit toggle checkbox)', async () => {
    const { getByLabelText, queryByRole } = await renderDetail();
    expect(getByLabelText('Ler: concluído')).toBeTruthy();
    expect(queryByRole('checkbox', { name: /Ler/ })).toBeNull();
  });

  it('renders the day todos as markable TodoRows', async () => {
    const { onToggleTodo, getByRole } = await renderDetail();
    await fireEvent.press(getByRole('checkbox', { name: 'Marcar Comprar leite como concluída' }));
    expect(onToggleTodo).toHaveBeenCalledWith('a');
  });

  it('shows a completed todo struck through', async () => {
    const { getByText } = await renderDetail({
      todos: [todo({ id: 'b', title: 'Feita', completed: true })],
    });
    expect(getByText('Feita')).toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('only lists todos for the selected day', async () => {
    const { queryByText } = await renderDetail({
      todos: [
        todo({ id: 'a', title: 'Hoje' }),
        todo({ id: 'c', title: 'Outro dia', date: '2026-05-09' }),
      ],
    });
    expect(queryByText('Hoje')).toBeTruthy();
    expect(queryByText('Outro dia')).toBeNull();
  });
});