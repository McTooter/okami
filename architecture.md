# Sphynx — Product and Provider Architecture

## Intent

Sphynx presents a single listening surface over the music a person is authorized to access. It is not a catalog-ripping layer, a subscription bypass, or a replacement for provider licensing. The app’s value is its player, library organization, sound controls, visual personalization, and a provider adapter model that can be expanded only where an approved SDK or API permits it.

> **Principle:** Sphynx can unify discovery and control, but playback rights remain with the connected service and the user’s entitlement.

## Provider model

| Adapter responsibility | Sphynx responsibility | Provider responsibility |
|---|---|---|
| **Identity and authorization** | Initiate approved account connection and show the resulting scope clearly. | Authenticate the user and grant only the scopes supported by its SDK or API. |
| **Catalog and library metadata** | Normalize titles, artists, artwork, IDs, and source labels into Sphynx search and library views. | Supply permitted metadata and user-library data. |
| **Playback** | Surface transport UI, queue intent, and audio mode compatible with the adapter. | Deliver playback only through the provider’s permitted player/SDK and enforce entitlement, territory, and content rules. |
| **Availability state** | Communicate whether an item is playable, preview-only, missing, or requires connection. | Determine actual availability and playback quality. |

Each `Track` is modeled with a source-aware identity. The UI always shows a source badge and never suggests that an unsupported source is locally hosted or universally playable.

```ts
type ProviderId = "sphynx" | "tidal" | "youtube" | "local";

type PlaybackCapability =
  | "full-authorized"
  | "preview"
  | "external-handoff"
  | "unavailable";

interface UnifiedTrack {
  id: string;
  provider: ProviderId;
  providerItemId: string;
  title: string;
  artist: string;
  album?: string;
  artwork: string;
  durationSeconds?: number;
  capability: PlaybackCapability;
}

interface ProviderAdapter {
  provider: ProviderId;
  connectionState: "disconnected" | "connecting" | "connected" | "limited";
  search(query: string): Promise<UnifiedTrack[]>;
  getLibrary(): Promise<UnifiedTrack[]>;
  play(track: UnifiedTrack): Promise<void>;
  pause(): Promise<void>;
  seek(seconds: number): Promise<void>;
}
```

## Current integration envelope

| Service | What can be designed now | Production path | Boundary Sphynx must honor |
|---|---|---|---|
| **TIDAL** | Service connection flow, searchable catalog metadata surfaces, source badges, and preview-aware player states. | Register an app, use TIDAL authorization, its API for permitted metadata, and its official iOS Player SDK where available. | TIDAL documents its official Player module as the permitted third-party playback method and describes third-party playback as previews in its public overview. [1] |
| **YouTube** | Discovery/result surfaces, a source-aware handoff state, and web-compatible embedded-playback affordances. | Use the supported Google/YouTube API and embedded player facilities within their platform requirements. | The documented IFrame Player API is an embedded video player controlled via JavaScript; it does not equate to unrestricted audio-catalog access. [2] |
| **Sphynx catalog** | First-party or explicitly licensed tracks, public-domain audio, approved previews, and user-owned/local media. | Maintain documented content rights and server-side catalog metadata. | The product must not label a demo library as an unlimited commercial catalog. |
| **Future providers** | A generic connection and capability state; no deceptive inactive controls. | Add adapters only after SDK, rights, and product review. | A source must be connected and authorized before Sphynx promises its music to the user. |

## Audio implementation strategy

The first Sphynx build uses the local player abstraction to demonstrate verified interface behavior, including transport state, seek state, volume, an EQ control model, gain safety feedback, queue operations, crossfade preference, and persisted sound presets. Native `expo-audio` supports standard playback control and exposes a device-level audio player; full DSP, DRM playback, and provider-specific audio behavior must be layered through supported native SDKs rather than simulated by the UI. [3]

The Sound Lab’s five-band EQ and preamp controls are clearly categorized as **Sphynx playback preferences**. The UI must distinguish between an effective setting applied to an eligible Sphynx/local stream, a setting being passed to a compliant native engine, and a provider source that cannot accept the adjustment. High-gain values show a safety state; audio volume and dB labels never imply increased file quality or lossless conversion.

## Research-driven interface decisions

Sphynx uses four labeled top-level tabs and retains navigation visibility to preserve context, matching Apple’s tab-bar guidance. The mini-player behaves as a persistent playback accessory, which aligns with Apple’s current iOS tab-bar pattern. [4] Queue and light adjustment panels use a scoped sheet; expanded Now Playing and Theme Atelier use a full-screen presentation because their tasks are prolonged and visual. [5] Themes keep contrast and state cues independent of color, with Dynamic Type, VoiceOver labels, and minimum control spacing in mind. [6]

## References

[1] [TIDAL API / SDK overview](https://developer.tidal.com/documentation/api-sdk/api-sdk-overview)

[2] [YouTube IFrame Player API reference](https://developers.google.com/youtube/iframe_api_reference)

[3] [Expo Audio documentation](https://docs.expo.dev/versions/latest/sdk/audio/)

[4] [Apple Human Interface Guidelines — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)

[5] [Apple Human Interface Guidelines — Sheets](https://developer.apple.com/design/human-interface-guidelines/sheets)

[6] [Apple Human Interface Guidelines — Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
