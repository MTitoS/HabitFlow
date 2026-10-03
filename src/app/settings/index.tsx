import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { spacing } from '@/theme/spacing';

const ITEMS = [
  { href: '/routines', label: 'Rotinas', icon: '🏷️' },
  { href: '/settings/appearance', label: 'Aparência', icon: '🌗' },
  { href: '/settings/notifications', label: 'Notificações', icon: '🔔' },
  { href: '/settings/defaults', label: 'Padrões', icon: '⚙️' },
  { href: '/settings/data', label: 'Dados', icon: '🗂️' },
  { href: '/settings/about', label: 'Sobre', icon: 'ℹ️' },
];

export default function SettingsScreen() {
  const theme = useTheme();
  return (
    <AppScaffold title="Ajustes">
      <View style={styles.list}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.href}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => router.push(item.href)}
            style={[styles.item, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}
          >
            <RNText style={styles.emoji}>{item.icon}</RNText>
            <RNText style={{ color: theme.color('textPrimary'), fontFamily: 'Inter_500Medium', fontSize: 15 }}>
              {item.label}
            </RNText>
            <RNText style={{ color: theme.color('textMuted') }}>›</RNText>
          </Pressable>
        ))}
      </View>
    </AppScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
  },
  emoji: {
    fontSize: 20,
  },
});