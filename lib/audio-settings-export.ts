import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

import { buildAudioSettingsExport, type AudioSettingsSnapshot, type EqPreset, type HeadphoneGroup } from "@/lib/audio-settings-core";

export type AudioSettingsExportResult = { ok: true; message: string } | { ok: false; message: string };

export async function exportAudioSettings(
  sound: AudioSettingsSnapshot,
  eqPresets: EqPreset[],
  headphoneGroups: HeadphoneGroup[],
  activeHeadphoneGroupId: string,
): Promise<AudioSettingsExportResult> {
  if (Platform.OS === "web") {
    return { ok: false, message: "Export is available from the iPhone or Android share sheet." };
  }
  if (!FileSystem.cacheDirectory) {
    return { ok: false, message: "Okami could not prepare the export file." };
  }
  if (!(await Sharing.isAvailableAsync())) {
    return { ok: false, message: "Sharing is unavailable on this device." };
  }

  const payload = buildAudioSettingsExport(sound, eqPresets, new Date(), headphoneGroups, activeHeadphoneGroupId);
  const uri = `${FileSystem.cacheDirectory}sphynx-audio-settings-${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2), { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(uri, {
    dialogTitle: "Export Okami audio settings",
    mimeType: "application/json",
    UTI: "public.json",
  });
  return { ok: true, message: "Audio settings file ready to share." };
}
