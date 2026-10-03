import { Habit, Routine } from '@/domain/habit/model';
import { HabitRecord } from '@/domain/record/model';
import { SkipCredit } from '@/domain/skip-credit/grantWeeklyCredit';

export interface HabitRepository {
  all(): Promise<Habit[]>;
  active(): Promise<Habit[]>;
  archived(): Promise<Habit[]>;
  byId(id: string): Promise<Habit | undefined>;
  create(input: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Habit>;
  update(habit: Habit): Promise<void>;
  archive(id: string, at: number): Promise<void>;
  unarchive(id: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface RecordRepository {
  all(): Promise<HabitRecord[]>;
  forHabit(habitId: string): Promise<HabitRecord[]>;
  setCompleted(habitId: string, dateKey: string, now: Date, value?: number): Promise<void>;
  setSkipped(habitId: string, dateKey: string, now: Date): Promise<void>;
  ensurePendings(habitId: string, dateKeys: string[], now: Date): Promise<void>;
  clearForHabit(habitId: string): Promise<void>;
}

export interface RoutineRepository {
  all(): Promise<Routine[]>;
  byId(id: string): Promise<Routine | undefined>;
  create(input: Omit<Routine, 'id'>): Promise<Routine>;
  update(routine: Routine): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface SkipCreditRepository {
  get(): Promise<SkipCredit>;
  save(state: SkipCredit): Promise<void>;
  reset(): Promise<void>;
}

export interface Repositories {
  habits: HabitRepository;
  records: RecordRepository;
  routines: RoutineRepository;
  skipCredit: SkipCreditRepository;
}