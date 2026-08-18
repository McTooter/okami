# Okami iOS Testing Without Paid Apple Membership

Research date: 2026-08-18.

## Verified findings

Apple allows a free Apple Account to create an Xcode **Personal Team**. A Personal Team can sign and install an app for testing on the account holder’s own devices, but it is not an app-distribution entitlement. Apple currently limits this path to ten App IDs, three registered devices, and three installed apps per device; the related provisioning profiles expire after seven days, so the app must be rebuilt and reinstalled periodically. [1]
Apple’s membership comparison page distinguishes this personal on-device testing from distribution: App Store, TestFlight, ad hoc, and custom distribution belong to the paid Apple Developer Program. Apple lists the program at 99 USD per membership year, subject to local currency and eligible fee waivers. [2]
Expo’s EAS internal-distribution documentation confirms that iOS internal builds use ad hoc or enterprise provisioning. Ad hoc distribution requires a paid Apple Developer account, registered device UDIDs, and a provisioning profile containing an allow-list of those devices. An IPA can be technically packaged without a paid membership only as an unsigned artifact, but it cannot be installed on a normal iPhone through the normal distribution path; a free Personal Team is a local Xcode signing/testing path rather than a GitHub Actions or EAS distribution path. [3]
SideStore provides a distinct personal-device sideloading path: it re-signs apps with the user’s personal development certificate and refreshes them during their normal seven-day development period. Its documentation says user apps should not require modification, but a free Apple Account is limited to three installed apps (including SideStore) and ten App IDs per week. The initial SideStore installation requires a computer, an Apple Account, Wi-Fi, LocalDevVPN, and a supported device. [4] [5]

## Practical Okami paths

| Goal                                              | Free Apple Account sufficient? | What is needed                                                                                                                     |
| ------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Test Okami on the owner’s own iPhone              | Yes                            | A Mac with Xcode, the owner’s Apple Account enabled as a Personal Team, and periodic re-signing/reinstallation.                    |
| Obtain a downloadable IPA that installs on iPhone | Yes, with SideStore            | A SideStore-compatible IPA artifact, SideStore installed and refreshed with the user’s Apple Account, and its free-account limits. |
| Produce an archive or unsigned IPA-shaped file    | Potentially                    | A macOS Xcode environment. SideStore can apply the required personal-device signing during sideloading.                            |

## References

[1] Apple, [Developer account overview](https://developer.apple.com/help/account/basics/about-your-developer-account/).
[2] Apple, [Choosing a Membership](https://developer.apple.com/support/compare-memberships/).
[3] Expo, [Internal distribution](https://docs.expo.dev/build/internal-distribution/).
[4] SideStore, [Frequently Asked Questions](https://docs.sidestore.io/docs/faq).
[5] SideStore, [Prerequisites](https://docs.sidestore.io/docs/installation/prerequisites).
