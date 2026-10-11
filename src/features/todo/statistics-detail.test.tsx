import { fireEvent, render } from '@testing-library/react-native';
import StatisticsScreen from '@/app/statistics/index';
import { ThemeProvider } from '@/theme/Provider';
import { Habit } from '@/domain/habit/model';
import { Todo } from '@/domain/todo/model';

const mockSetCompleted = jest.fn();
const mockSetUncompleted = jest.fn();
const mockShowToast = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  usePathname: () => '/statistics',
}));
jest.mock('@/utils/useBreakpoint', () => ({ useBreakpoint: () => 'mobile' }));
jest.mock('react-native-safe-area-context', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View: RNView } = require('react-native');
  return {
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaView: (props: { children: React.ReactNode }) => React.createElement(RNView, props),
  };
});

jest.mock('@/components/feature/dashboard/MonthView', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable, View } = require('react-native');
  return {
    MonthView: (props: { onSelectDay?: (d: string) => void }) =>
      React.createElement(
        Pressable,
        { accessibilityRole: 'button', accessibilityLabel: 'pick-day', onPress: () => props.onSelectDay?.('2026-05-05') },
        React.createElement(View, null),
      ),
  };
});

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
const TODO: Todo = { id: 'a', title: 'Comprar leite', date: '2026-05-05', completed: false, createdAt: 0, updatedAt: 0 };

jest.mock('@/data/DataProvider', () => ({
  useData: () => ({
    habits: [HABIT],
    records: [],
    todos: [TODO],
    repos: { todos: { setCompleted: mockSetCompleted, setUncompleted: mockSetUncompleted } },
  }),
}));
jest.mock('@/components/ui/Toast', () => ({ useToast: () => ({ showToast: mockShowToast }) }));
jest.mock('@/services/haptics', () => ({ triggerSuccess: jest.fn(async () => {}) }));

describe('Statistics inline day detail (D10)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('expands the day detail inline on month day selection, habits read-only + todos markable', async () => {
    const { getByLabelText, getByRole, getByText, queryByText } = await render(
      <ThemeProvider>
        <StatisticsScreen />
      </ThemeProvider>,
    );
    expect(queryByText('2026-05-05')).toBeNull();
    await fireEvent.press(getByLabelText('pick-day'));
    expect(getByText('2026-05-05')).toBeTruthy();
    expect(getByLabelText('Ler: perdido')).toBeTruthy();
    await fireEvent.press(getByRole('checkbox', { name: 'Marcar Comprar leite como concluída' }));
    expect(mockSetCompleted).toHaveBeenCalledWith('a', expect.any(Number));
  });
});