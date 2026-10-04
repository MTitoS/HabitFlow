import { Modal, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { Button } from '@/components/ui/Button';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface Props {
  visible: boolean;
  titles: string[];
  onClose: () => void;
}

export function MilestoneCelebration({ visible, titles, onClose }: Props) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.color('overlay') }]}>
        <View style={[styles.card, { backgroundColor: theme.color('surface'), borderColor: theme.color('border') }]}>
          <RNText style={styles.emoji}>🏆</RNText>
          <RNText style={[styles.title, { color: theme.color('textPrimary') }]}>
            Novo marco alcançado!
          </RNText>
          {titles.map((title) => (
            <RNText key={title} style={{ color: theme.color('textSecondary'), fontSize: 15, textAlign: 'center' }}>
              {title}
            </RNText>
          ))}
          <Button label="Continuar" onPress={onClose} />
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
    fontSize: 64,
  },
  title: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    textAlign: 'center',
  },
});