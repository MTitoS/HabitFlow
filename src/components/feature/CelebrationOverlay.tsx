import { Modal, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { Button } from '@/components/ui/Button';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { useMotion } from '@/services/motion';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CelebrationOverlay({ visible, onClose }: Props) {
  const theme = useTheme();
  const { reducedMotion } = useMotion();

  return (
    <Modal visible={visible} transparent animationType={reducedMotion ? 'none' : 'fade'}>
      <View style={[styles.backdrop, { backgroundColor: theme.color('overlay') }]}>
        <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
          <RNText style={[styles.emoji, reducedMotion && styles.static]}>🎉</RNText>
          <RNText style={[styles.title, { color: theme.color('textPrimary') }]}>
            Dia 100%
          </RNText>
          <RNText style={{ color: theme.color('textSecondary'), textAlign: 'center' }}>
            Você completou todos os hábitos de hoje.
          </RNText>
          <Button label="Aproveitar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  card: {
    borderRadius: radius.modal,
    borderWidth: 1,
    padding: spacing.xxxl,
    gap: spacing.md,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  emoji: {
    fontSize: 72,
  },
  static: {
    opacity: 0.9,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24,
    textAlign: 'center',
  },
});