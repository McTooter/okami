import { useCallback, useEffect, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, Text, View, type LayoutChangeEvent, type View as ViewType } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Line, Path, Rect, Stop } from "react-native-svg";

import { AlbumArt } from "@/components/sphynx/album-art";
import { listeningFieldTiltFromPoint } from "@/lib/listening-field-core";
import type { AppMaterial, ArtworkId, ThemeDefinition } from "@/lib/sphynx-store";
import { ListeningShader } from "./listening-shader";

const FIELD_MARKS = [
  { x: 19, y: 24, r: 1.3, delay: 0.05 },
  { x: 76, y: 18, r: 1.9, delay: 0.16 },
  { x: 86, y: 64, r: 1.1, delay: 0.28 },
  { x: 23, y: 78, r: 1.6, delay: 0.39 },
  { x: 61, y: 84, r: 1.1, delay: 0.52 },
];

type ListeningFieldProps = {
  artwork: ArtworkId;
  accent: string;
  theme: ThemeDefinition;
  isPlaying: boolean;
  motionReduced: boolean;
  material: AppMaterial;
  onArtworkMeasured?: (rect: { x: number; y: number; width: number; height: number }) => void;
  size?: number;
};

export function PlaybackPulse({ active, color, motionReduced }: { active: boolean; color: string; motionReduced: boolean }) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pulse);
    if (!active || motionReduced) {
      pulse.value = withTiming(0, { duration: 140 });
      return;
    }

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 860, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.28, { duration: 860, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    return () => cancelAnimation(pulse);
  }, [active, motionReduced, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.12 + pulse.value * 0.2 : 0,
    transform: [{ scale: 1 + pulse.value * 0.8 }],
  }));

  return (
    <View accessibilityElementsHidden style={styles.pulseRoot}>
      <Animated.View style={[styles.pulseHalo, { backgroundColor: color }, haloStyle]} />
      <View style={[styles.pulseCore, { backgroundColor: color }]} />
    </View>
  );
}

/**
 * A contained, original vector composition that gives the active artwork
 * touch-responsive depth without claiming to represent source audio data.
 */
