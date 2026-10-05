import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '@/components/ui/renderUtils';
import { HabitsToolbar, NO_ROUTINE_FILTER } from '@/components/feature/HabitsToolbar';
import { Routine } from '@/domain/habit/model';

const ROUTINES: Routine[] = [
  { id: 'r1', name: 'Saúde', order: 1 },
  { id: 'r2', name: 'Estudo', order: 2 },
];

function setup(over: Partial<React.ComponentProps<typeof HabitsToolbar>> = {}) {
  const props = {
    query: '',
    onQueryChange: jest.fn(),
    sortMode: 'added' as const,
    onSortModeChange: jest.fn(),
    routineFilter: null as string | null,
    onRoutineFilterChange: jest.fn(),
    routines: ROUTINES,
    ...over,
  };
  return { props, render: () => renderWithProviders(<HabitsToolbar {...props} />) };
}

describe('HabitsToolbar', () => {
  it('reports search text changes', async () => {
    const { props, render } = setup();
    const { getByLabelText } = await render();
    fireEvent.changeText(getByLabelText('Buscar hábito'), 'leitura');
    expect(props.onQueryChange).toHaveBeenCalledWith('leitura');
  });

  it('reports sort mode changes', async () => {
    const { props, render } = setup();
    const { getByLabelText } = await render();
    fireEvent.press(getByLabelText('A–Z'));
    expect(props.onSortModeChange).toHaveBeenCalledWith('alpha');
  });

  it('reports routine filter changes including "Sem rotina"', async () => {
    const { props, render } = setup();
    const { getByLabelText } = await render();
    fireEvent.press(getByLabelText('Saúde'));
    expect(props.onRoutineFilterChange).toHaveBeenCalledWith('r1');
    fireEvent.press(getByLabelText('Sem rotina'));
    expect(props.onRoutineFilterChange).toHaveBeenCalledWith(NO_ROUTINE_FILTER);
    fireEvent.press(getByLabelText('Todas'));
    expect(props.onRoutineFilterChange).toHaveBeenCalledWith(null);
  });
});
