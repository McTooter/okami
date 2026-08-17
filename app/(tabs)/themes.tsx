import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { MiniPlayer } from "@/components/sphynx/controls";
import { ScreenContainer } from "@/components/screen-container";
import { appMaterials, type AppMaterialId, useSphynx } from "@/lib/sphynx-store";

const materialOrder: AppMaterialId[] = ["core", "noir-pulse", "sunlit-signal"];

export default function ThemesTab() {
  const { material, materialId, setMaterialId, sound, theme } = useSphynx();
  const motionReduced = sound.motionReduced;

  return (
    <ScreenContainer containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={motionReduced ? undefined : FadeInDown.duration(240)}>
          <Text style={[styles.eyebrow, { color: material.cue ?? theme.accent }]}>APP MATERIAL</Text>
          <Text style={[styles.title, { color: theme.foreground }]}>Theme Studio</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Change how Sphynx moves, cues, and frames the music. Your base palette remains untouched.</Text>
        </Animated.View>

        <View style={[styles.preview, { backgroundColor: theme.surface, borderColor: material.cue ?? theme.border }]}> 
          <View style={[styles.previewRail, { backgroundColor: material.cue ?? theme.accent }]} />
          <View style={styles.previewTopline}>
            <Text style={[styles.previewLabel, { color: theme.muted }]}>ACTIVE MATERIAL</Text>
            <Text style={[styles.previewName, { color: theme.foreground }]}>{material.name}</Text>
          </View>
          <View style={styles.previewWindow}>
            <View style={[styles.previewOrb, { backgroundColor: material.fieldAccent ?? theme.accent }]} />
            <View style={[styles.previewLine, { backgroundColor: material.fieldSecondary ?? theme.foreground }]} />
            <View style={[styles.previewLineShort, { backgroundColor: material.fieldAccent ?? theme.accent }]} />
          </View>
          <Text style={[styles.previewNote, { color: theme.muted }]}>{material.note}</Text>
        </View>

        <View style={styles.sectionHeading}>
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Material studies</Text>
          <Text style={[styles.sectionMeta, { color: theme.muted }]}>Original Sphynx modes</Text>
        </View>

        <View style={styles.cards}>
          {materialOrder.map((id, index) => {
            const item = appMaterials[id];
            const selected = id === materialId;
            const cue = item.cue ?? theme.accent;
            return (
              <Animated.View key={id} entering={motionReduced ? undefined : FadeInDown.delay(90 + index * 55).duration(230)}>
                <Pressable
                  accessibilityLabel={`${item.name}. ${item.note}. ${selected ? "Selected" : "Select material"}`}
                  accessibilityState={{ selected }}
                  onPress={() => setMaterialId(id)}
                  style={({ pressed }) => [styles.materialCard, { backgroundColor: selected ? theme.raised : theme.surface, borderColor: selected ? cue : theme.border }, pressed && styles.pressed]}
                >
                  <View style={[styles.swatch, { backgroundColor: cue }]}>
                    <View style={[styles.swatchCut, { borderColor: item.fieldSecondary ?? theme.foreground }]} />
                  </View>
                  <View style={styles.cardCopy}>
                    <View style={styles.cardTitleRow}>
                      <Text style={[styles.cardTitle, { color: theme.foreground }]}>{item.name}</Text>
                      {selected ? <Ionicons name="checkmark-circle" size={18} color={cue} /> : null}
                    </View>
                    <Text style={[styles.cardNote, { color: theme.muted }]}>{item.note}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <View style={[styles.note, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={17} color={material.cue ?? theme.accent} />
          <Text style={[styles.noteText, { color: theme.muted }]}>Theme Studio changes Sphynx’s interaction material and Listening Field. Palette and reduced-motion controls stay available in Theme Atelier.</Text>
        </View>
      </ScrollView>
      <MiniPlayer />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 102, gap: 18 },
  eyebrow: { fontSize: 10, fontWeight: "900", letterSpacing: 1.45 },
  title: { marginTop: 5, fontSize: 32, lineHeight: 37, fontWeight: "800", letterSpacing: -1.1 },
  subtitle: { marginTop: 7, fontSize: 14, lineHeight: 20, maxWidth: 320 },
  preview: { minHeight: 174, borderWidth: StyleSheet.hairlineWidth, borderRadius: 23, overflow: "hidden", padding: 18, justifyContent: "space-between" },
  previewRail: { position: "absolute", top: 0, left: 0, right: 0, height: 5 },
  previewTopline: { gap: 3 },
  previewLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 1.05 },
  previewName: { fontSize: 19, lineHeight: 24, fontWeight: "800" },
  previewWindow: { height: 50, justifyContent: "center", overflow: "hidden" },
  previewOrb: { position: "absolute", width: 72, height: 72, borderRadius: 36, right: 24, opacity: 0.78 },
  previewLine: { width: "75%", height: 2, opacity: 0.7 },
  previewLineShort: { width: "42%", height: 5, marginTop: 9 },
  previewNote: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
  sectionHeading: { marginTop: 3, flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
  sectionMeta: { fontSize: 10, fontWeight: "700" },
  cards: { gap: 9 },
  materialCard: { minHeight: 84, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, padding: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  swatch: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  swatchCut: { width: 21, height: 21, borderRadius: 4, borderWidth: 2, transform: [{ rotate: "-18deg" }] },
  cardCopy: { flex: 1, gap: 3 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: "800" },
  cardNote: { fontSize: 11, lineHeight: 15, fontWeight: "500" },
  note: { flexDirection: "row", gap: 9, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 12 },
  noteText: { flex: 1, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
});
