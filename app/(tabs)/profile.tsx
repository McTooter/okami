import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import Animated, { Easing, FadeInDown } from "react-native-reanimated";

import { AnimatedAlbumArt } from "@/components/sphynx/animated-album-art";
import { MiniPlayer, SectionHeading } from "@/components/sphynx/controls";
import { MotionPressable } from "@/components/sphynx/motion-pressable";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { PROFILE_AVATAR_COLORS } from "@/lib/listening-profile-core";
import { useSphynx } from "@/lib/sphynx-store";

function SettingRow({ icon, title, note, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; note: string; onPress: () => void }) {
  const { theme } = useSphynx();
  return (
    <MotionPressable onPress={() => { haptic.light(); onPress(); }} style={[styles.settingRow, { borderBottomColor: theme.border }]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}><Ionicons name={icon} size={18} color={theme.accent} /></View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: theme.foreground }]}>{title}</Text>
        <Text style={[styles.settingNote, { color: theme.muted }]}>{note}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </MotionPressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const {
    activeListeningProfile,
    connected,
    currentTrack,
    isPlaying,
    isPinnedAlbum,
    listeningProfiles,
    material,
    pinnedAlbums,
    playTrack,
    profileQueueContinuity,
    progress,
    queue,
    setActiveListeningProfileId,
    setProfileQueueContinuity,
    sound,
    theme,
    themeId,
    togglePinnedAlbum,
    updateListeningProfile,
  } = useSphynx();
  const activeServices = Object.values(connected).filter(Boolean).length;
  const motionReduced = sound.motionReduced;
  const cue = material.cue ?? activeListeningProfile.cue;
  const profileCue = activeListeningProfile.cue;
  const [draftName, setDraftName] = useState(activeListeningProfile.name);

  useEffect(() => {
    setDraftName(activeListeningProfile.name);
  }, [activeListeningProfile.id, activeListeningProfile.name]);

  const commitName = () => {
    haptic.light();
    updateListeningProfile(activeListeningProfile.id, { name: draftName });
  };

  return (
    <ScreenContainer containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={motionReduced ? undefined : FadeInDown.duration(310).easing(Easing.out(Easing.cubic))} style={styles.topLine}>
          <View>
            <Text style={[styles.kicker, { color: cue }]}>SPHYNX / LISTENING IDENTITY</Text>
            <Text style={[styles.pageTitle, { color: theme.foreground }]}>Profile</Text>
          </View>
          <View style={[styles.monogram, { backgroundColor: profileCue }]}><Text style={[styles.monogramText, { color: material.cueInk ?? theme.accentInk }]}>{activeListeningProfile.name.slice(0, 1).toUpperCase()}</Text></View>
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(55).duration(330).easing(Easing.out(Easing.cubic))} style={[styles.identity, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <AnimatedAlbumArt artwork={activeListeningProfile.artwork} size={64} radius={18} accent={cue} active={isPlaying} motionReduced={motionReduced} />
          <View style={styles.identityCopy}>
            <Text style={[styles.identityTitle, { color: theme.foreground }]}>{activeListeningProfile.name}</Text>
            <Text style={[styles.identityNote, { color: theme.muted }]}>{activeListeningProfile.descriptor} · {activeServices} active sources</Text>
            <View style={[styles.activeCue, { backgroundColor: cue }]}><Text style={[styles.activeCueText, { color: material.cueInk ?? theme.accentInk }]}>ACTIVE IDENTITY</Text></View>
          </View>
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(105).duration(300).easing(Easing.out(Easing.cubic))}>
          <SectionHeading eyebrow="Identity card" title="Name & avatar color" />
          <View style={[styles.editorCard, { backgroundColor: theme.raised, borderColor: theme.border }]}>
            <View style={styles.nameRow}>
              <View style={[styles.editorMonogram, { backgroundColor: profileCue }]}><Text style={[styles.editorMonogramText, { color: material.cueInk ?? theme.accentInk }]}>{draftName.trim().slice(0, 1).toUpperCase() || "S"}</Text></View>
              <View style={[styles.nameInputShell, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <TextInput
                  accessibilityLabel="Listening identity name"
                  value={draftName}
                  onChangeText={setDraftName}
                  onBlur={commitName}
                  onSubmitEditing={commitName}
                  maxLength={26}
                  returnKeyType="done"
                  selectionColor={cue}
                  placeholder="Identity name"
                  placeholderTextColor={theme.muted}
                  style={[styles.nameInput, { color: theme.foreground }]}
                />
              </View>
              <MotionPressable accessibilityLabel="Save listening identity name" emphasis="compact" onPress={commitName} style={[styles.saveName, { backgroundColor: cue }]}>
                <Ionicons name="checkmark" size={17} color={material.cueInk ?? theme.accentInk} />
              </MotionPressable>
            </View>
            <View style={styles.avatarSwatches}>
              {PROFILE_AVATAR_COLORS.map((color) => {
                const selected = color === profileCue;
                return (
                  <MotionPressable
                    key={color}
                    accessibilityLabel={`Set avatar color ${color}`}
                    accessibilityState={{ selected }}
                    emphasis="compact"
                    onPress={() => { haptic.selection(); updateListeningProfile(activeListeningProfile.id, { cue: color }); }}
                    style={[styles.avatarSwatch, { backgroundColor: color, borderColor: selected ? theme.foreground : "transparent" }, selected && styles.avatarSwatchSelected]}
                  >
                    {selected ? <Ionicons name="checkmark" size={14} color={material.cueInk ?? theme.accentInk} /> : null}
                  </MotionPressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        <SectionHeading eyebrow="Choose a listening desk" title="Listening identities" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.identityRail}>
          {listeningProfiles.map((profile, index) => {
            const selected = profile.id === activeListeningProfile.id;
            return (
              <Animated.View key={profile.id} entering={motionReduced ? undefined : FadeInDown.delay(80 + index * 55).duration(270).easing(Easing.out(Easing.cubic))}>
                <MotionPressable
                  accessibilityLabel={`Use ${profile.name} listening identity`}
                  accessibilityState={{ selected }}
                  onPress={() => { haptic.medium(); setActiveListeningProfileId(profile.id); }}
                  emphasis={selected ? "primary" : "standard"}
                  style={[styles.identityTile, { backgroundColor: selected ? theme.raised : theme.surface, borderColor: selected ? cue : theme.border }, selected && { transform: [{ translateY: -3 }] }]}
                >
                  <AnimatedAlbumArt artwork={profile.artwork} size={42} radius={13} accent={profile.cue} active={selected && isPlaying} motionReduced={motionReduced} />
                  <Text numberOfLines={1} style={[styles.tileName, { color: theme.foreground }]}>{profile.name}</Text>
                  <Text numberOfLines={2} style={[styles.tileNote, { color: theme.muted }]}>{profile.descriptor}</Text>
                  {selected ? <View style={[styles.tileMarker, { backgroundColor: cue }]} /> : null}
                </MotionPressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(215).duration(315).easing(Easing.out(Easing.cubic))}>
          <SectionHeading eyebrow="Pick up the thread" title="Continue listening" />
          <ScrollView horizontal decelerationRate="fast" snapToInterval={150} snapToAlignment="start" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continuationRail}>
            {queue.slice(0, 5).map((track, index) => {
              const isCurrent = track.id === currentTrack.id;
              return (
                <Animated.View key={track.id} entering={motionReduced ? undefined : FadeInDown.delay(245 + index * 45).duration(260).easing(Easing.out(Easing.cubic))}>
                  <View style={styles.albumCardShell}>
                    <MotionPressable
                      accessibilityLabel={`Play ${track.title} from ${activeListeningProfile.name}'s continuation rail`}
                      accessibilityState={{ selected: isCurrent }}
                      emphasis="primary"
                      onPress={() => { haptic.light(); playTrack(track); }}
                      style={[styles.continuationCard, { backgroundColor: theme.surface, borderColor: isCurrent ? cue : theme.border }]}
                    >
                      <AnimatedAlbumArt artwork={track.artwork} size={126} radius={15} accent={track.accent} active={isCurrent && isPlaying} motionReduced={motionReduced} />
                      <Text numberOfLines={1} style={[styles.continuationTitle, { color: theme.foreground }]}>{track.title}</Text>
                      <Text numberOfLines={1} style={[styles.continuationArtist, { color: theme.muted }]}>{track.artist}</Text>
                      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}><View style={[styles.progressFill, { width: `${isCurrent ? Math.round(progress * 100) : 0}%`, backgroundColor: cue }]} /></View>
                      {isCurrent ? <View style={[styles.nowPip, { backgroundColor: cue }]}><Ionicons name="volume-high" size={11} color={material.cueInk ?? theme.accentInk} /></View> : null}
                    </MotionPressable>
                    <MotionPressable
                      accessibilityLabel={`${isPinnedAlbum(track.id) ? "Unpin" : "Pin"} ${track.title} for ${activeListeningProfile.name}`}
                      accessibilityState={{ selected: isPinnedAlbum(track.id) }}
                      emphasis="compact"
                      onPress={() => { haptic.selection(); togglePinnedAlbum(track.id); }}
                      style={[styles.pinControl, { backgroundColor: isPinnedAlbum(track.id) ? cue : theme.raised, borderColor: isPinnedAlbum(track.id) ? cue : theme.border }]}
                    >
                      <Ionicons name={isPinnedAlbum(track.id) ? "bookmark" : "bookmark-outline"} size={13} color={isPinnedAlbum(track.id) ? material.cueInk ?? theme.accentInk : theme.foreground} />
                    </MotionPressable>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(270).duration(300).easing(Easing.out(Easing.cubic))}>
          <SectionHeading eyebrow="Private quick access" title="Pinned albums" />
          {pinnedAlbums.length ? (
            <ScrollView horizontal decelerationRate="fast" snapToInterval={150} snapToAlignment="start" showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRail}>
              {pinnedAlbums.map((track, index) => {
                const isCurrent = track.id === currentTrack.id;
                return (
                  <Animated.View key={track.id} entering={motionReduced ? undefined : FadeInDown.delay(290 + index * 45).duration(260).easing(Easing.out(Easing.cubic))}>
                    <View style={styles.albumCardShell}>
                      <MotionPressable
                        accessibilityLabel={`Play pinned album ${track.title}`}
                        accessibilityState={{ selected: isCurrent }}
                        emphasis="primary"
                        onPress={() => { haptic.light(); playTrack(track); }}
                        style={[styles.continuationCard, styles.pinnedCard, { backgroundColor: theme.raised, borderColor: cue }]}
                      >
                        <AnimatedAlbumArt artwork={track.artwork} size={126} radius={15} accent={track.accent} active={isCurrent && isPlaying} motionReduced={motionReduced} />
                        <Text numberOfLines={1} style={[styles.continuationTitle, { color: theme.foreground }]}>{track.album}</Text>
                        <Text numberOfLines={1} style={[styles.continuationArtist, { color: theme.muted }]}>{track.artist}</Text>
                        <View style={[styles.pinnedCue, { backgroundColor: cue }]}><Ionicons name="bookmark" size={10} color={material.cueInk ?? theme.accentInk} /></View>
                      </MotionPressable>
                      <MotionPressable
                        accessibilityLabel={`Unpin ${track.title}`}
                        emphasis="compact"
                        onPress={() => { haptic.selection(); togglePinnedAlbum(track.id); }}
                        style={[styles.pinControl, { backgroundColor: cue, borderColor: cue }]}
                      >
                        <Ionicons name="bookmark" size={13} color={material.cueInk ?? theme.accentInk} />
                      </MotionPressable>
                    </View>
                  </Animated.View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={[styles.pinPrompt, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="bookmark-outline" size={18} color={cue} />
              <Text style={[styles.pinPromptText, { color: theme.muted }]}>Pin albums from Continue listening to keep a private quick-access shelf for {activeListeningProfile.name}.</Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={motionReduced ? undefined : FadeInDown.delay(285).duration(310).easing(Easing.out(Easing.cubic))}>
          <SectionHeading eyebrow="Current signal" title="Taste & continuity" />
          <View style={[styles.tasteCard, { backgroundColor: theme.raised, borderColor: theme.border }]}>
            <View style={[styles.tasteIcon, { backgroundColor: cue }]}><Ionicons name="sparkles-outline" size={17} color={material.cueInk ?? theme.accentInk} /></View>
            <View style={styles.tasteCopy}>
              <Text style={[styles.tasteTitle, { color: theme.foreground }]}>{activeListeningProfile.taste}</Text>
              <Text style={[styles.tasteNote, { color: theme.muted }]}>{activeListeningProfile.note}</Text>
            </View>
          </View>
          <View style={[styles.continuityCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.continuityCopy}>
              <Text style={[styles.continuityTitle, { color: theme.foreground }]}>Keep one queue across identities</Text>
              <Text style={[styles.continuityNote, { color: theme.muted }]}>{profileQueueContinuity ? "Your queue follows the current listening session." : "Each identity keeps its own local queue order."}</Text>
            </View>
            <Switch
              accessibilityLabel="Keep one queue across listening identities"
              value={profileQueueContinuity}
              onValueChange={(value) => { haptic.selection(); setProfileQueueContinuity(value); }}
              trackColor={{ false: theme.border, true: cue }}
              thumbColor={theme.raised}
            />
          </View>
          <View style={[styles.nowContext, { borderColor: theme.border }]}>
            <Ionicons name="play-circle-outline" size={18} color={cue} />
            <Text numberOfLines={1} style={[styles.nowContextText, { color: theme.muted }]}>Now holding {currentTrack.title} · {sound.crossfade}s crossfade</Text>
          </View>
        </Animated.View>

        <SectionHeading eyebrow="Control room" title="Make it yours" />
        <View style={[styles.settings, { borderTopColor: theme.border }]}>
          <SettingRow icon="options-outline" title="Sound Lab" note={`${sound.preamp > 0 ? "+" : ""}${sound.preamp.toFixed(1)} dB preamp · ${sound.limiter ? "Limiter on" : "Limiter off"}`} onPress={() => router.push("/sound-lab" as never)} />
          <SettingRow icon="color-palette-outline" title="Theme Atelier" note={`${theme.name} · ${themeId === "obsidian" ? "Reference mode" : "Personal mode"}`} onPress={() => router.push("/theme-atelier" as never)} />
          <SettingRow icon="link-outline" title="Connected services" note={`${activeServices} active · source-aware access`} onPress={() => router.push("/connected-services" as never)} />
          <SettingRow icon="accessibility-outline" title="Comfort" note={`${sound.typeScale} type · ${sound.motionReduced ? "reduced motion" : "standard motion"}`} onPress={() => router.push("/theme-atelier" as never)} />
        </View>
        <View style={{ height: 92 }} />
      </ScrollView>
      <MiniPlayer />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 18 },
  topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  kicker: { fontSize: 10, letterSpacing: 1.3, fontWeight: "800", marginBottom: 5 },
  pageTitle: { fontSize: 31, lineHeight: 37, letterSpacing: -1.15, fontWeight: "800" },
  monogram: { width: 44, height: 44, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  monogramText: { fontSize: 20, fontWeight: "900", letterSpacing: -1 },
  identity: { flexDirection: "row", alignItems: "center", gap: 13, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginBottom: 25 },
  identityCopy: { flex: 1, minWidth: 0 },
  identityTitle: { fontSize: 17, fontWeight: "800" },
  identityNote: { fontSize: 12, lineHeight: 16, marginTop: 3 },
  activeCue: { alignSelf: "flex-start", marginTop: 8, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  activeCueText: { fontSize: 8, fontWeight: "900", letterSpacing: 0.75 },
  editorCard: { borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginBottom: 25, gap: 12 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  editorMonogram: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  editorMonogramText: { fontSize: 18, fontWeight: "900" },
  nameInputShell: { flex: 1, minWidth: 0, height: 42, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", paddingHorizontal: 11 },
  nameInput: { fontSize: 14, fontWeight: "800", padding: 0, lineHeight: 18 },
  saveName: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  avatarSwatches: { flexDirection: "row", gap: 8, paddingLeft: 2 },
  avatarSwatch: { width: 28, height: 28, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  avatarSwatchSelected: { transform: [{ translateY: -2 }] },
  identityRail: { gap: 10, paddingBottom: 27, paddingRight: 20 },
  identityTile: { width: 128, minHeight: 140, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 11, gap: 8, overflow: "hidden" },
  tileName: { fontSize: 14, fontWeight: "800" },
  tileNote: { fontSize: 10, lineHeight: 14, fontWeight: "600" },
  tileMarker: { position: "absolute", left: 11, bottom: 0, height: 3, width: 48, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  continuationRail: { gap: 10, paddingBottom: 27, paddingRight: 20 },
  pinnedRail: { gap: 10, paddingBottom: 27, paddingRight: 20 },
  albumCardShell: { width: 140, position: "relative" },
  continuationCard: { width: 140, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 7, overflow: "hidden" },
  pinnedCard: { borderTopWidth: 2 },
  pinControl: { position: "absolute", top: 12, left: 12, width: 25, height: 25, borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  pinnedCue: { position: "absolute", top: 12, right: 12, width: 23, height: 23, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  pinPrompt: { minHeight: 72, marginBottom: 27, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: 10, padding: 13 },
  pinPromptText: { flex: 1, fontSize: 11, lineHeight: 15, fontWeight: "600" },
  continuationTitle: { fontSize: 12, fontWeight: "800", marginTop: 9 },
  continuationArtist: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  progressTrack: { height: 3, borderRadius: 99, marginTop: 9, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },
  nowPip: { position: "absolute", top: 13, right: 13, width: 23, height: 23, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  tasteCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 11, padding: 13, marginBottom: 10 },
  tasteIcon: { width: 38, height: 38, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  tasteCopy: { flex: 1, minWidth: 0 },
  tasteTitle: { fontSize: 14, fontWeight: "800" },
  tasteNote: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  continuityCard: { minHeight: 76, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: 10, padding: 13 },
  continuityCopy: { flex: 1, minWidth: 0 },
  continuityTitle: { fontSize: 13, lineHeight: 17, fontWeight: "800" },
  continuityNote: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  nowContext: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 4, paddingVertical: 12, marginBottom: 27, borderBottomWidth: StyleSheet.hairlineWidth },
  nowContextText: { flex: 1, fontSize: 11, fontWeight: "600" },
  settings: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: -1 },
  settingRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingCopy: { flex: 1, minWidth: 0 },
  settingTitle: { fontSize: 15, fontWeight: "700" },
  settingNote: { fontSize: 11, lineHeight: 15, marginTop: 2 },
});
