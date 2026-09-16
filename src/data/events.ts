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

export function getEventTypes(includeHidden = false): EventType[] {
  const eventRows = db.getAllSync<EventTypeRow>(`
    SELECT *
    FROM event_types
    ${includeHidden ? '' : 'WHERE is_hidden = 0'}
    ORDER BY sort_order, rowid
  `);

  const optionRows = db.getAllSync<EventOptionRow>(`
    SELECT *
    FROM event_options
    ORDER BY event_type_id, sort_order
  `);

  return eventRows.map((row) => mapEventType(row, optionRows));
}

export function getEventType(eventTypeId: string): EventType | null {
  const row = db.getFirstSync<EventTypeRow>('SELECT * FROM event_types WHERE id = ?', eventTypeId);
  if (!row) {
    return null;
  }

  const optionRows = db.getAllSync<EventOptionRow>(
    'SELECT * FROM event_options WHERE event_type_id = ? ORDER BY sort_order, rowid',
    eventTypeId
  );

  return mapEventType(row, optionRows);
}

function mapEventType(row: EventTypeRow, optionRows: EventOptionRow[]): EventType {
  return {
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
  };
}

export function updateEventType(
  eventTypeId: string,
  changes: Pick<EventType, 'label' | 'icon' | 'color' | 'bg' | 'isPredictable' | 'isHidden'>
) {
  db.runSync(
    `
      UPDATE event_types
      SET label = ?, icon = ?, color = ?, bg = ?, is_predictable = ?, is_hidden = ?
      WHERE id = ?
    `,
    changes.label,
    changes.icon,
    changes.color,
    changes.bg,
    changes.isPredictable ? 1 : 0,
    changes.isHidden ? 1 : 0,
    eventTypeId
  );
}

export function getEventTypeLogCount(eventTypeId: string): number {
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM event_log WHERE event_type_id = ?',
    eventTypeId
  );

  return row?.count ?? 0;
}

export function deleteEventType(eventTypeId: string) {
  // Deleting a definition also deletes the history that references it: the
  // event_log foreign key has no cascade, so its rows are removed explicitly.
  // event_options cascade through their foreign key. System types are protected
  // in SQL as well as in the UI.
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM event_log WHERE event_type_id = ?', eventTypeId);
    db.runSync('DELETE FROM event_types WHERE id = ? AND is_system = 0', eventTypeId);
  });
}

export function reorderEventTypes(eventTypeIds: string[]) {
  db.withTransactionSync(() => {
    eventTypeIds.forEach((eventTypeId, sortOrder) => {
      db.runSync('UPDATE event_types SET sort_order = ? WHERE id = ?', sortOrder, eventTypeId);
    });
  });
}

export function addEventOption(eventTypeId: string, option: EventOption) {
  // New options append to the end of the type's ordering.
  db.runSync(
    `
      INSERT INTO event_options (
        id,
        event_type_id,
        label,
        icon,
        color,
        bg,
        swipe_direction,
        sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, NULL, ?)
    `,
    option.id,
    eventTypeId,
    option.label,
    option.icon ?? null,
    option.color ?? null,
    option.bg ?? null,
    db.getFirstSync<{ max: number | null }>(
      'SELECT MAX(sort_order) + 1 AS max FROM event_options WHERE event_type_id = ?',
      eventTypeId
    )?.max ?? 0
  );
}

export function updateEventOption(
  eventTypeId: string,
  optionId: string,
  changes: Pick<EventOption, 'label' | 'icon' | 'color' | 'bg'>
) {
  db.runSync(
    `
      UPDATE event_options
      SET label = ?, icon = ?, color = ?, bg = ?
      WHERE event_type_id = ? AND id = ?
    `,
    changes.label,
    changes.icon ?? null,
    changes.color ?? null,
    changes.bg ?? null,
    eventTypeId,
    optionId
  );
}

export function deleteEventOption(eventTypeId: string, optionId: string) {
  // Deleting a choice also deletes the history that references it: event_log
  // links the exact type/option pair with no cascade, so its rows are removed
  // explicitly in the same transaction.
  db.withTransactionSync(() => {
    db.runSync(
      'DELETE FROM event_log WHERE event_type_id = ? AND option_id = ?',
      eventTypeId,
      optionId
    );
    db.runSync(
      'DELETE FROM event_options WHERE event_type_id = ? AND id = ?',
      eventTypeId,
      optionId
    );
  });
}

export function reorderEventOptions(eventTypeId: string, optionIds: string[]) {
  db.withTransactionSync(() => {
    optionIds.forEach((optionId, sortOrder) => {
      db.runSync(
        'UPDATE event_options SET sort_order = ? WHERE event_type_id = ? AND id = ?',
        sortOrder,
        eventTypeId,
        optionId
      );
    });
  });
}

export function getEventOptionLogCount(eventTypeId: string, optionId: string): number {
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM event_log WHERE event_type_id = ? AND option_id = ?',
    eventTypeId,
    optionId
  );

  return row?.count ?? 0;
}

export function nextEventOptionId(eventTypeId: string, label: string): string {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'option';

  const taken = new Set(
    db
      .getAllSync<{ id: string }>(
        'SELECT id FROM event_options WHERE event_type_id = ?',
        eventTypeId
      )
      .map((row) => row.id)
  );

  if (!taken.has(base)) {
    return base;
  }

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) {
    counter += 1;
  }

  return `${base}-${counter}`;
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

export function getEventLogIds(petId: number): number[] {
  return db
    .getAllSync<{ id: number }>(
      'SELECT id FROM event_log WHERE pet_id = ? ORDER BY occurred_at DESC, id DESC',
      petId
    )
    .map((row) => row.id);
}

export function updateEventTimestamp(eventLogId: number, petId: number, occurredAt: number) {
  db.runSync(
    'UPDATE event_log SET occurred_at = ? WHERE id = ? AND pet_id = ?',
    occurredAt,
    eventLogId,
    petId
  );
}

export function deleteEventLogs(eventLogIds: number[], petId: number) {
  if (eventLogIds.length === 0) {
    return;
  }

  db.withTransactionSync(() => {
    eventLogIds.forEach((eventLogId) => {
      db.runSync('DELETE FROM event_log WHERE id = ? AND pet_id = ?', eventLogId, petId);
    });
  });
}
