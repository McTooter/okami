import { requireOptionalNativeModule, type EventSubscription } from "expo-modules-core";

import type { DspPlaybackConfiguration, DspPlaybackStatus, DspPlaybackStatusEvent } from "./ExpoDspPlayer.types";

type NativeDspPlayerModule = {
  loadAsync(uri: string, configuration: DspPlaybackConfiguration): Promise<DspPlaybackStatus>;
  configureAsync(configuration: DspPlaybackConfiguration): Promise<DspPlaybackStatus>;
  playAsync(): Promise<DspPlaybackStatus>;
  pauseAsync(): Promise<DspPlaybackStatus>;
  seekAsync(seconds: number): Promise<DspPlaybackStatus>;
  getStatusAsync(): Promise<DspPlaybackStatus>;
  unloadAsync(): Promise<void>;
  addListener(eventName: "onPlaybackStatus", listener: (event: DspPlaybackStatusEvent) => void): EventSubscription;
};

const nativeModule = requireOptionalNativeModule<NativeDspPlayerModule>("ExpoDspPlayer");

export const dspPlaybackAvailable = Boolean(nativeModule);

function unavailable(): never {
  throw new Error("Sphynx DSP playback requires a custom iOS build.");
}

export function loadDspTrack(uri: string, configuration: DspPlaybackConfiguration) {
  return nativeModule ? nativeModule.loadAsync(uri, configuration) : unavailable();
}

export function setDspConfiguration(configuration: DspPlaybackConfiguration) {
  return nativeModule ? nativeModule.configureAsync(configuration) : unavailable();
}

export function playDspTrack() {
  return nativeModule ? nativeModule.playAsync() : unavailable();
}

export function pauseDspTrack() {
  return nativeModule ? nativeModule.pauseAsync() : unavailable();
}

export function seekDspTrack(seconds: number) {
  return nativeModule ? nativeModule.seekAsync(seconds) : unavailable();
}

export function getDspStatus() {
  return nativeModule ? nativeModule.getStatusAsync() : unavailable();
}

export function unloadDspTrack() {
  return nativeModule ? nativeModule.unloadAsync() : Promise.resolve();
}

export function addDspPlaybackListener(listener: (event: DspPlaybackStatusEvent) => void): EventSubscription | null {
  return nativeModule?.addListener("onPlaybackStatus", listener) ?? null;
}

export default nativeModule;
