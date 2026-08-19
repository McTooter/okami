import { describe, expect, it } from "vitest";

import { buildAudioSettingsExport, createEqPreset, createHeadphoneGroup, DEFAULT_AUDIO_SETTINGS, DEFAULT_HEADPHONE_GROUP, normalizeAudioSettings, normalizeHeadphoneGroupName, normalizePresetName } from "../lib/audio-settings-core";
import { clampAdvancedAudioSettings, nativeVolumeFromTrim } from "../lib/advanced-audio-core";
import { findMatchingHeadphoneGroup } from "../lib/audio-route-core";
import { buildDspPlaybackConfiguration, isDspProcessingEnabled } from "../lib/dsp-player-core";
import { listeningFieldTiltFromPoint, MAX_LISTENING_FIELD_TILT } from "../lib/listening-field-core";
import { findListeningProfile, mergeListeningProfiles, movePinnedTrackId, normalizePinnedTrackIds, normalizeProfileCustomization, normalizeProfilePinnedTrackIds, normalizeProfileQueueOrders, reorderPinnedTrackIds } from "../lib/listening-profile-core";
import { buildLocalImportIdentity } from "../lib/local-music-core";
import { formatLibraryCount, selectLibraryRotation } from "../lib/okami-library-core";
import { applyQueueOrder, moveQueueId } from "../lib/queue-core";
import { adjustPreamp, advanceProgress, clamp, nextTrackIndex } from "../lib/sphynx-core";

