import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

import { SwipeableEventRow } from '@/components/SwipeableEventRow';
import { getEventTypes, getRecentEvents, logEvent } from '@/data/events';
import { getActivePet } from '@/data/pets';
import { colors } from '@/theme/tokens';
import { EventOption, EventType } from '@/data/models';

export default function Home() {
  const [events] = useState(getEventTypes);
  const [pet] = useState(getActivePet);
  const [recentEvents, setRecentEvents] = useState(() => getRecentEvents(pet.id, 5));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleEvent = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const triggerEvent = useCallback(
    (event: EventType, option: EventOption) => {
      logEvent(pet.id, event.id, option.id);
      setRecentEvents(getRecentEvents(pet.id, 5));

      Toast.show({
        type: 'event',
        text1: `${event.label} · ${option.label}`,
        text2: new Date().toLocaleTimeString(undefined, {
          hour: 'numeric',
          minute: '2-digit',
        }),
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

      {/* Recent Events */}
      <View className="mt-8">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[21px] font-bold tracking-[-0.6px] text-foreground">
            Recent Events
          </Text>
          <Pressable
            className="flex-row items-center py-2 pl-3 active:opacity-60"
            accessibilityRole="button"
            accessibilityLabel="View all event history"
            onPress={() => router.push('/history')}>
            <Text className="text-[14px] font-semibold text-accent">View All</Text>
            <Ionicons name="chevron-forward" size={17} color={colors.accent} />
          </Pressable>
        </View>

        {recentEvents.length === 0 ? (
          <View className="items-center rounded-[20px] border border-border bg-surface px-5 py-8">
            <MaterialCommunityIcons name="history" size={26} color={colors['foreground-muted']} />
            <Text className="mt-2 text-[14px] font-medium text-foreground-secondary">
              No events yet
            </Text>
            <Text className="mt-1 text-center text-[12px] text-foreground-muted">
              Events you log will appear here.
            </Text>
          </View>
        ) : (
          <View className="overflow-hidden rounded-[20px] border border-border bg-surface px-4">
            {recentEvents.map((event, index) => (
              <View key={event.id} className="h-[66px] flex-row items-center">
                <Text className="w-[76px] text-[13px] text-foreground-secondary">
                  {new Date(event.occurredAt).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </Text>

                <View className="h-full w-5 items-center">
                  {index > 0 && <View className="h-1/2 w-px bg-border-strong" />}
                  <View
                    className="absolute top-[29px] h-2 w-2 rounded-full"
                    style={{ backgroundColor: event.eventColor }}
                  />
                  {index < recentEvents.length - 1 && (
                    <View className="absolute bottom-0 top-[33px] w-px bg-border-strong" />
                  )}
                </View>

                <View
                  className="ml-2 h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: event.eventBg }}>
                  <MaterialCommunityIcons
                    name={event.eventIcon}
                    size={20}
                    color={event.eventColor}
                  />
                </View>

                <View
                  className={`ml-3 flex-1 flex-row items-center py-4 ${
                    index < recentEvents.length - 1 ? 'border-b border-border' : ''
                  }`}>
                  <Text className="w-[92px] text-[15px] font-semibold text-foreground">
                    {event.eventLabel}
                  </Text>
                  <Text className="flex-1 text-[14px] text-foreground-secondary">
                    {event.optionLabel}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
