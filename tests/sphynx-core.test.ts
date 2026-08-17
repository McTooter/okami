import { describe, expect, it } from "vitest";

import { buildAudioSettingsExport, createEqPreset, normalizePresetName } from "../lib/audio-settings-core";
import { buildLocalImportIdentity } from "../lib/local-music-core";
import { adjustPreamp, advanceProgress, clamp, nextTrackIndex } from "../lib/sphynx-core";

describe("Sphynx playback boundaries", () => {
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
    const sound = { preamp: 1.5, limiter: true, crossfade: 4, mono: false, eq: [1, 0, -1, 2, 0] as [number, number, number, number, number], motionReduced: false, typeScale: "standard" as const };
    const preset = createEqPreset("eq-1", "  Studio   nearfields  ", sound, 1723982400000);
    const exported = buildAudioSettingsExport(sound, [preset], new Date("2026-08-17T00:00:00.000Z"));
    sound.eq[0] = 3;
    expect(preset.name).toBe("Studio nearfields");
    expect(exported).toMatchObject({ schemaVersion: 1, app: "Sphynx", exportedAt: "2026-08-17T00:00:00.000Z", sound: { eq: [1, 0, -1, 2, 0] }, eqPresets: [{ name: "Studio nearfields" }] });
  });

  it("keeps preset names compact and usable", () => {
    expect(normalizePresetName("     ")).toBe("Untitled preset");
    expect(normalizePresetName("A".repeat(40))).toHaveLength(32);
  });
});
