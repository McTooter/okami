export type DspPlaybackConfiguration = {
  eq: [number, number, number, number, number];
  preamp: number;
  outputTrim: number;
  limiter: boolean;
  loudnessMode: "off" | "track" | "album";
  compressor: boolean;
  playbackRate: number;
  repeatOne: boolean;
};

export type DspPlaybackStatus = {
  currentTime: number;
  duration: number;
  playing: boolean;
  didJustFinish?: boolean;
  engineActive: boolean;
  processingActive: boolean;
};

export type DspPlaybackStatusEvent = {
  status: DspPlaybackStatus;
};
