import { ReactNode } from 'react';
import { Text as RNText } from 'react-native';
import { fonts } from '@/theme/typography';
import { useTheme } from '@/theme/Provider';

type HeadingLevel = 'displayXL' | 'display' | 'headline' | 'title';

const SIZES: Record<HeadingLevel, { fontSize: number; lineHeight: number }> = {
  displayXL: { fontSize: 36, lineHeight: 42 },
  display: { fontSize: 32, lineHeight: 38 },
  headline: { fontSize: 24, lineHeight: 30 },
  title: { fontSize: 20, lineHeight: 26 },
};

interface Props {
  level?: HeadingLevel;
  children: ReactNode;
  color?: 'textPrimary' | 'textSecondary';
}

export function Heading({ level = 'title', children, color = 'textPrimary' }: Props) {
  const theme = useTheme();
  const size = SIZES[level];
  return (
    <RNText
      accessibilityRole="header"
      style={[
        { fontFamily: fonts.heading, color: theme.color(color), fontSize: size.fontSize, lineHeight: size.lineHeight },
      ]}
    >
      {children}
    </RNText>
  );
}