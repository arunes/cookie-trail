# Database

## Current persistence

The app opens a local SQLite database named `cookietrail.db` through Expo SQLite's synchronous API. `runMigrations()` executes during root-layout module initialization. Migrations are an ordered in-code array; the highest version in `schema_migrations` determines which entries run, and each pending migration plus its version record is applied in a synchronous transaction.

Migration version 2 creates and seeds the domain schema. There is currently no repository, query builder, remote synchronization, or database reset command.

## Current schema

### `schema_migrations`

Tracks integer migration `version` values and when they were applied. There is a current inconsistency: migration 1 declares `applied_at INTEGER NOT NULL`, but the bootstrap statement executed before reading migrations declares it as `TEXT NOT NULL`. Because both use `CREATE TABLE IF NOT EXISTS`, a new database keeps the bootstrap table's TEXT affinity even though `Date.now()` is supplied when recording a migration.

### `pets`

Represents pets independently from event definitions.

- `id`: autoincrementing integer primary key
- `name`: required text
- `created_at`: required integer

The migration seeds exactly one pet named `My Pet`, using Unix epoch milliseconds. There is no pet read/update API or pet UI.

### `event_types`

Defines event categories. Its text primary key supports stable identifiers such as `system.pee`. It stores `label`, icon name, foreground/background colors, and integer boolean flags for system, hidden, and predictable state.

The seed contains Pee and Poop as predictable and Food, Water, and Exercise as not predictable. Event Types do not contain `pet_id`; they are definitions rather than pet history.

### `event_options`

Defines choices belonging to an Event Type. The composite primary key is `(event_type_id, id)`, allowing option identifiers such as `success` to be reused by different types. Optional icon/color/background/swipe direction fields control presentation and interaction, and `sort_order` orders options. Deleting an Event Type cascades to its options at the schema level.

### `event_log`

Records occurrences. Each row has an autoincrementing ID and required `pet_id`, `event_type_id`, `option_id`, and `occurred_at`, plus an optional note. Foreign keys link the pet, event type, and the type/option pair. Indexes support history ordered by pet/time and history filtered by pet/type/time.

This separation is intentional: Event Types and options define what can happen; the event log records what actually happened to a pet.

## Timestamp convention

All application timestamps must be SQLite `INTEGER` values containing Unix epoch milliseconds in UTC. Use `Date.now()` in TypeScript and convert to local/user-facing dates only at the UI boundary. Do not mix ISO text timestamps into application tables without a specific, approved reason. `schema_migrations` should follow the same convention when its current inconsistency is addressed.

## Known gaps and cautions

- The current `logEvent` insert supplies `event_type_id`, `option_id`, and `occurred_at` but omits required `pet_id`. The schema and write path are therefore inconsistent; pet-scoped logging is not complete.
- Foreign-key constraints are declared, but application initialization does not explicitly enable or verify SQLite foreign-key enforcement.
- Home ordering currently relies on `event_types.rowid`; Event Types have no explicit sort column.
- Custom Event Type lifecycle, including archival when log rows reference a definition, has not been designed or implemented.

## Decided evolution policy

V1 has one default pet and no multi-pet interface. Keeping `pets` and `event_log.pet_id` now prevents history from permanently assuming a single pet; it does not authorize pet switching, profile systems, or per-pet Event Type configuration. Add per-pet definition/configuration only after an explicit design decision.

The project is pre-release and current development data is disposable. Early migrations may periodically be consolidated or rebuilt to keep the baseline intelligible instead of preserving migration archaeology. Once production or user data exists, migrations must become additive/data-preserving and must not rely on destructive resets.
