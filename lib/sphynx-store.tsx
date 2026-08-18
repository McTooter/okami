import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { createEqPreset, createHeadphoneGroup, DEFAULT_AUDIO_SETTINGS, DEFAULT_HEADPHONE_GROUP, normalizeAudioSettings, normalizeHeadphoneGroupName, type AudioSettingsSnapshot, type EqPreset, type HeadphoneGroup } from "@/lib/audio-settings-core";
import { nativeVolumeFromTrim } from "@/lib/advanced-audio-core";
import { findMatchingHeadphoneGroup, UNKNOWN_AUDIO_ROUTE, type DetectedAudioRoute } from "@/lib/audio-route-core";
import { buildDspPlaybackConfiguration } from "@/lib/dsp-player-core";
import { applyQueueOrder, moveQueueId } from "@/lib/queue-core";
import { advanceProgress, clamp, nextTrackIndex } from "@/lib/sphynx-core";
import { pickLocalMusicFiles } from "@/lib/local-music";
import { MAX_PROFILE_PINNED_ALBUMS, mergeListeningProfiles, normalizePinnedTrackIds, normalizeProfileCustomization, normalizeProfileCustomizations, normalizeProfilePinnedTrackIds, normalizeProfileQueueOrders, type ListeningProfile, type ListeningProfileCustomization, type ListeningProfileId } from "@/lib/listening-profile-core";
import { addAudioRouteListener, audioRouteDetectionAvailable, getCurrentAudioRoute } from "@/modules/expo-audio-route";
import { addDspPlaybackListener, dspPlaybackAvailable, getDspStatus, loadDspTrack, pauseDspTrack, playDspTrack, seekDspTrack, setDspConfiguration, unloadDspTrack, type DspPlaybackStatus } from "@/modules/expo-dsp-player";

export type ProviderId = "Sphynx" | "TIDAL" | "YouTube" | "Local";
export type ThemeId = "obsidian" | "cobalt" | "porcelain" | "ember";
export type AppMaterialId = "core" | "noir-pulse" | "sunlit-signal";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  provider: ProviderId;
  artwork: ArtworkId;
  accent: string;
  available: "authorized" | "preview" | "handoff";
  localUri?: string;
  importedAt?: number;
};

export type ArtworkId = "interval" | "horizon" | "kepler" | "sleepwalk" | "verge" | "resonance";

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  note: string;
  background: string;
  surface: string;
  raised: string;
  foreground: string;
  muted: string;
  border: string;
  accent: string;
  accentInk: string;
  danger: string;
  tabBar: string;
};

export type AppMaterial = {
  id: AppMaterialId;
  name: string;
  note: string;
  chrome: "neutral" | "cutout" | "broadcast";
  entry: "soft" | "snap" | "drift";
  cue?: string;
  cueInk?: string;
  fieldAccent?: string;
  fieldSecondary?: string;
  shaderMode: 0 | 1 | 2;
  shaderEnergy: number;
  signalOpacity: number;
  fieldRadius: number;
};

export const appMaterials: Record<AppMaterialId, AppMaterial> = {
  core: { id: "core", name: "Studio Core", note: "Track-led mineral material", chrome: "neutral", entry: "soft", shaderMode: 0, shaderEnergy: 0.72, signalOpacity: 1, fieldRadius: 36 },
  "noir-pulse": { id: "noir-pulse", name: "Noir Pulse", note: "Vermilion cueing with decisive cutout panels", chrome: "cutout", entry: "snap", cue: "#F05A47", cueInk: "#170504", fieldAccent: "#F05A47", fieldSecondary: "#F6EDE7", shaderMode: 1, shaderEnergy: 1.12, signalOpacity: 1.18, fieldRadius: 10 },
  "sunlit-signal": { id: "sunlit-signal", name: "Sunlit Signal", note: "Warm broadcast light with softened indigo detail", chrome: "broadcast", entry: "drift", cue: "#E7A628", cueInk: "#251B00", fieldAccent: "#E7A628", fieldSecondary: "#6874B8", shaderMode: 2, shaderEnergy: 0.82, signalOpacity: 0.78, fieldRadius: 32 },
};

