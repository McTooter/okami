# Noir Pulse — Kinetic Navigation Research Notes

## Purpose

This note translates **publicly discussed interface principles** from the user’s reference style into an original Okami navigation system. It is not a recreation plan: Okami will not use third-party characters, artwork, wording, layouts, typefaces, iconography, or screen-by-screen choreography.

## Transferable principles

| Publicly discussed principle | Original Okami application |
| --- | --- |
| A small, high-contrast palette can make a menu feel assertive while retaining clear hierarchy. [1] [2] | Noir Pulse uses only signal red, ink black, paper white, and the existing lime playback cue; lime remains functional rather than decorative. |
| A directional line can guide the eye through an otherwise asymmetric composition. [1] [2] | A fine white seam will enter after the main field and point toward the active navigation destination. It will not frame every element. |
| Foreground interaction should move faster than background texture, so depth does not compete with controls. [1] | The active menu marker and seam complete within 480 ms; the red field settles over 640 ms; haze moves slowly after the transition. |
| Motion works best when it establishes a relationship between the current and next information state. [1] [3] | Every tab change keeps the existing screen visible beneath one diagonal cut sweep, then clears it once the new destination is legible. |
| Expressive typography should be limited to stable, recognizable labels; variable content should stay in a readable sans-serif. [3] | Okami retains its readable system type for track data and uses scale, casing, spacing, and edge alignment—not novelty fonts—for character. |

## Original Okami choreography

The sequence has four deliberately bounded beats. **First**, a red field arrives at low opacity, giving the next state a tonal home. **Second**, an ink-black diagonal panel crosses quickly, creating the directional cut. **Third**, a narrow paper-white seam resolves through the panel and over-travels slightly before leaving the frame. **Last**, the temporary dark veil clears, revealing the destination only after its directional cue is established.

The persistent Library state remains sparse: one feature item, one rotation shelf, and one queue index. The dock behaves like a navigation index rather than a row of floating pills. Reduced-motion mode never performs the full sweep; it retains a stationary red field and a single white active edge.

## Explicit exclusions

Okami does **not** borrow protected characters, silhouettes, text fragments, specific menu arrangements, decorative motifs, or logo language. The reference informs only abstract principles: contrast, gaze direction, temporal layering, and hierarchy.

## References

[1] [Jiaxin Wen, “The UI Design of Persona 5”](https://jiaxinwen.wordpress.com/2017/04/27/the-ui-design-of-persona-5/)

[2] [Persona Central, “Panel on the Concept and Development Behind Persona 5’s UI”](https://personacentral.com/persona-5-panel-concept-development-ui/)

[3] [Kinga Olszewska, “Interface so good that people make cosplay of it — Persona 5 UI”](https://medium.com/@kinga.olszewska/interface-so-good-that-people-make-cosplay-of-it-persona-5-ui-controversial-yet-brilliant-ac1ec4b95229)
