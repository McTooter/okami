# Sphynx Native DSP Signal Chain

## Decision

Sphynx will use a project-local iOS Expo module backed by `AVAudioEngine` for local-file playback. The signal chain is `AVAudioPlayerNode → AVAudioUnitEQ → AVAudioUnitDynamicsProcessor → mainMixerNode → outputNode`. This keeps parametric equalization and controlled loudness processing inside Apple’s native audio graph rather than simulating the effects in JavaScript.

## Verified platform capability

Apple documents `AVAudioUnitEQ` as a multiband equalizer and exposes a configurable `bands` array plus `globalGain` in decibels. Sphynx will configure five peak bands at 60 Hz, 230 Hz, 910 Hz, 3.6 kHz, and 14 kHz; the existing Sound Lab sliders map to these parameters. The same `globalGain` maps to Sphynx preamp.

`AVAudioPlayerNode` schedules segments from `AVAudioFile`, making it appropriate for imported local tracks. The bridge will expose only private local file paths to native playback. The standard Expo Audio player remains the fallback for Expo Go, Android, web, unsupported formats, or engine start failures.

## Loudness policy

The native dynamic stage is an opt-in loudness contour, not a claim of track-loudness normalization. Sphynx will use conservative threshold, headroom, and output-gain values when the user enables loudness reference. True ReplayGain-style track or album normalization requires trusted per-track loudness metadata and will remain unavailable until an analyzer is added.

## Sources

1. Apple, [AVAudioUnitEQ](https://developer.apple.com/documentation/avfaudio/avaudiouniteq): multiband EQ, configurable bands, and overall gain.
2. Apple, [AVAudioPlayerNode](https://developer.apple.com/documentation/avfaudio/avaudioplayernode): schedules buffers or file segments for playback.
3. Apple, [AVAudioEngine](https://developer.apple.com/documentation/avfaudio/avaudioengine): connected native nodes for audio generation and processing.
4. Expo, [Autolinking](https://docs.expo.dev/modules/autolinking/): a project must configure `expo.autolinking.nativeModulesDir` for Expo Autolinking to discover local modules outside the default module directory.

## Delivery constraint

The native module is compiled into a custom iOS development or production build. It cannot run inside Expo Go.

Sphynx must also point Expo Autolinking to its `modules/` directory and provide a podspec for each project-local iOS module. Without those build declarations, TypeScript can see the bridge but iOS cannot compile or load it.
