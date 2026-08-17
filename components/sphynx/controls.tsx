import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, type View as ViewType } from "react-native";
import { useRef } from "react";

import { AnimatedAlbumArt } from "@/components/sphynx/animated-album-art";
import { MotionPressable } from "@/components/sphynx/motion-pressable";
import { haptic } from "@/lib/haptics";
import { type Track, useSphynx } from "@/lib/sphynx-store";
import { useArtworkTransition } from "./artwork-transition";

export function SourceBadge({ provider }: { provider: Track["provider"] }) {
  const { theme } = useSphynx();
  return (
    <View style={[styles.sourceBadge, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <Text style={[styles.sourceText, { color: theme.muted }]}>{provider}</Text>
    </View>
  );
}

export function TrackRow({ track, index, onMore }: { track: Track; index?: number; onMore?: () => void }) {
  const router = useRouter();
  const { theme, currentTrack, isPlaying, playTrack } = useSphynx();
  const active = currentTrack.id === track.id && isPlaying;

  const play = () => {
    haptic.light();
    playTrack(track);
    router.push("/now-playing");
  };

  return (
    <View style={[styles.trackRow, { borderBottomColor: theme.border }]}>
      {typeof index === "number" ? (
        <Text style={[styles.trackIndex, { color: active ? theme.accent : theme.muted }]}>
          {active ? "▮▮" : String(index + 1).padStart(2, "0")}
        </Text>
      ) : null}
      <MotionPressable onPress={play} style={styles.trackMain}>
        <AnimatedAlbumArt artwork={track.artwork} size={50} radius={12} accent={track.accent} active={active} motionReduced={false} />
        <View style={styles.trackCopy}>
          <Text numberOfLines={1} style={[styles.trackTitle, { color: theme.foreground }]}>
            {track.title}
          </Text>
          <Text numberOfLines={1} style={[styles.trackMeta, { color: theme.muted }]}>
            {track.artist} · {track.album}
          </Text>
        </View>
      </MotionPressable>
      <View style={styles.trackRight}>
        <Text style={[styles.duration, { color: theme.muted }]}>{track.duration}</Text>
        <MotionPressable
          accessibilityLabel={`More options for ${track.title}`}
          onPress={onMore ?? (() => haptic.selection())}
          hitSlop={10}
          emphasis="compact"
          style={styles.moreButton}
        >
          <Ionicons name="ellipsis-horizontal" size={19} color={theme.muted} />
        </MotionPressable>
      </View>
    </View>
  );
}

export function MiniPlayer() {
  const router = useRouter();
  const artworkRef = useRef<ViewType>(null);
  const { beginArtworkTransition } = useArtworkTransition();
  const { sound, theme, currentTrack, isPlaying, progress, togglePlayback } = useSphynx();
  const openPlayer = () => {
    if (sound.motionReduced || !artworkRef.current) {
      router.push("/now-playing");
      return;
    }
    artworkRef.current.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) beginArtworkTransition(currentTrack, { x, y, width, height });
      router.push("/now-playing");
    });
  };
  return (
    <View style={[styles.miniPlayerShell, { borderColor: theme.border, backgroundColor: theme.raised }]}>
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View style={[styles.progressFill, { backgroundColor: currentTrack.accent, width: `${Math.max(2, progress * 100)}%` }]} />
      </View>
      <MotionPressable
        accessibilityLabel="Open now playing"
        onPress={openPlayer}
        style={styles.miniTapArea}
      >
        <View ref={artworkRef} collapsable={false}>
          <AnimatedAlbumArt artwork={currentTrack.artwork} size={42} radius={11} accent={currentTrack.accent} active={isPlaying} motionReduced={sound.motionReduced} />
        </View>
        <View style={styles.miniCopy}>
          <Text numberOfLines={1} style={[styles.miniTitle, { color: theme.foreground }]}>
            {currentTrack.title}
          </Text>
          <Text numberOfLines={1} style={[styles.miniArtist, { color: theme.muted }]}>
            {currentTrack.artist}
          </Text>
        </View>
      </MotionPressable>
      <MotionPressable
        accessibilityLabel={isPlaying ? "Pause" : "Play"}
        onPress={() => {
          haptic.light();
          togglePlayback();
        }}
        hitSlop={8}
        emphasis="primary"
        style={styles.miniTransport}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={21} color={theme.foreground} />
      </MotionPressable>
    </View>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const { theme } = useSphynx();
  return (
    <View style={styles.sectionHeading}>
      <View>
        {eyebrow ? <Text style={[styles.eyebrow, { color: theme.accent }]}>{eyebrow}</Text> : null}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{title}</Text>
      </View>
      {action ? (
        <MotionPressable onPress={onAction} emphasis="compact" style={styles.sectionAction}>
          <Text style={[styles.sectionActionText, { color: theme.accent }]}>{action}</Text>
        </MotionPressable>
      ) : null}
    </View>
  );
}

export function Metric({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  const { theme } = useSphynx();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: emphasis ? theme.accent : theme.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sourceBadge: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  sourceText: { fontSize: 9, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase" },
  trackRow: { minHeight: 68, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth },
  trackIndex: { width: 30, fontSize: 11, fontWeight: "700", letterSpacing: 0.6, textAlign: "left" },
  trackMain: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 9 },
  trackCopy: { flex: 1, minWidth: 0, gap: 3 },
  trackTitle: { fontSize: 15, lineHeight: 19, fontWeight: "600" },
  trackMeta: { fontSize: 12, lineHeight: 16 },
  trackRight: { flexDirection: "row", alignItems: "center", gap: 5, marginLeft: 8 },
  duration: { fontSize: 11, fontVariant: ["tabular-nums"] },
  moreButton: { width: 32, height: 36, alignItems: "center", justifyContent: "center" },
  miniPlayerShell: { position: "absolute", left: 12, right: 12, bottom: 8, height: 62, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, overflow: "hidden", zIndex: 10, shadowColor: "#000", shadowOpacity: 0.28, shadowRadius: 16, shadowOffset: { width: 0, height: 5 }, elevation: 6 },
  progressTrack: { position: "absolute", top: 0, left: 0, right: 0, height: 2 },
  progressFill: { height: 2 },
  miniTapArea: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10 },
  miniCopy: { flex: 1, minWidth: 0, gap: 2 },
  miniTitle: { fontSize: 13, lineHeight: 16, fontWeight: "700" },
  miniArtist: { fontSize: 11, lineHeight: 14 },
  miniTransport: { width: 42, height: 42, alignItems: "center", justifyContent: "center" },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  eyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 4 },
  sectionTitle: { fontSize: 22, lineHeight: 27, fontWeight: "700", letterSpacing: -0.45 },
  sectionAction: { minHeight: 32, justifyContent: "center", paddingLeft: 12 },
  sectionActionText: { fontSize: 13, fontWeight: "700" },
  metric: { gap: 2 },
  metricValue: { fontSize: 18, lineHeight: 22, fontWeight: "800", letterSpacing: -0.3, fontVariant: ["tabular-nums"] },
  metricLabel: { fontSize: 10, lineHeight: 13, textTransform: "uppercase", letterSpacing: 0.75, fontWeight: "700" },
});
