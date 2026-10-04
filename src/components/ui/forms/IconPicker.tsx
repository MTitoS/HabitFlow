import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { Icon } from '@/components/ui/Icon';

export const HABIT_ICON_PRESET = [
  'droplet',
  'fire',
  'book',
  'footprints',
  'brain',
  'dumbbell',
  'moon',
  'sun',
  'heart',
  'target',
] as const;

export type HabitIconName = (typeof HABIT_ICON_PRESET)[number];

interface Props {
  label: string;
  value?: string;
  onChange: (name: string) => void;
}

export function IconPicker({ label, value, onChange }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <View style={styles.row}>
        {HABIT_ICON_PRESET.map((name) => {
          const selected = name === value;
          return (
            <Pressable
              key={name}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={name}
              onPress={() => onChange(name)}
              style={[
                styles.swatch,
                {
                  backgroundColor: selected ? theme.color('primaryEmphasis') : theme.color('surface'),
                  borderColor: selected ? theme.color('primaryEmphasis') : theme.color('border'),
                },
              ]}
            >
              <Icon name={name} size={22} color={selected ? 'onPrimary' : 'secondary'} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});