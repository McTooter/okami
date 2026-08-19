import type { AppMaterialId } from "@/lib/sphynx-store";

export type NoirPulseMotionPlan = {
  enabled: boolean;
  fieldEstablishDuration: number;
  panelDelay: number;
  panelSweepDuration: number;
  seamDelay: number;
  seamSweepDuration: number;
  contentRevealDelay: number;
  contentRevealDuration: number;
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
    fieldEstablishDuration: enabled ? 360 : 0,
    panelDelay: enabled ? 112 : 0,
    panelSweepDuration: enabled ? 560 : 0,
    seamDelay: enabled ? 308 : 0,
    seamSweepDuration: enabled ? 380 : 0,
    contentRevealDelay: enabled ? 418 : 0,
    contentRevealDuration: enabled ? 220 : 0,
    hazeOpacity: materialId === "noir-pulse" ? (motionReduced ? 0.08 : 0.12) : 0,
  };
}
