import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
      <Stack.Screen name="chat" options={{ title: 'Chat Practice', headerShown: true }} />
      <Stack.Screen name="speaking" options={{ title: 'Speaking Practice', headerShown: true }} />
      <Stack.Screen name="translator" options={{ title: 'Translator', headerShown: true }} />
    </Stack>
  );
}
