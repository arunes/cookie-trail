import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

import { EventType, SwipeableEventRow } from 'components/SwipeableEventRow';
import './global.css';

const events: EventType[] = [
  {
    id: 'pee',
    label: 'Pee',
    icon: 'water',
    color: '#e5a414',
    bg: 'bg-[#fff2c9]',
    options: [
      { id: 'success', label: 'Success', icon: 'check', color: '#2c7a3f', bg: '#e5f5e8', swipe: 'right' },
      { id: 'accident', label: 'Accident', icon: 'close', color: '#b3372f', bg: '#ffe2e4', swipe: 'left' },
    ],
  },
  {
    id: 'poop',
    label: 'Poop',
    icon: 'emoticon-poop',
    color: '#7b4b2c',
    bg: 'bg-[#faebd9]',
    options: [
      { id: 'success', label: 'Success', icon: 'check', color: '#2c7a3f', bg: '#e5f5e8', swipe: 'right' },
      { id: 'accident', label: 'Accident', icon: 'close', color: '#b3372f', bg: '#ffe2e4', swipe: 'left' },
    ],
  },
  {
    id: 'food',
    label: 'Food',
    icon: 'food-drumstick',
    color: '#df665f',
    bg: 'bg-[#ffe2e4]',
    options: [
      { id: 'regular', label: 'Regular', icon: 'bowl', color: '#985c20', bg: '#fff0d7', swipe: 'right' },
      { id: 'treat', label: 'Treat', icon: 'bone', color: '#b03968', bg: '#ffe9f0', swipe: 'left' },
    ],
  },
  {
    id: 'water',
    label: 'Water',
    icon: 'water-outline',
    color: '#2775d4',
    bg: 'bg-[#e1f0ff]',
    options: [
      { id: 'drank', label: 'Drank', icon: 'water-outline', color: '#1c58a6', bg: '#e3f1ff', swipe: 'right' },
      { id: 'refill', label: 'Refill', icon: 'cup', color: '#157f7a', bg: '#e0f5f4', swipe: 'left' },
    ],
  },
  {
    id: 'exercise',
    label: 'Exercise',
    icon: 'dog',
    color: '#2d7c3e',
    bg: 'bg-[#e1f7e4]',
    options: [
      { id: 'walk', label: 'Walk', icon: 'paw', color: '#246d35', bg: '#e5f5e8', swipe: 'right' },
      { id: 'play', label: 'Play', icon: 'soccer', color: '#5b3ea8', bg: '#efe9ff', swipe: 'left' },
    ],
  },
];

function handleEvent(eventType: string, option: string) {
  console.log(`${new Date().toISOString()} — ${eventType} / ${option}`);
}

export default function App() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleEvent = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  const triggerEvent = useCallback((eventType: string, option: string) => {
    handleEvent(eventType, option);
    setExpandedId(null);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        className="flex-1 bg-[#fbf8f5]"
        edges={['top', 'bottom']}
      >
        <StatusBar style="dark" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full">
            {/* Header */}
            <View className="flex-row items-center justify-between py-5">
              <View className="flex-1 flex-row items-center">
                <MaterialCommunityIcons name="paw" size={27} color="#825d3d" />
                <View className="ml-2">
                  <Text className="text-[25px] font-bold tracking-[-1px] text-[#211914]">CookieTrail</Text>
                  <Text className="text-[12px] text-[#aaa6a3]">A happier, healthier pup</Text>
                </View>
              </View>

              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full bg-[#1478e8]"
                accessibilityLabel="Open settings"
              >
                <Ionicons
                  name="settings"
                  size={24}
                  color="#ffffff"
                />
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
              <Ionicons
                name="add"
                size={28}
                color="#43218d"
              />

              <Text className="ml-2 text-[17px] font-medium text-[#43218d]">
                Add Custom Event
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}