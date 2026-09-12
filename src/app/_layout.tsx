import { Stack } from 'expo-router';

import { AppShell } from '@/components/AppShell';
import { runMigrations } from '@/data/migration';

// Loads the compiled NativeWind stylesheet — without this import every
// className in the app is a no-op and the shell collapses to zero height.
import '../global.css';

// Run before any screen renders. Screens read the database in render-time
// initializers, so migrations must have been applied by then.
runMigrations();

export default function RootLayout() {
  return (
    <AppShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fbf8f5' },
        }}
      />
    </AppShell>
  );
}
