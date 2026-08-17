# Advanced Audio Capability Mapping

Sphynx will use Neutron Music Player only as a **public capability reference**. The Sphynx interface, preset taxonomy, state model, and implementation will remain original.

| Publicly documented capability | Sphynx approach | Delivery boundary |
| --- | --- | --- |
| 4–60 band parametric equalizer; graphic presets | Add an original parametric band model alongside the existing five-band graphic control, with editable frequency, Q, gain, bypass, and device-scoped presets. | State and UI are feasible now; live DSP requires a native processor. |
| Loudness, frequency-response correction, surround, crossfeed, compressor, limiter, time alignment | Add device-scoped control models, guarded values, presets, and truthful active/preview states for loudness, balance, crossfeed, spatial width, compressor, and timing. | Expo Audio does not expose a configurable DSP graph; live processing requires a custom native audio engine. |
| Pitch, tempo, gain normalization, ReplayGain, crossfade, phase inversion | Expand Sphynx’s playback preferences and preset/export schema with speed, pitch lock, normalization mode, balance, phase, crossfade curve, and level protection. | Platform player support is limited; metadata-aware loudness and sample processing require native decoding/DSP. |
| Bit-perfect, high-resolution output, resampling, DSD, direct DAC output, oversampling, dither | Surface no fake controls. Document as a future native-engine layer. | Not deliverable through the current Expo Audio player. |
| Spectrum/RMS analysis | Add an original visual monitoring configuration only after an audio-sample analysis path exists. | Requires access to PCM frames from a native audio pipeline. |

Neutron states that its high-resolution and extended DSP capabilities rely on its own custom audio engine rather than basic operating-system media APIs. Sphynx therefore must not claim bit-perfect, DSD, oversampling, arbitrary high-rate processing, or live parametric DSP until an equivalent native engine is implemented.

## Sources

1. Neutron Music Player, “Advanced sound and DSP”: https://neutroncode.com/player
2. Neutron Music Player, “Hi-Res Audio”: https://neutroncode.com/feature_hi-res-audio
