import { useState } from 'react';
import { StyleSheet, Text as RNText, View } from 'react-native';
import { useTheme } from '@/theme/Provider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/forms/Input';
import { Select } from '@/components/ui/forms/Select';
import { ColorPicker } from '@/components/ui/forms/ColorPicker';
import { IconPicker } from '@/components/ui/forms/IconPicker';
import { Checkbox, Switch } from '@/components/ui/forms/Controls';
import { TimePicker } from '@/components/ui/forms/TimePicker';
import { Habit, HabitType, PredefinedUnit, FrequencyKind } from '@/domain/habit/model';
import { ColorToken } from '@/theme/types';
import { validateHabit } from '@/domain/habit/validateHabit';
import { WEEKDAY_KEYS, WEEKDAY_LABELS, Weekday } from '@/domain/date/dateUtils';
import { spacing } from '@/theme/spacing';

export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;

const UNITS: PredefinedUnit[] = [
  'vezes',
  'minutos',
  'horas',
  'paginas',
  'litros',
  'ml',
  'passos',
  'km',
  'repeticoes',
  'sessoes',
];

interface Props {
  initial?: Habit;
  defaults?: { icon?: string; color?: string; frequencyKind?: string };
  routineOptions: { label: string; value: string }[];
  onSubmit: (draft: HabitDraft) => Promise<void>;
}

