export interface Todo {
  id: string;
  title: string;
  date?: string;
  completed: boolean;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export function validateTodoTitle(title: string): boolean {
  return title.trim().length > 0;
}

export function isOverdue(todo: Todo, todayKey: string): boolean {
  return !todo.completed && Boolean(todo.date) && todo.date! < todayKey;
}

export function todosForDay(todos: Todo[], dateKey: string): Todo[] {
  return todos.filter((t) => t.date === dateKey);
}

export function undatedTodos(todos: Todo[]): Todo[] {
  return todos.filter((t) => !t.date);
}

export function groupedByDay(
  todos: Todo[],
  todayKey: string,
): { today: Todo[]; someday: Todo[]; upcoming: Todo[] } {
  return {
    today: todos.filter((t) => Boolean(t.date) && t.date! <= todayKey),
    someday: undatedTodos(todos),
    upcoming: todos.filter((t) => Boolean(t.date) && t.date! > todayKey),
  };
}

export function sortTodos(todos: Todo[]): Todo[] {
  return [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const ad = a.date ?? '';
    const bd = b.date ?? '';
    if (ad !== bd) return ad < bd ? -1 : 1;
    return a.createdAt - b.createdAt;
  });
}
