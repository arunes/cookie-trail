/**
 * Canonical application theme colors.
 *
 * Single source of truth:
 * - `tailwind.config.js` imports this object to register the utility classes
 *   (e.g. `bg-background`, `text-foreground`, `border-border`).
 * - Import `colors` directly where React Native APIs need raw values
 *   (icon `color` props, `StyleSheet`, navigator `contentStyle`).
 *
 * Colors on event types/options (Pee, Poop, custom events, ...) are
 * customizable DATA stored in SQLite and deliberately do not live here.
 * Application and data color ownership is documented in .docs/ui.md.
 */
export const colors = {
  // Screens and cards
  background: '#fbf8f5',
  surface: '#ffffff',
  'surface-raised': '#fffdfb',

  // Text and icons on background/surface
  foreground: '#211914',
  'foreground-secondary': '#9b948e',
  'foreground-muted': '#aaa6a3',
  'icon-muted': '#d9d3cc',

  // Hairlines
  border: '#f0ece8',
  'border-strong': '#e8e2dc',

  // Actions
  primary: '#1478e8',
  'on-primary': '#ffffff',
  accent: '#43218d',
  'accent-surface': '#eee5ff',

  // Brand
  brand: '#825d3d',

  // Default presentation of event options that define no colors of their own
  'option-surface': '#f7f6f5',
  'option-action-surface': '#f1efec',
  'option-icon': '#6b6b6b',
  'option-text': '#505050',

  // Status
  success: '#6f9f78',
  danger: '#b3372f',
} as const;

export type ColorToken = keyof typeof colors;
