# CookieTrail agent guide

CookieTrail is a deliberately small Expo/React Native app for logging a pet's routine events quickly. V1 is centered on one default pet and the sequence: log an event, show recent history, then offer a simple indication of what may happen next. Resist feature creep and preserve the large horizontal event rows that enable swipe actions.

Read the focused documentation before changing behavior:

- [Product scope](.docs/product.md)
- [Architecture and current implementation](.docs/architecture.md)
- [Database model and conventions](.docs/database.md)
- [UI and styling direction](.docs/ui.md)
- [Established decisions and known gaps](.docs/decisions.md)

## Working in this repository

- Install dependencies with `npm install` (the repository uses `package-lock.json`). Do not add or upgrade packages without explicit approval.
- Start Expo with `npm start`; use `npm run android` or `npm run ios` for native development builds.
- Run `npm run lint` before handing off code changes. It runs ESLint and Prettier checks. There is currently no test script.
- `npm run format` writes formatting changes across supported source/config files; use it only when that scope is intended.
- Routes live in `src/app`, shared UI in `src/components`, and SQLite code in `src/data`. The `@/` alias resolves to `src/`.
- Native `android/` and `ios/` directories exist locally but are ignored by Git. Treat `app.json` and the Expo configuration as the authoritative tracked configuration unless the user explicitly scopes native files.

## Architecture constraints

- Keep the app local-first and simple. SQLite persistence is opened synchronously in `src/data/database.ts`; migrations run before screens render from `src/app/_layout.tsx`.
- Preserve the distinction between definitions and history: `event_types` and `event_options` describe available events; `event_log` records occurrences and is scoped to a pet.
- V1 has exactly one default pet and no pet-management or pet-switching UI. Do not add `pet_id` to event definitions without a separately approved design.
- Prediction is intended only for event types marked predictable and should learn primarily from that pet's history. Do not invent a physiological model, machine-learning system, or exact-time promise.
- The repository is pre-release with disposable development data. Early migrations may be consolidated deliberately. Once real user data exists, migrations must preserve it.

## Database conventions

- Store all application timestamps as SQLite `INTEGER` Unix epoch milliseconds in UTC; use `Date.now()` in TypeScript and localize only at the UI boundary.
- Apply schema changes through the migration mechanism in `src/data/migration.ts`, not ad hoc SQL elsewhere.
- Maintain foreign-key relationships and indexes intentionally. Ask before changing persistence structure or migration policy.
- Review `.docs/database.md` before database work: it records current inconsistencies, including the incomplete `pet_id` logging path and `schema_migrations` timestamp affinity mismatch.

## UI and styling constraints

- Home is the primary experience. Keep event controls as large, full-width rows; horizontal space supports left/right swipe actions. Scrolling is acceptable.
- Event Type administration belongs in a small Settings experience, not as a prominent Home action. Long-press plus drag is the preferred future Home reorder interaction; do not also assign long-press to edit/delete menus.
- Upcoming should distinguish scheduled items from predictions. Prefer ranges or language such as “Likely soon” over false precision.
- Application colors should come from one practical set of semantic theme tokens, accessible from utility classes and TypeScript where raw values are required. Do not add dark mode, multiple themes, or tokenize every local layout value without a request.
- Colors on event types/options are customizable data and remain separate from application theme tokens.

## Scope and decision ownership

- Inspect existing code and documentation first. Follow established patterns and make the smallest correct change.
- Preserve behavior unless the user explicitly requests a behavior change. Do not refactor unrelated code or complete adjacent work.
- Do not add packages, frameworks, broad abstractions, new product features, or speculative flexibility without explicit approval.
- Ask before choices that materially affect architecture, dependencies, persistence, project structure, or established UX/product direction. Explain a proposed new pattern before spreading it through the codebase.
- Do not add Stats, charts, analytics dashboards, multi-pet UI, elaborate pet profiles, complex predictions, or a large Settings hierarchy unless explicitly requested.
- Keep current state, decided direction, and possible future ideas distinct in both implementation discussions and documentation.
- Update the relevant `.docs/` file when an approved product or architecture decision changes. Keep documentation concise; do not create boilerplate for its own sake.
