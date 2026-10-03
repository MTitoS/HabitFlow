import { Activity, BookOpen, Brain, Clock, Coffee, Droplet, Dumbbell, Flame, Footprints, Heart, Leaf, Moon, Music, Pencil, Star, Sun, Trophy, Zap } from 'lucide-react-native';
import { Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { ColorToken } from '@/theme/types';

const GLYPHS: Record<string, unknown> = {
  activity: Activity,
  book: BookOpen,
  brain: Brain,
  clock: Clock,
  coffee: Coffee,
  droplet: Droplet,
  dumbbell: Dumbbell,
  fire: Flame,
  footprints: Footprints,
  heart: Heart,
  leaf: Leaf,
  moon: Moon,
  music: Music,
  pencil: Pencil,
  star: Star,
  sun: Sun,
  trophy: Trophy,
  zap: Zap,
};

interface Props {
  name: string;
  size?: number;
  color?: ColorToken;
}

export function Icon({ name, size = 20, color = 'textPrimary' }: Props) {
  const theme = useTheme();
  const glyph = GLYPHS[name] as
    | ((props: { size: number; color: string; strokeWidth?: number }) => React.ReactElement)
    | undefined;

  if (!glyph) {
    return (
      <RNText testID="habit-icon-emoji" style={{ fontSize: size, lineHeight: size + 4 }}>
        {name}
      </RNText>
    );
  }

  return <View testID="habit-icon">{glyph({ size, color: theme.color(color) })}</View>;
}