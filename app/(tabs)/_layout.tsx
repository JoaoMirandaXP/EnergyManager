import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../src/utils/theme';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Theme.colors.background,
          borderTopColor: Theme.colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textMuted,
        sceneStyle: {
          backgroundColor: Theme.colors.background
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="objetos"
        options={{
          title: "Equipamentos",
          tabBarIcon: ({ color, size }) => <Ionicons name="hardware-chip" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Diário",
          tabBarIcon: ({ color, size }) => <Ionicons name="journal" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="script"
        options={{
          title: "Script",
          tabBarIcon: ({ color, size }) => <Ionicons name="code-slash" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ajustes",
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />
        }}
      />
    </Tabs>
  );
}
