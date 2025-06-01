import '../global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { initDB } from '~/lib/database';
import { useEffect } from 'react';
import { retryQueuedUPloads } from '~/lib/network';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SQLiteProvider databaseName="xtragis.db" onInit={initDB}>
        <RetryUploads />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ title: 'Modal', presentation: 'modal' }} />
        </Stack>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

function RetryUploads() {
  const db = useSQLiteContext();
  useEffect(() => {
    const unsubscribe = retryQueuedUPloads(db);
    return () => unsubscribe();
  }, [db]);
  return null;
}
