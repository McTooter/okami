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

## Motion and interactive-visual system

The visual signature is a **listening field**: a contained, touch-responsive depth stage that sits behind the active album artwork in Now Playing. It uses three deliberately restrained layers — a radial field, a small constellation of signal marks, and a shallow parallax card — rather than unrelated gradients or a full-screen animated backdrop. Pressing and dragging inside the stage shifts the perspective by a small, bounded amount; playback adds a slow, low-amplitude lift to the signal marks. The field is descriptive, not diagnostic, and never claims to visualize the waveform or underlying audio data.

| Interaction surface | Behavior | Motion contract |
|---|---|---|
| **Library now-playing card** | Establishes the artwork as the anchor before the full player opens. | A single entrance fade and a breathing active indicator while playback is active. No looping card motion. |
| **Now Playing listening field** | Gives album art depth and a controllable visual response. | Direct-touch tilt stays below 4 degrees. Releasing returns smoothly to rest. Playback drift stays within 2–4 pixels. |
| **Transport and seek controls** | Acknowledge intent without delaying playback. | 80–160 ms press compression, haptic confirmation, and brief active-state emphasis. |
| **Sound Lab** | Clarifies dense professional controls. | Small staged reveals on entry and short transitions between inactive, available, and processing states. |
| **Reduced-motion mode** | Preserves hierarchy for people who want less movement. | Disables continuous drift and depth transforms; uses brief opacity changes only. |

The implementation combines **Reanimated transforms**, a sparse SVG signal composition, and a small native **Skia Runtime Shader**. The shader is limited to the listening field, uses only a few uniforms, and remains low contrast so that it supports material depth instead of becoming a decorative full-screen effect. The web preview retains the SVG atmosphere rather than loading CanvasKit for one contained visual treatment.

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

## Playback continuity and Theme Studio

Sphynx treats the active artwork as a persistent object. Opening **Now Playing** from the Mini Player launches an app-owned artwork overlay that begins in the Mini Player’s measured bounds, then resolves into the Listening Field artwork shell once that screen is laid out. It is intentionally not an experimental navigator-level shared-element transition. This keeps the gesture interruptible, allows an opacity-only fallback for Reduced Motion, and avoids known tab-navigation limitations.

The **Queue Sheet** is a focused bottom sheet rather than a new feed. It exposes the current sequence, visible source provenance, a drag handle that starts reordering on long press, auto-scroll at the sheet edge, and separate move-up/move-down buttons so the operation remains available with assistive technology. Moving a row changes what will play next, but does not interrupt or replace the active track.

The new **Theme Studio** is a fifth tab. It changes an independent **app material** layer, not the user’s base theme, library, provider connections, DSP preferences, or playback queue. Base palette and accessibility comfort controls remain in Theme Atelier. Theme Studio initially exposes two original variants that are informed by the research’s broad interaction principles without copying a game interface.

| App material | Original visual vocabulary | Functional changes | Motion contract |
|---|---|---|---|
| **Noir Pulse** | Soot, bone-white type, a vermilion cue rail, and tightly bounded orbital detail. | Raises selected states, queue drag affordance, tab cue, and Listening Field contrast. | A 160 ms directional cue on selection; no idle theatrics outside playback. |
| **Sunlit Signal** | Warm paper, amber light, muted indigo metadata, and a broadcast-card edge. | Softens sheet framing, secondary labels, route chips, and the Listening Field bloom. | A 220 ms card reveal; ambient drift stays below 4 pixels. |

> These are original Sphynx materials. They deliberately avoid protected game names, characters, typefaces, screen layouts, music, or artwork.

## Original kinetic material refinements

The material system now applies to navigation and editorial surfaces as well as playback. **Noir Pulse** uses vermilion cue marks, offset cutout panels, compact uppercase metadata, and a short lateral snap for priority actions. **Sunlit Signal** uses amber channel markers, indigo echo bars, open panel corners, and a gentle upward drift for section entry. These modes are authored as Sphynx visual directions: they are not reproductions of any third-party game interface.

| Material | Application chrome | Entry behavior | Reduced-motion alternative |
|---|---|---|---|
| **Noir Pulse** | Squared tab framing, cutout editorial panels, and a high-contrast cue rail. | A 220–300 ms lateral settle for active sections and selection changes. | A 120 ms opacity transition with no lateral transform. |
| **Sunlit Signal** | Softer broadcast-card edges, amber channel stamps, and indigo signal echoes. | A 260–340 ms upward settle with a short opacity dissolve. | A 150 ms opacity transition with no vertical transform. |

Both materials retain existing contrast, touch-target, queue, and playback rules. The visual variant changes the application’s material and motion character; it never changes a user’s music access, provider entitlement, or DSP configuration.

