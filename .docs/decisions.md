# Decisions

This is a lightweight record of established product and architecture decisions. It is not an ADR process. Implementation gaps are listed so that direction is not mistaken for current behavior.

## Keep the product deliberately small

**Decision:** V1 focuses on fast event logging, recent history, and simple upcoming guidance for one pet. Stats, broad pet management, and a large Settings area are excluded.

**Why:** Speed and everyday usefulness are the product; extra surfaces would add complexity without strengthening the core loop.

## Model pets now; defer multi-pet UI

**Decision:** Keep a `pets` table and scope `event_log` rows with `pet_id`, while V1 creates exactly one default pet and exposes no switching or management UI.

**Why:** Historical data should not permanently assume one pet, but schema readiness does not justify building a multi-pet product.

**Current gap:** The table and foreign key exist, but `logEvent` omits `pet_id`.

## Keep definitions separate from occurrences

**Decision:** `event_types` and `event_options` are shared definitions; `event_log` is pet-specific history. Do not add `pet_id` to definitions speculatively.

**Why:** What can be logged and what happened have different responsibilities. Per-pet configuration, if needed, deserves an explicit design.

## Store timestamps as integer milliseconds

**Decision:** Store UTC Unix epoch milliseconds in SQLite `INTEGER` columns and localize only for display.

**Why:** `Date.now()` maps directly to this representation and one convention prevents subtle comparison and conversion errors.

**Current gap:** The migration bootstrap gives `schema_migrations.applied_at` TEXT affinity even though migration SQL and the decided convention specify INTEGER.

## Keep prediction intentionally simple

**Decision:** Begin with Pee and Poop as predictable. Favor history-based likelihood/ranges such as “Likely soon,” potentially informed later by elapsed time, time of day, recent routine, and relationships to other events.

**Why:** Personalized history can provide useful guidance without false precision or burdensome inputs.

**Excluded:** Physiological formulas, precise consumption calculations, weather APIs, complex machine learning, and promises of exact predicted times.

## Preserve full-width swipe rows

**Decision:** Home uses large full-width rows and may scroll. Do not compress the controls into a grid merely to fit above the fold.

**Why:** Horizontal surface area is part of the left/right option gesture and supports fast logging.

## Move Event Type administration to Settings

**Decision:** Do not keep Add Custom Event prominent on Home. Use a small Settings surface for future Event Type administration. Prefer long-press plus drag for Home ordering and reserve that gesture rather than combining it with edit/delete actions.

**Why:** Home should stay focused on logging. Administration is secondary, and one gesture should have one predictable purpose.

**Current gap:** Home still renders an inert Add Custom Event button; Settings is a placeholder, and no administration or reorder behavior exists.

## Exclude Stats from V1

**Decision:** Do not add a Stats screen, charts, analytics dashboard, trend dashboard, or Stats navigation in V1.

**Why:** Event history may enable analysis later, but those surfaces expand scope beyond the core loop.

## Centralize semantic application colors

**Decision:** Application visuals should use semantic theme tokens with access from utilities and TypeScript. Event Type/option colors remain database data rather than theme tokens.

**Why:** Semantic roles make shared design choices consistent without conflating application chrome with customizable event identity.

**Status:** Implemented. `src/theme/tokens.ts` is the canonical palette; `tailwind.config.js` imports it for utility classes and screens/components import it where raw values are required (icon props, `StyleSheet`, navigator `contentStyle`). Typography, spacing, radius, heights, and icon sizes are not tokenized yet.

## Keep early migrations understandable

**Decision:** While the app is pre-release and development data is disposable, migrations may be periodically consolidated or rebuilt. Once real user data exists, migrations must preserve it.

**Why:** Meaningless migration archaeology adds maintenance cost before compatibility is necessary; after release, data safety takes priority.
