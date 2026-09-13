# Product

## Purpose

CookieTrail is a deliberately small mobile application for recording a pet's routine events with minimal interaction. The immediate use case is a puppy and five system event types: Pee, Poop, Food, Water, and Exercise.

The product loop is intentionally narrow:

1. Log what happened.
2. Show recent history.
3. Give a simple indication of what may happen next.

The Home screen is the core product, not an entry point into a broad pet-management platform.

## V1 scope

V1 targets one default pet. A user should be able to log an event by swiping a large event row toward one of two common options, or by tapping the row and selecting an option. Examples include Success/Accident for elimination, Regular/Treat for food, Drank/Refill for water, and Walk/Play for exercise.

The decided V1 direction also includes recent history, a lightweight Upcoming section, and a very small Settings screen whose main purpose is Event Type management. These items are direction, not all current behavior; see [architecture.md](architecture.md) and [ui.md](ui.md) for the implementation status.

Pee and Poop are initially marked predictable. Predictions should be modest, personalized from the pet's own history, and expressed as a range or likelihood such as “Likely soon” when precision is not justified. Scheduled items and predictions represent different information and should be visibly distinct.

## Explicitly out of scope

- Multi-pet switching or management in V1
- Breed, weight, medical, or elaborate pet profiles
- Stats screens, charts, analytics, or trend dashboards
- Complex physiological calculations, weather integrations, or machine learning for prediction
- A large Settings hierarchy
- Dark mode, multiple themes, or an elaborate design system
- Features added only because the schema could support them

Future user-created event types are plausible, as are simple scheduling and history-based prediction. They are not permission to invent or implement unspecified behavior.

## Product discipline

Prefer a fast, understandable workflow over breadth. A proposed feature should serve the core logging/history/upcoming loop and have an explicit product decision behind it. Keep possible future ideas labeled as such; do not turn them into V1 commitments by documenting or scaffolding them prematurely.
