# UI

## Current state

Home is a vertically scrolling screen with a brand header, a circular Settings button, five large full-width Event Type rows, and a Recent Events section. Event definitions and presentation data are loaded from SQLite when Home mounts.

Each event row supports two input paths:

- Swipe right or left past a commit threshold to choose the option assigned to that direction. The row reveals an action strip and gives light haptic feedback when armed.
- Tap to expand the row and show option pills, then tap any option.

After a selection, Home writes the event for the default pet, refreshes the five newest history rows, and displays a bottom toast with the event, option, and localized time. Recent rows show the localized time, event identity, and selected option in a compact timeline.

The Recent Events “View All” action opens a placeholder History screen. Full history, Upcoming, custom Event Type creation, and reordering are not implemented. Settings currently contains only back navigation, a title, and “Nothing to configure yet.”

## Decided interaction direction

Home remains the primary experience. Preserve the large horizontal rows: their width is functional gesture space, not wasted layout. Do not replace them with a compact grid merely to fit everything above the fold. Home may scroll.

The intended Home sequence is event logging, recent history, then a simple Upcoming experience. Upcoming may mix scheduled information (for example, “Scheduled 11:30 PM”) with predictions (for example, “Likely soon”), but the two must look distinguishable because their certainty and source differ. Prediction need not claim an exact timestamp.

Event Type administration moves away from Home into a minimal Settings screen. Possible capabilities are create, edit, hide, reorder, and archive/delete custom types; these are future design areas, not current features. System types should generally be hidden/customized rather than destructively deleted. If ordering is implemented, the preferred Home interaction is long-press plus drag. Do not overload that gesture with an edit/delete menu.

Stats navigation, charts, and dashboards are excluded from V1. Earlier navigation exploration is not an authoritative commitment to bottom tabs or a Stats tab.

## Styling and color ownership

The UI uses NativeWind/Tailwind-style `className` utilities plus React Native inline styles and `StyleSheet`. Application colors are centralized in `src/theme/tokens.ts` as one canonical semantic palette: `tailwind.config.js` imports that object to register utility classes (`bg-background`, `text-foreground`, `border-border`, …), and screens/components import the same `colors` object wherever a raw value is required (icon `color` props, `StyleSheet`, navigator `contentStyle`). Fallback presentation for options that define no colors of their own uses the `option-*` tokens; colors stored in SQLite remain data. Typography, spacing, radius, heights, and icon sizes are not tokenized — local values stay local — and the toast shadow color and native splash/adaptive-icon colors in `app.json` remain literal.

The token set uses roles such as background, surface, raised surface, primary/secondary/muted foreground, primary/on-primary, border, accent/accent-surface, success, and brand. Token values must be available to utility styling and to TypeScript because icon and style props sometimes require raw colors. Prefer clarity and a single canonical source where practical; do not introduce dark mode, multiple themes, or a large design system without a request. Local spacing and radius values may remain local when they are not shared decisions.

Event colors have different ownership. Colors stored on `event_types` and `event_options` are data used to distinguish or customize events. They must not be folded automatically into the application theme:

```text
Application/design colors -> semantic theme tokens
Event/customizable colors -> event data in SQLite
```
