import { renderWithProviders } from '@/components/ui/renderUtils';
import { ChartLegend } from '@/components/feature/dashboard/ChartLegend';

describe('ChartLegend', () => {
  it('renders the three status labels', async () => {
    const { getByText } = await renderWithProviders(<ChartLegend />);
    expect(getByText('Concluído')).toBeTruthy();
    expect(getByText('Skipado')).toBeTruthy();
    expect(getByText('Não concluído')).toBeTruthy();
  });

  it('exposes a textual accessibility label (not color-only)', async () => {
    const { getByLabelText } = await renderWithProviders(<ChartLegend />);
    expect(getByLabelText('Concluído, Skipado, Não concluído')).toBeTruthy();
  });

  it('renders custom items', async () => {
    const { getByText } = await renderWithProviders(
      <ChartLegend items={[{ token: 'chartDone', label: 'Feito' }]} />,
    );
    expect(getByText('Feito')).toBeTruthy();
  });
});
