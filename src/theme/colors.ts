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
];