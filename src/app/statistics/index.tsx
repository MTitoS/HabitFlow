import { StyleSheet, Text as RNText, View } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/theme/Provider';
import { useData } from '@/data/DataProvider';
import { useToast } from '@/components/ui/Toast';
import { AppScaffold } from '@/components/layout/AppScaffold';
import { WeeklyChart } from '@/components/feature/dashboard/WeeklyChart';
import { StreakCard } from '@/components/feature/dashboard/StreakCard';
import { CompletionChart } from '@/components/feature/dashboard/CompletionChart';
import { MonthView } from '@/components/feature/dashboard/MonthView';
import { CalendarDetail } from '@/components/feature/CalendarDetail';
import { EmptyState } from '@/components/feature/EmptyState';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { daySummary, monthlySeries, totals, weeklySeries } from '@/domain/stats/aggregate';
import { monthDayStatus } from '@/domain/streak/overallStreak';
import { triggerSuccess } from '@/services/haptics';

export default function StatisticsScreen() {
  const theme = useTheme();
  const { habits, records, todos, repos } = useData();
  const { showToast } = useToast();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const now = new Date();
  const summary = daySummary(habits, records, now);
  const week = weeklySeries(habits, records, now);
  const month = monthlySeries(habits, records, now);
  const total = totals(habits, records);

  const active = habits.filter((h) => !h.archivedAt);

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    try {
      if (todo.completed) {
        await repos.todos.setUncompleted(id);
        showToast('info', 'Tarefa marcada como não concluída');
      } else {
        await repos.todos.setCompleted(id, new Date().getTime());
        await triggerSuccess();
        showToast('success', 'Tarefa concluída');
      }
    } catch {
      showToast('error', 'Não foi possível atualizar agora');
    }
  };

  if (active.length === 0) {
    return (
      <AppScaffold title="Estatísticas">
        <EmptyState kind="no-stats" />
      </AppScaffold>
    );
  }

  return (
    <AppScaffold title="Estatísticas">
      <SB card="ring">
        <ProgressRing progress={summary.percent} size={96} label="progresso do dia" />
        <View>
          <RNText style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 22, color: theme.color('textPrimary') }}>
            {summary.completedToday}/{summary.scheduledToday}
          </RNText>
          <RNText style={{ color: theme.color('textSecondary') }}>
            {Math.round(summary.percent * 100)}% hoje
          </RNText>
        </View>
      </SB>

      <StreakCard current={summary.dayStreakCurrent} best={summary.dayStreakBest} />

      <SB card="stats">
        <Stat label="Completados" value={`${total.completions}`} />
        <Stat label="Pulados" value={`${total.skips}`} />
        <Stat label="Hábitos ativos" value={`${total.activeHabits}`} />
      </SB>

      <WeeklyChart series={week} />
      <CompletionChart series={month} />
      <MonthView
        series={month}
        statuses={monthDayStatus(habits, records, now)}
        streakCurrent={summary.dayStreakCurrent}
        onSelectDay={setSelectedDay}
      />

      {selectedDay ? (
        <CalendarDetail
          dateKey={selectedDay}
          habits={habits}
          records={records}
          todos={todos}
          now={now}
          onToggleTodo={(id) => void toggleTodo(id)}
          onClose={() => setSelectedDay(null)}
        />
      ) : null}
    </AppScaffold>
  );
}

function SB({ card, children }: { card: 'ring' | 'stats'; children: React.ReactNode }) {
  const theme = useTheme();
  const row = card === 'ring';
  return (
    <View
      style={[
        styles.box,
        row && styles.row,
        { backgroundColor: theme.color('surface'), borderColor: theme.color('border') },
      ]}
    >
      {children}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={{ alignItems: 'center' }}>
      <RNText style={{ fontFamily: 'PlusJakartaSans_800ExtraBold', fontSize: 18, color: theme.color('textPrimary') }}>
        {value}
      </RNText>
      <RNText style={{ color: theme.color('textMuted'), fontSize: 12 }}>{label}</RNText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});