import type { PitchCorrectionQuality } from "expo-audio";

export type LoudnessMode = "off" | "track" | "album";
export type ResamplerMode = "system" | "high";

export type AdvancedAudioSettings = {
  playbackRate: number;
  pitchCorrectionEnabled: boolean;
  pitchCorrectionQuality: PitchCorrectionQuality;
  repeatOne: boolean;
  outputTrim: number;
  loudnessMode: LoudnessMode;
  crossfeed: number;
  spatialWidth: number;
  compressor: boolean;
  phaseInverted: boolean;
  resampler: ResamplerMode;
};

export const DEFAULT_ADVANCED_AUDIO_SETTINGS: AdvancedAudioSettings = {
  playbackRate: 1,
  pitchCorrectionEnabled: true,
  pitchCorrectionQuality: "high",
  repeatOne: false,
  outputTrim: 0,
  loudnessMode: "off",
  crossfeed: 0,
  spatialWidth: 0,
  compressor: false,
  phaseInverted: false,
  resampler: "system",
};

export function clampAdvancedAudioSettings(settings: Partial<AdvancedAudioSettings>): AdvancedAudioSettings {
  const merged = { ...DEFAULT_ADVANCED_AUDIO_SETTINGS, ...settings };
  const rate = Number.isFinite(merged.playbackRate) ? merged.playbackRate : 1;
  const trim = Number.isFinite(merged.outputTrim) ? merged.outputTrim : 0;
  const crossfeed = Number.isFinite(merged.crossfeed) ? merged.crossfeed : 0;
  const width = Number.isFinite(merged.spatialWidth) ? merged.spatialWidth : 0;
  return {
    ...merged,
    playbackRate: Math.min(2, Math.max(0.5, Number(rate.toFixed(2)))),
    outputTrim: Math.min(0, Math.max(-12, Number(trim.toFixed(1)))),
    crossfeed: Math.min(100, Math.max(0, Math.round(crossfeed))),
    spatialWidth: Math.min(100, Math.max(0, Math.round(width))),
    loudnessMode: ["off", "track", "album"].includes(merged.loudnessMode) ? merged.loudnessMode : "off",
    pitchCorrectionQuality: ["low", "medium", "high"].includes(merged.pitchCorrectionQuality) ? merged.pitchCorrectionQuality : "high",
    resampler: merged.resampler === "high" ? "high" : "system",
  };
}

export function nativeVolumeFromTrim(outputTrim: number) {
  return Math.min(1, Math.max(0, Math.pow(10, Math.min(0, outputTrim) / 20)));
}

export const ENGINE_REQUIRED_CONTROLS = [
  "Crossfeed",
  "Spatial width",
  "ReplayGain",
  "Phase inversion",
  "High-quality resampling",
] as const;
