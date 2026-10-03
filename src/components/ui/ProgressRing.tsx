import { ColorValue, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/theme/Provider';
import { ColorToken } from '@/theme/types';

interface Props {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: ColorToken;
  label?: string;
}

export function ProgressRing({
  progress,
  size = 96,
  strokeWidth = 8,
  color = 'primary',
  label,
}: Props) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * clamped;

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
      style={{ width: size, height: size }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          position: 'absolute',
          backgroundColor: theme.color('surfaceElevated'),
          borderWidth: 1,
          borderColor: theme.color('border'),
        }}
      />
      <ProgressSvg
        size={size}
        strokeWidth={strokeWidth}
        radius={radius}
        circumference={circumference}
        dash={dash}
        fill={theme.color(color)}
        track={theme.color('border')}
      />
    </View>
  );
}

function ProgressSvg({
  size,
  strokeWidth,
  radius,
  circumference,
  dash,
  fill,
  track,
}: {
  size: number;
  strokeWidth: number;
  radius: number;
  circumference: number;
  dash: number;
  fill: ColorValue;
  track: ColorValue;
}) {
  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={track}
        strokeWidth={strokeWidth}
        fill="transparent"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={fill}
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference - dash}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </Svg>
  );
}