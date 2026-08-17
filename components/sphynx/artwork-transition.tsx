import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import { AlbumArt } from "@/components/sphynx/album-art";
import { useSphynx, type Track } from "@/lib/sphynx-store";

type ArtworkRect = { x: number; y: number; width: number; height: number };
type ArtworkTransitionState = { track: Track; source: ArtworkRect; target: ArtworkRect | null };

type ArtworkTransitionContextValue = {
  beginArtworkTransition: (track: Track, source: ArtworkRect) => void;
  setArtworkTarget: (trackId: string, target: ArtworkRect) => void;
};

const ArtworkTransitionContext = createContext<ArtworkTransitionContextValue | null>(null);

function TransitionOverlay({ state, onComplete }: { state: ArtworkTransitionState; onComplete: () => void }) {
  const { sound, theme } = useSphynx();
  const progress = useSharedValue(0);
  const target = state.target;

  useEffect(() => {
    if (!target) return;
    progress.value = withTiming(1, { duration: sound.motionReduced ? 0 : 360, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onComplete)();
    });
  }, [onComplete, progress, sound.motionReduced, target]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!target) return { opacity: 0 };
    const scaleX = target.width / state.source.width;
    const scaleY = target.height / state.source.height;
    return {
      opacity: interpolate(progress.value, [0, 0.08, 1], [1, 1, 0]),
      left: state.source.x,
      top: state.source.y,
      width: state.source.width,
      height: state.source.height,
      transform: [
        { translateX: interpolate(progress.value, [0, 1], [0, target.x - state.source.x + (target.width - state.source.width) / 2]) },
        { translateY: interpolate(progress.value, [0, 1], [0, target.y - state.source.y + (target.height - state.source.height) / 2]) },
        { rotate: `${interpolate(progress.value, [0, 1], [-2, 0])}deg` },
        { scaleX: interpolate(progress.value, [0, 1], [1, scaleX]) },
        { scaleY: interpolate(progress.value, [0, 1], [1, scaleY]) },
      ],
    };
  }, [state.source, target]);

  if (!target) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.overlayArt, { backgroundColor: theme.raised }, animatedStyle]}>
      <View style={styles.fill}><AlbumArt artwork={state.track.artwork} size={state.source.width} radius={11} /></View>
    </Animated.View>
  );
}

export function ArtworkTransitionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ArtworkTransitionState | null>(null);
  const beginArtworkTransition = useCallback((track: Track, source: ArtworkRect) => setState({ track, source, target: null }), []);
  const setArtworkTarget = useCallback((trackId: string, target: ArtworkRect) => {
    setState((current) => current?.track.id === trackId ? { ...current, target } : current);
  }, []);
  const value = useMemo(() => ({ beginArtworkTransition, setArtworkTarget }), [beginArtworkTransition, setArtworkTarget]);

  return (
    <ArtworkTransitionContext.Provider value={value}>
      {children}
      {state ? <TransitionOverlay state={state} onComplete={() => setState(null)} /> : null}
    </ArtworkTransitionContext.Provider>
  );
}

export function useArtworkTransition() {
  const value = useContext(ArtworkTransitionContext);
  if (!value) throw new Error("useArtworkTransition must be used inside ArtworkTransitionProvider");
  return value;
}

const styles = StyleSheet.create({
  overlayArt: { position: "absolute", zIndex: 1000, elevation: 30, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  fill: { width: "100%", height: "100%", overflow: "hidden" },
});
