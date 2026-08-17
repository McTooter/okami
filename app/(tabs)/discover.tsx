import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { AlbumArt } from "@/components/sphynx/album-art";
import { MiniPlayer, SectionHeading, TrackRow } from "@/components/sphynx/controls";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { libraryTracks, type Track, useSphynx } from "@/lib/sphynx-store";

const rooms = [
  { title: "SLOW SIGNAL", note: "Weightless, nocturnal, precise", artwork: "resonance" as const },
  { title: "BRIGHT STATIC", note: "Rhythm without urgency", artwork: "verge" as const },
  { title: "OPEN CIRCUIT", note: "New work, clear edges", artwork: "horizon" as const },
];

export default function DiscoverScreen() {
  const router = useRouter();
  const { theme, playTrack } = useSphynx();

  return (
    <ScreenContainer containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <FlatList<Track>
        data={libraryTracks.slice(1, 5)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <TrackRow track={item} index={index} />}
        ListHeaderComponent={
          <View>
            <View style={styles.topLine}>
              <View>
                <Text style={[styles.kicker, { color: theme.accent }]}>CURATED FOR A LONG LISTEN</Text>
                <Text style={[styles.pageTitle, { color: theme.foreground }]}>Discover</Text>
              </View>
              <Pressable onPress={() => router.navigate("/search" as never)} style={({ pressed }) => [styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
                <Ionicons name="search" size={20} color={theme.foreground} />
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                haptic.medium();
                playTrack(libraryTracks[5]);
                router.push("/now-playing" as never);
              }}
              style={({ pressed }) => [styles.feature, { backgroundColor: theme.raised, borderColor: theme.border }, pressed && styles.pressed]}
            >
              <View style={styles.featureArtwork}><AlbumArt artwork="resonance" size={132} radius={25} /></View>
              <View style={styles.featureCopy}>
                <Text style={[styles.featureEyebrow, { color: theme.accent }]}>THE LONG FORM</Text>
                <Text style={[styles.featureTitle, { color: theme.foreground }]}>Objects that hold their frequency.</Text>
                <Text style={[styles.featureNote, { color: theme.muted }]}>A 54-minute passage through synthetic percussion and spacious guitar.</Text>
                <View style={[styles.listenButton, { borderColor: theme.border }]}>
                  <Ionicons name="play" size={14} color={theme.foreground} />
                  <Text style={[styles.listenText, { color: theme.foreground }]}>Begin room</Text>
                </View>
              </View>
            </Pressable>

            <SectionHeading eyebrow="Three ways in" title="Listening rooms" />
            <View style={styles.roomsRow}>
              {rooms.map((room) => (
                <Pressable key={room.title} onPress={haptic.selection} style={({ pressed }) => [styles.room, pressed && styles.pressed]}>
                  <AlbumArt artwork={room.artwork} size={101} radius={19} />
                  <Text numberOfLines={1} style={[styles.roomTitle, { color: theme.foreground }]}>{room.title}</Text>
                  <Text numberOfLines={2} style={[styles.roomNote, { color: theme.muted }]}>{room.note}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.trackHeading}><SectionHeading eyebrow="From connected sources" title="Fresh arrivals" /></View>
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
  topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.3, fontWeight: "800", marginBottom: 5 },
  pageTitle: { fontSize: 31, lineHeight: 37, letterSpacing: -1.15, fontWeight: "800" },
  iconButton: { width: 44, height: 44, borderRadius: 15, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  feature: { minHeight: 244, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden", flexDirection: "row", alignItems: "stretch", marginBottom: 27 },
  featureArtwork: { alignSelf: "flex-end", marginBottom: -12, marginLeft: -16 },
  featureCopy: { flex: 1, paddingVertical: 19, paddingRight: 15, paddingLeft: 11, justifyContent: "center" },
  featureEyebrow: { fontSize: 9, letterSpacing: 1.2, fontWeight: "800", marginBottom: 6 },
  featureTitle: { fontSize: 22, lineHeight: 26, fontWeight: "800", letterSpacing: -0.65 },
  featureNote: { fontSize: 12, lineHeight: 16, marginTop: 8 },
  listenButton: { height: 32, alignSelf: "flex-start", borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, paddingHorizontal: 11, alignItems: "center", flexDirection: "row", gap: 5, marginTop: 13 },
  listenText: { fontSize: 11, fontWeight: "700" },
  roomsRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 30 },
  room: { flex: 1, minWidth: 0 },
  roomTitle: { fontSize: 10, lineHeight: 13, fontWeight: "800", letterSpacing: 0.35, marginTop: 9 },
  roomNote: { fontSize: 10, lineHeight: 13, marginTop: 3 },
  trackHeading: { marginTop: 2 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
