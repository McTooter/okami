import type { AppMaterialId } from "@/lib/sphynx-store";

export type NoirPulseMotionPlan = {
  enabled: boolean;
  entryDuration: number;
  routeSweepDuration: number;
  hazeOpacity: number;
};

/**
 * Keeps material motion bounded and testable. The kinetic layer is decorative;
 * it must never run full animation for people who opt out of motion.
 */
export function getNoirPulseMotionPlan(materialId: AppMaterialId, motionReduced: boolean): NoirPulseMotionPlan {
  const enabled = materialId === "noir-pulse" && !motionReduced;
  return {
    enabled,
    entryDuration: enabled ? 520 : 0,
    routeSweepDuration: enabled ? 390 : 0,
    hazeOpacity: materialId === "noir-pulse" ? (motionReduced ? 0.09 : 0.16) : 0,
  };
}
