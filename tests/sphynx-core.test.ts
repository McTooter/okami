import { describe, expect, it } from "vitest";

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
});