export function ListeningField({ artwork, accent, theme, isPlaying, motionReduced, material, onArtworkMeasured, size = 286 }: ListeningFieldProps) {
  const artworkTargetRef = useRef<ViewType>(null);
  const bounds = useRef({ width: size, height: size });
  const tiltX = useSharedValue(0);
  const tiltY = useSharedValue(0);
  const drift = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(drift);
    if (!isPlaying || motionReduced) {
      drift.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
      return;
    }

    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
        withTiming(-1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );

    return () => cancelAnimation(drift);
  }, [drift, isPlaying, motionReduced]);

  const returnToRest = useCallback(() => {
    tiltX.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    tiltY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [tiltX, tiltY]);

  const panResponder = useMemo(
    () => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => !motionReduced && (Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3),
      onPanResponderMove: (event) => {
        const point = listeningFieldTiltFromPoint(
          event.nativeEvent.locationX,
          event.nativeEvent.locationY,
          bounds.current.width,
          bounds.current.height,
        );
        tiltX.value = point.x;
        tiltY.value = point.y;
      },
      onPanResponderRelease: returnToRest,
      onPanResponderTerminate: returnToRest,
    }),
    [motionReduced, returnToRest, tiltX, tiltY],
  );

  const artDepthStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 860 },
      { rotateX: `${tiltX.value}deg` },
      { rotateY: `${tiltY.value}deg` },
      { translateY: motionReduced ? 0 : drift.value * -3 },
      { scale: motionReduced ? 1 : 1 + drift.value * 0.006 },
    ],
  }), [motionReduced]);

  const atmosphereStyle = useAnimatedStyle(() => ({
    opacity: motionReduced ? 0.46 : 0.5 + drift.value * 0.12,
    transform: [
      { translateX: tiltY.value * 1.5 },
      { translateY: motionReduced ? 0 : tiltX.value * -1.5 + drift.value * 2 },
      { scale: motionReduced ? 1 : 1 + drift.value * 0.03 },
    ],
  }), [motionReduced]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: motionReduced ? 0.18 : 0.18 + Math.abs(drift.value) * 0.11,
    transform: [{ scale: motionReduced ? 1 : 1.01 + drift.value * 0.025 }],
  }), [motionReduced]);

  const visualAccent = material.fieldAccent ?? accent;
  const visualSecondary = material.fieldSecondary ?? theme.foreground;

  const reportArtworkTarget = (_: LayoutChangeEvent) => {
    requestAnimationFrame(() => artworkTargetRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) onArtworkMeasured?.({ x, y, width, height });
    }));
  };

  return (
    <View
      accessible
      accessibilityLabel="Interactive listening field. Drag gently to tilt the album artwork."
      accessibilityRole="image"
      onLayout={(event) => {
        bounds.current = {
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height,
        };
      }}
      style={[styles.field, { width: size, height: size, backgroundColor: theme.surface, borderColor: theme.border }]}
      {...panResponder.panHandlers}
    >
      <Animated.View pointerEvents="none" style={[styles.colorBloom, { backgroundColor: visualAccent }, glowStyle]} />
      <Animated.View pointerEvents="none" style={[styles.shaderLayer, atmosphereStyle]}>
        <ListeningShader accent={visualAccent} foreground={visualSecondary} isPlaying={isPlaying} motionReduced={motionReduced} size={size} mode={material.shaderMode} energy={material.shaderEnergy} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.atmosphere, atmosphereStyle]}>
        <Svg height="100%" width="100%" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="listening-field-fade" x1="0" x2="1" y1="0" y2="1">
              <Stop offset="0" stopColor={visualAccent} stopOpacity={0.52 * material.signalOpacity} />
              <Stop offset="1" stopColor={theme.surface} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect width="100" height="100" fill="url(#listening-field-fade)" opacity="0.28" />
          <Circle cx="50" cy="50" r="38" fill="none" stroke={visualAccent} strokeOpacity={0.3 * material.signalOpacity} strokeWidth="0.45" />
          <Circle cx="50" cy="50" r="30" fill="none" stroke={visualSecondary} strokeOpacity="0.12" strokeWidth="0.32" />
          <Circle cx="50" cy="50" r="47" fill="none" stroke={visualAccent} strokeOpacity={0.17 * material.signalOpacity} strokeDasharray={material.shaderMode === 1 ? "1 2.2" : "1.4 3.6"} strokeWidth="0.55" />
          <Path d="M8 57 C24 42, 35 72, 52 50 S78 40, 94 57" fill="none" stroke={visualAccent} strokeOpacity={0.45 * material.signalOpacity} strokeWidth="0.7" />
          <Line x1="11" y1="50" x2="89" y2="50" stroke={visualSecondary} strokeOpacity="0.1" strokeWidth="0.35" />
          {FIELD_MARKS.map((mark) => <Circle key={`${mark.x}-${mark.y}`} cx={mark.x} cy={mark.y} r={mark.r} fill={visualAccent} fillOpacity={0.75 * material.signalOpacity} />)}
        </Svg>
      </Animated.View>

      <Animated.View ref={artworkTargetRef} collapsable={false} style={[styles.artDepth, artDepthStyle]} onLayout={reportArtworkTarget}>
        <View style={[styles.artShell, { backgroundColor: theme.raised, borderColor: theme.border, borderRadius: material.fieldRadius - 2 }]}>
          <AlbumArt artwork={artwork} size={size - 28} radius={29} />
        </View>
      </Animated.View>

      <View pointerEvents="none" style={styles.fieldCaption}>
        <View style={styles.captionRow}>
          <PlaybackPulse active={isPlaying} color={visualAccent} motionReduced={motionReduced} />
          <Text style={[styles.captionText, { color: theme.foreground }]}>LISTENING FIELD</Text>
        </View>
        <Text style={[styles.captionHint, { color: theme.muted }]}>{motionReduced ? "Motion reduced" : "Touch to shift depth"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { alignSelf: "center", borderRadius: 36, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.27, shadowRadius: 31, shadowOffset: { width: 0, height: 18 }, elevation: 9 },
  colorBloom: { position: "absolute", width: "84%", height: "84%", borderRadius: 999, top: "8%", left: "8%" },
  shaderLayer: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  atmosphere: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0 },
  artDepth: { alignItems: "center", justifyContent: "center" },
  artShell: { padding: 5, borderRadius: 34, borderWidth: StyleSheet.hairlineWidth, shadowColor: "#000", shadowOpacity: 0.32, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  fieldCaption: { position: "absolute", right: 13, bottom: 12, alignItems: "flex-end" },
  captionRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  captionText: { fontSize: 8, lineHeight: 10, fontWeight: "900", letterSpacing: 1.15 },
  captionHint: { fontSize: 8, lineHeight: 11, fontWeight: "600", marginTop: 2 },
  pulseRoot: { width: 9, height: 9, alignItems: "center", justifyContent: "center" },
  pulseHalo: { position: "absolute", width: 9, height: 9, borderRadius: 999 },
  pulseCore: { width: 4, height: 4, borderRadius: 999 },
});
