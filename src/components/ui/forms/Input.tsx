import { StyleSheet, Text as RNText, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, multiline, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.color('textMuted')}
        multiline={multiline}
        style={[
          styles.input,
          {
            color: theme.color('textPrimary'),
            backgroundColor: theme.color('surface'),
            borderColor: error ? theme.color('danger') : theme.color('border'),
            fontFamily: 'Inter_400Regular',
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <RNText style={[styles.hint, { color: theme.color('danger') }]}>{error}</RNText>
      ) : hint ? (
        <RNText style={[styles.hint, { color: theme.color('textMuted') }]}>{hint}</RNText>
      ) : null}
    </View>
  );
}

export function Textarea(props: Props) {
  return <Input {...props} multiline numberOfLines={4} />;
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 48,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
});