import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSegments } from "expo-router";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { getNoirPulseMotionPlan } from "@/lib/noir-pulse-motion-core";
import { useSphynx } from "@/lib/sphynx-store";

/**
 * A deliberately sparse material overlay for Noir Pulse. It uses only abstract
 * geometry and never contains borrowed artwork, character silhouettes, words,
 * or layouts. Decorative layers ignore touch so app controls stay responsive.
 */
export function NoirPulseKineticLayer() {
  const { material, sound } = useSphynx();
  const { width, height } = useWindowDimensions();
  const segments = useSegments();
  const plan = getNoirPulseMotionPlan(material.id, sound.motionReduced);
  const materialEntry = useSharedValue(0);
  const routeSweep = useSharedValue(0);
  const haze = useSharedValue(0);

  useEffect(() => {
    materialEntry.value = 0;
    routeSweep.value = 0;
    haze.value = 0;

    if (!plan.enabled) return;

    materialEntry.value = withTiming(1, {
      duration: plan.entryDuration,
      easing: Easing.out(Easing.cubic),
    });
    haze.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.28, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [plan.enabled, plan.entryDuration, materialEntry, routeSweep, haze]);

  useEffect(() => {
    if (!plan.enabled) return;
    routeSweep.value = 0;
    routeSweep.value = withTiming(1, {
      duration: plan.routeSweepDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [plan.enabled, plan.routeSweepDuration, routeSweep, segments]);

  const hazeStyle = useAnimatedStyle(() => ({
    opacity: plan.hazeOpacity + haze.value * 0.11,
    transform: [
      { translateX: interpolate(haze.value, [0, 1], [-width * 0.1, width * 0.08]) },
      { translateY: interpolate(haze.value, [0, 1], [height * 0.02, -height * 0.025]) },
      { rotate: "-12deg" },
    ],
  }), [height, plan.hazeOpacity, width]);

  const blackCutStyle = useAnimatedStyle(() => ({
    opacity: interpolate(materialEntry.value, [0, 0.7, 1], [0, 0.18, 0.11]),
    transform: [
      { translateX: interpolate(materialEntry.value, [0, 1], [width * 0.74, -width * 0.26]) },
      { rotate: "-14deg" },
    ],
  }), [width]);

  const whiteSeamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(routeSweep.value, [0, 0.2, 0.72, 1], [0, 0.82, 0.06, 0]),
    transform: [
      { translateX: interpolate(routeSweep.value, [0, 1], [width * 0.94, -width * 1.08]) },
      { rotate: "-14deg" },
    ],
  }), [width]);

  if (material.id !== "noir-pulse") return null;

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View style={[styles.haze, { width: width * 0.84, height: height * 1.18 }, hazeStyle]} />
      <Animated.View style={[styles.blackCut, { width: width * 1.06, height: height * 1.24 }, blackCutStyle]} />
      <Animated.View style={[styles.whiteSeam, { height: height * 1.35 }, whiteSeamStyle]} />
      <View style={[styles.signalTick, { top: Math.max(72, height * 0.14) }]} />
      <View style={[styles.signalTick, styles.signalTickLower, { top: Math.max(310, height * 0.62) }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    overflow: "hidden",
  },
  haze: {
    position: "absolute",
    left: -70,
    top: -72,
    backgroundColor: "#D82C2A",
    borderTopRightRadius: 220,
    borderBottomRightRadius: 220,
  },
  blackCut: {
    position: "absolute",
    right: -500,
    top: -84,
    backgroundColor: "#070607",
  },
  whiteSeam: {
    position: "absolute",
    top: -110,
    width: 8,
    backgroundColor: "#F7F2E8",
    shadowColor: "#F7F2E8",
    shadowOpacity: 0.42,
    shadowRadius: 14,
  },
  signalTick: {
    position: "absolute",
    left: 18,
    width: 18,
    height: 3,
    backgroundColor: "#F05A47",
    opacity: 0.8,
  },
  signalTickLower: {
    left: undefined,
    right: 20,
    width: 28,
    backgroundColor: "#F7F2E8",
    opacity: 0.42,
  },
});
