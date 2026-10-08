import { Pressable, StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { CalendarDayInfo } from '@/domain/streak/overallStreak';

interface Props {
  dateKey: string;
  info?: CalendarDayInfo;
  isToday: boolean;
  onPress: (dateKey: string) => void;
}

export function CalendarDayCell({ dateKey, info, isToday, onPress }: Props) {
  const theme = useTheme();
  const scheduled = info?.scheduled ?? 0;
  const done = info?.done ?? 0;
  const skipped = info?.skipped ?? 0;
  const mark = info?.mark ?? 'pending';
  const dayNumber = Number(dateKey.slice(8));

  let symbol: string | null = null;
  let backgroundColor = 'transparent';
  let color = theme.color('textSecondary');
  let label: string;

  if (scheduled === 0) {
    color = theme.color('textMuted');
    label = `${dateKey}: Sem hábitos`;
  } else if (mark === 'conquered') {
    symbol = '✓';
    backgroundColor = theme.color('calendarDoneFill');
    color = theme.color('calendarDoneFg');
    label = `${dateKey}: Vencido (${done + skipped}/${scheduled})`;
  } else if (mark === 'partial') {
    symbol = '◐';
    backgroundColor = theme.color('calendarSkipFill');
    color = theme.color('calendarSkipFg');
    label = `${dateKey}: Parcial (${done}/${scheduled})`;
  } else if (mark === 'skip') {
    color = theme.color('accent');
    label = `${dateKey}: Com pulados (${skipped} pulado${skipped === 1 ? '' : 's'})`;
  } else {
    label = `${dateKey}: Pendente`;
  }

  const showSkip = scheduled > 0 && mark !== 'conquered' && skipped > 0;

  return (
    <Pressable
      testID={`cal-day-${dateKey}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => onPress(dateKey)}
      style={[
        styles.cell,
        isToday && { borderWidth: 2, borderColor: theme.color('calendarTodayRing'), borderRadius: 8 },
        scheduled > 0 &&
          mark === 'pending' && {
            borderWidth: 1,
            borderColor: theme.color('calendarPendingBorder'),
            borderRadius: 8,
          },
      ]}
    >
      <View style={[styles.day, { backgroundColor }]}>
        <RNText style={{ color, fontSize: 12, fontWeight: '600' }}>{symbol ?? dayNumber}</RNText>
        {showSkip ? (
          <View
            testID={`cal-skip-${dateKey}`}
            style={[styles.skipMark, { backgroundColor: theme.color('accent') }]}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipMark: {
    position: 'absolute',
    bottom: 4,
    width: '55%',
    height: 2,
    borderRadius: 1,
  },
});
