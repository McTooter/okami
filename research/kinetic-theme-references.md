# Kinetic Theme Reference Study — Original Sphynx Translation

## Boundary

Public discussion of Persona 5 and Persona 4 is used only for general interaction principles. Sphynx will not reproduce characters, graphics, logos, typefaces, sound, artwork, names, layouts, or other expressive source elements. The original Sphynx directions are **Noir Pulse** and **Sunlit Signal**.

## Transferable principles

| Principle | Original Sphynx implementation |
|---|---|
| Constrained contrast can unify a complex interface. | Noir Pulse uses soot, parchment, and vermilion; Sunlit Signal uses warm ivory, amber, and muted indigo. |
| Directional geometry can guide attention. | One original diagonal cue rail connects Mini Player, Now Playing, and Queue without copying a reference layout. |
| Background motion should be slower than direct manipulation. | Listening Field drift remains slower than transport, tab, and reorder feedback; Reduced Motion removes continuous drift. |
| Material framing can distinguish a theme. | Theme selection changes Sphynx materials, selection treatment, and Listening Field appearance without changing music, providers, or audio settings. |

## Theme direction

| Theme | Material | Listening Field | Motion |
|---|---|---|---|
| **Noir Pulse** | Soot, off-white labels, vermilion cue rail, fine grain. | Dark radial field with a tight red orbital accent. | One 160 ms cue-slash transition; otherwise calm. |
| **Sunlit Signal** | Warm ivory, mustard amber, muted indigo metadata, paper grain. | Soft amber bloom with wider low-contrast marks. | 220 ms broadcast-card reveal and a single metadata tick. |

## Guardrails

The shared artwork transition must be interruptible, preserve VoiceOver focus, and become opacity-only when Reduced Motion is active. Queue reordering retains a visible drag handle, announces a changed position, and never changes the playing track just because a row moves.

## Implementation decision

Reanimated’s cross-screen shared-element transitions are marked experimental and have native-stack, tab-navigation, modal, and web limitations. [4] Sphynx will instead create an **app-owned shared artwork illusion**: both Mini Player and Now Playing retain their normal artwork, while a temporary overlay artwork animates between measured source and destination bounds. It can be interrupted, reduced to an opacity transition, and falls back safely on web.

For queue reordering, the verified `react-native-draggable-flatlist` API is built on the project’s existing Reanimated and Gesture Handler stack, returns the updated list in `onDragEnd`, and supports drag handles, autoscroll, and active-row decorators. [5] The Sphynx sheet will additionally offer explicit Move Up and Move Down actions for assistive technologies; React Native documents labels, hints, state, modal isolation, and value announcements for this purpose. [6]

## References

[1] Jiaxin Wen, [The UI Design of Persona 5](https://jiaxinwen.wordpress.com/2017/04/27/the-ui-design-of-persona-5/).

[2] Kinga Olszewska, [Interface so good that people make cosplay of it — Persona 5 UI](https://medium.com/@kinga.olszewska/interface-so-good-that-people-make-cosplay-of-it-persona-5-ui-controversial-yet-brilliant-ac1ec4b95229).

[3] Game UI Database, [Persona 4](https://www.gameuidatabase.com/gameData.php?id=595).

[4] React Native Reanimated, [Shared Element Transitions](https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview/).

[5] computerjazz, [React Native Draggable FlatList](https://github.com/computerjazz/react-native-draggable-flatlist).

[6] React Native, [Accessibility](https://reactnative.dev/docs/next/accessibility).
