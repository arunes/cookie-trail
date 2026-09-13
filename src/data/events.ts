import type { EventType, EventOption, IconName, RecentEvent, SwipeDirection } from './models';
import type { EventTypeRow, EventOptionRow } from './database';
import { db } from './database';

export function logEvent(
  petId: number,
  eventTypeId: string,
  optionId: string,
  occurredAt = Date.now()
) {
  db.runSync(
    `
      INSERT INTO event_log (
        pet_id,
        event_type_id,
        option_id,
        occurred_at
      )
      VALUES (?, ?, ?, ?)
    `,
    petId,
    eventTypeId,
    optionId,
    occurredAt
  );
}

export function getEventTypes(): EventType[] {
  const eventRows = db.getAllSync<EventTypeRow>(`
    SELECT *
    FROM event_types
    WHERE is_hidden = 0
    ORDER BY sort_order, rowid
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
      .map((option): EventOption => ({
        id: option.id,
        label: option.label,
        icon: option.icon ? (option.icon as IconName) : undefined,
        color: option.color ?? undefined,
        bg: option.bg ?? undefined,
        swipe: option.swipe_direction ? (option.swipe_direction as SwipeDirection) : undefined,
      })),
  }));
}

export function reorderEventTypes(eventTypeIds: string[]) {
  db.withTransactionSync(() => {
    eventTypeIds.forEach((eventTypeId, sortOrder) => {
      db.runSync('UPDATE event_types SET sort_order = ? WHERE id = ?', sortOrder, eventTypeId);
    });
  });
}

type RecentEventRow = {
  id: number;
  occurred_at: number;
  event_label: string;
  event_icon: string;
  event_color: string;
  event_bg: string;
  option_label: string;
};

export function getRecentEvents(petId: number, limit: number): RecentEvent[] {
  return getEventHistory(petId, limit, 0);
}

export function getEventHistory(petId: number, limit: number, offset: number): RecentEvent[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  const safeOffset = Math.max(0, Math.floor(offset));

  const rows = db.getAllSync<RecentEventRow>(
    `
      SELECT
        event_log.id,
        event_log.occurred_at,
        event_types.label AS event_label,
        event_types.icon AS event_icon,
        event_types.color AS event_color,
        event_types.bg AS event_bg,
        event_options.label AS option_label
      FROM event_log
      INNER JOIN event_types
        ON event_types.id = event_log.event_type_id
      INNER JOIN event_options
        ON event_options.event_type_id = event_log.event_type_id
        AND event_options.id = event_log.option_id
      WHERE event_log.pet_id = ?
      ORDER BY event_log.occurred_at DESC, event_log.id DESC
      LIMIT ? OFFSET ?
    `,
    petId,
    safeLimit,
    safeOffset
  );

  return rows.map((row) => ({
    id: row.id,
    occurredAt: row.occurred_at,
    eventLabel: row.event_label,
    eventIcon: row.event_icon as IconName,
    eventColor: row.event_color,
    eventBg: row.event_bg,
    optionLabel: row.option_label,
  }));
}
