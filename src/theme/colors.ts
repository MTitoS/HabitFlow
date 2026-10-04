import { ColorToken } from '@/theme/types';

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  habitOrange: string;
  habitAmber: string;
  habitLime: string;
  habitGreen: string;
  habitTeal: string;
  habitCyan: string;
  habitBlue: string;
  habitIndigo: string;
  habitPurple: string;
  habitMagenta: string;
  habitPink: string;
  habitRose: string;
  habitBrown: string;
  habitSky: string;
}

export const lightColors: ThemeColors = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FDFDFF',
  primary: '#5B5BD6',
  secondary: '#7C6FF0',
  accent: '#0FA992',
  success: '#2FA36B',
  danger: '#E5484D',
  textPrimary: '#1B1E28',
  textSecondary: '#4E5566',
  textMuted: '#8B90A0',
  border: '#E3E6EE',
  habitOrange: '#FFA26B',
  habitAmber: '#FFC857',
  habitLime: '#BBD96B',
  habitGreen: '#6FCF7F',
  habitTeal: '#52C9A7',
  habitCyan: '#5FC8DD',
  habitBlue: '#74A9F5',
  habitIndigo: '#8E86FA',
  habitPurple: '#B9A7FF',
  habitMagenta: '#DC8BF3',
  habitPink: '#F58DB0',
  habitRose: '#F58A8A',
  habitBrown: '#C79A6B',
  habitSky: '#8FD0F0',
};

export const darkColors: ThemeColors = {
  background: '#0E1016',
  surface: '#171A22',
  surfaceElevated: '#1F232E',
  primary: '#7C7CF0',
  secondary: '#9A8CFF',
  accent: '#31C3AD',
  success: '#4CC38A',
  danger: '#FF7B7B',
  textPrimary: '#ECEFF5',
  textSecondary: '#B8BDCB',
  textMuted: '#7E8598',
  border: '#262B37',
  habitOrange: '#FFAF7A',
  habitAmber: '#FFD570',
  habitLime: '#CBE687',
  habitGreen: '#83D792',
  habitTeal: '#6FD6B4',
  habitCyan: '#7CD4E8',
  habitBlue: '#8FBDF7',
  habitIndigo: '#A39BFB',
  habitPurple: '#C9BBFF',
  habitMagenta: '#E5A0F6',
  habitPink: '#F8A4C2',
  habitRose: '#F7A0A0',
  habitBrown: '#D0AC7E',
  habitSky: '#9FD8F2',
};

export const colorOf = (theme: ThemeName, token: ColorToken): string =>
  (theme === 'dark' ? darkColors : lightColors)[token];

export const ALL_COLOR_TOKENS: ColorToken[] = [
  'background',
  'surface',
  'surfaceElevated',
  'primary',
  'secondary',
  'accent',
  'success',
  'danger',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'border',
  'habitOrange',
  'habitAmber',
  'habitLime',
  'habitGreen',
  'habitTeal',
  'habitCyan',
  'habitBlue',
  'habitIndigo',
  'habitPurple',
  'habitMagenta',
  'habitPink',
  'habitRose',
  'habitBrown',
  'habitSky',
];