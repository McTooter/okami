import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSegments } from "expo-router";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";

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
  const routeKey = segments.join("/");
  const redField = useSharedValue(0);
  const panelSweep = useSharedValue(0);
  const seamSweep = useSharedValue(0);
  const contentReveal = useSharedValue(0);
  const haze = useSharedValue(0);

  useEffect(() => {
    redField.value = 0;
    panelSweep.value = 0;
    seamSweep.value = 0;
    contentReveal.value = 0;
    haze.value = 0;

    if (!plan.enabled) return;

    redField.value = withTiming(1, {
      duration: plan.fieldEstablishDuration,
      easing: Easing.out(Easing.cubic),
    });
    panelSweep.value = withDelay(plan.panelDelay, withTiming(1, {
      duration: plan.panelSweepDuration,
      easing: Easing.out(Easing.cubic),
    }));
    seamSweep.value = withDelay(plan.seamDelay, withTiming(1, {
      duration: plan.seamSweepDuration,
      easing: Easing.out(Easing.quad),
    }));
    contentReveal.value = withDelay(plan.contentRevealDelay, withTiming(1, {
      duration: plan.contentRevealDuration,
      easing: Easing.out(Easing.cubic),
    }));
    haze.value = withRepeat(
      withSequence(
        withDelay(plan.fieldEstablishDuration, withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) })),
        withTiming(0.28, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [contentReveal, haze, panelSweep, plan.contentRevealDelay, plan.contentRevealDuration, plan.enabled, plan.fieldEstablishDuration, plan.panelDelay, plan.panelSweepDuration, plan.seamDelay, plan.seamSweepDuration, redField, seamSweep]);

  useEffect(() => {
    if (!plan.enabled) return;
    panelSweep.value = 0;
    seamSweep.value = 0;
    contentReveal.value = 0;
    panelSweep.value = withDelay(plan.panelDelay, withTiming(1, { duration: plan.panelSweepDuration, easing: Easing.out(Easing.cubic) }));
    seamSweep.value = withDelay(plan.seamDelay, withTiming(1, { duration: plan.seamSweepDuration, easing: Easing.out(Easing.quad) }));
    contentReveal.value = withDelay(plan.contentRevealDelay, withTiming(1, { duration: plan.contentRevealDuration, easing: Easing.out(Easing.cubic) }));
  }, [contentReveal, panelSweep, plan.contentRevealDelay, plan.contentRevealDuration, plan.enabled, plan.panelDelay, plan.panelSweepDuration, plan.seamDelay, plan.seamSweepDuration, routeKey, seamSweep]);

  const redFieldStyle = useAnimatedStyle(() => ({
    opacity: interpolate(redField.value, [0, 0.7, 1], [0, 0.2, 0.12]),
    transform: [
      { translateX: interpolate(redField.value, [0, 1], [-width * 0.4, -width * 0.08]) },
      { rotate: "-9deg" },
    ],
  }), [width]);

  const hazeStyle = useAnimatedStyle(() => ({
    opacity: plan.hazeOpacity + haze.value * 0.11,
    transform: [
      { translateX: interpolate(haze.value, [0, 1], [-width * 0.1, width * 0.08]) },
      { translateY: interpolate(haze.value, [0, 1], [height * 0.02, -height * 0.025]) },
      { rotate: "-12deg" },
    ],
  }), [height, plan.hazeOpacity, width]);

  const blackCutStyle = useAnimatedStyle(() => ({
    opacity: interpolate(panelSweep.value, [0, 0.16, 0.82, 1], [0, 0.52, 0.24, 0]),
    transform: [
      { translateX: interpolate(panelSweep.value, [0, 1], [width * 0.9, -width * 0.92]) },
      { rotate: "-14deg" },
    ],
  }), [width]);

  const whiteSeamStyle = useAnimatedStyle(() => ({
    opacity: interpolate(seamSweep.value, [0, 0.12, 0.78, 1], [0, 1, 0.38, 0]),
    transform: [
      { translateX: interpolate(seamSweep.value, [0, 1], [width * 1.04, -width * 1.12]) },
      { rotate: "-14deg" },
    ],
  }), [width]);

  const contentVeilStyle = useAnimatedStyle(() => ({
    opacity: interpolate(contentReveal.value, [0, 1], [0.12, 0]),
  }));

  if (material.id !== "noir-pulse") return null;

  return (
    <View pointerEvents="none" style={styles.root}>
      <Animated.View style={[styles.redField, { width: width * 0.76, height: height * 1.24 }, redFieldStyle]} />
      <Animated.View style={[styles.haze, { width: width * 0.7, height: height * 1.28 }, hazeStyle]} />
      <Animated.View style={[styles.blackCut, { width: width * 0.94, height: height * 1.24 }, blackCutStyle]} />
      <Animated.View style={[styles.whiteSeam, { height: height * 1.35 }, whiteSeamStyle]} />
      <Animated.View style={[styles.contentVeil, contentVeilStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 40,
    overflow: "hidden",
  },
  redField: {
    position: "absolute",
    left: -116,
    top: -78,
    backgroundColor: "#A10D21",
  },
  haze: {
    position: "absolute",
    left: -90,
    top: -100,
    backgroundColor: "#8F0A18",
  },
  blackCut: {
    position: "absolute",
    right: -390,
    top: -104,
    backgroundColor: "#050505",
  },
  whiteSeam: {
    position: "absolute",
    top: -110,
    width: 3,
    backgroundColor: "#F7F2E8",
    shadowColor: "#F7F2E8",
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  contentVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050505",
  },
});
