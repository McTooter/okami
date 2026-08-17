export type AudioRouteKind = "bluetooth" | "wired" | "airplay" | "speaker" | "receiver" | "unknown";

export type AudioRouteInfo = {
  kind: AudioRouteKind;
  name: string | null;
};

export type AudioRouteChangeEvent = {
  route: AudioRouteInfo;
};
