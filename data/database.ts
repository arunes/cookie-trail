import * as SQLite from 'expo-sqlite';

export type EventTypeRow = {
    id: string;
    label: string;
    icon: string;
    color: string;
    bg: string;
    is_system: number,
    is_hidden: number,
    is_predictable: number,
};

export type EventOptionRow = {
    id: string;
    event_type_id: string;
    label: string;
    icon: string | null;
    color: string | null;
    bg: string | null;
    swipe_direction: 'left' | 'right' | null;
};

export const db = SQLite.openDatabaseSync('cookietrail.db');