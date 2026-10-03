export const MIGRATIONS_BASE_VERSION = 1;

export type Migration = {
  from: number;
  to: number;
  up: (tables: Record<string, unknown[]>) => Record<string, unknown[]>;
};

export const MIGRATIONS: Migration[] = [];

export function applyMigrations(tables: Record<string, unknown[]>, fromVersion: number): Record<string, unknown[]> {
  let current = { ...tables };
  for (const migration of MIGRATIONS) {
    if (migration.from >= fromVersion) {
      current = migration.up(current);
    }
  }
  return current;
}