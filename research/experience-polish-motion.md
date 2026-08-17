# Sphynx Experience Polish: Motion and Interactive-Visual Direction

## Decision

Sphynx should feel like a **quiet instrument panel**, not a showcase reel. Motion will preserve spatial continuity between interface states, respond directly to touch, and remain secondary to playback control. The new treatment uses Reanimated and SVG primitives for broad platform coverage, with a contained, original pseudo-3D listening visual in Now Playing. A compact native Skia runtime shader adds material depth only inside that field; it is not used as a full-screen generative-art substitute.

## Design principles

| Principle | Sphynx implementation |
| --- | --- |
| Purpose before spectacle | Animate only state changes, track changes, scrubbing feedback, and intentional navigation. Do not decorate every static surface. |
| Direct manipulation | The listening visual responds to the listener’s touch; its tilt is bounded, reversible, and never required to operate playback. |
| Spatial continuity | Album art, metadata, and transport controls share stable anchors while layers fade, scale, and shift subtly between rest and active states. |
| Contained depth | 3D motion stays inside the album-art stage, so the screen retains a stable frame of reference and remains comfortable during long listening sessions. |
| Motion choice | The existing accessibility setting disables continuous drift and collapses transitions to short opacity changes while retaining all state information. |
| Performance policy | Prefer UI-thread shared values and simple transforms. Do not introduce unbounded WebGL, per-frame JavaScript work, or live shader compilation in the primary interaction path. |

## Implementation plan

The Library receives a restrained entrance hierarchy and a breathing active-track indicator. Now Playing becomes the visual anchor: an interactive depth stage behind the artwork, a soundfield constellation that reacts to play state and scrubbing, and measured transport micro-interactions. Sound Lab retains its dense professional controls but gains staged section reveals and clearer active-processing feedback. Scroll-driven effects remain limited to opacity and short parallax offsets, never long-running screen-wide motion.

## Technical choice

React Native Reanimated is already included in the Expo project and supports native UI-thread animation. The approved `@shopify/react-native-skia` package is available in Expo Go and native builds; its runtime-shader documentation highlights pixel-density handling and a heavier GPU composition path. Sphynx therefore confines the shader to one small native Canvas with fixed, low-cost uniforms. The web implementation retains the vector field without loading CanvasKit for the regular preview.

## Sources

1. Apple Human Interface Guidelines, [Motion](https://developer.apple.com/design/human-interface-guidelines/motion). Apple recommends purposeful, optional motion, brief feedback, and gesture-consistent behavior.
2. Expo, [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/). Reanimated is available in Expo Go and is designed for smooth, maintainable native animations.
3. Figma, [Smart animate layers between frames](https://help.figma.com/hc/en-us/articles/360039818874-Smart-animate-layers-between-frames). Matching hierarchy, position, scale, opacity, rotation, and fill support continuous visual transitions.
4. Unicorn Studio, [Overview](https://www.unicorn.studio/docs/). Its canvas combines depth, lighting, distortion, and interaction; Sphynx adapts the principle in a bounded native stage rather than duplicating web-centric effects.
5. React Native Skia, [Runtime Shader](https://shopify.github.io/react-native-skia/docs/image-filters/runtime-shader/). Runtime shaders require pixel-density-aware composition for crisp output.

## Animated album art and profile research

Public music-platform guidance supports a clear constraint: motion artwork must preserve its static first frame, retain focus on the original cover, loop without a visible seam, and avoid frenetic flashing. Sphynx therefore treats animation as a light layer around each deterministic cover—small material glints, bounded parallax, and a slow playback-only pulse—rather than substituting the cover with unrelated video. The static cover remains complete when motion is disabled, paused, or unavailable.

Streaming-profile research reinforces a different principle: switching identity should be deliberate, visible, and one tap away when a person meaningfully separates their listening history. Sphynx will use a local **Listening Identity** model—not an account or entitlement system—with a clear current-identity marker, taste cards derived from the existing library context, and a continuity choice for resuming the active queue. It will not copy Netflix names, profile art, or screen layouts.

| Research finding | Original Sphynx translation |
| --- | --- |
| The first animation frame should represent the static album cover. | `AlbumArt` remains the visual anchor; animated overlays begin after the initial composed state. |
| Music-motion loops should not use frantic flashing or unrelated cuts. | Cover treatments use low-frequency pulse, shallow depth, and contained cue accents. |
| A profile selector prevents mixed personalization when the choice is highly visible. | Listening Identity appears at the top of Profile and exposes its active queue and taste context. |
| A prompt is unnecessary for people who consistently use one identity. | Sphynx keeps the active identity persistent and offers switching from Profile rather than interrupting launch. |

6. Apple Music, [Album Motion Guidelines](https://help.apple.com/itc/albummotionguide/en.lproj/static.html). The guide emphasizes a representative first frame, continuous loop, static-art continuity, and avoidance of frenetic flashing.
7. Spotify for Artists, [Canvas](https://artists.spotify.com/en/canvas). Canvas illustrates the role of short, track-linked visual loops in a Now Playing context.
8. CXL, [Analyzing Netflix Design, UI and UX](https://cxl.com/blog/netflix-design/). The analysis highlights simple personalization choices and a short, visible profile-selection flow.
9. UX Magazine, [How Insight from Netflix Profiles Doubled Our Conversions](https://uxmag.com/articles/how-insight-from-netflix-profiles-doubled-our-conversions). The case study supports clearly exposing profile identity when it affects the user’s experience.
