import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { useSphynx } from "@/lib/sphynx-store";

const bands = ["60", "250", "1k", "4k", "12k"];
const presets: { name: string; values: [number, number, number, number, number] }[] = [
  { name: "Flat", values: [0, 0, 0, 0, 0] },
  { name: "Night drive", values: [2, 1, -1, 2, 1] },
  { name: "Room tone", values: [-1, 0, 1, 1, -1] },
];

function Stepper({ label, value, onDecrease, onIncrease, unit }: { label: string; value: string; onDecrease: () => void; onIncrease: () => void; unit?: string }) {
  const { theme } = useSphynx();
  return (
    <View style={[styles.stepper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.stepperLabel, { color: theme.muted }]}>{label}</Text>
      <View style={styles.stepperRight}>
        <Pressable accessibilityLabel={`Decrease ${label}`} onPress={onDecrease} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Ionicons name="remove" size={18} color={theme.foreground} /></Pressable>
        <Text style={[styles.stepperValue, { color: theme.foreground }]}>{value}{unit}</Text>
        <Pressable accessibilityLabel={`Increase ${label}`} onPress={onIncrease} style={({ pressed }) => [styles.stepButton, pressed && styles.pressed]}><Ionicons name="add" size={18} color={theme.foreground} /></Pressable>
      </View>
    </View>
  );
}

