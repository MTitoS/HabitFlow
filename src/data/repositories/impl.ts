import { DataStore } from '@/data/adapters/types';
import { Habit, Routine } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';
import { complete as completeRecord, pending as pendingRecord, skipped as skippedRecord } from '@/domain/record/transitions';
import { toDateKey } from '@/domain/date/dateUtils';
import { createSkipCredit, SkipCredit } from '@/domain/skip-credit/grantWeeklyCredit';
import { OPEN } from '@/config/opens';
import {
  HabitRepository,
  RecordRepository,
  Repositories,
  RoutineRepository,
  SkipCreditRepository,
} from '@/data/repositories/types';

const T_HABITS = 'habits';
const T_RECORDS = 'records';
const T_ROUTINES = 'routines';
const T_SKIP = 'skipcredit';

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function createHabitRepository(store: DataStore): HabitRepository {
  async function touch(id: string, fn: (h: Habit) => Habit): Promise<void> {
    const habits = await store.readTable<Habit>(T_HABITS);
    await store.writeTable(
      T_HABITS,
      habits.map((h) => (h.id === id ? fn(h) : h)),
    );
  }

  async function removeArchive(id: string): Promise<void> {
    await touch(id, (h) => {
      const { archivedAt, ...rest } = h;
      return { ...rest, archivedAt: undefined };
    });
  }

  return {
    async all() {
      return store.readTable<Habit>(T_HABITS);
    },
    async active() {
      const habits = await store.readTable<Habit>(T_HABITS);
      return habits.filter((h) => !h.archivedAt);
    },
    async archived() {
      const habits = await store.readTable<Habit>(T_HABITS);
      return habits.filter((h) => h.archivedAt);
    },
    async byId(id) {
      const habits = await store.readTable<Habit>(T_HABITS);
      return habits.find((h) => h.id === id);
    },
    async create(input) {
      const now = Date.now();
      const habit: Habit = {
        ...input,
        id: generateId('habit'),
        frequency: { ...input.frequency, schedule: { ...input.frequency.schedule } },
        createdAt: now,
        updatedAt: now,
      };
      const habits = await store.readTable<Habit>(T_HABITS);
      await store.writeTable(T_HABITS, [...habits, habit]);
      return habit;
    },
    async update(habit) {
      const habits = await store.readTable<Habit>(T_HABITS);
      const next = habits.map((h) =>
        h.id === habit.id ? { ...habit, updatedAt: Date.now() } : h,
      );
      await store.writeTable(T_HABITS, next);
    },
    async archive(id, at) {
      await touch(id, (h) => ({ ...h, archivedAt: at }));
    },
    async unarchive(id) {
      await removeArchive(id);
    },
    async remove(id) {
      const habits = await store.readTable<Habit>(T_HABITS);
      await store.writeTable(
        T_HABITS,
        habits.filter((h) => h.id !== id),
      );
      const records = await store.readTable<HabitRecord>(T_RECORDS);
      await store.writeTable(
        T_RECORDS,
        records.filter((r) => r.habitId !== id),
      );
    },
  };
}

