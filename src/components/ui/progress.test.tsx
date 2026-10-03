import { renderWithProviders } from '@/components/ui/renderUtils';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';

describe('ProgressBar', () => {
  it('exposes range value from progress', async () => {
    const { getByRole } = await renderWithProviders(<ProgressBar progress={0.75} label="hoje" />);
    const bar = getByRole('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 75, text: '75%' });
  });

  it('clamps progress to 0..1', async () => {
    const { getByRole } = await renderWithProviders(<ProgressBar progress={1.5} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
  });
});

describe('ProgressRing', () => {
  it('reflects the value in accessibility', async () => {
    const { getByRole } = await renderWithProviders(<ProgressRing progress={0.5} />);
    expect(getByRole('progressbar').props.accessibilityValue.now).toBe(50);
  });
});

describe('Card', () => {
  it('renders children and is pressable in interactive mode', async () => {
    const onPress = jest.fn();
    const { getByText, getByRole } = await renderWithProviders(
      <Card variant="interactive" onPress={onPress} style={{}}>
        <Text>Conteúdo</Text>
      </Card>,
    );
    expect(getByText('Conteúdo')).toBeTruthy();
    const card = getByRole('button');
    expect(card).toBeTruthy();
  });
});