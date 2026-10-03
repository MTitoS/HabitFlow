import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text as RNText, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '@/theme/Provider';
import { ToastProvider } from '@/components/ui/Toast';
import { MotionProvider } from '@/services/motion';
import { DataProvider, useData } from '@/data/DataProvider';
import { useAppFonts } from '@/services/fonts';
import { NotificationSync } from '@/services/notifications/NotificationSync';

export default function RootLayout() {
  const { fontsLoaded } = useAppFonts();

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <DataProvider>
          <MotionProvider>
            <ToastProvider>
              <StatusBar style="auto" />
              <NotificationSync />
              {fontsLoaded ? <Slot /> : <SplashScreen />}
            </ToastProvider>
          </MotionProvider>
        </DataProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function SplashScreen() {
  const theme = useTheme();
  const { loading } = useData();
  return (
    <View
      style={[styles.splash, { backgroundColor: theme.color('background') }]}
      accessibilityLabel="Carregando o app"
    >
      <RNText style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 32, color: theme.color('textPrimary') }}>
        HabitFlow
      </RNText>
      {loading ? <ActivityIndicator color={theme.color('primary')} style={styles.spinner} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginTop: 24,
  },
});