export const themes: Record<ThemeId, ThemeDefinition> = {
  obsidian: {
    id: "obsidian",
    name: "Obsidian",
    note: "Mineral black with signal lime",
    background: "#0A0B0D",
    surface: "#15171B",
    raised: "#1D2025",
    foreground: "#F1F3F4",
    muted: "#99A2AD",
    border: "#292E35",
    accent: "#CAFF4A",
    accentInk: "#101600",
    danger: "#FF725D",
    tabBar: "#0E1013",
  },
  cobalt: {
    id: "cobalt",
    name: "Cobalt Room",
    note: "Ink blue with electric violet",
    background: "#0B1020",
    surface: "#141C32",
    raised: "#1C2745",
    foreground: "#F4F6FF",
    muted: "#ABB6CF",
    border: "#2C3A5C",
    accent: "#8DA8FF",
    accentInk: "#08142E",
    danger: "#FF7A95",
    tabBar: "#0E1426",
  },
  porcelain: {
    id: "porcelain",
    name: "Porcelain",
    note: "Paper warmth with ink red",
    background: "#F4F1EA",
    surface: "#EAE5DA",
    raised: "#FFFFFF",
    foreground: "#171715",
    muted: "#69655E",
    border: "#D6D0C4",
    accent: "#D44835",
    accentInk: "#FFFFFF",
    danger: "#B42318",
    tabBar: "#F7F4ED",
  },
  ember: {
    id: "ember",
    name: "Ember Tape",
    note: "Oxide red with soft brass",
    background: "#1A100E",
    surface: "#2A1915",
    raised: "#3A221D",
    foreground: "#FFF4E9",
    muted: "#D4B8A8",
    border: "#55352B",
    accent: "#FF9B55",
    accentInk: "#301200",
    danger: "#FF7E70",
    tabBar: "#201310",
  },
};

export const libraryTracks: Track[] = [
  {
    id: "intervals",
    title: "Intervals",
    artist: "Lumen Field",
    album: "Glass Weather",
    duration: "4:12",
    provider: "TIDAL",
    artwork: "interval",
    accent: "#CAFF4A",
    available: "preview",
  },
  {
    id: "afterimage",
    title: "Afterimage",
    artist: "Mira Vale",
    album: "Still Life / Motion",
    duration: "3:46",
    provider: "Sphynx",
    artwork: "horizon",
    accent: "#8DA8FF",
    available: "authorized",
  },
  {
    id: "kepler",
    title: "Kepler–22",
    artist: "Solar Bureau",
    album: "Deep Receiver",
    duration: "5:03",
    provider: "YouTube",
    artwork: "kepler",
    accent: "#FFA779",
    available: "handoff",
  },
  {
    id: "sleepwalk",
    title: "Sleepwalk Protocol",
    artist: "Dawn Index",
    album: "Silent Arithmetic",
    duration: "4:27",
    provider: "Local",
    artwork: "sleepwalk",
    accent: "#EE8CF5",
    available: "authorized",
  },
  {
    id: "verge",
    title: "The Verge of Summer",
    artist: "Aster Unit",
    album: "No Fixed Sky",
    duration: "3:51",
    provider: "TIDAL",
    artwork: "verge",
    accent: "#F4D35E",
    available: "preview",
  },
  {
    id: "resonance",
    title: "Resonance Field",
    artist: "Cairn",
    album: "Objects in Orbit",
    duration: "6:18",
    provider: "Sphynx",
    artwork: "resonance",
    accent: "#71D6D1",
    available: "authorized",
  },
];

export type SoundSettings = AudioSettingsSnapshot;

type SphynxContextValue = {
  theme: ThemeDefinition;
  themeId: ThemeId;
  setThemeId: (theme: ThemeId) => void;
  material: AppMaterial;
  materialId: AppMaterialId;
  setMaterialId: (material: AppMaterialId) => void;
  activeListeningProfile: ListeningProfile;
  listeningProfiles: readonly ListeningProfile[];
  setActiveListeningProfileId: (profileId: ListeningProfileId) => void;
  updateListeningProfile: (profileId: ListeningProfileId, patch: ListeningProfileCustomization) => void;
  profileQueueContinuity: boolean;
  setProfileQueueContinuity: (enabled: boolean) => void;
  pinnedAlbums: Track[];
  isPinnedAlbum: (trackId: string) => boolean;
  togglePinnedAlbum: (trackId: string) => void;
  currentTrack: Track;
  queue: Track[];
  tracks: Track[];
  importedTracks: Track[];
  isPlaying: boolean;
  progress: number;
  playbackSeconds: number;
  playbackDuration: number;
  localPlaybackError: string | null;
  dspPlaybackAvailable: boolean;
  dspProcessingActive: boolean;
  setProgress: (value: number) => void;
  togglePlayback: () => void;
  playTrack: (track: Track) => void;
  skip: (direction: "next" | "previous") => void;
  reorderQueue: (tracks: Track[]) => void;
  moveQueueTrack: (trackId: string, direction: "up" | "down") => void;
  sound: SoundSettings;
  setSound: (patch: Partial<SoundSettings>) => void;
  eqPresets: EqPreset[];
  activeEqPresetId: string | null;
  headphoneGroups: HeadphoneGroup[];
  activeHeadphoneGroupId: string;
  detectedAudioRoute: DetectedAudioRoute;
  audioRouteDetectionAvailable: boolean;
  setActiveHeadphoneGroupId: (groupId: string) => void;
  createHeadphoneGroup: (name: string) => void;
  renameHeadphoneGroup: (groupId: string, name: string) => void;
  deleteHeadphoneGroup: (groupId: string) => void;
  saveEqPreset: (name: string) => void;
  applyEqPreset: (preset: EqPreset) => void;
  overwriteActiveEqPreset: () => void;
  deleteEqPreset: (presetId: string) => void;
  connected: Record<ProviderId, boolean>;
  setConnected: (provider: ProviderId, value: boolean) => void;
  isImporting: boolean;
  localImportMessage: string | null;
  importLocalTracks: () => Promise<void>;
};

