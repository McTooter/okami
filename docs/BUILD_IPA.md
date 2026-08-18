# Package an Okami IPA

The repository includes a GitHub Actions workflow at `.github/workflows/package-ios-ipa.yml`. It validates the source, asks Expo Application Services (EAS) to create an **iOS internal-distribution build**, downloads the resulting IPA, and publishes it as the `okami-ios-ipa` workflow artifact.

## One-time setup

Before the first automated run, initialize the project and iOS credentials from a local terminal with an Expo account that belongs to the app owner:

```sh
pnpm install --frozen-lockfile
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform ios --profile preview
```

This one-time interactive build establishes the EAS project ID and the iOS signing setup required for later non-interactive CI runs. EAS documents this initialization as a prerequisite for CI builds. [1]
Then create a GitHub Actions repository secret named `EXPO_TOKEN` using an Expo personal access token. Do not commit that token, Apple certificates, provisioning profiles, or private keys to the repository. [1] [3]

## Triggering and retrieving the IPA

Run **Actions → Package Okami iOS IPA → Run workflow**, or push a version tag such as `v1.0.0`. When the workflow completes, download the `okami-ios-ipa` artifact from that run. The profile in `eas.json` is an internal-distribution profile, so an iPhone install requires the Apple signing method supported by the account. For ad hoc distribution, the target device’s UDID must be registered before the build. [2]
| Build configuration | Value |
| --------------------- | --------------------------------------- |
| Workflow | `.github/workflows/package-ios-ipa.yml` |
| EAS profile | `preview` |
| Distribution | Internal |
| GitHub secret | `EXPO_TOKEN` |
| Downloadable artifact | `okami-ios-ipa` |
| Artifact retention | 14 days |

## References

[1]: https://docs.expo.dev/build/building-on-ci/ "Expo: Trigger builds from CI"
[2]: https://docs.expo.dev/build/internal-distribution/ "Expo: Internal distribution"
[3]: https://github.com/expo/expo-github-action "expo/expo-github-action"
