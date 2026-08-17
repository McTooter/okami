import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

import { AlbumArt } from "@/components/sphynx/album-art";
import type { ArtworkId } from "@/lib/sphynx-store";

type AnimatedAlbumArtProps = {
  artwork: ArtworkId;
  size: number;
  radius?: number;
  accent: string;
  active: boolean;
  motionReduced: boolean;
};

/**
 * Keeps the deterministic cover as the resting image, then adds one bounded
 * atmosphere layer only while music is playing. It never represents audio data.
 */
export function AnimatedAlbumArt({ artwork, size, radius = 16, accent, active, motionReduced }: AnimatedAlbumArtProps) {
  const pulse = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(pulse);
    if (!active || motionReduced) {
      pulse.value = withTiming(0, { duration: 160, easing: Easing.out(Easing.quad) });
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.22, { duration: 1700, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [active, motionReduced, pulse]);

  const atmosphereStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.13 + pulse.value * 0.22 : 0,
    transform: [
      { scale: motionReduced ? 1 : 1.01 + pulse.value * 0.06 },
      { rotate: motionReduced ? "0deg" : `${pulse.value * 1.2}deg` },
    ],
  }), [active, motionReduced]);

  const frameStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.5 + pulse.value * 0.3 : 0,
    transform: [{ translateX: motionReduced ? 0 : pulse.value * size * 0.035 }],
  }), [active, motionReduced, size]);

  return (
    <View style={[styles.root, { width: size, height: size, borderRadius: radius }]}>
      <Animated.View pointerEvents="none" style={[styles.atmosphere, { backgroundColor: accent, borderRadius: radius }, atmosphereStyle]} />
      <AlbumArt artwork={artwork} size={size} radius={radius} />
      <Animated.View pointerEvents="none" style={[styles.frame, { borderColor: accent, borderRadius: Math.max(radius - 3, 2) }, frameStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { overflow: "hidden", alignItems: "center", justifyContent: "center" },
  atmosphere: { position: "absolute", width: "88%", height: "88%", zIndex: 1 },
  frame: { position: "absolute", top: 5, right: 5, bottom: 5, left: 5, borderWidth: 1, zIndex: 2 },
});
