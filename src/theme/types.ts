export type ColorToken =
  | 'background'
  | 'surface'
  | 'surfaceElevated'
  | 'surfacePressed'
  | 'border'
  | 'borderStrong'
  | 'textPrimary'
  | 'textSecondary'
  | 'textMuted'
  | 'textDisabled'
  | 'textOnAccent'
  | 'textOnSand'
  | 'primary'
  | 'primaryEmphasis'
  | 'primaryPressed'
  | 'primaryDisabled'
  | 'secondary'
  | 'accent'
  | 'accentSecondary'
  | 'iconOnTint'
  | 'success'
  | 'successBright'
  | 'warning'
  | 'warningInline'
  | 'danger'
  | 'dangerBright'
  | 'dangerSolid'
  | 'progressTrack'
  | 'progressFill'
  | 'overlay'
  | 'shadow'
  | 'navInactive'
  | 'navActivePill'
  | 'navActiveIcon'
  | 'navActiveLabel'
  | 'skipFill'
  | 'skipGlyph'
  | 'skipDisabledFill'
  | 'skipDisabledBorder'
  | 'checkboxPendingBorder'
  | 'calendarDoneFill'
  | 'calendarDoneFg'
  | 'calendarSkipFill'
  | 'calendarSkipFg'
  | 'calendarMissedFill'
  | 'calendarMissedFg'
  | 'calendarPendingBorder'
  | 'calendarTodayRing'
  | 'onPrimary'
  | 'onSecondary'
  | 'onSuccess'
  | 'habitOrange'
  | 'habitAmber'
  | 'habitLime'
  | 'habitGreen'
  | 'habitTeal'
  | 'habitCyan'
  | 'habitBlue'
  | 'habitIndigo'
  | 'habitPurple'
  | 'habitMagenta'
  | 'habitPink'
  | 'habitRose'
  | 'habitBrown'
  | 'habitSky';

export const HABIT_COLOR_OPTIONS: ColorToken[] = [
  'primary',
  'secondary',
  'accent',
  'success',
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