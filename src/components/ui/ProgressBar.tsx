import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { ColorToken } from '@/theme/types';

interface Props {
  progress: number;
  color?: ColorToken;
  label?: string;
  height?: number;
}

export function ProgressBar({ progress, color = 'progressFill', label, height = 8 }: Props) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'progresso'}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.round(clamped * 100),
        text: `${Math.round(clamped * 100)}%`,
      }}
      style={[
        styles.track,
        { height, backgroundColor: theme.color('progressTrack') },
      ]}
    >
      <View
        style={[
          styles.fill,
          { width: `${clamped * 100}%`, backgroundColor: theme.color(color) },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
    height: '100%',
  },
});