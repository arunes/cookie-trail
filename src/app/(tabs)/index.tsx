import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';

import { SwipeableEventRow } from '@/components/SwipeableEventRow';
import { deleteEventLogs, getEventTypes, logEvent } from '@/data/events';
import { getActivePet } from '@/data/pets';
import { colors } from '@/theme/tokens';
import { EventOption, EventType } from '@/data/models';

export default function Home() {
  const [events, setEvents] = useState(getEventTypes);
  const [pet] = useState(getActivePet);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      setEvents(getEventTypes());
    }, [])
  );

  const toggleEvent = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const triggerEvent = useCallback(
    (event: EventType, option: EventOption) => {
      const logId = logEvent(pet.id, event.id, option.id);

      Toast.show({
        type: 'event',
        text1: `${event.label} · ${option.label}`,
        text2: new Date().toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }),
        // Slightly longer window so the undo action is usable.
        visibilityTime: 4000,
        props: {
          onUndo: () => deleteEventLogs([logId], pet.id),
        },
      });

      setExpandedId(null);
    },
    [pet.id]
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pb-10"
      showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row items-center justify-between py-5">
        <View className="flex-1 flex-row items-center">
          <MaterialCommunityIcons name="paw" size={27} color={colors.brand} />
          <View className="ml-2">
            <Text className="text-[25px] font-bold tracking-[-1px] text-foreground">
              CookieTrail
            </Text>
            <Text className="text-[12px] text-foreground-muted">A happier, healthier pup</Text>
          </View>
        </View>

        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full bg-primary"
          accessibilityLabel="Open settings"
          onPress={() => router.push('/settings')}>
          <Ionicons name="settings" size={24} color={colors['on-primary']} />
        </Pressable>
      </View>

      {/* Events */}
      <View className="gap-2.5">
        {events.map((event) => (
          <SwipeableEventRow
            key={event.id}
            event={event}
            expanded={expandedId === event.id}
            onToggle={toggleEvent}
            onAction={triggerEvent}
          />
        ))}
      </View>
    </ScrollView>
  );
}
