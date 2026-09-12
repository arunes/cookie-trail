import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { runMigrations } from './data/migration';
import { ToastHost } from '@/components/toastConfig';
import './global.css';
import Home from '@/screens/Home';

runMigrations();

export default function App() {
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

            <Home />
          </View>
        </ScrollView>

        <ToastHost />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
