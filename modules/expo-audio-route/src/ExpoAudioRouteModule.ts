import { requireOptionalNativeModule, type EventSubscription } from "expo-modules-core";

import type { AudioRouteChangeEvent, AudioRouteInfo } from "./ExpoAudioRoute.types";

type NativeAudioRouteModule = {
  getCurrentRouteAsync(): Promise<AudioRouteInfo>;
  addListener(eventName: "onAudioRouteChange", listener: (event: AudioRouteChangeEvent) => void): EventSubscription;
};

const nativeModule = requireOptionalNativeModule<NativeAudioRouteModule>("ExpoAudioRoute");

export const audioRouteDetectionAvailable = Boolean(nativeModule);

export async function getCurrentAudioRoute(): Promise<AudioRouteInfo> {
  if (!nativeModule) return { kind: "unknown", name: null };
  const route = await nativeModule.getCurrentRouteAsync();
  return {
    kind: route?.kind ?? "unknown",
    name: typeof route?.name === "string" && route.name.trim() ? route.name.trim() : null,
  };
}

export function addAudioRouteListener(listener: (event: AudioRouteChangeEvent) => void): EventSubscription | null {
  return nativeModule?.addListener("onAudioRouteChange", listener) ?? null;
}

export default nativeModule;
