import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

type TabItemProps = {
  focused: boolean;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function TabItem({ focused, activeIcon, inactiveIcon, label }: TabItemProps) {
  const color = focused ? colors.accent : colors['foreground-secondary'];

  return (
    <View style={[styles.tabPill, focused && styles.activeTabPill]}>
      <Ionicons name={focused ? activeIcon : inactiveIcon} size={24} color={color} />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarShowLabel: false,
        tabBarIconStyle: {
          width: 124,
          height: 56,
        },
        tabBarItemStyle: {
          padding: 0,
        },
        tabBarStyle: {
          height: 76,
          paddingHorizontal: 28,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabItem focused={focused} activeIcon="home" inactiveIcon="home-outline" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              activeIcon="time"
              inactiveIcon="time-outline"
              label="History"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabPill: {
    width: 124,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    gap: 2,
  },
  activeTabPill: {
    backgroundColor: colors['accent-surface'],
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
