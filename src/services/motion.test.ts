import { shouldAnimate } from '@/services/motion';

describe('motion system', () => {
  it('animates when reduced motion is off', () => {
    expect(shouldAnimate(false)).toBe(true);
  });

  it('suppresses motion when prefers-reduced-motion is on', () => {
    expect(shouldAnimate(true)).toBe(false);
  });
});