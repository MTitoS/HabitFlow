import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHabitsViewPrefs, setHabitsViewPrefs } from '@/services/prefs';

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
