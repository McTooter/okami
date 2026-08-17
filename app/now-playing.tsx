import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { GestureResponderEvent, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useArtworkTransition } from "@/components/sphynx/artwork-transition";
import { ListeningField } from "@/components/sphynx/listening-field";
import { SourceBadge } from "@/components/sphynx/controls";
import { MotionPressable } from "@/components/sphynx/motion-pressable";
import { QueueSheet } from "@/components/sphynx/queue-sheet";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { useSphynx } from "@/lib/sphynx-store";

function ProgressRail() {
  const { theme, currentTrack, playbackDuration, playbackSeconds, progress, setProgress } = useSphynx();
  const [railWidth, setRailWidth] = useState(1);
  const selectPosition = (event: GestureResponderEvent) => {
    const { locationX } = event.nativeEvent;
    setProgress(Math.max(0, Math.min(1, locationX / railWidth)));
    haptic.selection();
  };
  return (
    <View>
      <MotionPressable onLayout={(event) => setRailWidth(event.nativeEvent.layout.width)} onPress={selectPosition} emphasis="compact" style={styles.progressHit}>
        <View style={[styles.progressRail, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]} />
          <View style={[styles.progressThumb, { backgroundColor: theme.foreground, left: `${Math.max(0, progress * 100 - 1.7)}%` }]} />
        </View>
      </MotionPressable>
      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: theme.muted }]}>{formatTime(playbackDuration > 0 ? playbackSeconds : durationSeconds(currentTrack.duration) * progress)}</Text>
        <Text style={[styles.time, { color: theme.muted }]}>{playbackDuration > 0 ? formatTime(playbackDuration) : currentTrack.duration}</Text>
      </View>
    </View>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

function durationSeconds(duration: string) {
  const [minutes, seconds] = duration.split(":").map(Number);
  return Number.isFinite(minutes) && Number.isFinite(seconds) ? minutes * 60 + seconds : 0;
}

