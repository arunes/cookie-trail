import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ToastHost } from '@/toastConfig';
import { colors } from '@/theme/tokens';
import { runMigrations } from '@/data/migration';

// Loads the compiled NativeWind stylesheet — without this import every
// className in the app is a no-op and the shell collapses to zero height.
import '../global.css';

// Run before any screen renders. Screens read the database in render-time
// initializers, so migrations must have been applied by then.
runMigrations();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
        <ToastHost />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