export default function SoundLabScreen() {
  const router = useRouter();
  const { theme, sound, setSound } = useSphynx();
  const applyPreset = (values: [number, number, number, number, number]) => { haptic.medium(); setSound({ eq: values }); };
  const adjustBand = (index: number) => {
    const next = [...sound.eq] as [number, number, number, number, number];
    next[index] = next[index] >= 3 ? -3 : next[index] + 1;
    haptic.selection();
    setSound({ eq: next });
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <Stack.Screen options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}><Ionicons name="chevron-back" size={22} color={theme.foreground} /></Pressable>
          <Text style={[styles.topTitle, { color: theme.foreground }]}>Sound Lab</Text>
          <View style={styles.backButton} />
        </View>

        <Text style={[styles.kicker, { color: theme.accent }]}>LISTENING TOOLS</Text>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>Shape the room, not the truth.</Text>
        <Text style={[styles.intro, { color: theme.muted }]}>Controls apply only where the active source and approved playback engine can honor them. High gain is intentionally guarded.</Text>

        <View style={[styles.eqCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.eqHeader}><Text style={[styles.eqTitle, { color: theme.foreground }]}>Five-band equalizer</Text><Text style={[styles.eqNote, { color: theme.muted }]}>Tap a band to step</Text></View>
          <View style={styles.bands}>
            {bands.map((band, index) => {
              const db = sound.eq[index];
              return (
                <Pressable key={band} onPress={() => adjustBand(index)} style={({ pressed }) => [styles.band, pressed && styles.pressed]}>
                  <Text style={[styles.bandValue, { color: db === 0 ? theme.muted : theme.accent }]}>{db > 0 ? "+" : ""}{db}</Text>
                  <View style={[styles.faderTrack, { backgroundColor: theme.raised }]}>
                    <View style={[styles.centerLine, { backgroundColor: theme.border }]} />
                    <View style={[styles.faderKnob, { backgroundColor: theme.accent, bottom: 50 + db * 10 }]} />
                  </View>
                  <Text style={[styles.bandLabel, { color: theme.muted }]}>{band}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.presetRow}>
            {presets.map((preset) => (
              <Pressable key={preset.name} onPress={() => applyPreset(preset.values)} style={({ pressed }) => [styles.preset, { borderColor: theme.border }, pressed && styles.pressed]}>
                <Text style={[styles.presetText, { color: theme.foreground }]}>{preset.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.toolsGroup}>
          <Stepper label="Preamp" value={`${sound.preamp > 0 ? "+" : ""}${sound.preamp.toFixed(1)}`} unit=" dB" onDecrease={() => { haptic.selection(); setSound({ preamp: Math.max(-6, Number((sound.preamp - 0.5).toFixed(1))) }); }} onIncrease={() => { haptic.selection(); setSound({ preamp: Math.min(6, Number((sound.preamp + 0.5).toFixed(1))) }); }} />
          <Stepper label="Crossfade" value={String(sound.crossfade)} unit=" s" onDecrease={() => { haptic.selection(); setSound({ crossfade: Math.max(0, sound.crossfade - 1) }); }} onIncrease={() => { haptic.selection(); setSound({ crossfade: Math.min(12, sound.crossfade + 1) }); }} />
        </View>

        <View style={[styles.safety, { backgroundColor: sound.preamp > 3 ? "#4A211F" : theme.raised, borderColor: sound.preamp > 3 ? theme.danger : theme.border }]}>
          <Ionicons name={sound.preamp > 3 ? "warning-outline" : "shield-checkmark-outline"} size={20} color={sound.preamp > 3 ? theme.danger : theme.accent} />
          <View style={styles.safetyCopy}>
            <Text style={[styles.safetyTitle, { color: theme.foreground }]}>{sound.preamp > 3 ? "High gain can clip." : "Gain protection is active."}</Text>
            <Text style={[styles.safetyNote, { color: theme.muted }]}>{sound.preamp > 3 ? "Lower the preamp or keep the limiter on to preserve headroom." : "Limiter catches peak overload on eligible Sphynx/local playback."}</Text>
          </View>
          <Pressable onPress={() => { haptic.medium(); setSound({ limiter: !sound.limiter }); }} style={({ pressed }) => [styles.toggle, { backgroundColor: sound.limiter ? theme.accent : theme.border }, pressed && styles.pressed]}>
            <View style={[styles.toggleDot, { backgroundColor: sound.limiter ? theme.accentInk : theme.muted, alignSelf: sound.limiter ? "flex-end" : "flex-start" }]} />
          </Pressable>
        </View>

        <Pressable onPress={() => { haptic.medium(); setSound({ mono: !sound.mono }); }} style={({ pressed }) => [styles.option, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
          <View><Text style={[styles.optionTitle, { color: theme.foreground }]}>Mono compatibility</Text><Text style={[styles.optionNote, { color: theme.muted }]}>Sum eligible playback to a centered reference.</Text></View>
          <View style={[styles.check, { backgroundColor: sound.mono ? theme.accent : theme.raised, borderColor: sound.mono ? theme.accent : theme.border }]}>{sound.mono ? <Ionicons name="checkmark" size={15} color={theme.accentInk} /> : null}</View>
        </Pressable>
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
  intro: { fontSize: 13, lineHeight: 19, marginTop: 10, marginBottom: 24, maxWidth: 352 },
  eqCard: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 15 },
  eqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  eqTitle: { fontSize: 16, fontWeight: "800" },
  eqNote: { fontSize: 10, fontWeight: "600" },
  bands: { flexDirection: "row", justifyContent: "space-between", marginTop: 19, paddingHorizontal: 3 },
  band: { width: 42, alignItems: "center" },
  bandValue: { fontSize: 11, fontWeight: "800", fontVariant: ["tabular-nums"], marginBottom: 8 },
  faderTrack: { width: 8, height: 112, borderRadius: 4, position: "relative", justifyContent: "center" },
  centerLine: { position: "absolute", left: -3, right: -3, height: StyleSheet.hairlineWidth },
  faderKnob: { position: "absolute", left: -5, width: 18, height: 12, borderRadius: 6 },
  bandLabel: { fontSize: 10, fontWeight: "700", marginTop: 9 },
  presetRow: { flexDirection: "row", gap: 7, marginTop: 20 },
  preset: { flex: 1, minHeight: 32, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  presetText: { fontSize: 10, fontWeight: "700" },
  toolsGroup: { gap: 9 },
  stepper: { minHeight: 64, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 13 },
  stepperLabel: { fontSize: 13, fontWeight: "700" },
  stepperRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepButton: { width: 32, height: 36, justifyContent: "center", alignItems: "center" },
  stepperValue: { minWidth: 57, textAlign: "center", fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  safety: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, padding: 13, marginTop: 15 },
  safetyCopy: { flex: 1 },
  safetyTitle: { fontSize: 13, fontWeight: "800" },
  safetyNote: { fontSize: 10, lineHeight: 14, marginTop: 2 },
  toggle: { width: 39, height: 22, borderRadius: 11, padding: 3 },
  toggleDot: { width: 16, height: 16, borderRadius: 8 },
  option: { minHeight: 70, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 14, marginTop: 12 },
  optionTitle: { fontSize: 13, fontWeight: "800" },
  optionNote: { fontSize: 10, lineHeight: 14, marginTop: 3 },
  check: { width: 23, height: 23, borderRadius: 7, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", alignItems: "center" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
});
