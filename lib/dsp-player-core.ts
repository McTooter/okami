import type { AudioSettingsSnapshot } from "./audio-settings-core";
import type { DspPlaybackConfiguration } from "@/modules/expo-dsp-player";

export const DSP_EQ_FREQUENCIES = [60, 230, 910, 3600, 14000] as const;

export function buildDspPlaybackConfiguration(sound: AudioSettingsSnapshot): DspPlaybackConfiguration {
  return {
    eq: sound.eq,
    preamp: sound.preamp,
    outputTrim: sound.outputTrim,
    limiter: sound.limiter,
    loudnessMode: sound.loudnessMode,
    compressor: sound.compressor,
    playbackRate: sound.playbackRate,
    repeatOne: sound.repeatOne,
  };
}

export function isDspProcessingEnabled(configuration: DspPlaybackConfiguration) {
  return configuration.preamp !== 0
    || configuration.eq.some((gain) => gain !== 0)
    || configuration.limiter
    || configuration.compressor
    || configuration.loudnessMode !== "off";
}
