import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.textPrimary,
          contentStyle: { backgroundColor: Colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/message" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/result" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/link" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/qr" options={{ headerShown: false }} />
        <Stack.Screen name="analysis/image" options={{ headerShown: false }} />
        <Stack.Screen name="tools/sos" options={{ headerShown: false }} />
        <Stack.Screen name="tools/arena" options={{ headerShown: false }} />
        <Stack.Screen name="tools/breach" options={{ headerShown: false }} />
        <Stack.Screen name="tools/shield" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="settings/index" options={{ headerShown: false }} />
      </Stack>
    </AppProvider>
  );
}
