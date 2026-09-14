import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';

import { colors } from '@/theme/tokens';

export default function Settings() {
  return (
    <View className="flex-1 px-4">
      <Pressable
        className="-ml-2 mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        accessibilityLabel="Go back"
        onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={colors.foreground} />
      </Pressable>

      <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">Settings</Text>

      <View className="mt-5 overflow-hidden rounded-2xl border border-border bg-surface">
        <Pressable
          className="flex-row items-center px-4 py-4 active:bg-option-surface"
          accessibilityRole="button"
          accessibilityLabel="Open Event Settings"
          onPress={() => router.push('/event-settings')}>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-accent-surface">
            <Ionicons name="grid" size={20} color={colors.accent} />
          </View>

          <View className="ml-3 flex-1">
            <Text className="text-[16px] font-semibold text-foreground">Event Settings</Text>
            <Text className="mt-0.5 text-[13px] text-foreground-muted">Manage event types</Text>
          </View>

          <Ionicons name="chevron-forward" size={21} color={colors['icon-muted']} />
        </Pressable>
      </View>
    </View>
  );
}
