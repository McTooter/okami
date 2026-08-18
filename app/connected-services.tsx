import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { haptic } from "@/lib/haptics";
import { type ProviderId, useSphynx } from "@/lib/sphynx-store";

const services: { id: ProviderId; name: string; icon: keyof typeof Ionicons.glyphMap; note: string; capability: string }[] = [
  { id: "Sphynx", name: "Okami", icon: "radio-outline", note: "Your first-party and approved playback surface.", capability: "Okami/local eligible playback" },
  { id: "Local", name: "Local", icon: "phone-portrait-outline", note: "Files you have placed on this device.", capability: "Device-local playback" },
  { id: "TIDAL", name: "TIDAL", icon: "layers-outline", note: "Requires approved authorization and provider playback setup.", capability: "Metadata and eligible SDK playback" },
  { id: "YouTube", name: "YouTube", icon: "play-circle-outline", note: "Requires a supported embedded player or provider handoff.", capability: "Discovery and supported handoff" },
];

export default function ConnectedServicesScreen() {
  const router = useRouter();
  const { theme, connected } = useSphynx();
  const active = Object.values(connected).filter(Boolean).length;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerStyle={{ backgroundColor: theme.background }} style={{ backgroundColor: theme.background }}>
      <Stack.Screen options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && styles.pressed]}><Ionicons name="chevron-back" size={22} color={theme.foreground} /></Pressable>
          <Text style={[styles.topTitle, { color: theme.foreground }]}>Connected services</Text>
          <View style={styles.backButton} />
        </View>
        <Text style={[styles.kicker, { color: theme.accent }]}>ACCESS WITH ATTRIBUTION</Text>
        <Text style={[styles.pageTitle, { color: theme.foreground }]}>{active} ready on this device.</Text>
        <Text style={[styles.intro, { color: theme.muted }]}>One listening surface does not erase a provider’s rights, entitlement, player rules, or catalog availability.</Text>

        <View style={[styles.info, { backgroundColor: theme.raised, borderColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={19} color={theme.accent} />
          <Text style={[styles.infoText, { color: theme.muted }]}>This build demonstrates the adapter surfaces. A real third-party connection needs that provider’s approved OAuth/SDK configuration and product credentials.</Text>
        </View>

        <View style={styles.services}>
          {services.map((service) => {
            const isConnected = connected[service.id];
            return (
              <View key={service.id} style={[styles.serviceCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.serviceIcon, { backgroundColor: theme.raised }]}><Ionicons name={service.icon} size={22} color={theme.accent} /></View>
                <View style={styles.serviceCopy}>
                  <View style={styles.serviceNameRow}><Text style={[styles.serviceName, { color: theme.foreground }]}>{service.name}</Text><View style={[styles.stateDot, { backgroundColor: isConnected ? theme.accent : theme.border }]} /></View>
                  <Text style={[styles.serviceNote, { color: theme.muted }]}>{service.note}</Text>
                  <Text style={[styles.capability, { color: theme.accent }]}>{service.capability}</Text>
                </View>
                <View style={[styles.status, { borderColor: isConnected ? theme.accent : theme.border, backgroundColor: isConnected ? theme.accent : theme.raised }]}><Text style={[styles.statusText, { color: isConnected ? theme.accentInk : theme.muted }]}>{isConnected ? "Ready" : "Needs OAuth"}</Text></View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={() => { haptic.selection(); }} style={({ pressed }) => [styles.requestRow, { borderColor: theme.border }, pressed && styles.pressed]}>
          <Ionicons name="add" size={19} color={theme.accent} />
          <Text style={[styles.requestText, { color: theme.foreground }]}>Request a supported provider</Text>
          <Ionicons name="chevron-forward" size={17} color={theme.muted} />
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 34 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 29 },
  backButton: { width: 42, height: 42, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center" },
  topTitle: { fontSize: 14, fontWeight: "800" },
  kicker: { fontSize: 10, fontWeight: "800", letterSpacing: 1.35, marginBottom: 6 },
  pageTitle: { fontSize: 30, lineHeight: 36, fontWeight: "800", letterSpacing: -1.1 },
  intro: { fontSize: 13, lineHeight: 19, marginTop: 10, marginBottom: 18, maxWidth: 355 },
  info: { flexDirection: "row", alignItems: "flex-start", gap: 9, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 13, marginBottom: 17 },
  infoText: { flex: 1, fontSize: 10, lineHeight: 14 },
  services: { gap: 9 },
  serviceCard: { minHeight: 101, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 13, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  serviceIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  serviceCopy: { flex: 1, minWidth: 0 },
  serviceNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  serviceName: { fontSize: 14, fontWeight: "800" },
  stateDot: { width: 7, height: 7, borderRadius: 4 },
  serviceNote: { fontSize: 10, lineHeight: 14, marginTop: 3 },
  capability: { fontSize: 9, lineHeight: 12, fontWeight: "700", marginTop: 5 },
  status: { position: "absolute", top: 13, right: 12, minHeight: 25, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, justifyContent: "center", paddingHorizontal: 8 },
  statusText: { fontSize: 9, fontWeight: "800" },
  requestRow: { minHeight: 53, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 13, marginTop: 15, flexDirection: "row", alignItems: "center", gap: 9 },
  requestText: { flex: 1, fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.68, transform: [{ scale: 0.97 }] },
});
