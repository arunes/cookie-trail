import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ToastHost } from '@/components/toastConfig';

type AppShellProps = {
  children: ReactNode;
};

// App-wide chrome: safe area padding, status bar, and the toast host.
// Everything screen-specific (navigation stack, screens) renders as children.
export function AppShell({ children }: AppShellProps) {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-[#fbf8f5]" edges={['top', 'bottom']}>
        <StatusBar style="dark" />

        {children}

        <ToastHost />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
