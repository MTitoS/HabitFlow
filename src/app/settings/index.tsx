import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { spacing } from '@/theme/spacing';
import { Icon } from '@/components/ui/Icon';

const ITEMS = [
  { href: '/routines', label: 'Rotinas', icon: 'tag' },
  { href: '/settings/appearance', label: 'Aparência', icon: 'moon' },
  { href: '/settings/notifications', label: 'Notificações', icon: 'bell' },
  { href: '/settings/defaults', label: 'Padrões', icon: 'settings' },
  { href: '/settings/data', label: 'Dados', icon: 'database' },
  { href: '/settings/about', label: 'Sobre', icon: 'info' },
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
            <Icon name={item.icon} size={20} color="textSecondary" />
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
});