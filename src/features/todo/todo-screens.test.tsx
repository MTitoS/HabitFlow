import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';
import CreateTodoScreen from '@/app/todos/create';
import EditTodoScreen from '@/app/todos/[id]/edit';
import { ThemeProvider } from '@/theme/Provider';
import { Todo } from '@/domain/todo/model';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args), back: () => mockBack() },
  useLocalSearchParams: () => ({ id: 't1' }),
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

const mockCreate = jest.fn(async (draft: unknown) => ({ id: 't1', ...(draft as object) }));
const mockUpdate = jest.fn(async () => {});
const mockRemove = jest.fn(async () => {});
const mockShowToast = jest.fn();
let mockTodos: Todo[] = [];

jest.mock('@/data/DataProvider', () => ({
  useData: () => ({ todos: mockTodos, repos: { todos: { create: mockCreate, update: mockUpdate, remove: mockRemove } } }),
}));
jest.mock('@/components/ui/Toast', () => ({ useToast: () => ({ showToast: mockShowToast }) }));

const TODO: Todo = { id: 't1', title: 'Lavar carro', completed: false, createdAt: 1, updatedAt: 1 };

async function renderCreate() {
  return await render(
    <ThemeProvider>
      <CreateTodoScreen />
    </ThemeProvider>,
  );
}

async function renderEdit() {
  return await render(
    <ThemeProvider>
      <EditTodoScreen />
    </ThemeProvider>,
  );
}

describe('CreateTodoScreen (D8)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a todo and goes back with a success toast', async () => {
    const { getByLabelText, getByRole } = await renderCreate();
    await fireEvent.changeText(getByLabelText('Título'), 'Comprar leite');
    await fireEvent.press(getByRole('button', { name: 'Salvar tarefa' }));
    expect(mockCreate).toHaveBeenCalledWith({ title: 'Comprar leite', date: undefined });
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Tarefa criada');
    expect(mockBack).toHaveBeenCalled();
  });
});

describe('EditTodoScreen (D8)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTodos = [TODO];
  });

  it('saves edits via repos.todos.update with toast', async () => {
    const { getByLabelText, getByRole } = await renderEdit();
    await fireEvent.changeText(getByLabelText('Título'), 'Lavar moto');
    await fireEvent.press(getByRole('button', { name: 'Salvar tarefa' }));
    expect(mockUpdate).toHaveBeenCalledWith({ ...TODO, title: 'Lavar moto' });
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Tarefa atualizada');
    expect(mockBack).toHaveBeenCalled();
  });

  it('deletes after confirmation (Q13)', async () => {
    const spy = jest.spyOn(Alert, 'alert');
    const { getByRole } = await renderEdit();
    await fireEvent.press(getByRole('button', { name: 'Excluir tarefa' }));
    expect(spy).toHaveBeenCalledWith('Excluir tarefa?', expect.any(String), expect.any(Array));
    const buttons = spy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const destructive = buttons.find((b) => b.text === 'Excluir');
    destructive?.onPress?.();
    await new Promise((r) => setTimeout(r, 0));
    expect(mockRemove).toHaveBeenCalledWith('t1');
    expect(mockShowToast).toHaveBeenCalledWith('info', 'Tarefa removida');
    expect(mockBack).toHaveBeenCalled();
    spy.mockRestore();
  });
});