const STORAGE_KEY = "sphynx.preferences.v1";
const LOCAL_LIBRARY_KEY = "sphynx.local-library.v1";
const EQ_PRESET_STORAGE_KEY = "sphynx.eq-presets.v1";
const defaultSound: SoundSettings = DEFAULT_AUDIO_SETTINGS;

const SphynxContext = createContext<SphynxContextValue | null>(null);

export function SphynxProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("obsidian");
  const [materialId, setMaterialIdState] = useState<AppMaterialId>("core");
  const [activeListeningProfileId, setActiveListeningProfileIdState] = useState<ListeningProfileId>("sora");
  const [profileQueueContinuity, setProfileQueueContinuityState] = useState(true);
  const [profileCustomizations, setProfileCustomizations] = useState<Partial<Record<ListeningProfileId, ListeningProfileCustomization>>>({});
  const [sound, setSoundState] = useState<SoundSettings>(defaultSound);
  const [connected, setConnectedState] = useState<Record<ProviderId, boolean>>({
    Sphynx: true,
    TIDAL: false,
    YouTube: false,
    Local: true,
  });
  const [currentTrack, setCurrentTrack] = useState<Track>(libraryTracks[0]);
  const [queueOrder, setQueueOrder] = useState<string[]>(() => libraryTracks.map((track) => track.id));
  const [profileQueueOrders, setProfileQueueOrders] = useState<Partial<Record<ListeningProfileId, string[]>>>({});
  const [profilePinnedTrackIds, setProfilePinnedTrackIds] = useState<Partial<Record<ListeningProfileId, string[]>>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.36);
  const [importedTracks, setImportedTracks] = useState<Track[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [localImportMessage, setLocalImportMessage] = useState<string | null>(null);
  const [localLibraryHydrated, setLocalLibraryHydrated] = useState(false);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [localPlaybackError, setLocalPlaybackError] = useState<string | null>(null);
  const [dspProcessingActive, setDspProcessingActive] = useState(false);
  const [eqPresets, setEqPresets] = useState<EqPreset[]>([]);
  const [activeEqPresetId, setActiveEqPresetId] = useState<string | null>(null);
  const [headphoneGroups, setHeadphoneGroups] = useState<HeadphoneGroup[]>([DEFAULT_HEADPHONE_GROUP]);
  const [activeHeadphoneGroupId, setActiveHeadphoneGroupIdState] = useState(DEFAULT_HEADPHONE_GROUP.id);
  const [detectedAudioRoute, setDetectedAudioRoute] = useState<DetectedAudioRoute>(UNKNOWN_AUDIO_ROUTE);
  const [eqPresetsHydrated, setEqPresetsHydrated] = useState(false);
  const nativePlayerRef = useRef<AudioPlayer | null>(null);
  const nativeTrackIdRef = useRef<string | null>(null);
  const dspTrackIdRef = useRef<string | null>(null);
  const dspStatusSubscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as {
          themeId?: ThemeId;
          materialId?: AppMaterialId;
          activeListeningProfileId?: ListeningProfileId;
          profileQueueContinuity?: boolean;
          profileCustomizations?: unknown;
          queueOrder?: string[];
          profileQueueOrders?: unknown;
          profilePinnedTrackIds?: unknown;
          sound?: Partial<SoundSettings>;
          connected?: Partial<Record<ProviderId, boolean>>;
        };
        if (parsed.themeId && themes[parsed.themeId]) setThemeIdState(parsed.themeId);
        if (parsed.materialId && appMaterials[parsed.materialId]) setMaterialIdState(parsed.materialId);
        if (parsed.activeListeningProfileId && ["sora", "night-transit", "guest-session"].includes(parsed.activeListeningProfileId)) setActiveListeningProfileIdState(parsed.activeListeningProfileId);
        if (typeof parsed.profileQueueContinuity === "boolean") setProfileQueueContinuityState(parsed.profileQueueContinuity);
        setProfileCustomizations(normalizeProfileCustomizations(parsed.profileCustomizations));
        if (Array.isArray(parsed.queueOrder)) setQueueOrder(parsed.queueOrder.filter((id): id is string => typeof id === "string"));
        setProfileQueueOrders(normalizeProfileQueueOrders(parsed.profileQueueOrders));
        setProfilePinnedTrackIds(normalizeProfilePinnedTrackIds(parsed.profilePinnedTrackIds));
        if (parsed.sound) setSoundState((current) => normalizeAudioSettings({ ...current, ...parsed.sound, eq: parsed.sound?.eq ?? current.eq }));
        if (parsed.connected) setConnectedState((current) => ({ ...current, ...parsed.connected }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const preferences = JSON.stringify({ themeId, materialId, activeListeningProfileId, profileQueueContinuity, profileCustomizations, queueOrder, profileQueueOrders, profilePinnedTrackIds, sound, connected });
    AsyncStorage.setItem(STORAGE_KEY, preferences).catch(() => undefined);
  }, [activeListeningProfileId, connected, materialId, profileCustomizations, profilePinnedTrackIds, profileQueueContinuity, profileQueueOrders, queueOrder, sound, themeId]);

  useEffect(() => {
    AsyncStorage.getItem(LOCAL_LIBRARY_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as Track[];
        setImportedTracks(parsed.filter((track) => track.provider === "Local" && Boolean(track.localUri)));
      })
      .catch(() => undefined)
      .finally(() => setLocalLibraryHydrated(true));
  }, []);

  useEffect(() => {
    if (!localLibraryHydrated) return;
    AsyncStorage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(importedTracks)).catch(() => undefined);
  }, [importedTracks, localLibraryHydrated]);

  useEffect(() => {
    AsyncStorage.getItem(EQ_PRESET_STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as { presets?: EqPreset[]; activeId?: string | null; groups?: HeadphoneGroup[]; activeGroupId?: string | null };
        const storedGroups = Array.isArray(parsed.groups) ? parsed.groups.filter((group) => group?.id && group?.name) : [];
        const groups = storedGroups.some((group) => group.id === DEFAULT_HEADPHONE_GROUP.id) ? storedGroups : [DEFAULT_HEADPHONE_GROUP, ...storedGroups];
        const groupIds = new Set(groups.map((group) => group.id));
        if (Array.isArray(parsed.presets)) {
          setEqPresets(parsed.presets.map((preset) => ({ ...preset, groupId: groupIds.has(preset.groupId) ? preset.groupId : DEFAULT_HEADPHONE_GROUP.id })));
        }
        setHeadphoneGroups(groups);
        setActiveHeadphoneGroupIdState(parsed.activeGroupId && groupIds.has(parsed.activeGroupId) ? parsed.activeGroupId : DEFAULT_HEADPHONE_GROUP.id);
        if (parsed.activeId) setActiveEqPresetId(parsed.activeId);
      })
      .catch(() => undefined)
      .finally(() => setEqPresetsHydrated(true));
  }, []);

  useEffect(() => {
    if (!eqPresetsHydrated) return;
    AsyncStorage.setItem(EQ_PRESET_STORAGE_KEY, JSON.stringify({ presets: eqPresets, activeId: activeEqPresetId, groups: headphoneGroups, activeGroupId: activeHeadphoneGroupId })).catch(() => undefined);
  }, [activeEqPresetId, activeHeadphoneGroupId, eqPresets, eqPresetsHydrated, headphoneGroups]);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentTrack.localUri) return;
    const timer = setInterval(() => {
      setProgress((value) => advanceProgress(value, 0.001));
    }, 800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "duckOthers",
      interruptionModeAndroid: "duckOthers",
    }).catch(() => undefined);

    return () => {
      nativePlayerRef.current?.pause();
      nativePlayerRef.current?.remove();
      nativePlayerRef.current = null;
      nativeTrackIdRef.current = null;
      dspStatusSubscriptionRef.current?.remove();
      dspStatusSubscriptionRef.current = null;
      dspTrackIdRef.current = null;
      void unloadDspTrack();
    };
  }, []);

  useEffect(() => {
    if (!audioRouteDetectionAvailable) return;

    let active = true;
    getCurrentAudioRoute()
      .then((route) => {
        if (active) setDetectedAudioRoute(route);
      })
      .catch(() => undefined);

    const subscription = addAudioRouteListener(({ route }) => {
      if (active) setDetectedAudioRoute(route);
    });

    return () => {
      active = false;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    const matchingGroup = findMatchingHeadphoneGroup(detectedAudioRoute, headphoneGroups);
    if (!matchingGroup || matchingGroup.id === activeHeadphoneGroupId) return;
    setActiveHeadphoneGroupIdState(matchingGroup.id);
    setActiveEqPresetId(null);
  }, [activeHeadphoneGroupId, detectedAudioRoute, headphoneGroups]);

  const tracks = useMemo(() => [...importedTracks, ...libraryTracks], [importedTracks]);
  const listeningProfiles = useMemo(() => mergeListeningProfiles(profileCustomizations), [profileCustomizations]);
  const activeListeningProfile = listeningProfiles.find((profile) => profile.id === activeListeningProfileId) ?? listeningProfiles[0];
  const activeQueueOrder = profileQueueContinuity ? queueOrder : profileQueueOrders[activeListeningProfileId] ?? queueOrder;
  const queue = useMemo(() => applyQueueOrder(tracks, activeQueueOrder), [activeQueueOrder, tracks]);
  const pinnedAlbumIds = profilePinnedTrackIds[activeListeningProfileId] ?? [];
  const pinnedAlbums = useMemo(() => {
    const tracksById = new Map(tracks.map((track) => [track.id, track]));
    return pinnedAlbumIds.map((id) => tracksById.get(id)).filter((track): track is Track => Boolean(track));
  }, [pinnedAlbumIds, tracks]);

  const setThemeId = useCallback((nextTheme: ThemeId) => setThemeIdState(nextTheme), []);
  const setMaterialId = useCallback((nextMaterial: AppMaterialId) => setMaterialIdState(nextMaterial), []);
  const setActiveListeningProfileId = useCallback((profileId: ListeningProfileId) => {
    if (["sora", "night-transit", "guest-session"].includes(profileId)) setActiveListeningProfileIdState(profileId);
  }, []);
  const updateListeningProfile = useCallback((profileId: ListeningProfileId, patch: ListeningProfileCustomization) => {
    const normalized = normalizeProfileCustomization(patch);
    setProfileCustomizations((current) => {
      const next = { ...current[profileId] };
      if (Object.hasOwn(patch, "name")) {
        if (normalized.name) next.name = normalized.name;
        else delete next.name;
      }
      if (Object.hasOwn(patch, "cue")) {
        if (normalized.cue) next.cue = normalized.cue;
        else delete next.cue;
      }
      return { ...current, [profileId]: next };
    });
  }, []);
  const setProfileQueueContinuity = useCallback((enabled: boolean) => setProfileQueueContinuityState(enabled), []);
  const isPinnedAlbum = useCallback((trackId: string) => pinnedAlbumIds.includes(trackId), [pinnedAlbumIds]);
  const togglePinnedAlbum = useCallback((trackId: string) => {
    if (!tracks.some((track) => track.id === trackId)) return;
    setProfilePinnedTrackIds((current) => {
      const currentIds = current[activeListeningProfileId] ?? [];
      const nextIds = currentIds.includes(trackId)
        ? currentIds.filter((id) => id !== trackId)
        : normalizePinnedTrackIds([...currentIds, trackId]).slice(-MAX_PROFILE_PINNED_ALBUMS);
      return { ...current, [activeListeningProfileId]: nextIds };
    });
  }, [activeListeningProfileId, tracks]);
  const setSound = useCallback((patch: Partial<SoundSettings>) => {
    setSoundState((current) => normalizeAudioSettings({ ...current, ...patch, eq: patch.eq ?? current.eq }));
  }, []);
  const saveEqPreset = useCallback((name: string) => {
    const now = Date.now();
    const preset = createEqPreset(`eq-${now}`, name, sound, now, activeHeadphoneGroupId);
    setEqPresets((current) => [preset, ...current]);
    setActiveEqPresetId(preset.id);
  }, [activeHeadphoneGroupId, sound]);
  const applyEqPreset = useCallback((preset: EqPreset) => {
    setSoundState(normalizeAudioSettings(preset.settings));
    setActiveEqPresetId(preset.id);
  }, []);
  const overwriteActiveEqPreset = useCallback(() => {
    if (!activeEqPresetId) return;
    const now = Date.now();
    setEqPresets((current) => current.map((preset) => preset.id === activeEqPresetId ? { ...preset, settings: normalizeAudioSettings(sound), updatedAt: now } : preset));
  }, [activeEqPresetId, sound]);
  const deleteEqPreset = useCallback((presetId: string) => {
    setEqPresets((current) => current.filter((preset) => preset.id !== presetId));
    setActiveEqPresetId((current) => current === presetId ? null : current);
  }, []);
  const setActiveHeadphoneGroupId = useCallback((groupId: string) => {
    setActiveHeadphoneGroupIdState((current) => headphoneGroups.some((group) => group.id === groupId) ? groupId : current);
    setActiveEqPresetId(null);
  }, [headphoneGroups]);
  const createDeviceGroup = useCallback((name: string) => {
    const now = Date.now();
    const group = createHeadphoneGroup(`device-${now}`, name, now);
    setHeadphoneGroups((current) => [...current, group]);
    setActiveHeadphoneGroupIdState(group.id);
    setActiveEqPresetId(null);
  }, []);
  const renameHeadphoneGroup = useCallback((groupId: string, name: string) => {
    if (groupId === DEFAULT_HEADPHONE_GROUP.id) return;
    const updatedAt = Date.now();
    setHeadphoneGroups((current) => current.map((group) => group.id === groupId ? { ...group, name: normalizeHeadphoneGroupName(name), updatedAt } : group));
  }, []);
  const deleteHeadphoneGroup = useCallback((groupId: string) => {
    if (groupId === DEFAULT_HEADPHONE_GROUP.id) return;
    setHeadphoneGroups((current) => current.filter((group) => group.id !== groupId));
    setEqPresets((current) => current.map((preset) => preset.groupId === groupId ? { ...preset, groupId: DEFAULT_HEADPHONE_GROUP.id } : preset));
    setActiveHeadphoneGroupIdState((current) => current === groupId ? DEFAULT_HEADPHONE_GROUP.id : current);
    setActiveEqPresetId(null);
  }, []);
  const setConnected = useCallback((provider: ProviderId, value: boolean) => {
    setConnectedState((current) => ({ ...current, [provider]: value }));
  }, []);
  const importLocalTracks = useCallback(async () => {
    if (isImporting) return;
    setIsImporting(true);
    setLocalImportMessage(null);
    try {
      const selectedFiles = await pickLocalMusicFiles();
      if (!selectedFiles.length) {
        setLocalImportMessage("Import cancelled.");
        return;
      }
      const imports: Track[] = selectedFiles.map((file, index) => ({
        id: file.id,
        title: file.title,
        artist: "Imported file",
        album: "On this iPhone",
        duration: "—",
        provider: "Local",
        artwork: "resonance",
        accent: ["#71D6D1", "#CAFF4A", "#8DA8FF", "#FFA779"][index % 4],
        available: "authorized",
        localUri: file.uri,
        importedAt: file.importedAt,
      }));
      setImportedTracks((current) => [...imports, ...current]);
      setLocalImportMessage(`${imports.length} ${imports.length === 1 ? "track" : "tracks"} added to this iPhone.`);
    } catch {
      setLocalImportMessage("Sphynx could not import those files. Try a standard audio file.");
    } finally {
      setIsImporting(false);
    }
  }, [isImporting]);
  const handleNativeStatus = useCallback((trackId: string, status: AudioStatus) => {
    if (nativeTrackIdRef.current !== trackId) return;
    const duration = Number.isFinite(status.duration) ? status.duration : 0;
    const seconds = Number.isFinite(status.currentTime) ? status.currentTime : 0;
    setPlaybackDuration(duration);
    setPlaybackSeconds(seconds);
    setProgress(duration > 0 ? clamp(seconds / duration, 0, 1) : 0);
    setIsPlaying(status.playing);
  }, []);
  const stopNativePlayer = useCallback(() => {
    nativePlayerRef.current?.pause();
    nativePlayerRef.current?.clearLockScreenControls();
    nativePlayerRef.current?.remove();
    nativePlayerRef.current = null;
    nativeTrackIdRef.current = null;
  }, []);
  const handleDspStatus = useCallback((trackId: string, status: DspPlaybackStatus) => {
    if (dspTrackIdRef.current !== trackId) return;
    const duration = Number.isFinite(status.duration) ? status.duration : 0;
    const seconds = Number.isFinite(status.currentTime) ? status.currentTime : 0;
    setPlaybackDuration(duration);
    setPlaybackSeconds(seconds);
    setProgress(duration > 0 ? clamp(seconds / duration, 0, 1) : 0);
    setIsPlaying(Boolean(status.playing));
    setDspProcessingActive(Boolean(status.processingActive));
  }, []);
  const stopDspPlayer = useCallback(() => {
    dspStatusSubscriptionRef.current?.remove();
    dspStatusSubscriptionRef.current = null;
    dspTrackIdRef.current = null;
    setDspProcessingActive(false);
    void unloadDspTrack();
  }, []);
  useEffect(() => {
    const player = nativePlayerRef.current;
    if (player) {
      player.setPlaybackRate(sound.playbackRate, sound.pitchCorrectionQuality);
      player.shouldCorrectPitch = sound.pitchCorrectionEnabled;
      player.loop = sound.repeatOne;
      player.volume = nativeVolumeFromTrim(sound.outputTrim);
    }
    if (dspTrackIdRef.current && dspPlaybackAvailable) {
      void setDspConfiguration(buildDspPlaybackConfiguration(sound))
        .then((status) => handleDspStatus(dspTrackIdRef.current ?? "", status))
        .catch(() => {
          setDspProcessingActive(false);
          setLocalPlaybackError("Sphynx could not update the DSP path. Standard playback remains available.");
        });
    }
  }, [handleDspStatus, sound]);
  const playDspLocalTrack = useCallback(async (track: Track, startPlaying: boolean) => {
    if (!track.localUri || !dspPlaybackAvailable) return false;
    try {
      stopDspPlayer();
      const status = await loadDspTrack(track.localUri, buildDspPlaybackConfiguration(sound));
      dspTrackIdRef.current = track.id;
      dspStatusSubscriptionRef.current = addDspPlaybackListener(({ status: nextStatus }) => handleDspStatus(track.id, nextStatus));
      handleDspStatus(track.id, status);
      setCurrentTrack(track);
      setProgress(0);
      setPlaybackSeconds(0);
      setPlaybackDuration(status.duration || 0);
      if (startPlaying) {
        const playingStatus = await playDspTrack();
        handleDspStatus(track.id, playingStatus);
      }
      return true;
    } catch {
      stopDspPlayer();
      return false;
    }
  }, [handleDspStatus, sound, stopDspPlayer]);
  const playLocalTrack = useCallback(async (track: Track, startPlaying = true) => {
    if (!track.localUri) return false;
    try {
      setLocalPlaybackError(null);
      stopNativePlayer();
      const startedWithDsp = await playDspLocalTrack(track, startPlaying);
      if (startedWithDsp) return true;
      const player = createAudioPlayer(track.localUri, { updateInterval: 250, keepAudioSessionActive: true });
      player.setPlaybackRate(sound.playbackRate, sound.pitchCorrectionQuality);
      player.shouldCorrectPitch = sound.pitchCorrectionEnabled;
      player.loop = sound.repeatOne;
      player.volume = nativeVolumeFromTrim(sound.outputTrim);
      nativePlayerRef.current = player;
      nativeTrackIdRef.current = track.id;
      player.addListener("playbackStatusUpdate", (status) => handleNativeStatus(track.id, status));
      player.setActiveForLockScreen(true, { title: track.title, artist: track.artist, albumTitle: track.album });
      setCurrentTrack(track);
      setProgress(0);
      setPlaybackSeconds(0);
      setPlaybackDuration(0);
      setIsPlaying(startPlaying);
      if (startPlaying) player.play();
      return true;
    } catch {
      setIsPlaying(false);
      setLocalPlaybackError("Sphynx could not play this local file. Try MP3, AAC, M4A, or WAV.");
      return false;
    }
  }, [handleNativeStatus, playDspLocalTrack, sound.outputTrim, sound.pitchCorrectionEnabled, sound.pitchCorrectionQuality, sound.playbackRate, sound.repeatOne, stopNativePlayer]);
  const setPlaybackProgress = useCallback((nextProgress: number) => {
    const bounded = clamp(nextProgress, 0, 1);
    setProgress(bounded);
    const player = nativePlayerRef.current;
    const duration = player?.duration || playbackDuration;
    if (currentTrack.localUri && dspTrackIdRef.current === currentTrack.id && duration > 0) {
      void seekDspTrack(duration * bounded)
        .then((status) => handleDspStatus(currentTrack.id, status))
        .catch(() => setLocalPlaybackError("Sphynx could not seek in this file."));
    } else if (currentTrack.localUri && player && duration > 0) {
      void player.seekTo(duration * bounded).catch(() => setLocalPlaybackError("Sphynx could not seek in this file."));
    }
  }, [currentTrack, handleDspStatus, playbackDuration]);
  const playTrack = useCallback((track: Track) => {
    if (track.localUri) {
      void playLocalTrack(track, true);
      return;
    }
    stopDspPlayer();
    stopNativePlayer();
    setLocalPlaybackError(null);
    setCurrentTrack(track);
    setProgress(0);
    setPlaybackSeconds(0);
    setPlaybackDuration(0);
    setIsPlaying(true);
  }, [playLocalTrack, stopDspPlayer, stopNativePlayer]);
  const togglePlayback = useCallback(() => {
    const player = nativePlayerRef.current;
    if (currentTrack.localUri) {
      if (dspTrackIdRef.current === currentTrack.id) {
        if (isPlaying) {
          void pauseDspTrack().then((status) => handleDspStatus(currentTrack.id, status));
        } else {
          void getDspStatus()
            .then((status) => status.duration > 0 && status.currentTime >= status.duration ? seekDspTrack(0) : status)
            .then(() => playDspTrack())
            .then((status) => handleDspStatus(currentTrack.id, status));
        }
        return;
      }
      if (!player || nativeTrackIdRef.current !== currentTrack.id) {
        void playLocalTrack(currentTrack, true);
        return;
      }
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        if (player.duration > 0 && player.currentTime >= player.duration) {
          void player.seekTo(0);
        }
        player.play();
        setIsPlaying(true);
      }
      return;
    }
    setIsPlaying((value) => !value);
  }, [currentTrack, handleDspStatus, isPlaying, playLocalTrack]);
  const skip = useCallback(
    (direction: "next" | "previous") => {
      const currentIndex = queue.findIndex((track) => track.id === currentTrack.id);
      const nextIndex = nextTrackIndex(currentIndex, queue.length, direction);
      playTrack(queue[nextIndex]);
    },
    [currentTrack.id, playTrack, queue],
  );
  const reorderQueue = useCallback((nextQueue: Track[]) => {
    const nextOrder = nextQueue.map((track) => track.id);
    if (profileQueueContinuity) setQueueOrder(nextOrder);
    else setProfileQueueOrders((current) => ({ ...current, [activeListeningProfileId]: nextOrder }));
  }, [activeListeningProfileId, profileQueueContinuity]);
  const moveQueueTrack = useCallback((trackId: string, direction: "up" | "down") => {
    const nextOrder = moveQueueId(queue.map((track) => track.id), trackId, direction);
    if (profileQueueContinuity) setQueueOrder(nextOrder);
    else setProfileQueueOrders((current) => ({ ...current, [activeListeningProfileId]: nextOrder }));
  }, [activeListeningProfileId, profileQueueContinuity, queue]);

  const value = useMemo<SphynxContextValue>(
    () => ({
      theme: themes[themeId],
      themeId,
      setThemeId,
      material: appMaterials[materialId],
      materialId,
      setMaterialId,
      activeListeningProfile,
      listeningProfiles,
      setActiveListeningProfileId,
      updateListeningProfile,
      profileQueueContinuity,
      setProfileQueueContinuity,
      pinnedAlbums,
      isPinnedAlbum,
      togglePinnedAlbum,
      currentTrack,
      queue,
      tracks,
      importedTracks,
      isPlaying,
      progress,
      playbackSeconds,
      playbackDuration,
      localPlaybackError,
      dspPlaybackAvailable,
      dspProcessingActive,
      setProgress: setPlaybackProgress,
      togglePlayback,
      playTrack,
      skip,
      reorderQueue,
      moveQueueTrack,
      sound,
      setSound,
      eqPresets,
      activeEqPresetId,
      headphoneGroups,
      activeHeadphoneGroupId,
      detectedAudioRoute,
      audioRouteDetectionAvailable,
      setActiveHeadphoneGroupId,
      createHeadphoneGroup: createDeviceGroup,
      renameHeadphoneGroup,
      deleteHeadphoneGroup,
      saveEqPreset,
      applyEqPreset,
      overwriteActiveEqPreset,
      deleteEqPreset,
      connected,
      setConnected,
      isImporting,
      localImportMessage,
      importLocalTracks,
    }),
    [activeEqPresetId, activeHeadphoneGroupId, activeListeningProfile, applyEqPreset, connected, createDeviceGroup, currentTrack, deleteEqPreset, deleteHeadphoneGroup, detectedAudioRoute, dspProcessingActive, eqPresets, headphoneGroups, importLocalTracks, importedTracks, isImporting, isPinnedAlbum, isPlaying, listeningProfiles, localImportMessage, localPlaybackError, materialId, moveQueueTrack, overwriteActiveEqPreset, pinnedAlbums, playTrack, playbackDuration, playbackSeconds, profileQueueContinuity, progress, queue, renameHeadphoneGroup, reorderQueue, saveEqPreset, setActiveHeadphoneGroupId, setActiveListeningProfileId, setConnected, setMaterialId, setPlaybackProgress, setProfileQueueContinuity, setSound, setThemeId, skip, sound, themeId, togglePinnedAlbum, togglePlayback, tracks, updateListeningProfile],
  );

  return <SphynxContext.Provider value={value}>{children}</SphynxContext.Provider>;
}

export function useSphynx() {
  const context = useContext(SphynxContext);
  if (!context) throw new Error("useSphynx must be used inside SphynxProvider");
  return context;
}
