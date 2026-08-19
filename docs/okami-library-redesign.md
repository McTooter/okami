# Okami Library Redesign

## Intent

Replace the existing generic dark music-dashboard appearance with an original **Archive Index** interface. The direction borrows only high-level component principles from the referenced catalog: a clear compositional hierarchy, nested tactile surfaces, and expressive but restrained interaction states.

## Visual system

| Element | Treatment |
| --- | --- |
| Canvas | Near-black graphite background with quiet hairline dividers and warm-paper album fields. |
| Accent | Signal lime is reserved for progress, active navigation, and one decisive playback action. |
| Type | Oversized, tight editorial display type for primary hierarchy; compact uppercase metadata with tabular numerals. |
| Surfaces | One prominent featured composition, one thin import utility row, then a concise collection index. Avoid repeated rounded-card grids. |
| Motion | Brief press compression, active-track pulse, and small entrance offsets; reduced-motion mode keeps all controls functional without transform movement. |

## Library anatomy

1. A profile-aware masthead identifies the active Listening Identity and the size of the saved collection.
2. A **Now Selected** feature tile makes the active song the focal artifact, with large art and direct open-player behavior.
3. A narrow source strip exposes local-file import without competing with the listening surface.
4. A three-item **On Rotation** shelf provides a visual collection cue using actual library tracks.
5. A sharp **Queue Index** lists saved tracks with active-state, duration, and contextual control affordances.

## Command dock

The bottom navigation is a floating five-command dock. Its outer edge sits above the home indicator; a thin signal line marks the active context. The selected destination becomes a compact colored capsule, while inactive destinations remain quiet and legible. This replaces the standard flat tab strip without sacrificing familiar iOS bottom-navigation behavior.
