export const DB_VERSION = 2;

export const TABLES = ['habits', 'records', 'routines', 'skipcredit', 'todos'] as const;

export type TableName = (typeof TABLES)[number];

export const TABLE_NAMES: readonly string[] = TABLES;

export interface TableDefinition {
  name: string;
  fields: string[];
  unique?: string[];
}

export const TABLE_DEFINITIONS: TableDefinition[] = [
  {
    name: 'habits',
    fields: [
      'id',
      'name',
      'description',
      'icon',
      'color',
      'type',
      'targetValue',
      'unit',
      'customUnit',
      'frequency',
      'routineId',
      'scheduledTime',
      'reminder',
      'createdAt',
      'updatedAt',
      'archivedAt',
    ],
  },
  {
    name: 'records',
    fields: ['id', 'habitId', 'date', 'status', 'value', 'completedAt', 'skippedAt'],
    unique: ['habitId', 'date'],
  },
  {
    name: 'routines',
    fields: ['id', 'name', 'description', 'icon', 'color', 'order'],
  },
  {
    name: 'skipcredit',
    fields: ['id', 'balance', 'lastGrantRef', 'updatedAt'],
  },
  {
    name: 'todos',
    fields: ['id', 'title', 'date', 'completed', 'completedAt', 'createdAt', 'updatedAt'],
  },
];