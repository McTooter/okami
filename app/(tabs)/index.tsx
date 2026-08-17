import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { Easing, FadeInDown, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { AlbumArt } from "@/components/sphynx/album-art";
import { Metric, MiniPlayer, SectionHeading, SourceBadge, TrackRow } from "@/components/sphynx/controls";
import { PlaybackPulse } from "@/components/sphynx/listening-field";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { type Track, useSphynx } from "@/lib/sphynx-store";

export default function LibraryScreen() {
  const router = useRouter();
  const { theme, currentTrack, importedTracks, isImporting, isPlaying, localImportMessage, playTrack, importLocalTracks, tracks, sound } = useSphynx();
  const scrollY = useSharedValue(0);
  const motionReduced = sound.motionReduced;

  useEffect(() => {
    if (motionReduced) scrollY.value = withTiming(0, { duration: 100 });
  }, [motionReduced, scrollY]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (!motionReduced) scrollY.value = event.contentOffset.y;
    },
  });
  const heroParallaxStyle = useAnimatedStyle(() => {
    const distance = Math.min(Math.max(scrollY.value, 0), 180);
    return {
      opacity: motionReduced ? 1 : 1 - distance / 1200,
      transform: [{ translateY: motionReduced ? 0 : -distance * 0.07 }],
    };
  }, [motionReduced]);

  const openNowPlaying = () => {
    haptic.light();
    playTrack(currentTrack);
    router.push("/now-playing" as never);
  };

  return (
    <ScreenContainer containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <FlatList<Track>
        data={tracks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <TrackRow track={item} index={index} />}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View>
            <Animated.View entering={motionReduced ? undefined : FadeInDown.duration(340).easing(Easing.out(Easing.cubic))} style={[styles.topLine, heroParallaxStyle]}>
              <View>
                <Text style={[styles.kicker, { color: theme.accent }]}>SPHYNX / LIBRARY</Text>
                <Text style={[styles.pageTitle, { color: theme.foreground }]}>Your music.</Text>
              </View>
              <Pressable
                accessibilityLabel="Open search"
                onPress={() => router.navigate("/search" as never)}
                style={({ pressed }) => [styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}
              >
                <Ionicons name="search" size={20} color={theme.foreground} />
              </Pressable>
            </Animated.View>

            <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(90).duration(360).easing(Easing.out(Easing.cubic))}>
            <Pressable onPress={openNowPlaying} style={({ pressed }) => [styles.nowCard, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
              <View style={styles.nowCardTop}>
                <View style={styles.nowStatus}><PlaybackPulse active={isPlaying} color={theme.accent} motionReduced={motionReduced} /><Text style={[styles.nowLabel, { color: theme.muted }]}>{isPlaying ? "PLAYING NOW" : "READY IN THE DECK"}</Text></View>
                <SourceBadge provider={currentTrack.provider} />
              </View>
              <View style={styles.nowContent}>
                <AlbumArt artwork={currentTrack.artwork} size={92} radius={20} />
                <View style={styles.nowCopy}>
                  <Text numberOfLines={2} style={[styles.nowTitle, { color: theme.foreground }]}>{currentTrack.title}</Text>
                  <Text numberOfLines={1} style={[styles.nowArtist, { color: theme.muted }]}>{currentTrack.artist}</Text>
                  <View style={styles.nowActionRow}>
                    <View style={[styles.playPill, { backgroundColor: currentTrack.accent }]}>
                      <Ionicons name={isPlaying ? "pause" : "play"} size={15} color={theme.accentInk} />
                      <Text style={[styles.playPillText, { color: theme.accentInk }]}>{isPlaying ? "Resume" : "Play"}</Text>
                    </View>
                    <Text style={[styles.actionHint, { color: theme.muted }]}>Open player</Text>
                  </View>
                </View>
              </View>
            </Pressable>
            </Animated.View>

            <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(145).duration(330).easing(Easing.out(Easing.cubic))}><Pressable
              accessibilityLabel="Import music files from this device"
              disabled={isImporting}
              onPress={() => { haptic.medium(); void importLocalTracks(); }}
              style={({ pressed }) => [styles.importCard, { backgroundColor: theme.raised, borderColor: theme.border }, pressed && !isImporting && styles.pressed, isImporting && styles.disabled]}
            >
              <View style={[styles.importIcon, { backgroundColor: theme.accent }]}>
                <Ionicons name="folder-open-outline" size={19} color={theme.accentInk} />
              </View>
              <View style={styles.importCopy}>
                <Text style={[styles.importTitle, { color: theme.foreground }]}>{isImporting ? "Opening Files…" : "Import music files"}</Text>
                <Text style={[styles.importText, { color: theme.muted }]}>{localImportMessage ?? `${importedTracks.length} local ${importedTracks.length === 1 ? "track" : "tracks"} stored on this iPhone`}</Text>
              </View>
              <Ionicons name="add" size={22} color={theme.accent} />
            </Pressable>
            </Animated.View>

            <View style={[styles.metricBand, { borderColor: theme.border }]}>
              <Metric value={String(tracks.length)} label="Saved tracks" />
              <Metric value={String(importedTracks.length).padStart(2, "0")} label="On this iPhone" />
              <Metric value="02" label="Sources" emphasis />
            </View>

            <SectionHeading eyebrow="Recently handled" title="Library rotation" action="Sort" onAction={haptic.selection} />
          </View>
        }
        ListFooterComponent={<View style={{ height: 82 }} />}
        showsVerticalScrollIndicator={false}
      />
      <MiniPlayer />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 20, paddingTop: 18 },
  topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  kicker: { fontSize: 10, letterSpacing: 1.5, fontWeight: "800", marginBottom: 5 },
  pageTitle: { fontSize: 31, lineHeight: 37, letterSpacing: -1.15, fontWeight: "800" },
  iconButton: { width: 44, height: 44, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  nowCard: { borderRadius: 23, borderWidth: StyleSheet.hairlineWidth, padding: 14, marginBottom: 16 },
  importCard: { minHeight: 72, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 13, gap: 11, marginBottom: 18 },
  importIcon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  importCopy: { flex: 1, minWidth: 0 },
  importTitle: { fontSize: 14, fontWeight: "800" },
  importText: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  nowCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 13 },
  nowStatus: { flexDirection: "row", alignItems: "center", gap: 6 },
  nowLabel: { fontSize: 10, letterSpacing: 1.15, fontWeight: "800" },
  nowContent: { flexDirection: "row", gap: 14, alignItems: "center" },
  nowCopy: { flex: 1, minWidth: 0 },
  nowTitle: { fontSize: 21, lineHeight: 25, fontWeight: "800", letterSpacing: -0.45 },
  nowArtist: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  nowActionRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12 },
  playPill: { height: 30, borderRadius: 15, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", gap: 5 },
  playPillText: { fontSize: 12, fontWeight: "800" },
  actionHint: { fontSize: 11, fontWeight: "600" },
  metricBand: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 13, marginBottom: 26 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.55 },
});
