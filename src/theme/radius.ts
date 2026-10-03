export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  card: 20,
  modal: 28,
  input: 14,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;