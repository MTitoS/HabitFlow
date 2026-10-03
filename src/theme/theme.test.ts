import { ALL_COLOR_TOKENS, darkColors, lightColors } from '@/theme/tokens';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { typeScale } from '@/theme/typography';
import { ColorToken } from '@/theme/types';

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('theme tokens', () => {
  it('defines every semantic token in BOTH light and dark', () => {
    for (const token of ALL_COLOR_TOKENS as ColorToken[]) {
      const light = lightColors[token];
      const dark = darkColors[token];
      expect(light).toBeTruthy();
      expect(dark).toBeTruthy();
      expect(light.startsWith('#')).toBe(true);
      expect(dark.startsWith('#')).toBe(true);
    }
  });

  it('dark is not a straightforward inversion of light', () => {
    expect(darkColors.background).not.toBe(lightColors.surface);
    expect(darkColors.surface).not.toBe(lightColors.background);
  });

  it('textPrimary contrast over background is accessible (>= 4.5)', () => {
    expect(contrastRatio(lightColors.textPrimary, lightColors.background)).toBeGreaterThanOrEqual(
      4.5,
    );
    expect(contrastRatio(darkColors.textPrimary, darkColors.background)).toBeGreaterThanOrEqual(4.5);
  });

  it('textSecondary over surface is still readable', () => {
    expect(contrastRatio(lightColors.textSecondary, lightColors.surface)).toBeGreaterThanOrEqual(
      3,
    );
    expect(contrastRatio(darkColors.textSecondary, darkColors.surface)).toBeGreaterThanOrEqual(3);
  });

  it('spacing scale covers 4..64', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.enormous).toBe(64);
  });

  it('radius has card 20, modal 28, input 14 and pill', () => {
    expect(radius.card).toBe(20);
    expect(radius.modal).toBe(28);
    expect(radius.input).toBe(14);
    expect(radius.pill).toBeGreaterThanOrEqual(900);
  });

  it('typography scale has display..caption', () => {
    for (const key of ['displayXL', 'headline', 'title', 'body', 'caption']) {
      expect(typeScale[key].fontSize).toBeGreaterThan(0);
    }
  });
});