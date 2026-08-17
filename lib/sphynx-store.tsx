import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { advanceProgress, clamp, nextTrackIndex } from "@/lib/sphynx-core";

export type ProviderId = "Sphynx" | "TIDAL" | "YouTube" | "Local";
export type ThemeId = "obsidian" | "cobalt" | "porcelain" | "ember";

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

type SoundSettings = {
  preamp: number;
  limiter: boolean;
  crossfade: number;
  mono: boolean;
  eq: [number, number, number, number, number];
  motionReduced: boolean;
  typeScale: "standard" | "large" | "extra";
};

type SphynxContextValue = {
  theme: ThemeDefinition;
  themeId: ThemeId;
  setThemeId: (theme: ThemeId) => void;
  currentTrack: Track;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  setProgress: (value: number) => void;
  togglePlayback: () => void;
  playTrack: (track: Track) => void;
  skip: (direction: "next" | "previous") => void;
  sound: SoundSettings;
  setSound: (patch: Partial<SoundSettings>) => void;
  connected: Record<ProviderId, boolean>;
  setConnected: (provider: ProviderId, value: boolean) => void;
};

const STORAGE_KEY = "sphynx.preferences.v1";
const defaultSound: SoundSettings = {
  preamp: 0,
  limiter: true,
  crossfade: 4,
  mono: false,
  eq: [0, 0, 0, 0, 0],
  motionReduced: false,
  typeScale: "standard",
};

const SphynxContext = createContext<SphynxContextValue | null>(null);

export function SphynxProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>("obsidian");
  const [sound, setSoundState] = useState<SoundSettings>(defaultSound);
  const [connected, setConnectedState] = useState<Record<ProviderId, boolean>>({
    Sphynx: true,
    TIDAL: false,
    YouTube: false,
    Local: true,
  });
  const [currentTrack, setCurrentTrack] = useState<Track>(libraryTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.36);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) return;
        const parsed = JSON.parse(stored) as {
          themeId?: ThemeId;
          sound?: Partial<SoundSettings>;
          connected?: Partial<Record<ProviderId, boolean>>;
        };
        if (parsed.themeId && themes[parsed.themeId]) setThemeIdState(parsed.themeId);
        if (parsed.sound) setSoundState((current) => ({ ...current, ...parsed.sound }));
        if (parsed.connected) setConnectedState((current) => ({ ...current, ...parsed.connected }));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const preferences = JSON.stringify({ themeId, sound, connected });
    AsyncStorage.setItem(STORAGE_KEY, preferences).catch(() => undefined);
  }, [themeId, sound, connected]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgress((value) => advanceProgress(value, 0.001));
    }, 800);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const setThemeId = useCallback((nextTheme: ThemeId) => setThemeIdState(nextTheme), []);
  const setSound = useCallback((patch: Partial<SoundSettings>) => {
    setSoundState((current) => ({ ...current, ...patch }));
  }, []);
  const setConnected = useCallback((provider: ProviderId, value: boolean) => {
    setConnectedState((current) => ({ ...current, [provider]: value }));
  }, []);
  const setPlaybackProgress = useCallback((nextProgress: number) => setProgress(clamp(nextProgress, 0, 1)), []);
  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setProgress(0);
    setIsPlaying(true);
  }, []);
  const togglePlayback = useCallback(() => setIsPlaying((value) => !value), []);
  const skip = useCallback(
    (direction: "next" | "previous") => {
      const currentIndex = libraryTracks.findIndex((track) => track.id === currentTrack.id);
      const nextIndex = nextTrackIndex(currentIndex, libraryTracks.length, direction);
      setCurrentTrack(libraryTracks[nextIndex]);
      setProgress(0);
    },
    [currentTrack.id],
  );

  const value = useMemo<SphynxContextValue>(
    () => ({
      theme: themes[themeId],
      themeId,
      setThemeId,
      currentTrack,
      queue: libraryTracks,
      isPlaying,
      progress,
      setProgress: setPlaybackProgress,
      togglePlayback,
      playTrack,
      skip,
      sound,
      setSound,
      connected,
      setConnected,
    }),
    [connected, currentTrack, isPlaying, playTrack, progress, setConnected, setPlaybackProgress, setSound, setThemeId, skip, sound, themeId, togglePlayback],
  );

  return <SphynxContext.Provider value={value}>{children}</SphynxContext.Provider>;
}

export function useSphynx() {
  const context = useContext(SphynxContext);
  if (!context) throw new Error("useSphynx must be used inside SphynxProvider");
  return context;
}
