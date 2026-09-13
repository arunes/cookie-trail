import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Platform, Pressable, Text, View } from 'react-native';

import { deleteEventLogs, getEventHistory, updateEventTimestamp } from '@/data/events';
import type { RecentEvent } from '@/data/models';
import { getActivePet } from '@/data/pets';
import { colors } from '@/theme/tokens';

const BATCH_SIZE = 20;

export default function History() {
  const [pet] = useState(getActivePet);
  const [events, setEvents] = useState<RecentEvent[]>(() => getEventHistory(pet.id, BATCH_SIZE, 0));
  const [hasMore, setHasMore] = useState(events.length === BATCH_SIZE);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [editing, setEditing] = useState<RecentEvent | null>(null);
  const [draft, setDraft] = useState(() => new Date());
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const loading = useRef(false);

  const refresh = useCallback(() => {
    const rows = getEventHistory(pet.id, BATCH_SIZE, 0);
    setEvents(rows);
    setHasMore(rows.length === BATCH_SIZE);
    loading.current = false;
  }, [pet.id]);

  useFocusEffect(refresh);

  const loadMore = useCallback(() => {
    if (loading.current || !hasMore) return;
    loading.current = true;
    const rows = getEventHistory(pet.id, BATCH_SIZE, events.length);
    setEvents((current) => [...current, ...rows]);
    setHasMore(rows.length === BATCH_SIZE);
    loading.current = false;
  }, [events.length, hasMore, pet.id]);

  const cancelSelection = useCallback(() => {
    setSelecting(false);
    setSelected(new Set());
  }, []);

  const toggle = useCallback((id: number) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const longPress = useCallback((id: number) => {
    setSelecting(true);
    setSelected((current) => new Set(current).add(id));
  }, []);

  const openEditor = useCallback((event: RecentEvent) => {
    setEditing(event);
    setDraft(new Date(event.occurredAt));
    setPicker(null);
  }, []);

  const closeEditor = useCallback(() => {
    setEditing(null);
    setPicker(null);
  }, []);

  const save = useCallback(() => {
    if (!editing) return;
    updateEventTimestamp(editing.id, pet.id, draft.getTime());
    closeEditor();
    refresh();
  }, [closeEditor, draft, editing, pet.id, refresh]);

  const confirmDelete = useCallback(() => {
    const count = selected.size;
    if (!count) return;
    Alert.alert(
      count === 1 ? 'Delete event?' : `Delete ${count} events?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteEventLogs([...selected], pet.id);
            cancelSelection();
            refresh();
          },
        },
      ]
    );
  }, [cancelSelection, pet.id, refresh, selected]);

  return (
    <View className="flex-1 px-4">
      <View className="flex-row items-center justify-between pt-5">
        <Text className="text-[25px] font-bold tracking-[-1px] text-foreground">
          {selecting ? `${selected.size} selected` : 'History'}
        </Text>
        <Pressable
          className="min-h-11 justify-center px-2 active:opacity-60"
          onPress={selecting ? cancelSelection : () => setSelecting(true)}>
          <Text className="text-[14px] font-semibold text-accent">
            {selecting ? 'Cancel' : 'Select'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        className="mt-4"
        contentContainerClassName={
          events.length === 0 ? 'flex-grow' : selecting ? 'pb-28' : 'pb-10'
        }
        data={events}
        extraData={{ selected, selecting }}
        keyExtractor={(event) => event.id.toString()}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<EmptyHistory />}
        renderItem={({ item, index }) => (
          <HistoryRow
            event={item}
            index={index}
            count={events.length}
            selecting={selecting}
            selected={selected.has(item.id)}
            onPress={() => (selecting ? toggle(item.id) : openEditor(item))}
            onLongPress={() => longPress(item.id)}
          />
        )}
      />

      {selecting && (
        <View className="absolute bottom-3 left-4 right-4 rounded-[20px] border border-border bg-surface p-2 shadow-lg">
          <Pressable
            className={`h-12 flex-row items-center justify-center rounded-[14px] ${selected.size ? 'active:opacity-70' : 'opacity-40'}`}
            disabled={!selected.size}
            accessibilityLabel={`Delete ${selected.size} selected events`}
            onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text className="ml-2 text-[15px] font-semibold text-danger">
              Delete{selected.size ? ` (${selected.size})` : ''}
            </Text>
          </Pressable>
        </View>
      )}

      <Modal
        visible={editing !== null}
        transparent
        animationType="slide"
        onRequestClose={closeEditor}>
        <Pressable className="flex-1 justify-end bg-black/30" onPress={closeEditor}>
          <Pressable
            className="rounded-t-[28px] bg-surface px-5 pb-8 pt-5"
            onPress={(e) => e.stopPropagation()}>
            <View className="mb-5 flex-row items-center justify-between">
              <View>
                <Text className="text-[20px] font-bold text-foreground">Edit timestamp</Text>
                {editing && (
                  <Text className="mt-1 text-[13px] text-foreground-muted">
                    {editing.eventLabel} · {editing.optionLabel}
                  </Text>
                )}
              </View>
              <Pressable
                className="h-10 w-10 items-center justify-center rounded-full bg-option-surface"
                onPress={closeEditor}>
                <Ionicons name="close" size={22} color={colors.foreground} />
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <TimestampButton
                label="Date"
                value={draft.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
                onPress={() => setPicker('date')}
              />
              <TimestampButton
                label="Time"
                value={draft.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                onPress={() => setPicker('time')}
              />
            </View>

            {picker && (
              <DateTimePicker
                value={draft}
                mode={picker}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, value) => {
                  if (Platform.OS !== 'ios') setPicker(null);
                  if (value) setDraft(value);
                }}
              />
            )}

            <View className="mt-5 flex-row gap-3">
              <Pressable
                className="h-12 flex-1 items-center justify-center rounded-[16px] bg-option-surface"
                onPress={closeEditor}>
                <Text className="text-[15px] font-semibold text-foreground-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                className="h-12 flex-1 items-center justify-center rounded-[16px] bg-primary"
                onPress={save}>
                <Text className="text-[15px] font-semibold text-on-primary">Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function EmptyHistory() {
  return (
    <View className="flex-1 items-center justify-center pb-24">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
        <MaterialCommunityIcons name="history" size={28} color={colors['foreground-muted']} />
      </View>
      <Text className="mt-3 text-[16px] font-semibold text-foreground">No events yet</Text>
      <Text className="mt-1 text-[13px] text-foreground-muted">
        Events you log will appear here.
      </Text>
    </View>
  );
}

type HistoryRowProps = {
  event: RecentEvent;
  index: number;
  count: number;
  selecting: boolean;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function HistoryRow({
  event,
  index,
  count,
  selecting,
  selected,
  onPress,
  onLongPress,
}: HistoryRowProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityState={{ selected }}
      accessibilityHint={selecting ? 'Toggles event selection' : 'Opens timestamp editor'}
      className={`h-[70px] flex-row items-center px-4 active:opacity-80 ${selected ? 'bg-accent-surface' : 'bg-surface'} ${index === 0 ? 'rounded-t-[20px]' : ''} ${index === count - 1 ? 'rounded-b-[20px]' : ''}`}>
      <View className="w-[82px]">
        <Text className="text-[12px] text-foreground-muted">
          {new Date(event.occurredAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        <Text className="mt-0.5 text-[13px] text-foreground-secondary">
          {new Date(event.occurredAt).toLocaleTimeString(undefined, {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View className="h-full w-5 items-center">
        {index > 0 && <View className="h-1/2 w-px bg-border-strong" />}
        <View
          className="absolute top-[31px] h-2 w-2 rounded-full"
          style={{ backgroundColor: event.eventColor }}
        />
        {index < count - 1 && (
          <View className="absolute bottom-0 top-[35px] w-px bg-border-strong" />
        )}
      </View>
      <View
        className="ml-2 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: event.eventBg }}>
        <MaterialCommunityIcons name={event.eventIcon} size={20} color={event.eventColor} />
      </View>
      <View
        className={`ml-3 flex-1 flex-row items-center py-4 ${index < count - 1 ? 'border-b border-border' : ''}`}>
        <Text className="w-[92px] text-[15px] font-semibold text-foreground">
          {event.eventLabel}
        </Text>
        <Text className="flex-1 text-[14px] text-foreground-secondary">{event.optionLabel}</Text>
        {selecting && (
          <View
            className={`ml-2 h-6 w-6 items-center justify-center rounded-full border ${selected ? 'border-accent bg-accent' : 'border-border-strong'}`}>
            {selected && <Ionicons name="checkmark" size={16} color={colors.surface} />}
          </View>
        )}
      </View>
    </Pressable>
  );
}

function TimestampButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="h-14 flex-1 justify-center rounded-[16px] border border-border px-4 active:opacity-60"
      onPress={onPress}>
      <Text className="text-[11px] font-semibold uppercase text-foreground-muted">{label}</Text>
      <Text className="mt-1 text-[15px] font-semibold text-foreground">{value}</Text>
    </Pressable>
  );
}
