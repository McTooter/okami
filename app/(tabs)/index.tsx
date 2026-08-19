import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Animated, { Easing, FadeInDown, FadeInRight, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { AnimatedAlbumArt } from "@/components/sphynx/animated-album-art";
import { MiniPlayer, SourceBadge } from "@/components/sphynx/controls";
import { PlaybackPulse } from "@/components/sphynx/listening-field";
import { MotionPressable } from "@/components/sphynx/motion-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { isWideLibraryCanvas } from "@/lib/okami-layout-core";
import { formatLibraryCount, selectLibraryRotation } from "@/lib/okami-library-core";
import { type Track, useSphynx } from "@/lib/sphynx-store";

export default function LibraryScreen() {
  const router = useRouter();
  const { activeListeningProfile, currentTrack, importedTracks, isImporting, isPlaying, localImportMessage, material, pinnedAlbums, playTrack, importLocalTracks, sound, theme, tracks } = useSphynx();
  const { height, width } = useWindowDimensions();
  const scrollY = useSharedValue(0);
  const motionReduced = sound.motionReduced;
  const isNoirPulse = material.id === "noir-pulse";
  const isIpadLandscape = isWideLibraryCanvas(width, height);
  const rotation = selectLibraryRotation(pinnedAlbums, tracks);

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
        contentContainerStyle={[styles.list, isNoirPulse && styles.noirList, isIpadLandscape && styles.iPadList]}
        renderItem={({ item, index }) => {
          const active = currentTrack.id === item.id && isPlaying;
          return (
            <View style={[styles.trackRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.trackNumber, { color: active ? theme.accent : theme.muted }]}>{active ? "▮▮" : String(index + 1).padStart(2, "0")}</Text>
              <MotionPressable
                accessibilityLabel={`Play ${item.title}`}
                emphasis="standard"
                onPress={() => {
                  haptic.light();
                  playTrack(item);
                  router.push("/now-playing" as never);
                }}
                style={styles.trackTapArea}
              >
                <View style={[styles.trackArtworkFrame, isNoirPulse && styles.noirTrackArtworkFrame, { borderColor: active ? item.accent : theme.border }]}>
                  <AnimatedAlbumArt accent={item.accent} active={active} artwork={item.artwork} motionReduced={motionReduced} radius={isNoirPulse ? 0 : 10} size={43} />
                </View>
                <View style={styles.trackCopy}>
                  <Text numberOfLines={1} style={[styles.trackTitle, { color: theme.foreground }]}>{item.title}</Text>
                  <Text numberOfLines={1} style={[styles.trackMeta, { color: theme.muted }]}>{item.artist} · {item.album}</Text>
                </View>
              </MotionPressable>
              <View style={styles.trackMetaRight}>
                <Text style={[styles.duration, { color: theme.muted }]}>{item.duration}</Text>
                <MotionPressable accessibilityLabel={`More options for ${item.title}`} emphasis="compact" hitSlop={10} onPress={haptic.selection} style={styles.moreButton}>
                  <Ionicons color={theme.muted} name="ellipsis-horizontal" size={18} />
                </MotionPressable>
              </View>
            </View>
          );
        }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <View>
            <Animated.View entering={motionReduced ? undefined : FadeInDown.duration(340).easing(Easing.out(Easing.cubic))} style={[styles.masthead, isNoirPulse && styles.noirMasthead, heroParallaxStyle]}>
              <View style={styles.mastheadCopy}>
                <View style={styles.brandRow}>
                  <Image accessibilityLabel="Okami rising-sun logo" source={require("../../assets/images/icon.png")} style={[styles.brandMark, isNoirPulse && styles.noirBrandMark]} />
                  <Text style={[styles.kicker, { color: theme.accent }]}>OKAMI / LIBRARY</Text>
                </View>
                <Text style={[styles.pageTitle, isNoirPulse && styles.noirPageTitle, { color: theme.foreground }]}>{isNoirPulse ? "ARCHIVE /" : `For ${activeListeningProfile.name}.`}</Text>
                <Text style={[styles.pageDeck, { color: theme.muted }]}>{activeListeningProfile.taste}</Text>
              </View>
              <View style={[styles.identityChip, isNoirPulse && styles.noirIdentityChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <View style={[styles.identityDot, { backgroundColor: activeListeningProfile.cue }]} />
                <Text numberOfLines={1} style={[styles.identityName, { color: theme.foreground }]}>{formatLibraryCount(tracks.length)}</Text>
              </View>
            </Animated.View>

            <View style={[styles.libraryTopography, isIpadLandscape && styles.iPadTopography]}>
              <View style={[styles.featureColumn, isIpadLandscape && styles.iPadFeatureColumn]}>
                <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(90).duration(360).easing(Easing.out(Easing.cubic))}>
                  <MotionPressable onPress={openNowPlaying} emphasis="primary" style={[styles.featureTile, isNoirPulse && styles.noirFeatureTile, isIpadLandscape && styles.iPadFeatureTile, { backgroundColor: theme.raised, borderColor: theme.border }]}>
                    <View style={[styles.featureSignal, { backgroundColor: theme.accent }]} />
                    <View style={styles.featureCopy}>
                      <View style={styles.nowStatus}><PlaybackPulse active={isPlaying} color={theme.accent} motionReduced={motionReduced} /><Text style={[styles.nowLabel, { color: theme.muted }]}>{isPlaying ? "NOW PLAYING" : "NOW SELECTED"}</Text></View>
                      <Text numberOfLines={2} style={[styles.featureTitle, isIpadLandscape && styles.iPadFeatureTitle, { color: theme.foreground }]}>{currentTrack.title}</Text>
                      <Text numberOfLines={1} style={[styles.featureArtist, { color: theme.muted }]}>{currentTrack.artist}</Text>
                      <View style={styles.featureFooter}>
                        <View style={[styles.openPlayerButton, isNoirPulse && styles.noirOpenPlayerButton, { borderColor: theme.border }]}>
                          <Text style={[styles.openPlayerText, { color: theme.foreground }]}>OPEN FIELD</Text>
                          <Ionicons color={theme.accent} name="arrow-forward" size={15} />
                        </View>
                        <SourceBadge provider={currentTrack.provider} />
                      </View>
                    </View>
                    <View style={[styles.featureArtworkRail, isNoirPulse && styles.noirFeatureArtworkRail, isIpadLandscape && styles.iPadFeatureArtworkRail, { borderColor: theme.border }]}>
                      <AnimatedAlbumArt artwork={currentTrack.artwork} size={isIpadLandscape ? 168 : isNoirPulse ? 116 : 132} radius={isNoirPulse ? 0 : 18} accent={currentTrack.accent} active={isPlaying} motionReduced={motionReduced} />
                    </View>
                  </MotionPressable>
                </Animated.View>

                <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(145).duration(330).easing(Easing.out(Easing.cubic))}>
                  <MotionPressable
                    accessibilityLabel="Import music files from this device"
                    disabled={isImporting}
                    onPress={() => { haptic.medium(); void importLocalTracks(); }}
                    emphasis="compact"
                    style={[styles.importStrip, isNoirPulse && styles.noirImportStrip, { borderColor: theme.border }, isImporting && styles.disabled]}
                  >
                    <View style={[styles.importIcon, isNoirPulse && styles.noirImportIcon, { backgroundColor: theme.accent }]}>
                      <Ionicons name="add" size={20} color={theme.accentInk} />
                    </View>
                    <View style={styles.importCopy}>
                      <Text style={[styles.importTitle, { color: theme.foreground }]}>{isImporting ? "Opening file picker…" : "Add from this iPhone"}</Text>
                      <Text style={[styles.importText, { color: theme.muted }]}>{localImportMessage ?? `${formatLibraryCount(importedTracks.length)} local tracks in your archive`}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color={theme.accent} />
                  </MotionPressable>
                </Animated.View>
              </View>

              <View style={[styles.rotationPanel, isIpadLandscape && styles.iPadRotationPanel, isIpadLandscape && { borderLeftColor: theme.border }]}>
                <View style={styles.rotationHeading}>
                  <View>
                    <Text style={[styles.eyebrow, { color: theme.accent }]}>ON ROTATION</Text>
                    <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Three from the stack</Text>
                  </View>
                  <Text style={[styles.rotationCount, { color: theme.muted }]}>{formatLibraryCount(rotation.length)} / {formatLibraryCount(tracks.length)}</Text>
                </View>

                <FlatList
                  contentContainerStyle={[styles.rotationList, isIpadLandscape && styles.iPadRotationList]}
                  data={rotation}
                  horizontal
                  keyExtractor={(item) => `rotation-${item.id}`}
                  renderItem={({ item, index }) => (
                    <Animated.View entering={motionReduced ? undefined : FadeInRight.delay(210 + index * 55).duration(330)}>
                      <MotionPressable
                        accessibilityLabel={`Play ${item.title}`}
                        emphasis="primary"
                        onPress={() => {
                          haptic.light();
                          playTrack(item);
                          router.push("/now-playing" as never);
                        }}
                        style={[styles.rotationCard, isNoirPulse && styles.noirRotationCard, isIpadLandscape && styles.iPadRotationCard]}
                      >
                        <Text style={[styles.rotationIndex, { color: theme.muted }]}>{formatLibraryCount(index + 1)}</Text>
                        <AnimatedAlbumArt accent={item.accent} active={currentTrack.id === item.id && isPlaying} artwork={item.artwork} motionReduced={motionReduced} radius={isNoirPulse ? 0 : 16} size={isIpadLandscape ? 140 : 112} />
                        <Text numberOfLines={1} style={[styles.rotationTitle, { color: theme.foreground }]}>{item.title}</Text>
                        <Text numberOfLines={1} style={[styles.rotationMeta, { color: theme.muted }]}>{item.artist}</Text>
                      </MotionPressable>
                    </Animated.View>
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              </View>
            </View>

            <View style={[styles.queueHeader, { borderTopColor: theme.border }]}>
              <View>
                <Text style={[styles.eyebrow, { color: theme.accent }]}>QUEUE INDEX</Text>
                <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Saved measures</Text>
              </View>
              <MotionPressable accessibilityLabel="Sort library" emphasis="compact" onPress={haptic.selection} style={[styles.sortControl, isNoirPulse && styles.noirSortControl, { borderColor: theme.border }]}>
                <Ionicons color={theme.foreground} name="swap-vertical" size={14} />
                <Text style={[styles.sortLabel, { color: theme.foreground }]}>SORT</Text>
              </MotionPressable>
            </View>
          </View>
        }
        ListFooterComponent={<View style={{ height: isIpadLandscape ? 132 : 104 }} />}
        showsVerticalScrollIndicator={false}
      />
      <MiniPlayer />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 18, paddingTop: 14 },
  noirList: { paddingHorizontal: 16, paddingTop: 8 },
  iPadList: { paddingHorizontal: 42, paddingTop: 26, maxWidth: 1560, alignSelf: "center", width: "100%" },
  masthead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 27 },
  noirMasthead: { marginBottom: 24 },
  mastheadCopy: { flex: 1, minWidth: 0, paddingRight: 10 },
  brandRow: { flexDirection: "row", alignItems: "center", height: 28, marginBottom: 10, gap: 7 },
  brandMark: { width: 23, height: 23, borderRadius: 7 },
  noirBrandMark: { borderRadius: 0, width: 18, height: 18 },
  kicker: { fontSize: 10, lineHeight: 13, letterSpacing: 1.6, fontWeight: "900" },
  pageTitle: { fontSize: 38, lineHeight: 42, letterSpacing: -1.8, fontWeight: "800" },
  noirPageTitle: { fontSize: 47, lineHeight: 48, letterSpacing: -3.2, fontWeight: "900" },
  pageDeck: { fontSize: 13, lineHeight: 18, marginTop: 6, fontWeight: "500" },
  identityChip: { marginTop: 1, width: 48, height: 48, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", gap: 3 },
  noirIdentityChip: { borderRadius: 0, width: 42, height: 42 },
  identityDot: { width: 10, height: 10, borderRadius: 999 },
  identityName: { fontSize: 10, fontWeight: "900", letterSpacing: 0.7, fontVariant: ["tabular-nums"] },
  featureTile: { minHeight: 174, borderRadius: 28, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", overflow: "hidden", marginBottom: 13 },
  noirFeatureTile: { minHeight: 156, borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, backgroundColor: "#060606" },
  libraryTopography: { flexDirection: "column" },
  iPadTopography: { flexDirection: "row", alignItems: "stretch", marginBottom: 24 },
  featureColumn: { minWidth: 0 },
  iPadFeatureColumn: { flex: 1, minWidth: 0, paddingRight: 32 },
  iPadFeatureTile: { minHeight: 226, marginBottom: 0 },
  featureSignal: { position: "absolute", left: 0, top: 20, bottom: 20, width: 3, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  featureCopy: { flex: 1, minWidth: 0, paddingTop: 18, paddingBottom: 15, paddingLeft: 20, paddingRight: 8, justifyContent: "space-between" },
  nowStatus: { flexDirection: "row", alignItems: "center", gap: 7 },
  nowLabel: { fontSize: 9, letterSpacing: 1.25, fontWeight: "900" },
  featureTitle: { fontSize: 25, lineHeight: 28, letterSpacing: -0.9, fontWeight: "800", marginTop: 10 },
  iPadFeatureTitle: { fontSize: 38, lineHeight: 41, letterSpacing: -1.7 },
  featureArtist: { fontSize: 12, lineHeight: 16, marginTop: 4, fontWeight: "600" },
  featureFooter: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 10 },
  openPlayerButton: { height: 28, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 5 },
  noirOpenPlayerButton: { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, paddingHorizontal: 0 },
  openPlayerText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.75 },
  featureArtworkRail: { width: 146, borderLeftWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  noirFeatureArtworkRail: { width: 126, borderLeftWidth: 0, alignItems: "flex-end", paddingRight: 10 },
  iPadFeatureArtworkRail: { width: 214, paddingRight: 22 },
  importStrip: { minHeight: 66, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 2, gap: 10, marginBottom: 31 },
  noirImportStrip: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 8, paddingTop: 1 },
  importIcon: { width: 33, height: 33, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  noirImportIcon: { borderRadius: 0 },
  importCopy: { flex: 1, minWidth: 0 },
  importTitle: { fontSize: 13, lineHeight: 17, fontWeight: "800" },
  importText: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  rotationPanel: { minWidth: 0 },
  iPadRotationPanel: { flex: 1, minWidth: 0, borderLeftWidth: StyleSheet.hairlineWidth, paddingLeft: 32, justifyContent: "center" },
  rotationHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 },
  eyebrow: { fontSize: 9, lineHeight: 12, letterSpacing: 1.35, fontWeight: "900", marginBottom: 4 },
  sectionTitle: { fontSize: 22, lineHeight: 26, letterSpacing: -0.75, fontWeight: "800" },
  rotationCount: { fontSize: 10, lineHeight: 14, fontWeight: "800", letterSpacing: 0.9, fontVariant: ["tabular-nums"] },
  rotationList: { gap: 12, paddingRight: 18, paddingBottom: 34 },
  iPadRotationList: { gap: 16, paddingRight: 0, paddingBottom: 0 },
  rotationCard: { width: 123, gap: 7 },
  noirRotationCard: { width: 116, gap: 6 },
  iPadRotationCard: { width: 148, gap: 8 },
  rotationIndex: { fontSize: 9, lineHeight: 11, fontWeight: "900", letterSpacing: 1 },
  rotationTitle: { fontSize: 13, lineHeight: 16, fontWeight: "800", letterSpacing: -0.2, marginTop: 1 },
  rotationMeta: { fontSize: 10, lineHeight: 13, fontWeight: "500" },
  queueHeader: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 21, marginBottom: 7, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  sortControl: { height: 30, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, flexDirection: "row", alignItems: "center", gap: 4 },
  noirSortControl: { borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, paddingHorizontal: 0 },
  sortLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.75 },
  trackRow: { minHeight: 70, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth },
  trackNumber: { width: 30, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, fontVariant: ["tabular-nums"] },
  trackTapArea: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  trackArtworkFrame: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 1 },
  noirTrackArtworkFrame: { borderRadius: 0, padding: 0 },
  trackCopy: { flex: 1, minWidth: 0 },
  trackTitle: { fontSize: 14, lineHeight: 18, fontWeight: "800", letterSpacing: -0.2 },
  trackMeta: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  trackMetaRight: { flexDirection: "row", alignItems: "center", gap: 1, marginLeft: 6 },
  duration: { fontSize: 10, fontWeight: "700", fontVariant: ["tabular-nums"] },
  moreButton: { width: 30, height: 38, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.55 },
});
