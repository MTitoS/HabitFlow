import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getHabitsViewPrefs,
  getRetroEditEnabled,
  setHabitsViewPrefs,
  setRetroEditEnabled,
} from '@/services/prefs';

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

describe('habits view prefs', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when never saved', async () => {
    expect(await getHabitsViewPrefs()).toBeNull();
  });

  it('roundtrips stored preferences', async () => {
    await setHabitsViewPrefs({ mode: 'alpha', routineFilter: 'r1' });
    expect(await getHabitsViewPrefs()).toEqual({ mode: 'alpha', routineFilter: 'r1' });
  });

  it('returns null on invalid JSON', async () => {
    await AsyncStorage.setItem('habitflow:prefs:habitsView', '{invalid');
    expect(await getHabitsViewPrefs()).toBeNull();
  });
});

describe('retroEdit pref', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('defaults to false when never saved', async () => {
    expect(await getRetroEditEnabled()).toBe(false);
  });

  it('roundtrips true and false', async () => {
    await setRetroEditEnabled(true);
    expect(await getRetroEditEnabled()).toBe(true);
    await setRetroEditEnabled(false);
    expect(await getRetroEditEnabled()).toBe(false);
  });

  it('returns false on an invalid stored value', async () => {
    await AsyncStorage.setItem('habitflow:prefs:retroEdit', 'maybe');
    expect(await getRetroEditEnabled()).toBe(false);
  });
});
