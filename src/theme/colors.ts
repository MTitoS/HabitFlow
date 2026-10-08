import { ColorToken } from '@/theme/types';

export type ThemeName = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfacePressed: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textOnAccent: string;
  textOnSand: string;
  primary: string;
  primaryEmphasis: string;
  primaryPressed: string;
  primaryDisabled: string;
  secondary: string;
  accent: string;
  accentSecondary: string;
  iconOnTint: string;
  success: string;
  successBright: string;
  warning: string;
  warningInline: string;
  danger: string;
  dangerBright: string;
  dangerSolid: string;
  progressTrack: string;
  progressFill: string;
  overlay: string;
  shadow: string;
  navInactive: string;
  navActivePill: string;
  navActiveIcon: string;
  navActiveLabel: string;
  skipFill: string;
  skipGlyph: string;
  skipDisabledFill: string;
  skipDisabledBorder: string;
  checkboxPendingBorder: string;
  calendarDoneFill: string;
  calendarDoneFg: string;
  calendarSkipFill: string;
  calendarSkipFg: string;
  calendarMissedFill: string;
  calendarMissedFg: string;
  calendarPendingBorder: string;
  calendarTodayRing: string;
  chartDone: string;
  chartSkip: string;
  chartUndone: string;
  onPrimary: string;
  onSecondary: string;
  onSuccess: string;
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

// Reque warm terra/caramelo — mesma base nos 2 temas (spec designer v1).
export const lightColors: ThemeColors = {
  background: '#EADCCE',
  surface: '#EFE8D8',
  surfaceElevated: '#DCBAAE',
  surfacePressed: '#E5DCCC',
  border: '#AB7D4140',
  borderStrong: '#AB7D4180',
  textPrimary: '#491814',
  textSecondary: '#704214',
  textMuted: '#805D55',
  textDisabled: '#8B6B62',
  textOnAccent: '#F8F1E5',
  textOnSand: '#491814',
  primary: '#C3593F',
  primaryEmphasis: '#AD2F21',
  primaryPressed: '#9E2F22',
  primaryDisabled: '#DDB1A6',
  secondary: '#704214',
  accent: '#C3593F',
  accentSecondary: '#704214',
  iconOnTint: '#C3593F',
  success: '#4A6B3E',
  successBright: '#4A6B3E',
  warning: '#8F6512',
  warningInline: '#7A5610',
  danger: '#AD2F21',
  dangerBright: '#AD2F21',
  dangerSolid: '#94291E',
  progressTrack: '#DCCAAE',
  progressFill: '#4A6B3E',
  overlay: '#49181499',
  shadow: '#49181426',
  navInactive: '#8B6B62',
  navActivePill: '#E8D6C6',
  navActiveIcon: '#C3593F',
  navActiveLabel: '#491814',
  skipFill: '#E4D7C0',
  skipGlyph: '#AD2F21',
  skipDisabledFill: '#EFE8D8',
  skipDisabledBorder: '#C6A87D',
  checkboxPendingBorder: '#AB7D4140',
  calendarDoneFill: '#4A6B3E',
  calendarDoneFg: '#F8F1E5',
  calendarSkipFill: '#E4D7C0',
  calendarSkipFg: '#491814',
  calendarMissedFill: '#E8D6C6',
  calendarMissedFg: '#94291E',
  calendarPendingBorder: '#AB7D4166',
  calendarTodayRing: '#C3593F',
  chartDone: '#4A6B3E',
  chartSkip: '#A5763C',
  chartUndone: '#AD2F21',
  onPrimary: '#F8F1E5',
  onSecondary: '#F8F1E5',
  onSuccess: '#F8F1E5',
  habitOrange: '#E8A06C',
  habitAmber: '#D9A84E',
  habitLime: '#B4C36A',
  habitGreen: '#7FAE78',
  habitTeal: '#6FA791',
  habitCyan: '#79A9B5',
  habitBlue: '#7E9CC4',
  habitIndigo: '#8C85B8',
  habitPurple: '#A98BB8',
  habitMagenta: '#C98FB0',
  habitPink: '#D69A9D',
  habitRose: '#CF8683',
  habitBrown: '#A97C4F',
  habitSky: '#8FB3C4',
};

