# Architecture

## Current state

CookieTrail is a TypeScript mobile application built with Expo 57, React Native 0.86, React 19, and Expo Router. It uses file-based routes, NativeWind/Tailwind utilities, Expo SQLite, React Native Animated/PanResponder, React Native Gesture Handler, Reanimated, Expo Haptics, Expo vector icons, `react-native-sortables`, and `react-native-toast-message`. npm and `package-lock.json` manage dependencies.

Tracked application structure:

```text
src/
  app/
    _layout.tsx       root providers, stack, global CSS, migration startup
    (tabs)/
      _layout.tsx     persistent Home/History bottom-tab navigator
      index.tsx       Home route and event logging orchestration
      history.tsx     infinite-scrolling full-history route
    settings.tsx      Settings menu
    event-settings.tsx event list with persistent drag ordering
    edit-event.tsx    edit screen for one event type and its options
    create-event.tsx  create screen for a new custom event type
  components/
    SwipeableEventRow.tsx
    eventEditor.tsx   shared event-editor pieces (curated choices, pickers, option row, option sheet)
  data/
    database.ts       SQLite connection and row types
    events.ts         event definition/history reads and event-log writes
    migration.ts      schema migrations and seed data
    models.ts         UI-facing event types
  global.css          NativeWind directives
  toastConfig.tsx     event confirmation toast
```

The `@/` TypeScript alias points to `src/`. `app.json`, Babel, Metro, Tailwind, ESLint, and Prettier files configure the Expo toolchain. Locally generated `android/` and `ios/` directories are ignored by Git; the tracked project remains configured with scaffold identifiers such as `my-expo-app`.

## Runtime and data flow

Importing the root layout calls `runMigrations()` synchronously before rendering the route stack. The root stack contains a two-screen tab group plus Settings outside the tabs. `database.ts` opens the local `cookietrail.db` synchronously. Home loads its event definitions by calling `getEventTypes()`, which reads visible event types and all options, maps SQLite rows to UI models, and supplies each definition to `SwipeableEventRow`. It refreshes those definitions when Home regains focus so ordering changes made in Event Settings appear immediately.

A Home row owns the gesture mechanics. It clamps horizontal movement, gives haptic feedback after a threshold, and commits the configured left or right option on release. Tapping expands the same row to expose all options. Home calls `logEvent`, shows a localized-time confirmation toast, and collapses the row. History refreshes when its tab gains focus and joins occurrences to their type and option definitions for display. History owns timestamp editing and selection state; timestamp updates and pet-scoped transactional bulk deletes remain in the data layer.

Event Settings lists every event type, including hidden ones (marked "Hidden"), refreshes on focus, persists drag ordering, and offers a circular add action that pushes the `create-event` route. Tapping a row pushes the `edit-event` route with the type id. Both screens share the small editor pieces in `components/eventEditor.tsx`: the curated icon set and color pairs, the icon/color pickers, the flag toggle row, the option row, and the option bottom-sheet editor (which owns its draft state and label validation, and assigns swipe directions with a one-option-per-direction take-over). The Edit screen drafts label, icon, color pair, and the predictable/hidden flags behind a Save button, while its option changes persist immediately through the data layer. The Create screen mirrors that layout but holds its options only in local state; `createEventType` persists the event and all initial options in one transaction, generating the type id from the label (uniquified on collision), forcing `is_system = 0`, and appending with `MAX(sort_order) + 1`. Deleting an option or a custom event requires an `Alert` confirmation that states how many logged entries will also be removed, and the delete removes those history rows in the same transaction; system events cannot be deleted.

There is no service layer, remote API, state-management framework, or reactive database subscription. There are also no automated tests or test command. Keep new layers proportional to an approved need rather than adding them preemptively.

## Boundaries

- `src/data` owns local persistence and conversion from database rows to UI-facing models.
- Route components coordinate screen state and navigation.
- `SwipeableEventRow` owns reusable presentation and gesture behavior, while its parent performs the write.
- Event definition presentation values (label, icon, and colors) come from SQLite data. Application colors come from semantic tokens in `src/theme/tokens.ts`.

## Decided direction, not current implementation

- Home remains the primary logging experience; History is a peer tab, and a simple Upcoming experience remains future direction.
- Settings becomes the small administration surface for Event Types.
- Event history is pet-scoped while event definitions remain global.
- Predictions remain a lightweight interpretation of an individual pet's history.

## Known implementation gaps

- Upcoming is not implemented.
- Event Settings supports creating, editing, hiding, reordering, and deleting custom events. New events and their initial options share one transaction; editing an existing event's options persists immediately.
- Home still presents an inert “Add Custom Event” control, contrary to its decided placement in Settings.
- App/package/bundle identifiers still use generated `my-expo-app`/`com.anonymous.myexpoapp` values rather than CookieTrail branding.

These are recorded discrepancies, not authorization to fix them.
