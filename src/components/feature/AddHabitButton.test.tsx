import { fireEvent, render } from '@testing-library/react-native';
import { AddHabitButton } from '@/components/feature/AddHabitButton';
import { ThemeProvider } from '@/theme/Provider';

const mockPush = jest.fn();
const mockBreakpoint = jest.fn(() => 'mobile');

jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
}));

jest.mock('@/utils/useBreakpoint', () => ({ useBreakpoint: () => mockBreakpoint() }));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

function renderFab() {
  return render(
    <ThemeProvider>
      <AddHabitButton />
    </ThemeProvider>,
  );
}

describe('AddHabitButton', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders a mobile FAB and navigates to create on press', async () => {
    mockBreakpoint.mockReturnValue('mobile');
    const { getByRole } = await renderFab();
    const fab = getByRole('button', { name: 'Novo hábito' });
    await fireEvent.press(fab);
    expect(mockPush).toHaveBeenCalledWith('/habits/create');
  });

  it('renders a desktop header button and navigates on press', async () => {
    mockBreakpoint.mockReturnValue('desktop');
    const { getByRole } = await renderFab();
    const button = getByRole('button', { name: 'Novo hábito' });
    await fireEvent.press(button);
    expect(mockPush).toHaveBeenCalledWith('/habits/create');
  });
});