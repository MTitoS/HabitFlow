import { renderWithProviders } from '@/components/ui/renderUtils';
import { HomeStreakHeader } from '@/components/feature/HomeStreakHeader';

describe('HomeStreakHeader', () => {
  it('renders streak value, phrase text and author', async () => {
    const { getByText } = await renderWithProviders(
      <HomeStreakHeader streak={5} phrase={{ text: 'Um passo de cada vez.', author: 'Sêneca' }} />,
    );
    expect(getByText('5')).toBeTruthy();
    expect(getByText('dias seguidos')).toBeTruthy();
    expect(getByText('Um passo de cada vez.')).toBeTruthy();
    expect(getByText('Sêneca')).toBeTruthy();
  });

  it('uses singular label for one day', async () => {
    const { getByText } = await renderWithProviders(
      <HomeStreakHeader streak={1} phrase={{ text: 'Foco.', author: 'Marco Aurélio' }} />,
    );
    expect(getByText('dia seguido')).toBeTruthy();
  });

  it('exposes an accessibility label combining streak and phrase', async () => {
    const { getByLabelText } = await renderWithProviders(
      <HomeStreakHeader streak={3} phrase={{ text: 'Persista.', author: 'Jocko Willink' }} />,
    );
    getByLabelText(/Sequência geral: 3 dias seguidos/);
  });
});
