export interface NavItem {
  href: string;
  label: string;
  icon: string;
  match: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Hoje', icon: 'home', match: '/' },
  { href: '/habits', label: 'Hábitos', icon: 'list', match: '/habits' },
  { href: '/statistics', label: 'Estatísticas', icon: 'chart', match: '/statistics' },
  { href: '/calendar', label: 'Calendário', icon: 'calendar', match: '/calendar' },
  { href: '/settings', label: 'Ajustes', icon: 'settings', match: '/settings' },
];