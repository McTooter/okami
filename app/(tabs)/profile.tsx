import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AlbumArt } from "@/components/sphynx/album-art";
import { MiniPlayer, SectionHeading } from "@/components/sphynx/controls";
import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { useSphynx } from "@/lib/sphynx-store";

function SettingRow({ icon, title, note, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; note: string; onPress: () => void }) {
  const { theme } = useSphynx();
  return (
    <Pressable onPress={() => { haptic.light(); onPress(); }} style={({ pressed }) => [styles.settingRow, { borderBottomColor: theme.border }, pressed && styles.pressed]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.surface }]}><Ionicons name={icon} size={18} color={theme.accent} /></View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, { color: theme.foreground }]}>{title}</Text>
        <Text style={[styles.settingNote, { color: theme.muted }]}>{note}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.muted} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, themeId, connected, sound } = useSphynx();
  const activeServices = Object.values(connected).filter(Boolean).length;

  return (
    <ScreenContainer containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topLine}>
          <View>
            <Text style={[styles.kicker, { color: theme.accent }]}>SPHYNX PERSONALIZATION</Text>
            <Text style={[styles.pageTitle, { color: theme.foreground }]}>Profile</Text>
          </View>
          <View style={[styles.monogram, { backgroundColor: theme.accent }]}><Text style={[styles.monogramText, { color: theme.accentInk }]}>S</Text></View>
        </View>

        <View style={[styles.identity, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <AlbumArt artwork="interval" size={60} radius={16} />
          <View style={styles.identityCopy}>
            <Text style={[styles.identityTitle, { color: theme.foreground }]}>Your listening desk</Text>
            <Text style={[styles.identityNote, { color: theme.muted }]}>{activeServices} authorized sources · {sound.crossfade}s crossfade</Text>
          </View>
        </View>

        <SectionHeading eyebrow="Control room" title="Make it yours" />
        <View style={[styles.settings, { borderTopColor: theme.border }]}>
          <SettingRow icon="options-outline" title="Sound Lab" note={`${sound.preamp > 0 ? "+" : ""}${sound.preamp.toFixed(1)} dB preamp · ${sound.limiter ? "Limiter on" : "Limiter off"}`} onPress={() => router.push("/sound-lab" as never)} />
          <SettingRow icon="color-palette-outline" title="Theme Atelier" note={`${theme.name} · ${themeId === "obsidian" ? "Reference mode" : "Personal mode"}`} onPress={() => router.push("/theme-atelier" as never)} />
          <SettingRow icon="link-outline" title="Connected services" note={`${activeServices} active · source-aware access`} onPress={() => router.push("/connected-services" as never)} />
          <SettingRow icon="accessibility-outline" title="Comfort" note={`${sound.typeScale} type · ${sound.motionReduced ? "reduced motion" : "standard motion"}`} onPress={() => router.push("/theme-atelier" as never)} />
        </View>

        <View style={[styles.integrity, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.accent} />
          <View style={styles.integrityCopy}>
            <Text style={[styles.integrityTitle, { color: theme.foreground }]}>Your source stays visible.</Text>
            <Text style={[styles.integrityNote, { color: theme.muted }]}>Sphynx keeps service provenance and playback availability explicit rather than promising access it cannot authorize.</Text>
          </View>
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
  identity: { flexDirection: "row", alignItems: "center", gap: 13, borderRadius: 19, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginBottom: 27 },
  identityCopy: { flex: 1, minWidth: 0 },
  identityTitle: { fontSize: 16, fontWeight: "800" },
  identityNote: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  settings: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: -1 },
  settingRow: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  settingIcon: { width: 37, height: 37, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  settingCopy: { flex: 1, minWidth: 0 },
  settingTitle: { fontSize: 15, fontWeight: "700" },
  settingNote: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  integrity: { flexDirection: "row", gap: 11, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, padding: 14, marginTop: 26 },
  integrityCopy: { flex: 1 },
  integrityTitle: { fontSize: 13, fontWeight: "800" },
  integrityNote: { fontSize: 11, lineHeight: 15, marginTop: 3 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
});
