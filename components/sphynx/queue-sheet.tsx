import { Ionicons } from "@expo/vector-icons";
import DraggableFlatList, { type RenderItemParams } from "react-native-draggable-flatlist";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";

import { AlbumArt } from "@/components/sphynx/album-art";
import { haptic } from "@/lib/haptics";
import { type Track, useSphynx } from "@/lib/sphynx-store";

type QueueSheetProps = { visible: boolean; onDismiss: () => void };

export function QueueSheet({ visible, onDismiss }: QueueSheetProps) {
  const { currentTrack, material, moveQueueTrack, playTrack, queue, reorderQueue, sound, theme } = useSphynx();
  const cue = material.cue ?? theme.accent;
  const motionReduced = sound.motionReduced;

  const renderItem = ({ item, drag, getIndex, isActive }: RenderItemParams<Track>) => {
    const index = getIndex() ?? 0;
    const isCurrent = item.id === currentTrack.id;
    return (
      <View style={[styles.row, { backgroundColor: isActive ? theme.raised : theme.surface, borderColor: isCurrent ? cue : theme.border }, isActive && styles.activeRow]}>
        <Pressable
          accessibilityLabel={`Play ${item.title}`}
          onPress={() => { haptic.light(); playTrack(item); onDismiss(); }}
          style={styles.trackTap}
        >
          <AlbumArt artwork={item.artwork} size={42} radius={11} />
          <View style={styles.trackCopy}>
            <Text numberOfLines={1} style={[styles.trackTitle, { color: theme.foreground }]}>{item.title}</Text>
            <Text numberOfLines={1} style={[styles.trackMeta, { color: theme.muted }]}>{item.artist} · {item.duration}</Text>
          </View>
        </Pressable>
        <View style={styles.controls}>
          <Pressable accessibilityLabel={`Move ${item.title} up`} disabled={index === 0} onPress={() => moveQueueTrack(item.id, "up")} style={({ pressed }) => [styles.step, index === 0 && styles.disabled, pressed && styles.pressed]}>
            <Ionicons name="chevron-up" size={16} color={theme.muted} />
          </Pressable>
          <Pressable accessibilityLabel={`Move ${item.title} down`} disabled={index === queue.length - 1} onPress={() => moveQueueTrack(item.id, "down")} style={({ pressed }) => [styles.step, index === queue.length - 1 && styles.disabled, pressed && styles.pressed]}>
            <Ionicons name="chevron-down" size={16} color={theme.muted} />
          </Pressable>
          <Pressable accessibilityLabel={`Drag to reorder ${item.title}`} accessibilityHint="Long press, then drag vertically to change the queue order" onLongPress={() => { haptic.medium(); drag(); }} delayLongPress={180} style={({ pressed }) => [styles.dragHandle, pressed && styles.pressed]}>
            <Ionicons name="reorder-three" size={24} color={cue} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View entering={motionReduced ? undefined : FadeIn.duration(160)} style={styles.modal}>
        <Pressable accessibilityLabel="Close queue" onPress={onDismiss} style={styles.backdrop} />
        <Animated.View entering={motionReduced ? undefined : SlideInDown.duration(280)} style={[styles.sheet, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: cue }]}>UP NEXT</Text>
              <Text style={[styles.heading, { color: theme.foreground }]}>Queue · {queue.length}</Text>
            </View>
            <Pressable accessibilityLabel="Close queue" onPress={onDismiss} style={({ pressed }) => [styles.close, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}>
              <Ionicons name="close" size={20} color={theme.foreground} />
            </Pressable>
          </View>
          <Text style={[styles.instruction, { color: theme.muted }]}>Hold the order handle to drag. Step controls are available for precise keyboard and screen-reader reordering.</Text>
          <DraggableFlatList
            data={queue}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            onDragEnd={({ data }) => reorderQueue(data)}
            activationDistance={8}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.52)" },
  sheet: { maxHeight: "78%", borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 0, paddingTop: 14, overflow: "hidden" },
  header: { paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1.35 },
  heading: { marginTop: 4, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
  close: { width: 38, height: 38, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  instruction: { paddingHorizontal: 20, paddingTop: 9, paddingBottom: 12, fontSize: 11, lineHeight: 15 },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 7 },
  row: { minHeight: 65, borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, flexDirection: "row", alignItems: "center", paddingHorizontal: 9, gap: 5 },
  activeRow: { transform: [{ scale: 1.012 }], shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 11, shadowOffset: { width: 0, height: 5 }, elevation: 8 },
  trackTap: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  trackCopy: { flex: 1, minWidth: 0, gap: 3 },
  trackTitle: { fontSize: 13, lineHeight: 17, fontWeight: "800" },
  trackMeta: { fontSize: 10, lineHeight: 13, fontWeight: "600" },
  controls: { flexDirection: "row", alignItems: "center" },
  step: { width: 24, height: 34, alignItems: "center", justifyContent: "center" },
  dragHandle: { width: 32, height: 42, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.25 },
  pressed: { opacity: 0.62, transform: [{ scale: 0.94 }] },
});