describe("Sphynx playback boundaries", () => {
  it("gives the Library a concise live count and makes identity-pinned tracks lead the rotation", () => {
    const library = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    expect(formatLibraryCount(6)).toBe("06");
    expect(formatLibraryCount(-2.4)).toBe("00");
    expect(selectLibraryRotation([{ id: "pinned" }], library)).toEqual([{ id: "pinned" }]);
    expect(selectLibraryRotation([], library)).toEqual([{ id: "a" }, { id: "b" }, { id: "c" }]);
  });

  it("clamps user-controlled progress to the valid playback range", () => {
    expect(clamp(-0.2, 0, 1)).toBe(0);
    expect(clamp(0.42, 0, 1)).toBe(0.42);
    expect(clamp(1.3, 0, 1)).toBe(1);
  });

  it("cycles the queue forwards and backwards without a dead end", () => {
    expect(nextTrackIndex(5, 6, "next")).toBe(0);
    expect(nextTrackIndex(0, 6, "previous")).toBe(5);
    expect(nextTrackIndex(-1, 6, "next")).toBe(0);
  });

  it("preserves a curated queue order, appends newly available tracks, and supports accessible one-step movement", () => {
    const tracks = [{ id: "a" }, { id: "b" }, { id: "c" }];
    expect(applyQueueOrder(tracks, ["c", "a", "missing"])).toEqual([{ id: "c" }, { id: "a" }, { id: "b" }]);
    expect(moveQueueId(["c", "a", "b"], "a", "up")).toEqual(["a", "c", "b"]);
    expect(moveQueueId(["c", "a", "b"], "c", "up")).toEqual(["c", "a", "b"]);
    expect(moveQueueId(["c", "a", "b"], "b", "down")).toEqual(["c", "a", "b"]);
  });

  it("wraps preview progress when a demo track reaches its terminal boundary", () => {
    expect(advanceProgress(0.8, 0.001)).toBeCloseTo(0.801);
    expect(advanceProgress(0.995, 0.001)).toBe(0);
  });

  it("keeps preamp within the intentionally guarded gain window", () => {
    expect(adjustPreamp(5.8, 0.5)).toBe(6);
    expect(adjustPreamp(-5.8, -0.5)).toBe(-6);
    expect(adjustPreamp(0, 0.5)).toBe(0.5);
  });

  it("turns a selected music file into readable, safe local-library metadata", () => {
    expect(buildLocalImportIdentity("Kiasmos_–_Looped.m4a", 1723982400000, 2)).toEqual({
      id: "local-1723982400000-2",
      title: "Kiasmos – Looped",
      storageFileName: "local-1723982400000-2-Kiasmos_-_Looped.m4a",
    });
  });

  it("gives a valid fallback title when a selected file has no readable stem", () => {
    expect(buildLocalImportIdentity(".mp3", 1723982400000, 0).title).toBe("Untitled import");
  });

  it("builds a portable settings export without leaking mutable EQ references", () => {
    const sound = normalizeAudioSettings({ ...DEFAULT_AUDIO_SETTINGS, preamp: 1.5, eq: [1, 0, -1, 2, 0] as [number, number, number, number, number], playbackRate: 1.25, outputTrim: -4 });
    const group = createHeadphoneGroup("device-1", "  Audeze   LCD-X  ", 1723982400000);
    const preset = createEqPreset("eq-1", "  Studio   nearfields  ", sound, 1723982400000, group.id);
    const exported = buildAudioSettingsExport(sound, [preset], new Date("2026-08-17T00:00:00.000Z"), [DEFAULT_HEADPHONE_GROUP, group], group.id);
    sound.eq[0] = 3;
    expect(preset.name).toBe("Studio nearfields");
    expect(exported).toMatchObject({ schemaVersion: 2, app: "Okami", exportedAt: "2026-08-17T00:00:00.000Z", sound: { eq: [1, 0, -1, 2, 0], playbackRate: 1.25, outputTrim: -4 }, eqPresets: [{ name: "Studio nearfields", groupId: "device-1" }], headphoneGroups: [{ id: "general-audio", protected: true }, { id: "device-1", name: "Audeze LCD-X" }], activeHeadphoneGroupId: "device-1" });
  });

  it("keeps preset names compact and usable", () => {
    expect(normalizePresetName("     ")).toBe("Untitled preset");
    expect(normalizePresetName("A".repeat(40))).toHaveLength(32);
  });

  it("builds compact device-group names and keeps a stable general-audio fallback", () => {
    expect(normalizeHeadphoneGroupName("     ")).toBe("Untitled device");
    expect(normalizeHeadphoneGroupName("A".repeat(40))).toHaveLength(32);
    expect(DEFAULT_HEADPHONE_GROUP).toMatchObject({ id: "general-audio", protected: true });
  });

  it("auto-selects exactly one matching Bluetooth headphone group and ignores ambiguous or non-Bluetooth routes", () => {
    const airPods = createHeadphoneGroup("device-airpods", "AirPods Pro", 1723982400000);
    const studio = createHeadphoneGroup("device-studio", "Studio Headphones", 1723982400000);
    const groups = [DEFAULT_HEADPHONE_GROUP, airPods, studio];

    expect(findMatchingHeadphoneGroup({ kind: "bluetooth", name: "Alice’s AirPods Pro" }, groups)?.id).toBe("device-airpods");
    expect(findMatchingHeadphoneGroup({ kind: "wired", name: "AirPods Pro" }, groups)).toBeNull();
    expect(findMatchingHeadphoneGroup({ kind: "bluetooth", name: "AirPods" }, [DEFAULT_HEADPHONE_GROUP, createHeadphoneGroup("device-one", "AirPods", 1723982400000), createHeadphoneGroup("device-two", "AirPods", 1723982400000)])).toBeNull();
  });

  it("keeps advanced transport settings inside native playback boundaries and converts trim to safe volume", () => {
    expect(clampAdvancedAudioSettings({ playbackRate: 3, outputTrim: 4, crossfeed: -1, spatialWidth: 105 })).toMatchObject({ playbackRate: 2, outputTrim: 0, crossfeed: 0, spatialWidth: 100 });
    expect(clampAdvancedAudioSettings({ playbackRate: 0.2, outputTrim: -20 })).toMatchObject({ playbackRate: 0.5, outputTrim: -12 });
    expect(nativeVolumeFromTrim(0)).toBe(1);
    expect(nativeVolumeFromTrim(-6)).toBeCloseTo(0.501, 2);
  });

  it("maps persisted Sound Lab controls to a real native DSP configuration", () => {
    const configuration = buildDspPlaybackConfiguration(normalizeAudioSettings({
      ...DEFAULT_AUDIO_SETTINGS,
      eq: [2, -1, 0, 1, 3],
      preamp: -1.5,
      outputTrim: -3,
      limiter: true,
      loudnessMode: "album",
      compressor: true,
      playbackRate: 1.1,
      repeatOne: true,
    }));

    expect(configuration).toMatchObject({
      eq: [2, -1, 0, 1, 3],
      preamp: -1.5,
      outputTrim: -3,
      limiter: true,
      loudnessMode: "album",
      compressor: true,
      playbackRate: 1.1,
      repeatOne: true,
    });
    expect(isDspProcessingEnabled(configuration)).toBe(true);
    expect(isDspProcessingEnabled(buildDspPlaybackConfiguration(DEFAULT_AUDIO_SETTINGS))).toBe(true);
  });

  it("keeps interactive listening-field depth shallow and stable at every touch boundary", () => {
    expect(listeningFieldTiltFromPoint(100, 100, 200, 200)).toEqual({ x: 0, y: 0 });
    expect(listeningFieldTiltFromPoint(500, -100, 200, 200)).toEqual({ x: MAX_LISTENING_FIELD_TILT, y: MAX_LISTENING_FIELD_TILT });
    expect(listeningFieldTiltFromPoint(Number.NaN, 40, 200, 200)).toEqual({ x: 0, y: 0 });
  });

  it("keeps Listening Identity local, stable, and limited to valid queue-order values", () => {
    expect(findListeningProfile("night-transit")).toMatchObject({ name: "Night Transit", artwork: "horizon" });
    expect(findListeningProfile("missing").id).toBe("sora");
    expect(normalizeProfileQueueOrders({ sora: ["a", 1], "night-transit": ["b", "c"], other: ["z"] })).toEqual({ sora: ["a"], "night-transit": ["b", "c"] });
  });

  it("normalizes editable local identity values without accepting arbitrary avatar colors", () => {
    expect(normalizeProfileCustomization({ name: "  After   Hours  ", cue: "#F05A47" })).toEqual({ name: "After Hours", cue: "#F05A47" });
    expect(normalizeProfileCustomization({ name: "  ", cue: "#ffffff" })).toEqual({});
    expect(mergeListeningProfiles({ sora: { name: "After Hours", cue: "#F05A47" } })[0]).toMatchObject({ id: "sora", name: "After Hours", cue: "#F05A47" });
  });

  it("keeps pinned albums identity-scoped, unique, bounded, and safe to restore", () => {
    expect(normalizePinnedTrackIds(["a", "a", 2, "b", "c"])).toEqual(["a", "b", "c"]);
    expect(normalizeProfilePinnedTrackIds({ sora: ["a", "b"], "guest-session": ["c"], unknown: ["d"] })).toEqual({ sora: ["a", "b"], "guest-session": ["c"] });
  });

  it("persists only valid pinned drag results and supports accessible one-step reordering", () => {
    expect(reorderPinnedTrackIds(["a", "b", "c"], ["c", "missing", "a", "a"])).toEqual(["c", "a", "b"]);
    expect(movePinnedTrackId(["c", "a", "b"], "a", "left")).toEqual(["a", "c", "b"]);
    expect(movePinnedTrackId(["c", "a", "b"], "c", "left")).toEqual(["c", "a", "b"]);
    expect(movePinnedTrackId(["c", "a", "b"], "b", "right")).toEqual(["c", "a", "b"]);
  });
});
