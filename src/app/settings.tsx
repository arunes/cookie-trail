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
      <Text className="mt-1 text-[13px] text-foreground-muted">Nothing to configure yet.</Text>
    </View>
  );
}
