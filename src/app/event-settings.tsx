import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
    <View
      className={`h-[72px] flex-row items-center border-x border-border bg-surface px-4 ${
        index === 0 ? 'rounded-t-2xl border-t' : ''
      } ${index === lastIndex ? 'rounded-b-2xl border-b' : 'border-b'}`}
      style={{ width }}
      accessible
      accessibilityLabel={`${event.label} event`}
      accessibilityHint="Long press, then drag to reorder">
      <Ionicons name="reorder-three" size={25} color={colors['icon-muted']} />

      <View
        className="ml-3 h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: event.bg }}>
        <MaterialCommunityIcons name={event.icon} size={23} color={event.color} />
      </View>

      <Text className="ml-3 flex-1 text-[16px] font-semibold text-foreground">{event.label}</Text>
      <Text className="text-[13px] text-foreground-muted">
        {event.isSystem ? 'System' : 'Custom'}
      </Text>
    </View>
  );
}

export default function EventSettings() {
  const [events, setEvents] = useState(getEventTypes);
  const { width: screenWidth } = useWindowDimensions();
  const listWidth = screenWidth - 32;

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

      <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">
        Event Settings
      </Text>
      <Text className="mt-1 text-[13px] text-foreground-muted">
        Long press an event and drag to change its order on Home.
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
