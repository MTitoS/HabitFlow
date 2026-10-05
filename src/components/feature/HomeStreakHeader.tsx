import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { Icon } from '@/components/ui/Icon';
import { MotivationalPhrase } from '@/config/motivationalPhrases';

interface Props {
  streak: number;
  phrase: MotivationalPhrase;
}

export function HomeStreakHeader({ streak, phrase }: Props) {
  const theme = useTheme();
  const label = streak === 1 ? 'dia seguido' : 'dias seguidos';

  return (
    <View
      accessibilityLabel={`Sequência geral: ${streak} ${label}. Frase do dia, ${phrase.author}: ${phrase.text}`}
      style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}
    >
      <View style={styles.row}>
        <Icon name="fire" size={20} color="accent" />
        <RNText style={[styles.value, { color: theme.color('textPrimary') }]}>{streak}</RNText>
        <RNText numberOfLines={1} style={[styles.label, { color: theme.color('textSecondary') }]}>
          {label}
        </RNText>
      </View>
      <RNText numberOfLines={1} style={[styles.phrase, { color: theme.color('textSecondary') }]}>
        {phrase.text}
      </RNText>
      <RNText numberOfLines={1} style={[styles.author, { color: theme.color('textMuted') }]}>
        {phrase.author}
      </RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 20,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  phrase: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  author: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
});
