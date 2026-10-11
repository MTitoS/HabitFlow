import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..', '..');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe('calendar route removal (D11)', () => {
  it('deletes src/app/calendar/index.tsx', () => {
    expect(existsSync(join(SRC, 'app', 'calendar', 'index.tsx'))).toBe(false);
  });

  it('leaves no orphan reference to the removed calendar route', () => {
    const offenders = walk(SRC)
      .filter((file) => !file.endsWith('calendar-removed.test.ts'))
      .filter((file) => /app\/calendar|\/calendar['"]/.test(readFileSync(file, 'utf8')));
    expect(offenders).toEqual([]);
  });
});