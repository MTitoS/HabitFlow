import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { spacing } from '@/theme/spacing';
import { Text } from '@/components/ui/Text';

interface Props {
  title?: string;
  children: ReactNode;
}

export function Section({ title, children }: Props) {
  return (
    <View style={styles.section}>
      {title ? (
        <Text variant="caption" color="textMuted">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
});