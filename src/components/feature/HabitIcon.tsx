import { Icon } from '@/components/ui/Icon';
import { ColorToken } from '@/theme/types';

export function HabitIcon({ name, color, size = 20 }: { name: string; color: ColorToken; size?: number }) {
  return <Icon name={name} size={size} color={color} />;
}