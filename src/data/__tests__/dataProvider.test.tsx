import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { DataProvider, useData } from '@/data/DataProvider';
import { Pressable, Text } from 'react-native';
import { Todo } from '@/domain/todo/model';

function Harness() {
  const { repos, todos, reload } = useData();
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="create-todo"
        onPress={() => void repos.todos.create({ title: 'Nova tarefa' }).then(() => reload())}
      />
      <Text>{todos.map((t: Todo) => t.title).join(',')}</Text>
    </>
  );
}

describe('DataProvider todos (D4)', () => {
  it('exposes todos after a reload that includes them', async () => {
    const { getByLabelText, getByText } = await render(
      <DataProvider>
        <Harness />
      </DataProvider>,
    );
    await fireEvent.press(getByLabelText('create-todo'));
    await waitFor(() => expect(getByText('Nova tarefa')).toBeTruthy());
  });
});