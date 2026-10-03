import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text as RNText, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { useTheme } from '@/theme/Provider';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { useBreakpoint } from '@/utils/useBreakpoint';
import { NAV_ITEMS } from '@/components/layout/NavItems';
import { Icon } from '@/components/ui/Icon';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function AppScaffold({ title, children, actions }: Props) {
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const pathname = usePathname();
  const isDesktop = breakpoint === 'desktop';

  const activeFor = (match: string): boolean =>
    match === '/' ? pathname === '/' : pathname.startsWith(match);

  const navigate = (href: string) => {
    router.push(href);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.color('background') }]}
      edges={['top', 'left', 'right']}
    >
      <View style={[styles.row, isDesktop && styles.desktopRow]}>
        {isDesktop ? (
          <View style={[styles.sidebar, { backgroundColor: theme.color('surface') }]}>
            <View style={styles.brand}>
              <RNText style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 24, color: theme.color('textPrimary') }}>
                HabitFlow
              </RNText>
            </View>
            <View style={styles.sideNav}>
              {NAV_ITEMS.map((item) => {
                const active = activeFor(item.match);
                return (
                  <Pressable
                    key={item.href}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                    accessibilityState={{ selected: active }}
                    onPress={() => navigate(item.href)}
                    style={[
                      styles.sideItem,
                      {
                        backgroundColor: active ? theme.color('primary') : 'transparent',
                      },
                    ]}
                  >
                    <Icon name={item.icon} size={18} color={active ? undefined : 'textSecondary'} />
                    <RNText
                      style={{
                        color: active ? '#FFFFFF' : theme.color('textSecondary'),
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                      }}
                    >
                      {item.label}
                    </RNText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={styles.main}>
          <View
            style={[
              styles.header,
              { backgroundColor: theme.color('background'), borderBottomColor: theme.color('border') },
            ]}
          >
            <RNText
              style={{
                fontFamily: 'PlusJakartaSans_700Bold',
                fontSize: 24,
                color: theme.color('textPrimary'),
                flex: 1,
              }}
            >
              {title}
            </RNText>
            {actions}
          </View>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>

      {!isDesktop ? <BottomNav activeFor={activeFor} navigate={navigate} /> : null}
    </SafeAreaView>
  );
}

function BottomNav({
  activeFor,
  navigate,
}: {
  activeFor: (match: string) => boolean;
  navigate: (href: string) => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: theme.color('surface'),
          borderTopColor: theme.color('border'),
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const active = activeFor(item.match);
        return (
          <Pressable
            key={item.href}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: active }}
            hitSlop={4}
            onPress={() => navigate(item.href)}
            style={[styles.tab, { borderTopWidth: 2, borderTopColor: active ? theme.color('primary') : 'transparent' }]}
          >
            <View
              style={[
                styles.tabIcon,
                { backgroundColor: active ? theme.color('primary') : 'transparent' },
              ]}
            >
              <Icon name={item.icon} size={20} color={active ? undefined : 'textMuted'} />
            </View>
            <RNText
              style={{
                fontSize: 10,
                color: active ? theme.color('primary') : theme.color('textMuted'),
                fontFamily: 'Inter_500Medium',
              }}
            >
              {item.label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopRow: {
    paddingTop: 0,
  },
  sidebar: {
    width: 220,
    borderRightWidth: 1,
    borderRightColor: '#E3E6EE',
    paddingVertical: spacing.xl,
  },
  brand: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sideNav: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  main: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: 120,
  },
  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
  },
  tabIcon: {
    width: 36,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});