function createRecordRepository(store: DataStore): RecordRepository {
  async function replaceForHabit(habitId: string, next: HabitRecord[]): Promise<void> {
    const records = await store.readTable<HabitRecord>(T_RECORDS);
    const others = records.filter((r) => r.habitId !== habitId);
    await store.writeTable(T_RECORDS, [...others, ...next]);
  }

  async function find(habitId: string, dateKey: string): Promise<HabitRecord | undefined> {
    const records = await store.readTable<HabitRecord>(T_RECORDS);
    return records.find((r) => r.habitId === habitId && r.date === dateKey);
  }

  return {
    async all() {
      return store.readTable<HabitRecord>(T_RECORDS);
    },
    async forHabit(habitId) {
      const records = await store.readTable<HabitRecord>(T_RECORDS);
      return records.filter((r) => r.habitId === habitId);
    },
    async setCompleted(habitId, dateKey, now, value) {
      if (toDateKey(now) !== dateKey) {
        throw new Error('record_write_past_date');
      }
      const existing = await find(habitId, dateKey);
      if (existing && existing.status !== 'pending') {
        throw new Error('record_conflict');
      }
      const next = completeRecord(habitId, dateKey, now, value);
      const all = await store.readTable<HabitRecord>(T_RECORDS);
      const without = all.filter((r) => !(r.habitId === habitId && r.date === dateKey));
      await store.writeTable(T_RECORDS, [...without, next]);
    },
    async setSkipped(habitId, dateKey, now) {
      if (toDateKey(now) !== dateKey) {
        throw new Error('record_write_past_date');
      }
      const existing = await find(habitId, dateKey);
      if (existing && existing.status !== 'pending') {
        throw new Error('record_conflict');
      }
      const next = skippedRecord(habitId, dateKey, now);
      const all = await store.readTable<HabitRecord>(T_RECORDS);
      const without = all.filter((r) => !(r.habitId === habitId && r.date === dateKey));
      await store.writeTable(T_RECORDS, [...without, next]);
    },
    async setPending(habitId, dateKey, now) {
      if (toDateKey(now) !== dateKey) {
        throw new Error('record_write_past_date');
      }
      const existing = await find(habitId, dateKey);
      if (!existing || existing.status !== 'completed') {
        throw new Error('record_conflict');
      }
      const next = pendingRecord(habitId, dateKey);
      const all = await store.readTable<HabitRecord>(T_RECORDS);
      const without = all.filter((r) => !(r.habitId === habitId && r.date === dateKey));
      await store.writeTable(T_RECORDS, [...without, next]);
    },
    async undoSkipped(habitId, dateKey, now) {
      if (toDateKey(now) !== dateKey) {
        throw new Error('record_write_past_date');
      }
      const existing = await find(habitId, dateKey);
      if (!existing || existing.status !== 'skipped') {
        throw new Error('record_conflict');
      }
      const next = pendingRecord(habitId, dateKey);
      const all = await store.readTable<HabitRecord>(T_RECORDS);
      const without = all.filter((r) => !(r.habitId === habitId && r.date === dateKey));
      await store.writeTable(T_RECORDS, [...without, next]);
    },
    async ensurePendings(habitId, dateKeys, now) {
      const today = toDateKey(now);
      const all = await store.readTable<HabitRecord>(T_RECORDS);
      const mine = all.filter((r) => r.habitId === habitId);
      const future = new Set(dateKeys.filter((d) => d >= today));

      const kept: HabitRecord[] = [];
      for (const record of mine) {
        if (record.status === 'pending' && record.date > today && !future.has(record.date)) {
          continue;
        }
        kept.push(record);
      }

      for (const date of future) {
        if (!kept.some((r) => r.date === date)) {
          kept.push(pendingRecord(habitId, date));
        }
      }

      await replaceForHabit(habitId, kept);
    },
    async clearForHabit(habitId) {
      await replaceForHabit(habitId, []);
    },
  };
}

function createRoutineRepository(store: DataStore): RoutineRepository {
  return {
    async all() {
      return store.readTable<Routine>(T_ROUTINES);
    },
    async byId(id) {
      const routines = await store.readTable<Routine>(T_ROUTINES);
      return routines.find((r) => r.id === id);
    },
    async create(input) {
      const routine: Routine = { ...input, id: generateId('routine') };
      const routines = await store.readTable<Routine>(T_ROUTINES);
      await store.writeTable(T_ROUTINES, [...routines, routine]);
      return routine;
    },
    async update(routine) {
      const routines = await store.readTable<Routine>(T_ROUTINES);
      await store.writeTable(
        T_ROUTINES,
        routines.map((r) => (r.id === routine.id ? routine : r)),
      );
    },
    async remove(id) {
      const routines = await store.readTable<Routine>(T_ROUTINES);
      await store.writeTable(
        T_ROUTINES,
        routines.filter((r) => r.id !== id),
      );
      const habits = await store.readTable<Habit>(T_HABITS);
      await store.writeTable(
        T_HABITS,
        habits.map((h) => (h.routineId === id ? { ...h, routineId: undefined } : h)),
      );
    },
  };
}

function createSkipCreditRepository(store: DataStore): SkipCreditRepository {
  return {
    async get() {
      const rows = await store.readTable<SkipCredit>(T_SKIP);
      const found = rows.find((r) => r.id === OPEN.SKIP_CREDIT_SINGLETON_ID);
      if (found) return found;
      const fresh = createSkipCredit(OPEN.SKIP_CREDIT_SINGLETON_ID, new Date());
      await store.writeTable(T_SKIP, [...rows, fresh]);
      return fresh;
    },
    async save(state) {
      const rows = await store.readTable<SkipCredit>(T_SKIP);
      const others = rows.filter((r) => r.id !== state.id);
      await store.writeTable(T_SKIP, [...others, state]);
    },
    async reset() {
      const fresh = createSkipCredit(OPEN.SKIP_CREDIT_SINGLETON_ID, new Date());
      await store.writeTable(T_SKIP, [fresh]);
    },
  };
}

export function createRepositories(store: DataStore): Repositories {
  return {
    habits: createHabitRepository(store),
    records: createRecordRepository(store),
    routines: createRoutineRepository(store),
    skipCredit: createSkipCreditRepository(store),
  };
}