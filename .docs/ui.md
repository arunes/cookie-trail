# UI

## Current state

The application has a persistent bottom menu with Home and History tabs. Home is a vertically scrolling screen with a brand header, a circular Settings button, and five large full-width Event Type rows. Event definitions and presentation data are loaded from SQLite when Home mounts.

Each event row supports two input paths:

- Swipe right or left past a commit threshold to choose the option assigned to that direction. The row reveals an action strip and gives light haptic feedback when armed.
- Tap to expand the row and show option pills, then tap any option.

After a selection, Home writes the event for the default pet and displays a bottom toast with the event, option, and localized time. The toast carries an Undo link for its display window; tapping it deletes the just-recorded occurrence.

History shows the default pet's complete event history and loads additional rows as the user scrolls. Tapping a row opens a bottom-sheet editor for its date and time. Long-pressing a row enters multi-selection; a visible Select action provides the same mode, subsequent taps toggle rows, and Select All includes the complete history even when some rows have not loaded yet. A floating destructive action confirms before deleting the selected events. Upcoming and custom Event Type creation are not implemented.

Settings contains one Event Settings destination. The list shows all event types, including hidden ones with a "Hidden" badge, supports long-press drag reordering, offers a top-right circular add action (the same primary-plus button style as Home's settings button) that opens the Create Event screen, and opens the Edit Event screen when a row is tapped. Editing covers the label, an icon from a curated pet/activity set, a curated color pair, the predictable and hidden switches, and the event's options. Options are listed with the same drag interaction, edited in a bottom sheet (label, icon, color, and a None/Left/Right swipe action; assigning a direction takes it over from any other option, so one option per direction), and deleted through a confirmation that states how many logged entries for that option will also be removed. A Save button applies event-level changes with a toast; deleting a custom event requires a confirmation that states how many logged entries will be removed, while system events expose no delete action.

The Create Event screen mirrors the Edit layout with the same curated icon set and color pairs. Its options are added, edited, deleted, and reordered in local state only; creating the event persists the event and all initial options in one transaction, shows a creation toast, and returns to the Event list, which refreshes on focus. New events default to not hidden and not predictable, and are always custom (non-system).

## Decided interaction direction

Home remains the primary experience. Preserve the large horizontal rows: their width is functional gesture space, not wasted layout. Do not replace them with a compact grid merely to fit everything above the fold. Home may scroll.

The intended primary sequence is event logging on Home, history through its bottom tab, then a simple Upcoming experience. Upcoming may mix scheduled information (for example, “Scheduled 11:30 PM”) with predictions (for example, “Likely soon”), but the two must look distinguishable because their certainty and source differ. Prediction need not claim an exact timestamp.

Event Type administration moves away from Home into a minimal Settings screen. Possible capabilities are create, edit, hide, reorder, and archive/delete custom types; these are future design areas, not current features. System types should generally be hidden/customized rather than destructively deleted. Event ordering will live on a separate administration screen; long-press plus drag remains the intended interaction there. Do not also assign long-press to edit/delete menus.

Stats navigation, charts, and dashboards are excluded from V1. The bottom menu remains limited to Home and History.

## Styling and color ownership

The UI uses NativeWind/Tailwind-style `className` utilities plus React Native inline styles and `StyleSheet`. Application colors are centralized in `src/theme/tokens.ts` as one canonical semantic palette: `tailwind.config.js` imports that object to register utility classes (`bg-background`, `text-foreground`, `border-border`, …), and screens/components import the same `colors` object wherever a raw value is required (icon `color` props, `StyleSheet`, navigator `contentStyle`). Fallback presentation for options that define no colors of their own uses the `option-*` tokens; colors stored in SQLite remain data. Typography, spacing, radius, heights, and icon sizes are not tokenized — local values stay local — and the toast shadow color and native splash/adaptive-icon colors in `app.json` remain literal.

The token set uses roles such as background, surface, raised surface, primary/secondary/muted foreground, primary/on-primary, border, accent/accent-surface, success, danger, and brand. Token values must be available to utility styling and to TypeScript because icon and style props sometimes require raw colors. Prefer clarity and a single canonical source where practical; do not introduce dark mode, multiple themes, or a large design system without a request. Local spacing and radius values may remain local when they are not shared decisions.

Event colors have different ownership. Colors stored on `event_types` and `event_options` are data used to distinguish or customize events. They must not be folded automatically into the application theme:

```text
Application/design colors -> semantic theme tokens
Event/customizable colors -> event data in SQLite
```
