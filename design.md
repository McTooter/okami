# Sphynx — iOS Interface Design Plan

## Product stance

Sphynx is a listening instrument rather than a generic content feed. Its interface should feel composed, dimensional, and calm: dark mineral surfaces, dense but legible type, sharp artwork, and hardware-like audio controls. The product avoids oversized greeting copy, random gradient blobs, pseudo-editorial cards, and novelty motion. Every screen prioritizes immediate music control, purposeful discovery, and a strong sense of an owned library.

The iPhone experience is designed for portrait, one-handed use. Primary actions sit in the lower half of the display or in the persistent mini-player. The tab bar is deliberately quiet; the now-playing screen provides the visual signature while the rest of the app stays structurally disciplined.

## Screen list

| Screen | Primary content and functionality | Layout direction |
|---|---|---|
| **Library** | Pinned mixes, recent plays, downloaded music, saved albums, artists, playlists, and service collections. | Editorial grid with small, information-rich rows; a segmented scope control keeps the library navigable without a dashboard-card aesthetic. |
| **Discover** | New releases, curated rooms, scenes, long-form mixes, and provider-aware recommendations. | A limited number of art-led modules on a near-black canvas; horizontal rails never exceed two visible rows. |
| **Search** | Unified search across the user library, connected providers, and the Sphynx catalog. | Large focused search field, source filters, fast results with explicit provider provenance, and zero distraction. |
| **Now Playing** | Album art, track metadata, seek control, transport, queue access, lyrics entry, output selection, favorite, and contextual actions. | Full-height immersive screen with a single artwork focal point and tactile lower-half controls. |
| **Queue** | Current track, upcoming sequence, drag ordering, remove, play-next, and source labels. | Bottom sheet with clear hierarchy, dense rows, and no hidden playback state. |
| **Sound Lab** | Five-band EQ, preamp, bass enhancement, gain safety notice, spatial balance, crossfade, mono mode, and preset management. | Instrument-panel styling: measured labels, segmented controls, slim sliders, explicit dB values, and undoable changes. |
| **Theme Atelier** | Curated base themes, live preview, artwork tint policy, typography scale, contrast, motion intensity, and saved theme sets. | A controlled customization studio rather than an infinite color picker; every combination is checked for contrast and legibility. |
| **Connected Services** | Connect, refresh, disable, and explain provider scope for YouTube, TIDAL, and future lawful integrations. | Transparent account states; Sphynx never obscures the source or implies access that a connected service does not authorize. |
| **Album / Playlist / Artist Detail** | Art, source badge, metadata, play / shuffle, save, download state, track list, credits, and related listening. | Typography-led detail header followed by highly scannable track rows. |
| **Settings** | Audio behavior, downloads, connectivity, appearance, accessibility, and privacy. | Native iOS-style grouped settings with direct descriptions of consequential controls. |

## Key user flows

| Goal | Flow |
|---|---|
| **Play saved music** | User opens **Library** → selects album or playlist → taps the lower-half **Play** control → mini-player appears → user swipes the mini-player up to **Now Playing**. |
| **Find music across services** | User opens **Search** → enters artist, song, or album → filters or inspects source badges → taps an authorized result → playback begins through the connected provider or Sphynx catalog. |
| **Tune sound without losing playback context** | User opens **Now Playing** → taps **Sound Lab** → adjusts EQ or preamp → hears the change immediately → taps **Save as preset** or exits, retaining the active settings. |
| **Create a personal visual mode** | User opens **Theme Atelier** → selects a base material theme → adjusts accent, type scale, artwork treatment, and motion → previews on representative listening screens → saves the theme set. |
| **Manage what plays next** | User swipes up on the mini-player or taps queue from **Now Playing** → reorders or removes tracks → returns to playback without interrupting audio. |
| **Connect a provider responsibly** | User opens **Connected Services** → selects a service → completes authorized connection → sees what catalog and playback capabilities are available → uses explicit service badges across the app. |

## Navigation and interaction

The main tab bar uses four destinations: **Library**, **Discover**, **Search**, and **Profile**. The mini-player sits above it whenever music is active. **Now Playing**, **Queue**, **Sound Lab**, and **Theme Atelier** are presented as intentional full-screen or sheet-based modes so playback context remains continuous.

Tap targets use a minimum 44-point footprint. Primary controls use brief opacity/scale feedback and sparing haptics. Motion is functional: artwork expands toward Now Playing, the queue rises from its source control, and theme changes dissolve rather than theatrically animate. Motion can be reduced independently of the system setting from Theme Atelier.

## Color and material system

The default visual language is **Obsidian + Signal Lime**, inspired by a precise studio device rather than a neon gaming interface. Light is used as an accent, not a background texture.

| Token | Value | Role |
|---|---|---|
| **Obsidian** | `#0A0B0D` | Main background; dense, low-reflection base. |
| **Basalt** | `#15171B` | Raised surfaces, sheets, and the mini-player. |
| **Graphite** | `#22262C` | Hairline separators and inactive controls. |
| **Porcelain** | `#F1F3F4` | Primary text and high-priority iconography. |
| **Mist** | `#9CA4AD` | Secondary labels, durations, and provenance. |
| **Signal Lime** | `#CAFF4A` | Active playback, selected controls, and focused accents. |
| **Cobalt Room** | `#7895FF` | Optional alternate theme accent for spatial and discovery contexts. |
| **Heat** | `#FF664F` | Deliberate warning and high-gain state only. |

Artwork is never blurred behind text by default. It appears as an asset with a restrained shadow and can influence small accent elements only when contrast checks pass. Theme Atelier offers generated combinations through constrained material, type, and accent controls; it does not expose unbounded choices that degrade readability or product coherence.

## Typography and visual rhythm

Sphynx uses the iOS system typography stack for responsive accessibility, with **SF Pro Display** behavior for titles and **SF Pro Text** behavior for functional rows. Titles are compact and assertive rather than oversized. Mono-styled numerical treatment is reserved for timecode, dB values, and source identifiers to make Sound Lab feel precise. Spacing follows a four-point rhythm; intentional high-contrast negative space separates sections instead of decorative containers.

## Audio controls and safety

Sound Lab exposes music controls that can be represented accurately on-device: five EQ bands, a transparent preamp gain control, limiter toggle, crossfade, mono playback, and saved presets. Any increase in output gain is labeled in dB, visually marked after safe headroom, and paired with a limiter option. The app must not claim to create lossless quality, bypass provider controls, or provide tracks outside the permissions granted by the connected provider.

## Implementation quality bar

Each screen must earn its visual complexity through a usable task. No screen will use filler recommendations, fake statistics, generic welcome statements, stock-profile avatars, rounded-card mosaics, decorative graphs, or ungrounded premium claims. Content states must be honest: disconnected services explain the next action, unavailable data is labeled as unavailable, and controls affecting audio give immediate, readable feedback.
