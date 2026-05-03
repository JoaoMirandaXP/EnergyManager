import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Aqui definimos que o grupo (tabs) é a nossa rota principal.
        O 'headerShown: false' aqui esconde o título do Stack pai, 
        já que as Tabs terão seu próprio gerenciamento de título.*/}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}