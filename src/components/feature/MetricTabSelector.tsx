import { Pressable, StyleSheet, Text as RNText } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface Props {
  active: string;
  onChange: (tab: 'active' | 'archived') => void;
}

export function MetricTabSelector({ active, onChange }: Props) {
  const theme = useTheme();
  const options = [
    { value: 'active' as const, label: 'Ativos' },
    { value: 'archived' as const, label: 'Arquivados' },
  ];
  return (
    <Pressable
      accessibilityRole="tablist"
      style={[styles.row, { backgroundColor: theme.color('surfaceElevated') }]}
    >
      {options.map((option) => {
        const selected = active === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={[
              styles.tab,
              {
                backgroundColor: selected ? theme.color('surface') : 'transparent',
                borderColor: selected ? theme.color('primary') : 'transparent',
              },
            ]}
          >
            <RNText
              style={{
                color: selected ? theme.color('primary') : theme.color('textSecondary'),
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
              }}
            >
              {option.label}
            </RNText>
          </Pressable>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 4,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});