export const darkColors: ThemeColors = {
  background: '#491814',
  surface: '#5D312C',
  surfaceElevated: '#714A43',
  surfacePressed: '#592C27',
  border: '#92726A',
  borderStrong: '#DCBAAE',
  textPrimary: '#EFE8D8',
  textSecondary: '#E8D7C8',
  textMuted: '#E3CABD',
  textDisabled: '#B08980',
  textOnAccent: '#FFFFFF',
  textOnSand: '#491814',
  primary: '#BE563D',
  primaryEmphasis: '#BE563D',
  primaryPressed: '#984230',
  primaryDisabled: '#7E4A3B',
  secondary: '#EFCA93',
  accent: '#DCBAAE',
  accentSecondary: '#EFCA93',
  iconOnTint: '#D9A08C',
  success: '#C69C62',
  successBright: '#EFD6AF',
  warning: '#EFCA93',
  warningInline: '#EFCA93',
  danger: '#AD2F21',
  dangerBright: '#E5CCBD',
  dangerSolid: '#AD2F21',
  progressTrack: '#542621',
  progressFill: '#C69C62',
  overlay: '#491814B3',
  shadow: '#0000004D',
  navInactive: '#E3CABD',
  navActivePill: '#8E4F42',
  navActiveIcon: '#EFE8D8',
  navActiveLabel: '#EFE8D8',
  skipFill: '#DCBAAE',
  skipGlyph: '#491814',
  skipDisabledFill: '#835A53',
  skipDisabledBorder: '#A37C74',
  checkboxPendingBorder: '#DCBAAE',
  calendarDoneFill: '#EFCA93',
  calendarDoneFg: '#491814',
  calendarSkipFill: '#DCBAAE',
  calendarSkipFg: '#491814',
  calendarMissedFill: '#AD2F21',
  calendarMissedFg: '#EFE8D8',
  calendarPendingBorder: '#C39F94',
  calendarTodayRing: '#EFCA93',
  chartDone: '#EFCA93',
  chartSkip: '#DCBAAE',
  chartUndone: '#C0795F',
  onPrimary: '#FFFFFF',
  onSecondary: '#491814',
  onSuccess: '#491814',
  habitOrange: '#D9A57A',
  habitAmber: '#D9B06E',
  habitLime: '#B7C57E',
  habitGreen: '#8CB58A',
  habitTeal: '#7EADA0',
  habitCyan: '#84B0BC',
  habitBlue: '#8CA6CC',
  habitIndigo: '#9892C4',
  habitPurple: '#B497C2',
  habitMagenta: '#CF9DB8',
  habitPink: '#DBA6A8',
  habitRose: '#D49491',
  habitBrown: '#B98D62',
  habitSky: '#9CB9C9',
};

export const colorOf = (theme: ThemeName, token: ColorToken): string =>
  (theme === 'dark' ? darkColors : lightColors)[token];

export const ALL_COLOR_TOKENS: ColorToken[] = [
  'background',
  'surface',
  'surfaceElevated',
  'surfacePressed',
  'border',
  'borderStrong',
  'textPrimary',
  'textSecondary',
  'textMuted',
  'textDisabled',
  'textOnAccent',
  'textOnSand',
  'primary',
  'primaryEmphasis',
  'primaryPressed',
  'primaryDisabled',
  'secondary',
  'accent',
  'accentSecondary',
  'iconOnTint',
  'success',
  'successBright',
  'warning',
  'warningInline',
  'danger',
  'dangerBright',
  'dangerSolid',
  'progressTrack',
  'progressFill',
  'overlay',
  'shadow',
  'navInactive',
  'navActivePill',
  'navActiveIcon',
  'navActiveLabel',
  'skipFill',
  'skipGlyph',
  'skipDisabledFill',
  'skipDisabledBorder',
  'checkboxPendingBorder',
  'calendarDoneFill',
  'calendarDoneFg',
  'calendarSkipFill',
  'calendarSkipFg',
  'calendarMissedFill',
  'calendarMissedFg',
  'calendarPendingBorder',
  'calendarTodayRing',
  'chartDone',
  'chartSkip',
  'chartUndone',
  'onPrimary',
  'onSecondary',
  'onSuccess',
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