export default function NowPlayingScreen() {
  const router = useRouter();
  const { setArtworkTarget } = useArtworkTransition();
  const [queueVisible, setQueueVisible] = useState(false);
  const { theme, material, currentTrack, isPlaying, localPlaybackError, togglePlayback, skip, headphoneGroups, activeHeadphoneGroupId, setActiveHeadphoneGroupId, detectedAudioRoute, audioRouteDetectionAvailable, sound } = useSphynx();
  const activeGroup = headphoneGroups.find((group) => group.id === activeHeadphoneGroupId) ?? headphoneGroups[0];
  const detectedBluetoothName = detectedAudioRoute.kind === "bluetooth" ? detectedAudioRoute.name : null;
  const motionReduced = sound.motionReduced;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <Stack.Screen options={{ presentation: "fullScreenModal", animation: "fade" }} />
      <View style={styles.page}>
        <Animated.View entering={motionReduced ? undefined : FadeIn.duration(260)} style={styles.topBar}>
          <MotionPressable accessibilityLabel="Close player" onPress={() => router.back()} emphasis="compact" style={[styles.chromeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="chevron-down" size={22} color={theme.foreground} />
          </MotionPressable>
          <View style={styles.topCenter}>
            <Text style={[styles.topLabel, { color: theme.muted }]}>NOW PLAYING FROM</Text>
            <SourceBadge provider={currentTrack.provider} />
          </View>
          <MotionPressable accessibilityLabel="Open more player options" onPress={haptic.selection} emphasis="compact" style={[styles.chromeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.foreground} />
          </MotionPressable>
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(70).duration(420)}>
          <ListeningField artwork={currentTrack.artwork} accent={currentTrack.accent} theme={theme} material={material} isPlaying={isPlaying} motionReduced={motionReduced} onArtworkMeasured={(rect) => setArtworkTarget(currentTrack.id, rect)} />
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(130).duration(360)} style={styles.songInfo}>
          <View style={styles.titleBlock}>
            <Text numberOfLines={2} style={[styles.songTitle, { color: theme.foreground }]}>{currentTrack.title}</Text>
            <Text numberOfLines={1} style={[styles.songArtist, { color: theme.muted }]}>{currentTrack.artist} · {currentTrack.album}</Text>
          </View>
          <MotionPressable accessibilityLabel="Save track" onPress={haptic.selection} emphasis="compact" style={styles.saveButton}>
            <Ionicons name="add-circle-outline" size={28} color={theme.accent} />
          </MotionPressable>
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(180).duration(320)}><ProgressRail /></Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(210).duration(300)} style={styles.transportRow}>
          <MotionPressable accessibilityLabel="Toggle shuffle" onPress={haptic.selection} emphasis="compact" style={styles.minorControl}>
            <Ionicons name="shuffle" size={20} color={theme.muted} />
          </MotionPressable>
          <MotionPressable accessibilityLabel="Previous track" onPress={() => { haptic.light(); skip("previous"); }} emphasis="primary" style={styles.majorControl}>
            <Ionicons name="play-skip-back" size={30} color={theme.foreground} />
          </MotionPressable>
          <MotionPressable accessibilityLabel={isPlaying ? "Pause" : "Play"} onPress={() => { haptic.medium(); togglePlayback(); }} emphasis="primary" style={[styles.playControl, { backgroundColor: theme.accent }]}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={31} color={theme.accentInk} style={{ marginLeft: isPlaying ? 0 : 3 }} />
          </MotionPressable>
          <MotionPressable accessibilityLabel="Next track" onPress={() => { haptic.light(); skip("next"); }} emphasis="primary" style={styles.majorControl}>
            <Ionicons name="play-skip-forward" size={30} color={theme.foreground} />
          </MotionPressable>
          <MotionPressable accessibilityLabel="Toggle repeat" onPress={haptic.selection} emphasis="compact" style={styles.minorControl}>
            <Ionicons name="repeat" size={20} color={theme.muted} />
          </MotionPressable>
        </Animated.View>

        <View style={[styles.deviceSwitcher, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.deviceLabelRow}>
            <View style={styles.deviceLabel}>
              <Ionicons name="headset-outline" size={15} color={theme.accent} />
              <Text style={[styles.deviceEyebrow, { color: theme.muted }]}>LISTENING ON</Text>
            </View>
            <Text numberOfLines={1} style={[styles.activeDeviceName, { color: theme.foreground }]}>{activeGroup.name}</Text>
          </View>
          <View style={styles.routeStatusRow}>
            <Ionicons name={detectedBluetoothName ? "bluetooth" : "headset-outline"} size={12} color={detectedBluetoothName ? theme.accent : theme.muted} />
            <Text numberOfLines={1} style={[styles.routeStatusText, { color: theme.muted }]}>
              {detectedBluetoothName ? `${detectedBluetoothName} connected · matched to ${activeGroup.name}` : audioRouteDetectionAvailable ? "No matched Bluetooth listening device" : "Auto-select activates in a native Sphynx build"}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deviceChipRow}>
            {headphoneGroups.map((group) => {
              const selected = group.id === activeHeadphoneGroupId;
              return (
                <MotionPressable
                  key={group.id}
                  accessibilityLabel={`Switch listening device to ${group.name}`}
                  onPress={() => { haptic.selection(); setActiveHeadphoneGroupId(group.id); }}
                  emphasis="compact"
                  style={[styles.deviceChip, { borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.accent : theme.raised }]}
                >
                  {selected ? <Ionicons name="checkmark" size={12} color={theme.accentInk} /> : null}
                  <Text numberOfLines={1} style={[styles.deviceChipText, { color: selected ? theme.accentInk : theme.foreground }]}>{group.name}</Text>
                </MotionPressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.toolLine, { borderTopColor: theme.border }]}>
          <MotionPressable onPress={() => router.push("/sound-lab" as never)} style={styles.toolItem}>
            <Ionicons name="options-outline" size={18} color={theme.accent} />
            <Text style={[styles.toolText, { color: theme.foreground }]}>Sound Lab</Text>
          </MotionPressable>
          <View style={[styles.toolDivider, { backgroundColor: theme.border }]} />
          <MotionPressable accessibilityLabel="Open queue" onPress={() => { haptic.selection(); setQueueVisible(true); }} style={styles.toolItem}>
            <Ionicons name="list-outline" size={20} color={theme.accent} />
            <Text style={[styles.toolText, { color: theme.foreground }]}>Queue</Text>
          </MotionPressable>
        </View>

        <View style={[styles.availability, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <Ionicons name={currentTrack.available === "authorized" ? "checkmark-circle-outline" : "information-circle-outline"} size={15} color={theme.accent} />
          <Text style={[styles.availabilityText, { color: localPlaybackError ? theme.danger : theme.muted }]}>
            {localPlaybackError ?? (currentTrack.localUri ? "Playing from a file stored privately on this iPhone." : currentTrack.available === "preview" ? "Preview behavior depends on the connected service." : currentTrack.available === "handoff" ? "This source may open through its approved player." : "Eligible local or Sphynx playback controls are available.")}
          </Text>
        </View>
        <QueueSheet visible={queueVisible} onDismiss={() => setQueueVisible(false)} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 22, justifyContent: "space-between", paddingBottom: 6 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  topCenter: { alignItems: "center", gap: 5 },
  topLabel: { fontSize: 9, lineHeight: 11, fontWeight: "800", letterSpacing: 1.1 },
  chromeButton: { width: 42, height: 42, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  songInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  titleBlock: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: 25, lineHeight: 30, letterSpacing: -0.7, fontWeight: "800" },
  songArtist: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  saveButton: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  progressHit: { height: 26, justifyContent: "center" },
  progressRail: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },
  progressThumb: { position: "absolute", top: -3, width: 10, height: 10, borderRadius: 5 },
  timeRow: { marginTop: -1, flexDirection: "row", justifyContent: "space-between" },
  time: { fontSize: 11, fontWeight: "600", fontVariant: ["tabular-nums"] },
  transportRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  minorControl: { width: 38, height: 44, alignItems: "center", justifyContent: "center" },
  majorControl: { width: 50, height: 52, alignItems: "center", justifyContent: "center" },
  playControl: { width: 66, height: 66, borderRadius: 33, alignItems: "center", justifyContent: "center" },
  deviceSwitcher: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingVertical: 10, overflow: "hidden" },
  deviceLabelRow: { minHeight: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, gap: 12 },
  deviceLabel: { flexDirection: "row", alignItems: "center", gap: 5 },
  deviceEyebrow: { fontSize: 8, fontWeight: "800", letterSpacing: 0.9 },
  activeDeviceName: { flex: 1, minWidth: 0, textAlign: "right", fontSize: 10, fontWeight: "800" },
  routeStatusRow: { minHeight: 17, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingTop: 5 },
  routeStatusText: { flex: 1, fontSize: 9, lineHeight: 12, fontWeight: "600" },
  deviceChipRow: { paddingHorizontal: 12, paddingTop: 9, gap: 7 },
  deviceChip: { minHeight: 29, maxWidth: 150, borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 4 },
  deviceChipText: { flexShrink: 1, fontSize: 10, fontWeight: "800" },
  toolLine: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 12 },
  toolItem: { flex: 1, minHeight: 36, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  toolText: { fontSize: 12, fontWeight: "700" },
  toolDivider: { width: StyleSheet.hairlineWidth, height: 20 },
  availability: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10, paddingVertical: 8 },
  availabilityText: { flex: 1, fontSize: 10, lineHeight: 13, fontWeight: "500" },
});
