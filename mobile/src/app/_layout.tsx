import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(shop)",
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(shop)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

