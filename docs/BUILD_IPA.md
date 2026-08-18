# Packaging an Okami IPA for SideStore

The repository’s **Package Okami SideStore IPA** GitHub Actions workflow creates an unsigned, device-targeted IPA artifact. It does not use EAS, Apple certificates, provisioning profiles, or repository secrets. The intended installation path is SideStore, which applies the user’s personal development signing on their own device.[1]

> The artifact is not an ad hoc, TestFlight, or App Store build. Do not expect iOS to install it directly from Files. Import it into SideStore instead.

## Prerequisites

Before using the artifact, install and refresh SideStore on the target device. SideStore’s official prerequisites require an Apple Account, Wi-Fi, LocalDevVPN, a supported iOS/iPadOS device, and a computer for the initial SideStore installation.[2] A free Apple Account is limited to three active apps including SideStore and ten App IDs per week; SideStore refreshes personal-signing apps during their seven-day development period.[1]

## Build and install

Run **Actions → Package Okami SideStore IPA → Run workflow**, or push a version tag such as `v1.0.0`. When the workflow completes, download the `okami-sidestore-unsigned-ipa` artifact and extract `okami-sidestore-unsigned.ipa` from GitHub’s download archive. Then open that IPA with SideStore through the iOS share sheet or its import interface. With LocalDevVPN connected, SideStore re-signs and installs the app using the Apple Account configured in SideStore.[1] [2]

| Build configuration   | Value                                   |
| --------------------- | --------------------------------------- |
| Workflow              | `.github/workflows/package-ios-ipa.yml` |
| Runner                | `macos-15`                              |
| Build type            | Unsigned device IPA                     |
| GitHub secrets        | None                                    |
| Downloadable artifact | `okami-sidestore-unsigned-ipa`          |
| Artifact retention    | 14 days                                 |
| Installation method   | Import into SideStore                   |

## What the workflow does

The workflow validates the project, runs Expo prebuild for iOS, builds the generated device app with code signing disabled, wraps that app in the standard `Payload/Okami.app` IPA structure, and uploads the result as a GitHub Actions artifact. SideStore’s own signing process remains responsible for making it installable on the personal device.

## References

[1]: https://docs.sidestore.io/docs/faq "SideStore: Frequently Asked Questions"
[2]: https://docs.sidestore.io/docs/installation/prerequisites "SideStore: Prerequisites"
