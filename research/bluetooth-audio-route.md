# Bluetooth Audio-Route Decision

Sphynx will observe the operating system’s active audio route rather than scanning nearby Bluetooth peripherals. On iOS, a small native Expo module can read `AVAudioSession.sharedInstance().currentRoute.outputs`, identify Bluetooth output ports, and observe `AVAudioSession.routeChangeNotification` for connection and disconnection changes. This avoids discovery of unrelated nearby devices and is aligned with the system-selected playback route.

The module will expose a normalized output name and route kind to JavaScript. Sphynx will only auto-select a non-general headphone group where the saved group name clearly matches the system output name. No match, or an unavailable native bridge, leaves the selected group unchanged. The observer must be available only in a custom development build or production build; Expo Go cannot load a project-local native module.

Expo’s Modules API is the appropriate bridge mechanism because it supports Swift and Kotlin native modules within Expo’s architecture. The implementation must ship in a custom development or production build, because Expo Go cannot include this project-local native module.

The verified Expo reference keeps the bridge in `modules/expo-audio-route/`, including `expo-module.config.json`, `index.ts`, `src/`, and platform source folders. Its native API supplies the selected output’s route class and display name through both a query function and an `onAudioRouteChange` event. Sphynx will retain a deliberate no-detection fallback in Expo Go and on web.

Sources:

- Apple: https://developer.apple.com/documentation/avfaudio/responding-to-audio-route-changes
- Expo native route example: https://expo.dev/blog/how-to-add-native-code-to-your-app-with-expo-modules
- Expo Modules API overview: https://docs.expo.dev/modules/overview/
