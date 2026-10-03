export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  bigger: 48,
  enormous: 64,
} as const;

export type SpacingToken = keyof typeof spacing;

export function space(token: SpacingToken): number {
  return spacing[token];
}