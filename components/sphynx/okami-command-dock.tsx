import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { type ComponentProps, useEffect } from "react";
import { Platform, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { haptic } from "@/lib/haptics";
import { isWideLibraryCanvas } from "@/lib/okami-layout-core";
import { useSphynx } from "@/lib/sphynx-store";
import { MotionPressable } from "./motion-pressable";

type IconName = ComponentProps<typeof Ionicons>["name"];

const COMMANDS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Library", icon: "library-outline" },
  discover: { label: "Discover", icon: "compass-outline" },
  search: { label: "Search", icon: "search-outline" },
  themes: { label: "Studio", icon: "color-palette-outline" },
  profile: { label: "Identity", icon: "person-outline" },
};

function DockCommand({ command, focused, onPress, onLongPress, wide, width }: { command: { label: string; icon: IconName }; focused: boolean; onPress: () => void; onLongPress: () => void; wide: boolean; width?: number }) {
  const { material, sound, theme } = useSphynx();
  const isNoirPulse = material.id === "noir-pulse";
  const selected = useSharedValue(focused ? 1 : 0);
  const cue = material.cue ?? theme.accent;

  useEffect(() => {
    selected.value = withTiming(focused ? 1 : 0, { duration: sound.motionReduced ? 0 : isNoirPulse ? 240 : 180, easing: Easing.out(Easing.cubic) });
  }, [focused, isNoirPulse, selected, sound.motionReduced]);

  const activePillStyle = useAnimatedStyle(() => ({
    opacity: selected.value,
    transform: isNoirPulse
      ? [{ scaleY: 0.16 + selected.value * 0.84 }, { translateY: (1 - selected.value) * 10 }]
      : [{ scale: 0.9 + selected.value * 0.1 }, { translateY: (1 - selected.value) * 4 }],
  }));

  return (
    <MotionPressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={command.label}
      onLongPress={onLongPress}
      onPress={onPress}
      emphasis="compact"
      style={[styles.command, wide && styles.iPadCommand, wide && width ? { width } : undefined]}
    >
      <Animated.View pointerEvents="none" style={[styles.activePill, isNoirPulse && styles.noirActiveMarker, { backgroundColor: cue }, activePillStyle]} />
      <View style={styles.commandContent}>
        <Ionicons color={focused ? (isNoirPulse ? theme.foreground : theme.accentInk) : theme.muted} name={command.icon} size={20} />
        <Text numberOfLines={1} style={[styles.commandLabel, { color: focused ? (isNoirPulse ? theme.foreground : theme.accentInk) : theme.muted }]}>
          {command.label}
        </Text>
      </View>
    </MotionPressable>
  );
}

/** A focused, original navigation dock that preserves native tab semantics. */
export function OkamiCommandDock({ state, descriptors, navigation }: BottomTabBarProps) {
  const { material, theme } = useSphynx();
  const isNoirPulse = material.id === "noir-pulse";
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const isIpadLandscape = isWideLibraryCanvas(width, height);
  const iPadDockWidth = Math.min(Math.max(width * 0.58, 520), 740);
  const iPadCommandWidth = (iPadDockWidth - 8) / state.routes.length;
  const cue = material.cue ?? theme.accent;
  const bottomInset = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 10);

  return (
    <View style={[styles.shell, isNoirPulse && styles.noirShell, isIpadLandscape && styles.iPadShell, { paddingBottom: bottomInset }]}>
      <View style={[styles.dock, isNoirPulse && styles.noirDock, isIpadLandscape && styles.iPadDock, isIpadLandscape ? { width: iPadDockWidth } : undefined, { backgroundColor: theme.raised, borderColor: theme.border }]}>
        <View pointerEvents="none" style={[styles.signalLine, { backgroundColor: cue }]} />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const command = COMMANDS[route.name] ?? { label: descriptors[route.key]?.options.title ?? route.name, icon: "ellipse-outline" as IconName };
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              haptic.selection();
              navigation.navigate(route.name as never);
            }
          };
          const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });

          return <DockCommand command={command} focused={focused} key={route.key} onLongPress={onLongPress} onPress={onPress} wide={isIpadLandscape} width={isIpadLandscape ? iPadCommandWidth : undefined} />;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { paddingHorizontal: 14, paddingTop: 8, backgroundColor: "transparent" },
  dock: { height: 64, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", paddingHorizontal: 4, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.24, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 12 },
  signalLine: { position: "absolute", top: 0, left: 28, right: 28, height: 1, opacity: 0.8 },
  command: { flex: 1, minWidth: 0, marginVertical: 6, borderRadius: 18, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  activePill: { ...StyleSheet.absoluteFillObject, borderRadius: 18 },
  noirActiveMarker: { left: 0, right: undefined, top: 10, bottom: 10, width: 2, borderRadius: 0 },
  commandContent: { alignItems: "center", justifyContent: "center", gap: 3 },
  commandLabel: { fontSize: 9, lineHeight: 11, fontWeight: "800", letterSpacing: 0.18 },
  noirShell: { paddingHorizontal: 0, paddingTop: 0 },
  noirDock: { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, shadowOpacity: 0 },
  iPadShell: { alignItems: "center", paddingHorizontal: 0, paddingTop: 5 },
  iPadDock: { height: 56 },
  iPadCommand: { flex: 0, flexShrink: 0 },
});
