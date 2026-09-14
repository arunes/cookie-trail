import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getEventTypes } from '@/data/events';
import { colors } from '@/theme/tokens';

export default function EventSettings() {
  const [events] = useState(getEventTypes);

  return (
    <ScrollView
      className="flex-1"
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
        Choose which events are available on Home.
      </Text>

      <View className="mt-6 overflow-hidden rounded-2xl border border-border bg-surface px-4">
        {events.map((event, index) => (
          <View
            key={event.id}
            className={`flex-row items-center py-3.5 ${index > 0 ? 'border-t border-border' : ''}`}>
            <View
              className="h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: event.bg }}>
              <MaterialCommunityIcons name={event.icon} size={23} color={event.color} />
            </View>

            <Text className="ml-3 flex-1 text-[16px] font-semibold text-foreground">
              {event.label}
            </Text>

            <Text className="text-[13px] text-foreground-muted">
              {event.isSystem ? 'System' : 'Custom'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
