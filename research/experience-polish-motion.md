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
