export type LocalImportIdentity = {
  id: string;
  title: string;
  storageFileName: string;
};

export function buildLocalImportIdentity(fileName: string, importedAt: number, index: number): LocalImportIdentity {
  const id = `local-${importedAt}-${index}`;
  const title = fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ").trim() || "Untitled import";
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || `track-${index + 1}`;
  return { id, title, storageFileName: `${id}-${safeName}` };
}
