# IPA Workflow Notes

Okami's GitHub Actions workflow will trigger an Expo Application Services (EAS) iOS internal-distribution build rather than attempting to compile or sign an IPA directly on the GitHub runner. Expo documents that non-interactive CI builds require an `EXPO_TOKEN`, an initialized EAS project with a `projectId`, build profiles in `eas.json`, and pre-existing iOS credentials. For iOS internal distribution, the selected profile must set `distribution` to `internal`; the resulting IPA uses ad hoc or enterprise provisioning and ad hoc installations are limited to registered device UDIDs. [1] [2]

The workflow will use the maintained `expo/expo-github-action` to install EAS CLI and run `eas build --platform ios --profile preview --non-interactive --no-wait`. It deliberately reads the Expo token from the GitHub `EXPO_TOKEN` secret rather than committing any credential. [1] [3]

## References

[1]: https://docs.expo.dev/build/building-on-ci/ "Expo: Trigger builds from CI"
[2]: https://docs.expo.dev/build/internal-distribution/ "Expo: Internal distribution"
[3]: https://github.com/expo/expo-github-action "expo/expo-github-action"
