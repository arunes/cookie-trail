import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

export default function History() {
  return (
    <View className="flex-1 px-4">
      <Pressable
        className="-ml-2 mt-2 h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        accessibilityLabel="Go back"
        onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} color={colors.foreground} />
      </Pressable>

      <Text className="mt-4 text-[25px] font-bold tracking-[-1px] text-foreground">History</Text>

      <View className="flex-1 items-center justify-center pb-24">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-surface">
          <MaterialCommunityIcons name="history" size={28} color={colors['foreground-muted']} />
        </View>
        <Text className="mt-3 text-[16px] font-semibold text-foreground">No events yet</Text>
        <Text className="mt-1 text-[13px] text-foreground-muted">
          Your complete event history will appear here.
        </Text>
      </View>
    </View>
  );
}
