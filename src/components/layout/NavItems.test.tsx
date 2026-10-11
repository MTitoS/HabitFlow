import { NAV_ITEMS } from '@/components/layout/NavItems';

describe('NavItems (D7)', () => {
  it('replaces Calendário with Tarefas at the 4th position, keeping 5 tabs (Q2/Q5)', () => {
    const labels = NAV_ITEMS.map((i) => i.label);
    expect(labels).toEqual(['Hoje', 'Hábitos', 'Estatísticas', 'Tarefas', 'Ajustes']);
    expect(NAV_ITEMS[3].href).toBe('/todos');
    expect(NAV_ITEMS[3].icon).toBe('squareCheck');
    expect(NAV_ITEMS.some((i) => i.label === 'Calendário')).toBe(false);
  });
});