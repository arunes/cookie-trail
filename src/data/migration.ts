import { db } from './database';

type Migration = {
  version: number;
  sql: string;
};

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY NOT NULL,
        applied_at INTEGER NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: `
      CREATE TABLE pets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE event_types (
        id TEXT PRIMARY KEY NOT NULL,
        label TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        bg TEXT NOT NULL,
        is_system INTEGER NOT NULL DEFAULT 0,
        is_hidden INTEGER NOT NULL DEFAULT 0,
        is_predictable INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE event_options (
        id TEXT NOT NULL,
        event_type_id TEXT NOT NULL,
        label TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        bg TEXT,
        swipe_direction TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,

        PRIMARY KEY (event_type_id, id),

        FOREIGN KEY (event_type_id)
          REFERENCES event_types(id)
          ON DELETE CASCADE
      );

      CREATE TABLE event_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pet_id INTEGER NOT NULL,
        event_type_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        occurred_at INTEGER NOT NULL,
        note TEXT,

        FOREIGN KEY (pet_id)
          REFERENCES pets(id)
          ON DELETE CASCADE,

        FOREIGN KEY (event_type_id)
          REFERENCES event_types(id),

        FOREIGN KEY (event_type_id, option_id)
          REFERENCES event_options(event_type_id, id)
      );

      CREATE INDEX idx_event_log_pet_occurred_at
        ON event_log(pet_id, occurred_at);

      CREATE INDEX idx_event_log_pet_type_occurred_at
        ON event_log(pet_id, event_type_id, occurred_at);


      -- Default pet

      INSERT INTO pets (name, created_at)
      VALUES ('My Pet', unixepoch() * 1000);


      -- System event types

      INSERT INTO event_types
        (
          id,
          label,
          icon,
          color,
          bg,
          is_system,
          is_hidden,
          is_predictable,
          sort_order
        )
      VALUES
        ('system.pee', 'Pee', 'water', '#e5a414', '#fff2c9', 1, 0, 1, 0),
        ('system.poop', 'Poop', 'emoticon-poop', '#7b4b2c', '#faebd9', 1, 0, 1, 1),
        ('system.food', 'Food', 'food-drumstick', '#df665f', '#ffe2e4', 1, 0, 0, 2),
        ('system.water', 'Water', 'water-outline', '#2775d4', '#e1f0ff', 1, 0, 0, 3),
        ('system.exercise', 'Exercise', 'dog', '#2d7c3e', '#e1f7e4', 1, 0, 0, 4);


      -- System event options

      INSERT INTO event_options
        (id, event_type_id, label, icon, color, bg, swipe_direction, sort_order)
      VALUES
        ('success', 'system.pee', 'Success', 'check', '#2c7a3f', '#e5f5e8', 'right', 0),
        ('accident', 'system.pee', 'Accident', 'close', '#b3372f', '#ffe2e4', 'left', 1),

        ('success', 'system.poop', 'Success', 'check', '#2c7a3f', '#e5f5e8', 'right', 0),
        ('accident', 'system.poop', 'Accident', 'close', '#b3372f', '#ffe2e4', 'left', 1),

        ('regular', 'system.food', 'Regular', 'bowl', '#985c20', '#fff0d7', 'right', 0),
        ('treat', 'system.food', 'Treat', 'bone', '#b03968', '#ffe9f0', 'left', 1),

        ('drank', 'system.water', 'Drank', 'water-outline', '#1c58a6', '#e3f1ff', 'right', 0),
        ('refill', 'system.water', 'Refill', 'cup', '#157f7a', '#e0f5f4', 'left', 1),

        ('walk', 'system.exercise', 'Walk', 'paw', '#246d35', '#e5f5e8', 'right', 0),
        ('play', 'system.exercise', 'Play', 'soccer', '#5b3ea8', '#efe9ff', 'left', 1);
    `,
  },
];

export function runMigrations() {
  // SQLite does not enforce foreign keys unless explicitly enabled.
  db.execSync('PRAGMA foreign_keys = ON;');

  db.execSync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);

  const row = db.getFirstSync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM schema_migrations'
  );

  const currentVersion = row?.version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    db.withTransactionSync(() => {
      db.execSync(migration.sql);

      db.runSync(
        'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
        migration.version,
        Date.now()
      );
    });
  }
}