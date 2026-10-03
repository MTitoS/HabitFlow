import { useFonts } from 'expo-font';
import { Platform } from 'react-native';
import {
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

const FONT_MAP = {
  PlusJakartaSans_800ExtraBold,
  PlusJakartaSans_700Bold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
};

export function useAppFonts(): { fontsLoaded: boolean; fontError: Error | null } {
  const [loaded, error] = useFonts(Platform.OS === 'web' ? {} : FONT_MAP);
  if (Platform.OS === 'web') {
    return { fontsLoaded: true, fontError: null };
  }
  return { fontsLoaded: loaded, fontError: error };
}