import { Tabs } from "expo-router";

import { OkamiCommandDock } from "@/components/sphynx/okami-command-dock";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <OkamiCommandDock {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Library",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="music.note.list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="themes"
        options={{
          title: "Themes",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="paintpalette.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
