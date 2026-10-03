import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { Button } from '@/components/ui/Button';

export type EmptyKind = 'no-habits' | 'all-done' | 'no-stats' | 'nothing-today';

const COPY: Record<EmptyKind, { emoji: string; title: string; body: string; action?: string }> = {
  'no-habits': {
    emoji: '🌱',
    title: 'Comece um hábito',
    body: 'Crie seu primeiro hábito para ver seu progresso crescer.',
    action: 'Criar hábito',
  },
  'all-done': {
    emoji: '🎉',
    title: 'Você completou tudo hoje!',
    body: 'Nenhum hábito pendente. Aproveite o momento.',
  },
  'no-stats': {
    emoji: '📊',
    title: 'Sem estatísticas ainda',
    body: 'Complete alguns hábitos para começar a ver gráficos e sequências.',
  },
  'nothing-today': {
    emoji: '🌙',
    title: 'Nada programado para hoje',
    body: 'Seus hábitos de hoje aparecerão aqui.',
  },
};

interface Props {
  kind: EmptyKind;
  onAction?: () => void;
}

export function EmptyState({ kind, onAction }: Props) {
  const theme = useTheme();
  const copy = COPY[kind];
  return (
    <View style={[styles.container, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
      <RNText style={styles.emoji}>{copy.emoji}</RNText>
      <RNText style={[styles.title, { color: theme.color('textPrimary') }]}>{copy.title}</RNText>
      <RNText style={[styles.body, { color: theme.color('textSecondary') }]}>{copy.body}</RNText>
      {copy.action && onAction ? (
        <View style={styles.action}>
          <Button label={copy.action} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.color('surface'), borderColor: theme.color('danger') }]}>
      <RNText style={styles.emoji}>⚠️</RNText>
      <RNText style={[styles.title, { color: theme.color('textPrimary') }]}>Algo deu errado</RNText>
      <RNText style={[styles.body, { color: theme.color('textSecondary') }]}>{message}</RNText>
      {onRetry ? (
        <View style={styles.action}>
          <Button label="Tentar novamente" onPress={onRetry} variant="ghost" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xxxl,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.sm,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    textAlign: 'center',
  },
  action: {
    marginTop: spacing.md,
  },
});