import { Activity, Archive, Bell, BookOpen, Brain, CalendarDays, ChartColumn, Check, Circle, Clock, Coffee, Database, Droplet, Dumbbell, Flame, Footprints, Heart, Home, Info, Leaf, ListTodo, Minus, Moon, Music, Pencil, Plus, Settings, Star, Sun, Tag, Target, Trophy, X, Zap } from 'lucide-react-native';
import { createElement } from 'react';
import { Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { ColorToken } from '@/theme/types';

const GLYPHS: Record<string, unknown> = {
  activity: Activity,
  archive: Archive,
  bell: Bell,
  book: BookOpen,
  brain: Brain,
  calendar: CalendarDays,
  chart: ChartColumn,
  check: Check,
  circle: Circle,
  clock: Clock,
  coffee: Coffee,
  database: Database,
  droplet: Droplet,
  dumbbell: Dumbbell,
  fire: Flame,
  footprints: Footprints,
  heart: Heart,
  home: Home,
  info: Info,
  leaf: Leaf,
  list: ListTodo,
  minus: Minus,
  moon: Moon,
  music: Music,
  pencil: Pencil,
  plus: Plus,
  settings: Settings,
  star: Star,
  sun: Sun,
  tag: Tag,
  target: Target,
  trophy: Trophy,
  x: X,
  zap: Zap,
};

interface Props {
  name: string;
  size?: number;
  color?: ColorToken | string;
}

export function Icon({ name, size = 20, color = 'textPrimary' }: Props) {
  const theme = useTheme();
  const glyph = GLYPHS[name] as
    | ((props: { size: number; color: string; strokeWidth?: number }) => React.ReactElement)
    | undefined;

  const resolvedColor = typeof color === 'string' && color.startsWith('#') ? color : theme.color(color as ColorToken);

  if (!glyph) {
    return (
      <RNText testID="habit-icon-emoji" style={{ color: resolvedColor, fontSize: size, lineHeight: size + 4 }}>
        {name}
      </RNText>
    );
  }

  return <View testID="habit-icon">{createElement(glyph, { size, color: resolvedColor })}</View>;
}