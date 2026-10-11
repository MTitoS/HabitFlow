import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { TodayTodos } from '@/components/feature/TodayTodos';
import { Todo } from '@/domain/todo/model';

const TODAY = '2026-05-05';

function todo(over: Partial<Todo>): Todo {
  return { id: 't', title: 'Tarefa', completed: false, createdAt: 0, updatedAt: 0, ...over };
}

function fixture(): Todo[] {
  return [
    todo({ id: 'today-open', title: 'Hoje aberta', date: TODAY, createdAt: 2 }),
    todo({ id: 'late-open', title: 'Atrasada aberta', date: '2026-05-04', createdAt: 1 }),
    todo({ id: 'late-done', title: 'Atrasada feita', date: '2026-05-03', completed: true }),
    todo({ id: 'today-done', title: 'Hoje feita', date: TODAY, completed: true, createdAt: 3 }),
    todo({ id: 'someday', title: 'Algum dia' }),
    todo({ id: 'upcoming', title: 'Futura', date: '2026-06-01' }),
  ];
}

async function renderToday(onToggle: (id: string) => void = jest.fn()) {
  return await renderWithProviders(<TodayTodos todos={fixture()} today={TODAY} onToggle={onToggle} />);
}

describe('TodayTodos (D9)', () => {
  it('renders only today and open overdue todos, not completed-past/someday/upcoming (Q15)', async () => {
    const { getAllByTestId, queryByText } = await renderToday();
    const rows = getAllByTestId(/todo-row-/).map((n) => n.props.testID);
    expect(rows).toEqual(['todo-row-late-open', 'todo-row-today-open', 'todo-row-today-done']);
    expect(queryByText('Algum dia')).toBeNull();
    expect(queryByText('Futura')).toBeNull();
    expect(queryByText('Atrasada feita')).toBeNull();
  });

  it('flags overlapping overdue and strkes completed (Q15/Q14)', async () => {
    const { getByText, getByRole } = await renderToday();
    expect(getByText('atrasada')).toBeTruthy();
    getByRole('checkbox', { name: 'Hoje feita: concluída' });
    expect(getByText('Hoje feita')).toHaveStyle({ textDecorationLine: 'line-through' });
  });

  it('fires onToggle with the todo id', async () => {
    const onToggle = jest.fn();
    const { getByRole } = await renderToday(onToggle);
    await fireEvent.press(getByRole('checkbox', { name: 'Marcar Hoje aberta como concluída' }));
    expect(onToggle).toHaveBeenCalledWith('today-open');
  });

  it('renders nothing when there are no today or overdue todos', async () => {
    const { queryByTestId } = await renderWithProviders(
      <TodayTodos todos={[todo({ id: 'x', title: 'X' })]} today={TODAY} onToggle={jest.fn()} />,
    );
    expect(queryByTestId(/todo-row-/)).toBeNull();
  });
});