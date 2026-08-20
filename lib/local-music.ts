import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

import { buildLocalImportIdentity } from "@/lib/local-music-core";
export type ImportedLocalFile = {
  id: string;
  title: string;
  uri: string;
  importedAt: number;
};

export async function pickLocalMusicFiles(): Promise<ImportedLocalFile[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "audio/*",
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (result.canceled) return [];

  const importedAt = Date.now();
  const documentsDirectory = FileSystem.documentDirectory;
  const localLibraryDirectory = documentsDirectory ? `${documentsDirectory}sphynx-library` : null;
  if (Platform.OS !== "web" && !localLibraryDirectory) {
    throw new Error("Okami could not access app storage for this import.");
  }

  if (localLibraryDirectory) {
    await FileSystem.makeDirectoryAsync(localLibraryDirectory, { intermediates: true });
  }

  return Promise.all(
    result.assets.map(async (asset, index) => {
      const identity = buildLocalImportIdentity(asset.name || `track-${index + 1}`, importedAt, index);
      const uri = Platform.OS === "web" ? asset.uri : `${localLibraryDirectory}/${identity.storageFileName}`;

      if (Platform.OS !== "web") {
        await FileSystem.copyAsync({ from: asset.uri, to: uri });
      }

      return {
        id: identity.id,
        title: identity.title,
        uri,
        importedAt,
      };
    }),
  );
}
