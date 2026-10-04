import { fireEvent, render } from '@testing-library/react-native';
import { HabitRow } from '@/components/feature/HabitRow';
import { ThemeProvider } from '@/theme/Provider';
import { Habit } from '@/domain/habit/model';

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

async function renderRow(over: Partial<React.ComponentProps<typeof HabitRow>> = {}) {
  const onToggle = jest.fn();
  const onSkip = jest.fn();
  const onUndoSkip = jest.fn();
  const utils = await render(
    <ThemeProvider>
      <HabitRow
        habit={HABIT}
        state="pending"
        onToggle={onToggle}
        onSkip={onSkip}
        onUndoSkip={onUndoSkip}
        {...over}
      />
    </ThemeProvider>,
  );
  return { ...utils, onToggle, onSkip, onUndoSkip };
}

describe('HabitRow toggle + skip', () => {
  it('pending state labels main action "marcar como concluído" and shows skip', async () => {
    const { getByRole, getByLabelText } = await renderRow();
    expect(getByRole('checkbox', { name: 'Ler: marcar como concluído' })).toBeTruthy();
    getByLabelText('Pular Ler (usar 1 crédito)');
  });

  it('completed state labels main action "desfazer marcação" and hides skip', async () => {
    const { queryByLabelText, getByRole } = await renderRow({ state: 'completed' });
    getByRole('checkbox', { name: 'Ler: desfazer marcação' });
    expect(queryByLabelText('Pular Ler (usar 1 crédito)')).toBeNull();
  });

  it('main toggle fires onToggle for pending', async () => {
    const { onToggle, getByRole } = await renderRow();
    await fireEvent.press(getByRole('checkbox', { name: 'Ler: marcar como concluído' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('skip fires onSkip when credits available', async () => {
    const { onSkip, getByLabelText } = await renderRow();
    await fireEvent.press(getByLabelText('Pular Ler (usar 1 crédito)'));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('skip is disabled (a11y) and inert when balance is zero', async () => {
    const { onSkip, getByRole } = await renderRow({ state: 'pending', skipDisabled: true });
    const skip = getByRole('button', { name: 'Pular Ler (usar 1 crédito)', disabled: true });
    await fireEvent.press(skip);
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('non-pending non-completed states render status without toggle', async () => {
    const { queryByRole } = await renderRow({ state: 'skipped', onToggle: undefined });
    expect(queryByRole('checkbox')).toBeNull();
  });

  it('T6: skipped state shows undo-skip action that fires onUndoSkip', async () => {
    const { onUndoSkip, getByLabelText } = await renderRow({ state: 'skipped' });
    await fireEvent.press(getByLabelText('Desfazer pulo de Ler (recuperar 1 crédito)'));
    expect(onUndoSkip).toHaveBeenCalledTimes(1);
  });

  it('T6: completed state keeps undo-skip hidden', async () => {
    const { onUndoSkip, queryByLabelText } = await renderRow({ state: 'completed' });
    expect(queryByLabelText('Desfazer pulo de Ler (recuperar 1 crédito)')).toBeNull();
    expect(onUndoSkip).not.toHaveBeenCalled();
  });
});