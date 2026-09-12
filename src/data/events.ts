import type { EventType, EventOption, IconName, SwipeDirection } from './models';
import type { EventTypeRow, EventOptionRow } from './database';
import { db } from './database';

export function logEvent(
  eventTypeId: string,
  optionId: string,
  occurredAt = Date.now(),
) {
  db.runSync(
    `
      INSERT INTO event_log (
        event_type_id,
        option_id,
        occurred_at
      )
      VALUES (?, ?, ?)
    `,
    eventTypeId,
    optionId,
    occurredAt,
  );
}

export function getEventTypes(): EventType[] {
  const eventRows = db.getAllSync<EventTypeRow>(`
    SELECT *
    FROM event_types
    WHERE is_hidden = 0
    ORDER BY rowid
  `);

  const optionRows = db.getAllSync<EventOptionRow>(`
    SELECT *
    FROM event_options
    ORDER BY event_type_id, sort_order
  `);

  return eventRows.map((row) => ({
    id: row.id,
    label: row.label,
    icon: row.icon as IconName,
    color: row.color,
    bg: row.bg,

    isSystem: row.is_system === 1,
    isHidden: row.is_hidden === 1,
    isPredictable: row.is_predictable === 1,

    options: optionRows
      .filter((option) => option.event_type_id === row.id)
      .map(
        (option): EventOption => ({
          id: option.id,
          label: option.label,
          icon: option.icon ? (option.icon as IconName) : undefined,
          color: option.color ?? undefined,
          bg: option.bg ?? undefined,
          swipe: option.swipe_direction
            ? (option.swipe_direction as SwipeDirection)
            : undefined,
        }),
      ),
  }));
}