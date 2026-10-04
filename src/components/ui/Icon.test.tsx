import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme/Provider';
import { Icon } from '@/components/ui/Icon';

jest.mock('lucide-react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const icon = (name: string) => {
    const C = React.forwardRef((props: Record<string, unknown>, ref: unknown) =>
      React.createElement(View, { ...props, ref }),
    );
    C.displayName = name;
    return C;
  };
  return {
    __esModule: true,
    Plus: icon('Plus'),
    Flame: icon('Flame'),
  };
});

async function renderIcon(name: string) {
  return await render(
    <ThemeProvider>
      <Icon name={name} />
    </ThemeProvider>,
  );
}

describe('Icon with real lucide shape (forwardRef object)', () => {
  it('renders a lucide icon for known names without throwing', async () => {
    const { getByTestId } = await renderIcon('plus');
    expect(getByTestId('habit-icon')).toBeTruthy();
  });

  it('does not fall back to emoji when a real icon exists', async () => {
    const { getByTestId, queryByTestId } = await renderIcon('fire');
    expect(getByTestId('habit-icon')).toBeTruthy();
    expect(queryByTestId('habit-icon-emoji')).toBeNull();
  });

  it('falls back to emoji for unknown names', async () => {
    const { getByTestId } = await renderIcon('🦄');
    expect(getByTestId('habit-icon-emoji')).toBeTruthy();
  });
});