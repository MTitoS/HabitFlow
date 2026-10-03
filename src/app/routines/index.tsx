import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feature/EmptyState';
import { spacing } from '@/theme/spacing';

export default function RoutinesScreen() {
  const theme = useTheme();
  const { routines, habits } = useData();
  const sorted = routines.slice().sort((a, b) => a.order - b.order);

  return (
    <AppScaffold
      title="Rotinas"
      actions={<Button label="Nova rotina" onPress={() => router.push('/routines/create')} />}
    >
      {sorted.length === 0 ? (
        <EmptyState kind="no-habits" onAction={() => router.push('/routines/create')} />
      ) : (
        <View style={styles.list}>
          {sorted.map((routine) => {
            const count = habits.filter((h) => h.routineId === routine.id).length;
            return (
              <Pressable
                key={routine.id}
                accessibilityRole="button"
                accessibilityLabel={routine.name}
                onPress={() => router.push(`/routines/${routine.id}/edit`)}
                style={[styles.item, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}
              >
                <View style={styles.info}>
                  <RNText style={{ color: theme.color('textPrimary'), fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>
                    {routine.name}
                  </RNText>
                  <RNText style={{ color: theme.color('textMuted'), fontSize: 13 }}>
                    {count} hábito{count === 1 ? '' : 's'} · ordem {routine.order}
                  </RNText>
                </View>
                <RNText style={{ color: theme.color('textMuted') }}>›</RNText>
              </Pressable>
            );
          })}
        </View>
      )}
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  info: { flex: 1, gap: 2 },
});