export function HabitForm({ initial, defaults, routineOptions, onSubmit }: Props) {
  const theme = useTheme();
  const [advanced, setAdvanced] = useState(Boolean(initial?.routineId || initial?.scheduledTime));

  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? defaults?.icon ?? 'fire');
  const [color, setColor] = useState<ColorToken>(initial?.color ?? (defaults?.color as ColorToken) ?? 'primary');
  const [type, setType] = useState<HabitType>(initial?.type ?? 'binary');
  const [targetValue, setTargetValue] = useState(initial?.targetValue?.toString() ?? '');
  const [unit, setUnit] = useState<PredefinedUnit | ''>(initial?.unit ?? '');
  const [customUnit, setCustomUnit] = useState(initial?.customUnit ?? '');
  const [frequencyKind, setFrequencyKind] = useState<FrequencyKind>(() =>
    isFrequencyKind(initial?.frequency.kind ?? defaults?.frequencyKind)
      ? (initial?.frequency.kind ?? (defaults?.frequencyKind as FrequencyKind))
      : 'daily',
  );
  const [days, setDays] = useState<Weekday[]>(initial?.frequency.schedule.days ?? []);
  const [countPerPeriod, setCountPerPeriod] = useState(initial?.frequency.schedule.countPerPeriod ?? 3);
  const [routineId, setRoutineId] = useState(initial?.routineId ?? '');
  const [scheduledTime, setScheduledTime] = useState(initial?.scheduledTime);
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminder?.enabled ?? false);
  const [reminderTimes, setReminderTimes] = useState<string[]>(initial?.reminder?.times ?? []);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = (day: Weekday) => {
    setDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day],
    );
  };

  const toggleReminderTime = (time: string) => {
    setReminderTimes((current) =>
      current.includes(time) ? current.filter((t) => t !== time) : [...current, time],
    );
  };

  const buildDraft = (): HabitDraft | null => {
    const typeValue = targetValue.trim() === '' ? undefined : Number(targetValue);
    const draft: HabitDraft = {
      name: name.trim(),
      description: description || undefined,
      icon,
      color,
      type,
      targetValue: type === 'quantitative' ? typeValue : undefined,
      unit: type === 'quantitative' && unit ? unit : undefined,
      customUnit: type === 'quantitative' && customUnit.trim() ? customUnit.trim() : undefined,
      frequency: {
        kind: frequencyKind,
        schedule:
          frequencyKind === 'weekdays'
            ? { days }
            : frequencyKind === 'daily'
              ? {}
              : { countPerPeriod },
      },
      routineId: routineId || undefined,
      scheduledTime,
      reminder:
        reminderEnabled && reminderTimes.length > 0
          ? { enabled: true, times: reminderTimes }
          : undefined,
    };

    if (draft.type === 'quantitative' && draft.unit && draft.customUnit) {
      draft.customUnit = undefined;
    }

    return draft;
  };

  const handleSubmit = async () => {
    const draft = buildDraft();
    if (!draft) return;
    const validation = validateHabit(draft);
    if (!validation.ok) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setError(null);
    try {
      await onSubmit(draft);
    } catch {
      setError('Não foi possível salvar. Tente novamente.');
    }
  };

  return (
    <View style={styles.wrapper}>
      <Input label="Nome" placeholder="Ex.: Beber água" value={name} onChangeText={setName} />
      <Input label="Ícone customizado (opcional)" placeholder="💧 ou nome lucide" value={icon} onChangeText={setIcon} />
      <IconPicker label="Ícone" value={icon} onChange={setIcon} />
      <ColorPicker label="Cor" value={color} onChange={setColor} />
      <Select
        label="Tipo"
        options={[
          { label: 'Binário (sim/não)', value: 'binary' },
          { label: 'Quantitativo (meta)', value: 'quantitative' },
        ]}
        value={type}
        onChange={setType}
      />

      {type === 'quantitative' ? (
        <View style={styles.branch}>
          <Input label="Meta por dia" placeholder="Ex.: 8" value={targetValue} onChangeText={setTargetValue} keyboardType="numeric" />
          <Select
            label="Unidade"
            options={[
              { label: '—', value: '' },
              ...UNITS.map((u) => ({ label: u, value: u })),
            ]}
            value={unit}
            onChange={(v) => setUnit(v as PredefinedUnit | '')}
          />
          <Input label="Ou unidade customizada" placeholder="Ex.: copos" value={customUnit} onChangeText={setCustomUnit} />
        </View>
      ) : null}

      <View style={styles.branch}>
        <Select
          label="Frequência"
          options={[
            { label: 'Todos os dias', value: 'daily' },
            { label: 'Dias específicos', value: 'weekdays' },
            { label: 'Por semana', value: 'x_per_week' },
            { label: 'Por mês', value: 'x_per_month' },
          ]}
          value={frequencyKind}
          onChange={setFrequencyKind}
        />

        {frequencyKind === 'weekdays' ? (
          <View style={styles.daysGrid}>
            {WEEKDAY_KEYS.map((day) => (
              <Checkbox
                key={day}
                label={WEEKDAY_LABELS[day]}
                checked={days.includes(day)}
                onChange={() => toggleDay(day)}
              />
            ))}
          </View>
        ) : null}

        {frequencyKind === 'x_per_week' || frequencyKind === 'x_per_month' ? (
          <Select
            label={frequencyKind === 'x_per_week' ? 'Vezes por semana' : 'Vezes por mês'}
            options={[1, 2, 3, 4, 5, 6, 7].map((n) => ({ label: `${n}`, value: n }))}
            value={countPerPeriod}
            onChange={setCountPerPeriod}
          />
        ) : null}
      </View>

      <Button
        label={advanced ? 'Ocultar opções' : 'Opções avançadas'}
        onPress={() => setAdvanced(!advanced)}
        variant="ghost"
      />

      {advanced ? (
        <View style={styles.branch}>
          <Input label="Descrição (opcional)" placeholder="Notas sobre este hábito" value={description} onChangeText={setDescription} />
          <Select
            label="Rotina"
            options={[{ label: 'Sem rotina', value: '' }, ...routineOptions]}
            value={routineId}
            onChange={setRoutineId}
          />
          <TimePicker label="Horário no dia" value={scheduledTime} onChange={setScheduledTime} allowNone />
          <Switch label="Lembrar de completar" checked={reminderEnabled} onChange={setReminderEnabled} />
          {reminderEnabled ? (
            <View style={styles.daysGrid}>
              {['06:00', '08:00', '12:00', '18:00', '20:00', '22:00'].map((time) => (
                <Checkbox
                  key={time}
                  label={time}
                  checked={reminderTimes.includes(time)}
                  onChange={() => toggleReminderTime(time)}
                />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {error ? <RNText style={{ color: theme.color('danger') }}>{error}</RNText> : null}
      <Button label="Salvar hábito" onPress={() => void handleSubmit()} />
    </View>
  );
}

function isFrequencyKind(value: string | undefined): value is FrequencyKind {
  return value === 'daily' || value === 'weekdays' || value === 'x_per_week' || value === 'x_per_month';
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.lg,
  },
  branch: {
    gap: spacing.md,
  },
  daysGrid: {
    gap: 4,
  },
});