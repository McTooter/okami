import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { themes, type ThemeId, useSphynx } from "@/lib/sphynx-store";

const themeOrder: ThemeId[] = ["obsidian", "cobalt", "porcelain", "ember"];
const typeOptions = ["standard", "large", "extra"] as const;

export default function ThemeAtelierScreen() {
  const router = useRouter();
  const { theme, themeId, setThemeId, sound, setSound } = useSphynx();
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <Stack.Screen options={{ presentation: "fullScreenModal", animation: "fade" }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}><Ionicons name="chevron-back" size={22} color={theme.foreground} /></Pressable>
          <Text style={[styles.topTitle, { color: theme.foreground }]}>Theme Atelier</Text>
          <View style={styles.backButton} />
        </View>
        <Text style={[styles.kicker, { color: theme.accent }]}>COMPOSABLE, NOT CHAOTIC</Text>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>A room that sounds like you.</Text>
        <Text style={[styles.intro, { color: theme.muted }]}>Each palette changes the environment while keeping the same hierarchy, contrast logic, and playback state language.</Text>

        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Palette studies</Text>
        <View style={styles.themeGrid}>
          {themeOrder.map((id) => {
            const item = themes[id];
            const selected = themeId === id;
            return (
              <Pressable key={id} onPress={() => { haptic.medium(); setThemeId(id); }} style={({ pressed }) => [styles.themeCard, { backgroundColor: item.surface, borderColor: selected ? item.accent : item.border }, pressed && styles.pressed]}>
                <View style={[styles.themePreview, { backgroundColor: item.background }]}>
                  <View style={[styles.previewBar, { backgroundColor: item.accent }]} />
                  <View style={[styles.previewLine, { backgroundColor: item.foreground, width: "62%" }]} />
                  <View style={[styles.previewLine, { backgroundColor: item.muted, width: "42%" }]} />
                  <View style={[styles.previewPill, { backgroundColor: item.raised }]} />
                </View>
                <View style={styles.themeNameRow}>
                  <Text style={[styles.themeName, { color: item.foreground }]}>{item.name}</Text>
                  {selected ? <Ionicons name="checkmark-circle" size={17} color={item.accent} /> : null}
                </View>
                <Text style={[styles.themeNote, { color: item.muted }]}>{item.note}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.foreground, marginTop: 27 }]}>Comfort tuning</Text>
        <View style={[styles.comfortCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.comfortRow}>
            <View><Text style={[styles.comfortTitle, { color: theme.foreground }]}>Type scale</Text><Text style={[styles.comfortNote, { color: theme.muted }]}>Affects app interface copy</Text></View>
            <View style={styles.typeOptions}>
              {typeOptions.map((option) => {
                const active = sound.typeScale === option;
                return <Pressable key={option} onPress={() => { haptic.selection(); setSound({ typeScale: option }); }} style={({ pressed }) => [styles.typeButton, { backgroundColor: active ? theme.accent : theme.raised, borderColor: active ? theme.accent : theme.border }, pressed && styles.pressed]}><Text style={[styles.typeButtonText, { color: active ? theme.accentInk : theme.muted }]}>{option === "standard" ? "A" : option === "large" ? "A+" : "A++"}</Text></Pressable>;
              })}
            </View>
          </View>
          <View style={[styles.comfortDivider, { backgroundColor: theme.border }]} />
          <Pressable onPress={() => { haptic.medium(); setSound({ motionReduced: !sound.motionReduced }); }} style={({ pressed }) => [styles.comfortRow, pressed && styles.pressed]}>
            <View><Text style={[styles.comfortTitle, { color: theme.foreground }]}>Reduce motion</Text><Text style={[styles.comfortNote, { color: theme.muted }]}>Favor discreet state changes</Text></View>
            <View style={[styles.toggle, { backgroundColor: sound.motionReduced ? theme.accent : theme.border }]}><View style={[styles.toggleDot, { backgroundColor: sound.motionReduced ? theme.accentInk : theme.muted, alignSelf: sound.motionReduced ? "flex-end" : "flex-start" }]} /></View>
          </Pressable>
        </View>

        <View style={[styles.designNote, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <Ionicons name="contrast-outline" size={20} color={theme.accent} />
          <Text style={[styles.designText, { color: theme.muted }]}>Okami protects legibility: destructive, active, and source states keep distinct labels and shapes, not color alone.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 34 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 29 },
  backButton: { width: 42, height: 42, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 14, fontWeight: "800" },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.35, marginBottom: 6 },
  pageTitle: { fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -1.1, maxWidth: 330 },
  intro: { fontSize: 13, lineHeight: 19, marginTop: 10, marginBottom: 25, maxWidth: 350 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 12 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  themeCard: { width: "48.5%", minHeight: 174, borderRadius: 18, borderWidth: 1.5, padding: 10 },
  themePreview: { height: 84, borderRadius: 12, padding: 12, justifyContent: "center", gap: 6, overflow: "hidden" },
  previewBar: { position: "absolute", top: 0, left: 0, right: 0, height: 4 },
  previewLine: { height: 7, borderRadius: 4 },
  previewPill: { width: "52%", height: 15, borderRadius: 8, marginTop: 3 },
  themeNameRow: { marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 },
  themeName: { fontSize: 12, fontWeight: "800" },
  themeNote: { fontSize: 9, lineHeight: 12, marginTop: 3 },
  comfortCard: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14 },
  comfortRow: { minHeight: 66, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  comfortTitle: { fontSize: 13, fontWeight: "800" },
  comfortNote: { fontSize: 10, lineHeight: 14, marginTop: 2 },
  comfortDivider: { height: StyleSheet.hairlineWidth },
  typeOptions: { flexDirection: "row", gap: 5 },
  typeButton: { width: 35, height: 29, borderRadius: 9, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", alignItems: "center" },
  typeButtonText: { fontSize: 10, fontWeight: "800" },
  toggle: { width: 39, height: 22, borderRadius: 11, padding: 3 },
  toggleDot: { width: 16, height: 16, borderRadius: 8 },
  designNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, padding: 13, marginTop: 15 },
  designText: { flex: 1, fontSize: 10, lineHeight: 14 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
});
