import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from "react-native";

import { AlbumArt } from "@/components/sphynx/album-art";
import { SourceBadge } from "@/components/sphynx/controls";
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
      <Pressable onLayout={(event) => setRailWidth(event.nativeEvent.layout.width)} onPress={selectPosition} style={({ pressed }) => [styles.progressHit, pressed && styles.pressed]}>
        <View style={[styles.progressRail, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${progress * 100}%` }]} />
          <View style={[styles.progressThumb, { backgroundColor: theme.foreground, left: `${Math.max(0, progress * 100 - 1.7)}%` }]} />
        </View>
      </Pressable>
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
  const { theme, currentTrack, isPlaying, localPlaybackError, togglePlayback, skip } = useSphynx();

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <Stack.Screen options={{ presentation: "fullScreenModal", animation: "fade" }} />
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Close player" onPress={() => router.back()} style={({ pressed }) => [styles.chromeButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
            <Ionicons name="chevron-down" size={22} color={theme.foreground} />
          </Pressable>
          <View style={styles.topCenter}>
            <Text style={[styles.topLabel, { color: theme.muted }]}>NOW PLAYING FROM</Text>
            <SourceBadge provider={currentTrack.provider} />
          </View>
          <Pressable accessibilityLabel="Open more player options" onPress={haptic.selection} style={({ pressed }) => [styles.chromeButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.foreground} />
          </Pressable>
        </View>

        <View style={[styles.artFrame, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <AlbumArt artwork={currentTrack.artwork} size={286} radius={30} />
        </View>

        <View style={styles.songInfo}>
          <View style={styles.titleBlock}>
            <Text numberOfLines={2} style={[styles.songTitle, { color: theme.foreground }]}>{currentTrack.title}</Text>
            <Text numberOfLines={1} style={[styles.songArtist, { color: theme.muted }]}>{currentTrack.artist} · {currentTrack.album}</Text>
          </View>
          <Pressable accessibilityLabel="Save track" onPress={haptic.selection} style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}>
            <Ionicons name="add-circle-outline" size={28} color={theme.accent} />
          </Pressable>
        </View>

        <ProgressRail />

        <View style={styles.transportRow}>
          <Pressable accessibilityLabel="Toggle shuffle" onPress={haptic.selection} style={({ pressed }) => [styles.minorControl, pressed && styles.pressed]}>
            <Ionicons name="shuffle" size={20} color={theme.muted} />
          </Pressable>
          <Pressable accessibilityLabel="Previous track" onPress={() => { haptic.light(); skip("previous"); }} style={({ pressed }) => [styles.majorControl, pressed && styles.pressed]}>
            <Ionicons name="play-skip-back" size={30} color={theme.foreground} />
          </Pressable>
          <Pressable accessibilityLabel={isPlaying ? "Pause" : "Play"} onPress={() => { haptic.medium(); togglePlayback(); }} style={({ pressed }) => [styles.playControl, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={31} color={theme.accentInk} style={{ marginLeft: isPlaying ? 0 : 3 }} />
          </Pressable>
          <Pressable accessibilityLabel="Next track" onPress={() => { haptic.light(); skip("next"); }} style={({ pressed }) => [styles.majorControl, pressed && styles.pressed]}>
            <Ionicons name="play-skip-forward" size={30} color={theme.foreground} />
          </Pressable>
          <Pressable accessibilityLabel="Toggle repeat" onPress={haptic.selection} style={({ pressed }) => [styles.minorControl, pressed && styles.pressed]}>
            <Ionicons name="repeat" size={20} color={theme.muted} />
          </Pressable>
        </View>

        <View style={[styles.toolLine, { borderTopColor: theme.border }]}>
          <Pressable onPress={() => router.push("/sound-lab" as never)} style={({ pressed }) => [styles.toolItem, pressed && styles.pressed]}>
            <Ionicons name="options-outline" size={18} color={theme.accent} />
            <Text style={[styles.toolText, { color: theme.foreground }]}>Sound Lab</Text>
          </Pressable>
          <View style={[styles.toolDivider, { backgroundColor: theme.border }]} />
          <Pressable onPress={haptic.selection} style={({ pressed }) => [styles.toolItem, pressed && styles.pressed]}>
            <Ionicons name="list-outline" size={20} color={theme.accent} />
            <Text style={[styles.toolText, { color: theme.foreground }]}>Queue</Text>
          </Pressable>
        </View>

        <View style={[styles.availability, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <Ionicons name={currentTrack.available === "authorized" ? "checkmark-circle-outline" : "information-circle-outline"} size={15} color={theme.accent} />
          <Text style={[styles.availabilityText, { color: localPlaybackError ? theme.danger : theme.muted }]}>
            {localPlaybackError ?? (currentTrack.localUri ? "Playing from a file stored privately on this iPhone." : currentTrack.available === "preview" ? "Preview behavior depends on the connected service." : currentTrack.available === "handoff" ? "This source may open through its approved player." : "Eligible local or Sphynx playback controls are available.")}
          </Text>
        </View>
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
  artFrame: { alignSelf: "center", padding: 5, borderRadius: 35, borderWidth: StyleSheet.hairlineWidth, shadowColor: "#000", shadowOpacity: 0.22, shadowRadius: 28, shadowOffset: { width: 0, height: 14 }, elevation: 8 },
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
  toolLine: { borderTopWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingTop: 12 },
  toolItem: { flex: 1, minHeight: 36, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  toolText: { fontSize: 12, fontWeight: "700" },
  toolDivider: { width: StyleSheet.hairlineWidth, height: 20 },
  availability: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 10, paddingVertical: 8 },
  availabilityText: { flex: 1, fontSize: 10, lineHeight: 13, fontWeight: "500" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
});
