import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import Sortable, { type SortableFlexDragEndCallback } from 'react-native-sortables';

import { getEventTypes, reorderEventTypes } from '@/data/events';
import type { EventType } from '@/data/models';
import { colors } from '@/theme/tokens';

type EventRowProps = {
  event: EventType;
  index: number;
  lastIndex: number;
  width: number;
};

function EventRow({ event, index, lastIndex, width }: EventRowProps) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/edit-event', params: { id: event.id } })}
      className={`h-[72px] flex-row items-center border-x border-border bg-surface px-4 active:opacity-80 ${
        index === 0 ? 'rounded-t-2xl border-t' : ''
      } ${index === lastIndex ? 'rounded-b-2xl border-b' : 'border-b'}`}
      style={{ width }}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${event.label} event`}
      accessibilityHint="Opens the event editor. Long press, then drag to reorder">
      <Ionicons name="reorder-three" size={25} color={colors['icon-muted']} />

      <View
        className="ml-3 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: event.bg }}>
        <MaterialCommunityIcons name={event.icon} size={23} color={event.color} />
      </View>

      <Text className="ml-3 flex-1 text-[16px] font-semibold text-foreground">{event.label}</Text>
      <Text className="text-[13px] text-foreground-muted">
        {event.isHidden ? 'Hidden' : event.isSystem ? 'System' : 'Custom'}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors['icon-muted']} className="ml-2" />
    </Pressable>
  );
}

export default function EventSettings() {
  // Hidden events stay manageable here; Home filters them out instead.
  const [events, setEvents] = useState(() => getEventTypes(true));
  const { width: screenWidth } = useWindowDimensions();
  const listWidth = screenWidth - 32;

  useFocusEffect(
    useCallback(() => {
      setEvents(getEventTypes(true));
    }, [])
  );

  const handleDragEnd = useCallback<SortableFlexDragEndCallback>(
    ({ order }) => {
      const reordered = order(events);
      if (reordered === events) return;

      setEvents(reordered);
      requestIdleCallback(() => {
        reorderEventTypes(reordered.map((event) => event.id));
      });
    },
    [events]
  );

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-4 pb-10"
      showsVerticalScrollIndicator={false}>
      <Pressable
        className="-ml-2 mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        accessibilityLabel="Go back"
        onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={colors.foreground} />
      </Pressable>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-[25px] font-bold tracking-[-1px] text-foreground">
          Event Settings
        </Text>
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full bg-primary active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Add event"
          onPress={() => router.push('/create-event')}>
          <Ionicons name="add" size={26} color={colors['on-primary']} />
        </Pressable>
      </View>
      <Text className="mt-1 text-[13px] text-foreground-muted">
        Tap an event to edit it. Long press and drag to change its order on Home.
      </Text>

      <View className="mt-6">
        <Sortable.Flex
          flexDirection="column"
          width={listWidth}
          strategy="insert"
          overDrag="vertical"
          dragActivationDelay={250}
          hapticsEnabled
          autoScrollEnabled={false}
          activeItemScale={1}
          inactiveItemOpacity={1}
          onDragEnd={handleDragEnd}>
          {events.map((event, index) => (
            <EventRow
              key={event.id}
              event={event}
              index={index}
              lastIndex={events.length - 1}
              width={listWidth}
            />
          ))}
        </Sortable.Flex>
      </View>
    </ScrollView>
  );
}
