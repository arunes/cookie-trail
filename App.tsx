import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { runMigrations } from './data/migration';
import { SwipeableEventRow } from 'components/SwipeableEventRow';
import { ToastHost } from 'components/toastConfig';
import { getEventTypes } from './data/events';
import './global.css';
import { EventOption, EventType } from './data/models';
import { logEvent } from './data/events';

runMigrations();

const events = getEventTypes();
export default function App() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleEvent = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const triggerEvent = useCallback((event: EventType, option: EventOption) => {
    logEvent(event.id, option.id);
    console.log(`${new Date().toISOString()} — ${event.id} / ${option.id}`);

    Toast.show({
      type: 'event',
      text1: `${event.label} · ${option.label}`,
      text2: new Date().toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    });

    setExpandedId(null);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#fbf8f5]" edges={['top', 'bottom']}>
        <StatusBar style="dark" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          showsVerticalScrollIndicator={false}>
          <View className="w-full">
            {/* Header */}
            <View className="flex-row items-center justify-between py-5">
              <View className="flex-1 flex-row items-center">
                <MaterialCommunityIcons name="paw" size={27} color="#825d3d" />
                <View className="ml-2">
                  <Text className="text-[25px] font-bold tracking-[-1px] text-[#211914]">
                    CookieTrail
                  </Text>
                  <Text className="text-[12px] text-[#aaa6a3]">A happier, healthier pup</Text>
                </View>
              </View>

              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full bg-[#1478e8]"
                accessibilityLabel="Open settings">
                <Ionicons name="settings" size={24} color="#ffffff" />
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

            {/* Add custom event */}
            <Pressable className="mt-6 h-16 flex-row items-center justify-center rounded-[22px] bg-[#eee5ff]">
              <Ionicons name="add" size={28} color="#43218d" />

              <Text className="ml-2 text-[17px] font-medium text-[#43218d]">Add Custom Event</Text>
            </Pressable>
          </View>
        </ScrollView>

        <ToastHost />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
