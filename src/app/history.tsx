import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { getEventHistory } from '@/data/events';
import type { RecentEvent } from '@/data/models';
import { getActivePet } from '@/data/pets';
import { colors } from '@/theme/tokens';

const HISTORY_BATCH_SIZE = 20;

export default function History() {
  const [pet] = useState(getActivePet);
  const [events, setEvents] = useState<RecentEvent[]>(() =>
    getEventHistory(pet.id, HISTORY_BATCH_SIZE, 0)
  );
  const [hasMore, setHasMore] = useState(events.length === HISTORY_BATCH_SIZE);
  const isLoading = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const firstBatch = getEventHistory(pet.id, HISTORY_BATCH_SIZE, 0);
      setEvents(firstBatch);
      setHasMore(firstBatch.length === HISTORY_BATCH_SIZE);
      isLoading.current = false;
    }, [pet.id])
  );

  const loadMore = useCallback(() => {
    if (isLoading.current || !hasMore) {
      return;
    }

    isLoading.current = true;
    const nextBatch = getEventHistory(pet.id, HISTORY_BATCH_SIZE, events.length);
    setEvents((current) => [...current, ...nextBatch]);
    setHasMore(nextBatch.length === HISTORY_BATCH_SIZE);
    isLoading.current = false;
  }, [events.length, hasMore, pet.id]);

  return (
    <View className="flex-1 px-4">
      <Pressable
        className="-ml-2 mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        accessibilityLabel="Go back"
        onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={colors.foreground} />
      </Pressable>

      <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">History</Text>

      <FlatList
        className="mt-4"
        contentContainerClassName={events.length === 0 ? 'flex-grow' : 'pb-10'}
        data={events}
        keyExtractor={(event) => event.id.toString()}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pb-24">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
              <MaterialCommunityIcons name="history" size={28} color={colors['foreground-muted']} />
            </View>
            <Text className="mt-3 text-[16px] font-semibold text-foreground">No events yet</Text>
            <Text className="mt-1 text-[13px] text-foreground-muted">
              Events you log will appear here.
            </Text>
          </View>
        }
        renderItem={({ item: event, index }) => (
          <View
            className={`h-[70px] flex-row items-center bg-surface px-4 ${
              index === 0 ? 'rounded-t-[20px]' : ''
            } ${index === events.length - 1 ? 'rounded-b-[20px]' : ''}`}>
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
              {index < events.length - 1 && (
                <View className="absolute bottom-0 top-[35px] w-px bg-border-strong" />
              )}
            </View>

            <View
              className="ml-2 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: event.eventBg }}>
              <MaterialCommunityIcons name={event.eventIcon} size={20} color={event.eventColor} />
            </View>

            <View
              className={`ml-3 flex-1 flex-row items-center py-4 ${
                index < events.length - 1 ? 'border-b border-border' : ''
              }`}>
              <Text className="w-[92px] text-[15px] font-semibold text-foreground">
                {event.eventLabel}
              </Text>
              <Text className="flex-1 text-[14px] text-foreground-secondary">
                {event.optionLabel}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