## Dynamic interface requirement

Sphynx primary controls are not static. Each press has a clear down state, a short settled state, and an active-state distinction. Motion must clarify control ownership and result; it must not delay playback, cover content, or simulate physical interaction where none exists.

| Surface | Direct interaction | Persistent or active motion | Material variation |
|---|---|---|---|
| **Primary button / transport** | 92 ms depth compression, cue-color lift, and light haptic feedback. | Play and pause crossfade their symbols; active controls retain a cue rail. | Noir Pulse resolves laterally; Sunlit Signal resolves upward. |
| **Cards and rows** | 96 ms opacity and 0.985-scale response. | A selected row receives a short material-colored edge sweep. | Noir uses a cutout edge; Sunlit uses a soft channel stamp. |
| **Tabs and filters** | 110 ms icon/text scale response with a moving active indicator. | The active destination has an animated cue marker, not a static tint alone. | Noir uses a sharp marker; Sunlit uses a rounded broadcast marker. |
| **Panels and sheets** | Controls lift independently; the panel itself does not bounce. | Sections enter once, then remain still until user input or playback state changes. | Noir enters from the side; Sunlit enters from below. |

Reduced Motion preserves all state changes through 100–150 ms opacity and color transitions, while removing transforms, continuous drift, and indicator travel.

## Album motion and Listening Identity

Album motion begins from the complete static cover, then adds a contained **cover atmosphere**: a translucent gradient wash, an offset signal frame, and one material-tuned parallax plane. Playback is the only trigger for continuous movement; pausing settles the cover into its composed static frame. Library thumbnails receive a one-time card reveal and selected-track cue, Mini Player receives a small active halo, and Now Playing receives the full cover atmosphere behind the existing Listening Field. The system never replaces an album cover with unrelated media, flashing, or fabricated artist imagery.

Sphynx’s profile system is an original **Listening Identity** model. It is local to the app and separates taste and queue continuity, not music-service authorization, billing, or account permissions. The Profile screen foregrounds the active identity, offers compact choices for switching, and shows concrete listening context so people understand what will carry forward.

| Surface | Primary behavior | Motion and continuity |
|---|---|---|
| **Animated cover** | Preserves the deterministic album art as its first and resting frame. | The atmosphere begins after the frame is established; it fades and settles when motion is reduced or playback pauses. |
| **Listening Identity rail** | Lets the listener choose a local identity such as “Sora,” “Night Transit,” or “Guest Session.” | Selection lifts the chosen tile and updates the persistent identity marker; no launch-blocking chooser is shown. |
| **Taste cards** | Give a transparent, small summary of current mood, saved sources, and active sound context. | Cards enter with a single material-specific offset and remain still until an identity changes. |
| **Continuity control** | Makes it explicit whether the active queue follows the selected identity. | The state change has a concise cue sweep and haptic response, never a destructive reset without confirmation. |

The profile direction is influenced only by the high-level streaming pattern of clear, compact identity selection and personalized continuity. It does not use Netflix marks, avatar styles, copy, account models, or layouts.

## Editable identities and continuation rail

Identity editing stays local, immediate, and reversible. The active identity exposes a compact inline name field and a row of six high-contrast color swatches; the selected swatch changes the monogram and selected-identity cue without altering the app-wide Theme or Material. Input accepts a concise display name, normalizes whitespace, and falls back to the identity’s original name if left blank. There is no account-sign-up or hidden persistence boundary.

The **Continue listening** rail is horizontal, card-led, and identity-specific. It draws from the existing queue order for the selected identity, exposes the current track with an active progress cue, and allows direct playback. Its horizontal movement is user driven through native scrolling; cards have a compact press response on touch and a subtle hover lift on pointer-capable platforms. A selected card uses a material-colored cue edge, with Noir Pulse resolving laterally and Sunlit Signal resolving upward through a soft broadcast stamp. The rail uses a single entrance sequence and never auto-scrolls, cycles, or competes with playback.

| Interaction | Standard motion | Reduced-motion behavior |
|---|---|---|
| **Identity name / color edit** | 120 ms cue change and selected-card lift. | Color and opacity state change only. |
| **Continuation card press** | 92 ms depth response; material directional travel; immediate playback. | 100 ms opacity response; immediate playback. |
| **Pointer hover** | 140 ms 1.02-scale and 2-point lift on the specific card only. | Cue-color change only. |
| **Rail entrance** | Short staggered horizontal reveal, then static. | One opacity reveal; no horizontal offset. |

The two material variants use original visual rules: Noir Pulse emphasizes decisive cutout markers and lateral cues, while Sunlit Signal uses warm, softly rounded broadcast stamps and upward resolution. No third-party names, layouts, visual assets, or animation sequences are reproduced.
