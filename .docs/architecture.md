# Architecture

## Current state

CookieTrail is a TypeScript mobile application built with Expo 57, React Native 0.86, React 19, and Expo Router. It uses file-based routes, NativeWind/Tailwind utilities, Expo SQLite, React Native Animated/PanResponder, Expo Haptics, Expo vector icons, and `react-native-toast-message`. npm and `package-lock.json` manage dependencies.

Tracked application structure:

```text
src/
  app/
    _layout.tsx       root providers, stack, global CSS, migration startup
    index.tsx         Home route and event logging orchestration
    settings.tsx      placeholder Settings route
  components/
    SwipeableEventRow.tsx
  data/
    database.ts       SQLite connection and row types
    events.ts         event definition reads and event-log writes
    migration.ts      schema migrations and seed data
    models.ts         UI-facing event types
  global.css          NativeWind directives
  toastConfig.tsx     event confirmation toast
```

The `@/` TypeScript alias points to `src/`. `app.json`, Babel, Metro, Tailwind, ESLint, and Prettier files configure the Expo toolchain. Locally generated `android/` and `ios/` directories are ignored by Git; the tracked project remains configured with scaffold identifiers such as `my-expo-app`.

## Runtime and data flow

Importing the root layout calls `runMigrations()` synchronously before rendering the route stack. `database.ts` opens the local `cookietrail.db` synchronously. Home initializes its event definitions once by calling `getEventTypes()`, which reads visible event types and all options, maps SQLite rows to UI models, and supplies each definition to `SwipeableEventRow`.

A row owns the gesture mechanics. It clamps horizontal movement, gives haptic feedback after a threshold, and commits the configured left or right option on release. Tapping expands the same row to expose all options. Home calls `logEvent`, shows a localized-time confirmation toast, and collapses the row.

There is no service layer, remote API, state-management framework, or reactive database subscription. There are also no automated tests or test command. Keep new layers proportional to an approved need rather than adding them preemptively.

## Boundaries

- `src/data` owns local persistence and conversion from database rows to UI-facing models.
- Route components coordinate screen state and navigation.
- `SwipeableEventRow` owns reusable presentation and gesture behavior, while its parent performs the write.
- Event definition presentation values (label, icon, and colors) come from SQLite data. Application colors come from semantic tokens in `src/theme/tokens.ts`.

## Decided direction, not current implementation

- Home remains the primary, scrollable experience and gains recent history plus a simple Upcoming section.
- Settings becomes the small administration surface for Event Types.
- Event history is pet-scoped while event definitions remain global.
- Predictions remain a lightweight interpretation of an individual pet's history.

## Known implementation gaps

- `logEvent` does not provide the required `event_log.pet_id`, so logging against the current schema should fail. No default-pet lookup or selection path is wired into the write.
- Home has no recent-history or Upcoming query/rendering.
- Settings says there is nothing to configure; Event Type administration is not implemented.
- Home still presents an inert “Add Custom Event” control, contrary to its decided placement in Settings.
- Event order is implicit `event_types.rowid`; reorder storage and drag interaction do not exist.
- App/package/bundle identifiers still use generated `my-expo-app`/`com.anonymous.myexpoapp` values rather than CookieTrail branding.

These are recorded discrepancies, not authorization to fix them.
