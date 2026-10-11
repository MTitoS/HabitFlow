import { useState } from 'react';
import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import {
  DateTimePicker as NativePicker,
  DateTimePickerChangeEvent,
} from '@expo/ui/community/datetime-picker';
import { useTheme } from '@/theme/Provider';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { formatDateKeyPtBR, parseDateKey, toDateKey } from '@/domain/date/dateUtils';

interface Props {
  label: string;
  value?: string;
  onChange: (dateKey: string) => void;
}

export function DatePicker({ label, value, onChange }: Props) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const display = value ? formatDateKeyPtBR(value) : 'Algum dia';

  const handleChange = (event: DateTimePickerChangeEvent, date: Date) => {
    setOpen(false);
    void event;
    onChange(toDateKey(date));
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <RNText style={[styles.label, { color: theme.color('textSecondary') }]}>{label}</RNText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Abre o calendário para escolher a data"
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: theme.color('surface'), borderColor: theme.color('border') },
        ]}
      >
        <RNText
          style={[
            styles.fieldText,
            { color: value ? theme.color('textPrimary') : theme.color('textMuted') },
          ]}
        >
          {display}
        </RNText>
      </Pressable>
      {open ? (
        <NativePicker
          value={value ? parseDateKey(value) : new Date()}
          mode="date"
          presentation="dialog"
          positiveButton={{ label: 'OK' }}
          negativeButton={{ label: 'Cancelar' }}
          onValueChange={handleChange}
          onDismiss={handleDismiss}
          testID="todo-date-picker"
        />
      ) : null}
    </View>
  );
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
  field: {
    minHeight: 48,
    borderRadius: radius.input,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  fieldText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 22,
  },
});