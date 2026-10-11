import { fireEvent, render } from '@testing-library/react-native';
import TodosScreen from '@/app/todos/index';
import { ThemeProvider } from '@/theme/Provider';
import { Todo } from '@/domain/todo/model';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
  usePathname: () => '/todos',
}));
jest.mock('@/utils/useBreakpoint', () => ({ useBreakpoint: () => 'mobile' }));
jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaView: (props: { children: React.ReactNode }) => React.createElement(View, props),
  };
});

const mockSetCompleted = jest.fn();
const mockSetUncompleted = jest.fn();
const mockShowToast = jest.fn();
let mockTodos: Todo[] = [];

jest.mock('@/data/DataProvider', () => ({
  useData: () => ({ todos: mockTodos, repos: { todos: { setCompleted: mockSetCompleted, setUncompleted: mockSetUncompleted } } }),
}));
jest.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));
jest.mock('@/services/haptics', () => ({ triggerSuccess: jest.fn(async () => {}) }));
jest.mock('@/domain/date/dateUtils', () => ({ todayKey: () => TODAY }));

const TODAY = '2026-05-05';

function todo(over: Partial<Todo>): Todo {
  return { id: 't', title: 'Tarefa', completed: false, createdAt: 0, updatedAt: 0, ...over };
}

function fixture(): Todo[] {
  return [
    todo({ id: 'late-open', title: 'Atrasada aberta', date: '2026-05-04', createdAt: 1 }),
    todo({ id: 'today-pending', title: 'Hoje pendente', date: TODAY, createdAt: 2 }),
    todo({ id: 'late-done', title: 'Atrasada feita', date: '2026-05-03', completed: true, createdAt: 3 }),
    todo({ id: 'today-done', title: 'Hoje feita', date: TODAY, completed: true, createdAt: 4 }),
    todo({ id: 'someday', title: 'Algum dia' }),
    todo({ id: 'upcoming', title: 'Futura', date: '2026-06-01' }),
  ];
}

async function renderScreen() {
  return await render(
    <ThemeProvider>
      <TodosScreen />
    </ThemeProvider>,
  );
}

describe('TodosScreen (D7)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTodos = [];
  });

  it('renders sections Hoje / Algum dia / Próximas in order with completed last (Q11/Q14)', async () => {
    mockTodos = fixture();
    const { getAllByText, getAllByTestId } = await renderScreen();
    expect(getAllByText('Hoje').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Algum dia').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Próximas').length).toBeGreaterThanOrEqual(1);
    const ordered = getAllByTestId(/todo-row-/).map((n) => n.props.testID);
    expect(ordered).toEqual([
      'todo-row-late-open',
      'todo-row-today-pending',
      'todo-row-late-done',
      'todo-row-today-done',
      'todo-row-someday',
      'todo-row-upcoming',
    ]);
  });

  it('toggles an open todo via repos.setCompleted with toast success', async () => {
    mockTodos = [todo({ id: 'a', title: 'A', date: TODAY })];
    const { getByRole } = await renderScreen();
    await fireEvent.press(getByRole('checkbox', { name: 'Marcar A como concluída' }));
    expect(mockSetCompleted).toHaveBeenCalledWith('a', expect.any(Number));
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Tarefa concluída');
    expect(mockSetUncompleted).not.toHaveBeenCalled();
  });

  it('reopens a completed todo via repos.setUncompleted with toast info', async () => {
    mockTodos = [todo({ id: 'a', title: 'A', date: TODAY, completed: true })];
    const { getByRole } = await renderScreen();
    await fireEvent.press(getByRole('checkbox', { name: 'A: concluída' }));
    expect(mockSetUncompleted).toHaveBeenCalledWith('a');
    expect(mockShowToast).toHaveBeenCalledWith('info', 'Tarefa marcada como não concluída');
    expect(mockSetCompleted).not.toHaveBeenCalled();
  });

  it('renders the no-todos empty state with create action when list is empty', async () => {
    const { getByText, getByRole } = await renderScreen();
    expect(getByText('Sem tarefas')).toBeTruthy();
    await fireEvent.press(getByRole('button', { name: 'Criar tarefa' }));
    expect(mockPush).toHaveBeenCalledWith('/todos/create');
  });

  it('navigates to create via the header action', async () => {
    const { getByRole } = await renderScreen();
    await fireEvent.press(getByRole('button', { name: 'Nova tarefa' }));
    expect(mockPush).toHaveBeenCalledWith('/todos/create');
  });
});