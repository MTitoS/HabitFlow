import {
  groupedByDay,
  isOverdue,
  sortTodos,
  Todo,
  todosForDay,
  undatedTodos,
  validateTodoTitle,
} from '@/domain/todo/model';

function todo(over: Partial<Todo> = {}): Todo {
  return {
    id: 't1',
    title: 'Tarefa',
    completed: false,
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

const TODAY = '2026-05-05';

describe('validateTodoTitle', () => {
  it('rejects empty and whitespace-only titles', () => {
    expect(validateTodoTitle('')).toBe(false);
    expect(validateTodoTitle('   ')).toBe(false);
  });

  it('accepts a non-empty trimmed title', () => {
    expect(validateTodoTitle('Comprar leite')).toBe(true);
  });
});

describe('isOverdue', () => {
  it('is true only for an uncompleted todo dated before today', () => {
    expect(isOverdue(todo({ date: '2026-05-04' }), TODAY)).toBe(true);
    expect(isOverdue(todo({ date: '2026-05-04', completed: true }), TODAY)).toBe(false);
    expect(isOverdue(todo({ date: TODAY }), TODAY)).toBe(false);
    expect(isOverdue(todo({ date: '2026-05-06' }), TODAY)).toBe(false);
    expect(isOverdue(todo({}), TODAY)).toBe(false);
  });
});

describe('groupedByDay', () => {
  it('separates today, someday and upcoming', () => {
    const todayTodo = todo({ id: 'a', date: TODAY });
    const someday = todo({ id: 'b' });
    const upcoming = todo({ id: 'c', date: '2026-05-09' });
    const groups = groupedByDay([todayTodo, someday, upcoming], TODAY);
    expect(groups.today.map((t) => t.id)).toEqual(['a']);
    expect(groups.someday.map((t) => t.id)).toEqual(['b']);
    expect(groups.upcoming.map((t) => t.id)).toEqual(['c']);
  });

  it('puts an uncompleted overdue todo in today (Q15)', () => {
    const overdue = todo({ id: 'late', date: '2026-05-01' });
    expect(groupedByDay([overdue], TODAY).today.map((t) => t.id)).toEqual(['late']);
  });

  it('keeps a completed todo dated today in today (Q14)', () => {
    const done = todo({ id: 'done', date: TODAY, completed: true });
    expect(groupedByDay([done], TODAY).today.map((t) => t.id)).toEqual(['done']);
  });

  it('keeps a completed past todo visible in today, not dropped', () => {
    const doneLate = todo({ id: 'doneLate', date: '2026-05-01', completed: true });
    const groups = groupedByDay([doneLate], TODAY);
    expect(groups.today.map((t) => t.id)).toEqual(['doneLate']);
    expect(groups.upcoming).toHaveLength(0);
  });
});

describe('todosForDay / undatedTodos', () => {
  it('filters by exact date and by absence of date', () => {
    const a = todo({ id: 'a', date: '2026-05-05' });
    const b = todo({ id: 'b', date: '2026-05-06' });
    const c = todo({ id: 'c' });
    expect(todosForDay([a, b, c], '2026-05-05').map((t) => t.id)).toEqual(['a']);
    expect(undatedTodos([a, b, c]).map((t) => t.id)).toEqual(['c']);
  });
});

describe('sortTodos', () => {
  it('places completed last and orders by createdAt asc within a group', () => {
    const late = todo({ id: 'late', createdAt: 30 });
    const early = todo({ id: 'early', createdAt: 10 });
    const done = todo({ id: 'done', completed: true, createdAt: 5 });
    expect(sortTodos([done, late, early]).map((t) => t.id)).toEqual(['early', 'late', 'done']);
  });

  it('orders dated before the same-completion undated by date asc', () => {
    const day2 = todo({ id: 'd2', date: '2026-05-06', createdAt: 1 });
    const day1 = todo({ id: 'd1', date: '2026-05-05', createdAt: 9 });
    expect(sortTodos([day2, day1]).map((t) => t.id)).toEqual(['d1', 'd2']);
  });
});
