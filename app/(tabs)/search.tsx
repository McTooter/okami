import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { MiniPlayer, SectionHeading, TrackRow } from "@/components/sphynx/controls";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { type Track, useSphynx } from "@/lib/sphynx-store";

const filters = ["All", "Library", "TIDAL", "YouTube"] as const;
type Filter = (typeof filters)[number];

export default function SearchScreen() {
  const { theme, tracks } = useSphynx();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesSource = filter === "All" || (filter === "Library" ? ["Sphynx", "Local"].includes(track.provider) : track.provider === filter);
      return matchesSource && (!term || `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(term));
    });
  }, [filter, query, tracks]);

  return (
    <ScreenContainer containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <FlatList<Track>
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => <TrackRow track={item} index={index} />}
        ListHeaderComponent={
          <View>
            <Text style={[styles.kicker, { color: theme.accent }]}>ONE SEARCH SURFACE</Text>
            <Text style={[styles.pageTitle, { color: theme.foreground }]}>Find music.</Text>
            <View style={[styles.inputShell, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="search" size={19} color={theme.muted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Artist, record, track"
                placeholderTextColor={theme.muted}
                returnKeyType="done"
                autoCapitalize="none"
                style={[styles.input, { color: theme.foreground }]}
              />
              {query ? (
                <Pressable accessibilityLabel="Clear search" onPress={() => setQuery("")} hitSlop={8} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
                  <Ionicons name="close-circle" size={18} color={theme.muted} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.filterRow}>
              {filters.map((item) => {
                const selected = filter === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => { haptic.selection(); setFilter(item); }}
                    style={({ pressed }) => [styles.filter, { backgroundColor: selected ? theme.accent : theme.surface, borderColor: selected ? theme.accent : theme.border }, pressed && styles.pressed]}
                  >
                    <Text style={[styles.filterText, { color: selected ? theme.accentInk : theme.muted }]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.resultHead}>
              <SectionHeading eyebrow={query ? `${results.length} matches` : "All available in this prototype"} title={query ? "Results" : "Source-aware library"} />
              <View style={[styles.provenance, { backgroundColor: theme.raised, borderColor: theme.border }]}>
                <Ionicons name="information-circle-outline" size={15} color={theme.accent} />
                <Text style={[styles.provenanceText, { color: theme.muted }]}>Sources label every result</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.empty, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Nothing in this surface.</Text>
            <Text style={[styles.emptyText, { color: theme.muted }]}>Try the full library or connect a service in Profile.</Text>
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
  list: { paddingHorizontal: 20, paddingTop: 20 },
  kicker: { fontSize: 10, letterSpacing: 1.3, fontWeight: "800", marginBottom: 5 },
  pageTitle: { fontSize: 31, lineHeight: 37, letterSpacing: -1.15, fontWeight: "800", marginBottom: 18 },
  inputShell: { height: 52, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 10 },
  input: { flex: 1, fontSize: 16, lineHeight: 20, paddingVertical: 0 },
  clearButton: { width: 24, height: 30, justifyContent: "center", alignItems: "center" },
  filterRow: { flexDirection: "row", gap: 8, marginTop: 13, marginBottom: 29 },
  filter: { minHeight: 33, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, alignItems: "center", justifyContent: "center" },
  filterText: { fontSize: 11, fontWeight: "800" },
  resultHead: { marginBottom: 1 },
  provenance: { minHeight: 32, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 9, marginTop: -3, marginBottom: 12 },
  provenanceText: { fontSize: 10, fontWeight: "600" },
  empty: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 17, marginTop: 8 },
  emptyTitle: { fontSize: 16, fontWeight: "800" },
  emptyText: { fontSize: 13, lineHeight: 18, marginTop: 5 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
