import { Ionicons } from "@expo/vector-icons";
import type { PitchCorrectionQuality } from "expo-audio";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { exportAudioSettings } from "@/lib/audio-settings-export";
import { ENGINE_REQUIRED_CONTROLS, type LoudnessMode, type ResamplerMode } from "@/lib/advanced-audio-core";
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
  const { theme, sound, setSound, eqPresets, activeEqPresetId, headphoneGroups, activeHeadphoneGroupId, setActiveHeadphoneGroupId, createHeadphoneGroup, renameHeadphoneGroup, deleteHeadphoneGroup, saveEqPreset, applyEqPreset, overwriteActiveEqPreset, deleteEqPreset } = useSphynx();
  const [presetName, setPresetName] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const activeGroup = headphoneGroups.find((group) => group.id === activeHeadphoneGroupId) ?? headphoneGroups[0];
  const groupPresets = eqPresets.filter((preset) => preset.groupId === activeGroup.id);
  const applyPreset = (values: [number, number, number, number, number]) => { haptic.medium(); setSound({ eq: values }); };
  const adjustBand = (index: number) => {
    const next = [...sound.eq] as [number, number, number, number, number];
    next[index] = next[index] >= 3 ? -3 : next[index] + 1;
    haptic.selection();
    setSound({ eq: next });
  };
  const saveCurrentPreset = () => {
    haptic.medium();
    saveEqPreset(presetName);
    setPresetName("");
  };
  const shareSettings = async () => {
    haptic.medium();
    const result = await exportAudioSettings(sound, eqPresets, headphoneGroups, activeHeadphoneGroupId);
    setExportMessage(result.message);
  };
  const addDeviceGroup = () => {
    haptic.medium();
    createHeadphoneGroup(deviceName);
    setDeviceName("");
  };
  const renameDeviceGroup = () => {
    haptic.medium();
    renameHeadphoneGroup(activeGroup.id, deviceName || activeGroup.name);
    setDeviceName("");
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

        <View style={[styles.deviceCluster, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <View style={styles.rackHeading}>
            <View>
              <Text style={[styles.rackTitle, { color: theme.foreground }]}>Listening device</Text>
              <Text style={[styles.rackNote, { color: theme.muted }]}>Give every pair its own sound signature.</Text>
            </View>
            <Ionicons name="headset-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.deviceChips}>
            {headphoneGroups.map((group) => {
              const selected = group.id === activeHeadphoneGroupId;
              return <Pressable key={group.id} accessibilityLabel={`Select ${group.name}`} onPress={() => { haptic.selection(); setActiveHeadphoneGroupId(group.id); }} style={({ pressed }) => [styles.deviceChip, { borderColor: selected ? theme.accent : theme.border, backgroundColor: selected ? theme.accent : theme.surface }, pressed && styles.pressed]}><Text numberOfLines={1} style={[styles.deviceChipText, { color: selected ? theme.accentInk : theme.foreground }]}>{group.name}</Text></Pressable>;
            })}
          </View>
          <View style={styles.saveRow}>
            <TextInput
              accessibilityLabel="Name listening device"
              value={deviceName}
              onChangeText={setDeviceName}
              placeholder={activeGroup.protected ? "Add device — e.g. Night cans" : `Rename ${activeGroup.name}`}
              placeholderTextColor={theme.muted}
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={addDeviceGroup}
              style={[styles.presetInput, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
            <Pressable accessibilityLabel="Add listening device" onPress={addDeviceGroup} style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.accent }, pressed && styles.pressed]}><Ionicons name="add" size={19} color={theme.accentInk} /></Pressable>
          </View>
          {!activeGroup.protected ? (
            <View style={styles.deviceActions}>
              <Pressable accessibilityLabel={`Rename ${activeGroup.name}`} onPress={renameDeviceGroup} style={({ pressed }) => [styles.deviceAction, { borderColor: theme.border }, pressed && styles.pressed]}><Ionicons name="pencil-outline" size={14} color={theme.foreground} /><Text style={[styles.deviceActionText, { color: theme.foreground }]}>Rename selected</Text></Pressable>
              <Pressable accessibilityLabel={`Delete ${activeGroup.name}`} onPress={() => { haptic.selection(); deleteHeadphoneGroup(activeGroup.id); }} style={({ pressed }) => [styles.deviceAction, { borderColor: theme.border }, pressed && styles.pressed]}><Ionicons name="trash-outline" size={14} color={theme.danger} /><Text style={[styles.deviceActionText, { color: theme.danger }]}>Remove group</Text></Pressable>
            </View>
          ) : <Text style={[styles.deviceFootnote, { color: theme.muted }]}>General audio keeps unassigned presets safe when a device group is removed.</Text>}
        </View>

        <View style={[styles.deviceRack, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.rackHeading}>
            <View>
              <Text style={[styles.rackTitle, { color: theme.foreground }]}>{activeGroup.name} presets</Text>
              <Text style={[styles.rackNote, { color: theme.muted }]}>Private EQ profiles for this listening device.</Text>
            </View>
            <Text style={[styles.rackCount, { color: theme.accent }]}>{String(groupPresets.length).padStart(2, "0")}</Text>
          </View>
          <View style={styles.saveRow}>
            <TextInput
              accessibilityLabel="Name EQ preset"
              value={presetName}
              onChangeText={setPresetName}
              placeholder="Name this field"
              placeholderTextColor={theme.muted}
              maxLength={32}
              returnKeyType="done"
              onSubmitEditing={saveCurrentPreset}
              style={[styles.presetInput, { color: theme.foreground, borderColor: theme.border, backgroundColor: theme.raised }]}
            />
            <Pressable accessibilityLabel="Save EQ preset" onPress={saveCurrentPreset} style={({ pressed }) => [styles.saveButton, { backgroundColor: theme.accent }, pressed && styles.pressed]}>
              <Ionicons name="bookmark-outline" size={17} color={theme.accentInk} />
            </Pressable>
          </View>
          {groupPresets.length ? (
            <View style={styles.savedPresets}>
              {groupPresets.map((preset) => {
                const active = preset.id === activeEqPresetId;
                return (
                  <View key={preset.id} style={[styles.savedPreset, { borderColor: active ? theme.accent : theme.border, backgroundColor: active ? theme.raised : theme.surface }]}>
                    <Pressable accessibilityLabel={`Apply ${preset.name} preset`} onPress={() => { haptic.medium(); applyEqPreset(preset); }} style={({ pressed }) => [styles.savedPresetMain, pressed && styles.pressed]}>
                      <View style={[styles.presetIndicator, { backgroundColor: active ? theme.accent : theme.border }]} />
                      <Text numberOfLines={1} style={[styles.savedPresetName, { color: theme.foreground }]}>{preset.name}</Text>
                      {active ? <Text style={[styles.activeLabel, { color: theme.accent }]}>ACTIVE</Text> : null}
                    </Pressable>
                    <Pressable accessibilityLabel={`Delete ${preset.name} preset`} onPress={() => { haptic.selection(); deleteEqPreset(preset.id); }} style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
                      <Ionicons name="trash-outline" size={16} color={theme.muted} />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ) : <Text style={[styles.emptyRack, { color: theme.muted }]}>Save the field you are shaping to recall it with {activeGroup.name}.</Text>}
          {activeEqPresetId ? (
            <Pressable accessibilityLabel="Overwrite active EQ preset" onPress={() => { haptic.medium(); overwriteActiveEqPreset(); }} style={({ pressed }) => [styles.overwriteButton, { borderColor: theme.border }, pressed && styles.pressed]}>
              <Ionicons name="refresh-outline" size={15} color={theme.foreground} />
              <Text style={[styles.overwriteText, { color: theme.foreground }]}>Overwrite active preset</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.toolsGroup}>
          <Stepper label="Preamp" value={`${sound.preamp > 0 ? "+" : ""}${sound.preamp.toFixed(1)}`} unit=" dB" onDecrease={() => { haptic.selection(); setSound({ preamp: Math.max(-6, Number((sound.preamp - 0.5).toFixed(1))) }); }} onIncrease={() => { haptic.selection(); setSound({ preamp: Math.min(6, Number((sound.preamp + 0.5).toFixed(1))) }); }} />
          <Stepper label="Crossfade" value={String(sound.crossfade)} unit=" s" onDecrease={() => { haptic.selection(); setSound({ crossfade: Math.max(0, sound.crossfade - 1) }); }} onIncrease={() => { haptic.selection(); setSound({ crossfade: Math.min(12, sound.crossfade + 1) }); }} />
        </View>

        <View style={[styles.engineCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.rackHeading}>
            <View><Text style={[styles.rackTitle, { color: theme.foreground }]}>Local playback</Text><Text style={[styles.rackNote, { color: theme.muted }]}>These controls are applied to imported files by the current audio engine.</Text></View>
            <Ionicons name="speedometer-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.toolsGroup}>
            <Stepper label="Tempo" value={sound.playbackRate.toFixed(2)} unit="×" onDecrease={() => { haptic.selection(); setSound({ playbackRate: Math.max(0.5, Number((sound.playbackRate - 0.05).toFixed(2))) }); }} onIncrease={() => { haptic.selection(); setSound({ playbackRate: Math.min(2, Number((sound.playbackRate + 0.05).toFixed(2))) }); }} />
            <Stepper label="Output trim" value={sound.outputTrim.toFixed(1)} unit=" dB" onDecrease={() => { haptic.selection(); setSound({ outputTrim: Math.max(-12, Number((sound.outputTrim - 0.5).toFixed(1))) }); }} onIncrease={() => { haptic.selection(); setSound({ outputTrim: Math.min(0, Number((sound.outputTrim + 0.5).toFixed(1))) }); }} />
          </View>
          <View style={styles.switchRow}>
            <Pressable accessibilityLabel="Toggle pitch correction" onPress={() => { haptic.selection(); setSound({ pitchCorrectionEnabled: !sound.pitchCorrectionEnabled }); }} style={({ pressed }) => [styles.smallToggle, { backgroundColor: sound.pitchCorrectionEnabled ? theme.accent : theme.raised, borderColor: sound.pitchCorrectionEnabled ? theme.accent : theme.border }, pressed && styles.pressed]}><Text style={[styles.smallToggleText, { color: sound.pitchCorrectionEnabled ? theme.accentInk : theme.foreground }]}>Pitch lock</Text></Pressable>
            <Pressable accessibilityLabel="Toggle repeat one" onPress={() => { haptic.selection(); setSound({ repeatOne: !sound.repeatOne }); }} style={({ pressed }) => [styles.smallToggle, { backgroundColor: sound.repeatOne ? theme.accent : theme.raised, borderColor: sound.repeatOne ? theme.accent : theme.border }, pressed && styles.pressed]}><Text style={[styles.smallToggleText, { color: sound.repeatOne ? theme.accentInk : theme.foreground }]}>Repeat one</Text></Pressable>
          </View>
          <Text style={[styles.choiceLabel, { color: theme.muted }]}>Pitch correction quality</Text>
          <View style={styles.choiceRow}>{(["low", "medium", "high"] as PitchCorrectionQuality[]).map((quality) => <Pressable key={quality} onPress={() => { haptic.selection(); setSound({ pitchCorrectionQuality: quality }); }} style={({ pressed }) => [styles.choiceChip, { borderColor: sound.pitchCorrectionQuality === quality ? theme.accent : theme.border, backgroundColor: sound.pitchCorrectionQuality === quality ? theme.accent : theme.raised }, pressed && styles.pressed]}><Text style={[styles.choiceText, { color: sound.pitchCorrectionQuality === quality ? theme.accentInk : theme.foreground }]}>{quality}</Text></Pressable>)}</View>
        </View>

        <View style={[styles.engineCard, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <View style={styles.rackHeading}>
            <View><Text style={[styles.rackTitle, { color: theme.foreground }]}>Reference DSP shelf</Text><Text style={[styles.rackNote, { color: theme.muted }]}>Profiles remember these choices; waveform processing awaits Sphynx’s dedicated native DSP engine.</Text></View>
            <Ionicons name="hardware-chip-outline" size={20} color={theme.accent} />
          </View>
          <View style={styles.toolsGroup}>
            <Stepper label="Crossfeed" value={String(sound.crossfeed)} unit="%" onDecrease={() => { haptic.selection(); setSound({ crossfeed: Math.max(0, sound.crossfeed - 5) }); }} onIncrease={() => { haptic.selection(); setSound({ crossfeed: Math.min(100, sound.crossfeed + 5) }); }} />
            <Stepper label="Spatial width" value={String(sound.spatialWidth)} unit="%" onDecrease={() => { haptic.selection(); setSound({ spatialWidth: Math.max(0, sound.spatialWidth - 5) }); }} onIncrease={() => { haptic.selection(); setSound({ spatialWidth: Math.min(100, sound.spatialWidth + 5) }); }} />
          </View>
          <Text style={[styles.choiceLabel, { color: theme.muted }]}>Loudness reference</Text>
          <View style={styles.choiceRow}>{(["off", "track", "album"] as LoudnessMode[]).map((mode) => <Pressable key={mode} onPress={() => { haptic.selection(); setSound({ loudnessMode: mode }); }} style={({ pressed }) => [styles.choiceChip, { borderColor: sound.loudnessMode === mode ? theme.accent : theme.border, backgroundColor: sound.loudnessMode === mode ? theme.accent : theme.surface }, pressed && styles.pressed]}><Text style={[styles.choiceText, { color: sound.loudnessMode === mode ? theme.accentInk : theme.foreground }]}>{mode}</Text></Pressable>)}</View>
          <View style={styles.switchRow}>
            <Pressable accessibilityLabel="Toggle compressor request" onPress={() => { haptic.selection(); setSound({ compressor: !sound.compressor }); }} style={({ pressed }) => [styles.smallToggle, { backgroundColor: sound.compressor ? theme.accent : theme.surface, borderColor: sound.compressor ? theme.accent : theme.border }, pressed && styles.pressed]}><Text style={[styles.smallToggleText, { color: sound.compressor ? theme.accentInk : theme.foreground }]}>Compressor</Text></Pressable>
            <Pressable accessibilityLabel="Toggle phase inversion request" onPress={() => { haptic.selection(); setSound({ phaseInverted: !sound.phaseInverted }); }} style={({ pressed }) => [styles.smallToggle, { backgroundColor: sound.phaseInverted ? theme.accent : theme.surface, borderColor: sound.phaseInverted ? theme.accent : theme.border }, pressed && styles.pressed]}><Text style={[styles.smallToggleText, { color: sound.phaseInverted ? theme.accentInk : theme.foreground }]}>Invert phase</Text></Pressable>
          </View>
          <Text style={[styles.choiceLabel, { color: theme.muted }]}>Resampler target</Text>
          <View style={styles.choiceRow}>{(["system", "high"] as ResamplerMode[]).map((mode) => <Pressable key={mode} onPress={() => { haptic.selection(); setSound({ resampler: mode }); }} style={({ pressed }) => [styles.choiceChip, { borderColor: sound.resampler === mode ? theme.accent : theme.border, backgroundColor: sound.resampler === mode ? theme.accent : theme.surface }, pressed && styles.pressed]}><Text style={[styles.choiceText, { color: sound.resampler === mode ? theme.accentInk : theme.foreground }]}>{mode === "high" ? "High quality" : "System"}</Text></Pressable>)}</View>
          <View style={styles.engineTags}>{ENGINE_REQUIRED_CONTROLS.map((feature) => <View key={feature} style={[styles.engineTag, { borderColor: theme.border }]}><Text style={[styles.engineTagText, { color: theme.muted }]}>{feature}</Text></View>)}</View>
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

        <Pressable accessibilityLabel="Export Sphynx audio settings" onPress={() => void shareSettings()} style={({ pressed }) => [styles.exportCard, { backgroundColor: theme.raised, borderColor: theme.border }, pressed && styles.pressed]}>
          <View style={[styles.exportIcon, { backgroundColor: theme.accent }]}><Ionicons name="share-outline" size={18} color={theme.accentInk} /></View>
          <View style={styles.exportCopy}>
            <Text style={[styles.exportTitle, { color: theme.foreground }]}>Export audio settings</Text>
            <Text style={[styles.exportNote, { color: theme.muted }]}>{exportMessage ?? "Create a portable .json copy of this listening setup."}</Text>
          </View>
          <Ionicons name="arrow-up-outline" size={18} color={theme.accent} />
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
  deviceRack: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 15 },
  deviceCluster: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 15 },
  rackHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  rackTitle: { fontSize: 16, fontWeight: "800" },
  rackNote: { fontSize: 10, lineHeight: 14, marginTop: 3, maxWidth: 244 },
  rackCount: { fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  saveRow: { flexDirection: "row", gap: 8, marginTop: 15 },
  presetInput: { flex: 1, height: 42, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 12, fontSize: 13, fontWeight: "700" },
  saveButton: { width: 43, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  deviceChips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 14 },
  deviceChip: { maxWidth: "100%", minHeight: 32, paddingHorizontal: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center" },
  deviceChipText: { fontSize: 10, fontWeight: "800" },
  deviceActions: { flexDirection: "row", gap: 8, marginTop: 10 },
  deviceAction: { flex: 1, minHeight: 33, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 5, paddingHorizontal: 7 },
  deviceActionText: { fontSize: 9, fontWeight: "800" },
  deviceFootnote: { fontSize: 10, lineHeight: 14, marginTop: 10 },
  savedPresets: { gap: 7, marginTop: 10 },
  savedPreset: { minHeight: 46, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, flexDirection: "row", alignItems: "center" },
  savedPresetMain: { flex: 1, minWidth: 0, minHeight: 44, flexDirection: "row", alignItems: "center", paddingHorizontal: 11, gap: 9 },
  presetIndicator: { width: 6, height: 6, borderRadius: 3 },
  savedPresetName: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: "800" },
  activeLabel: { fontSize: 8, letterSpacing: 0.9, fontWeight: "800" },
  deleteButton: { width: 42, height: 44, justifyContent: "center", alignItems: "center" },
  emptyRack: { fontSize: 11, lineHeight: 16, marginTop: 13 },
  overwriteButton: { minHeight: 34, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 10, marginTop: 11, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6 },
  overwriteText: { fontSize: 10, fontWeight: "800" },
  toolsGroup: { gap: 9 },
  engineCard: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginTop: 15 },
  switchRow: { flexDirection: "row", gap: 8, marginTop: 13 },
  smallToggle: { flex: 1, minHeight: 36, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  smallToggleText: { fontSize: 10, fontWeight: "800" },
  choiceLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.55, marginTop: 15, marginBottom: 7, textTransform: "uppercase" },
  choiceRow: { flexDirection: "row", gap: 7 },
  choiceChip: { flex: 1, minHeight: 34, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", paddingHorizontal: 5 },
  choiceText: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },
  engineTags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 15 },
  engineTag: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  engineTagText: { fontSize: 9, fontWeight: "700" },
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
  exportCard: { minHeight: 76, borderRadius: 17, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", padding: 13, gap: 11, marginTop: 12 },
  exportIcon: { width: 37, height: 37, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  exportCopy: { flex: 1 },
  exportTitle: { fontSize: 13, fontWeight: "800" },
  exportNote: { fontSize: 10, lineHeight: 14, marginTop: 3 },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
});
