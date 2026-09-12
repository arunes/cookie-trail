import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { SwipeableEventRow } from '@/components/SwipeableEventRow';
import { logEvent, getEventTypes } from '@/data/events';
import { EventOption, EventType } from '@/data/models';

export default function Home() {
  // Must run after runMigrations() (called in App's module body). Calling it at
  // module scope here would run before that, since imported modules evaluate first.
  const [events] = useState(getEventTypes);
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
    <>
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
    </>
  );
}
