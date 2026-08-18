# Okami iOS Testing Without Paid Apple Membership

Research date: 2026-08-18.

## Verified findings

Apple allows a free Apple Account to create an Xcode **Personal Team**. A Personal Team can sign and install an app for testing on the account holder’s own devices, but it is not an app-distribution entitlement. Apple currently limits this path to ten App IDs, three registered devices, and three installed apps per device; the related provisioning profiles expire after seven days, so the app must be rebuilt and reinstalled periodically. [1]
Apple’s membership comparison page distinguishes this personal on-device testing from distribution: App Store, TestFlight, ad hoc, and custom distribution belong to the paid Apple Developer Program. Apple lists the program at 99 USD per membership year, subject to local currency and eligible fee waivers. [2]
Expo’s EAS internal-distribution documentation confirms that iOS internal builds use ad hoc or enterprise provisioning. Ad hoc distribution requires a paid Apple Developer account, registered device UDIDs, and a provisioning profile containing an allow-list of those devices. An IPA can be technically packaged without a paid membership only as an unsigned artifact, but it cannot be installed on a normal iPhone; a free Personal Team is a local Xcode signing/testing path rather than a GitHub Actions or EAS distribution path. [3]

## Practical Okami paths

| Goal                                              | Free Apple Account sufficient? | What is needed                                                                                                  |
| ------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Test Okami on the owner’s own iPhone              | Yes                            | A Mac with Xcode, the owner’s Apple Account enabled as a Personal Team, and periodic re-signing/reinstallation. |
| Obtain a downloadable IPA that installs on iPhone | No                             | Paid Apple Developer Program membership and ad hoc, enterprise, or TestFlight signing.                          |
| Produce an archive or unsigned IPA-shaped file    | Potentially                    | A macOS Xcode environment, but the result is not installable on a standard iPhone.                              |

## References

[1] Apple, [Developer account overview](https://developer.apple.com/help/account/basics/about-your-developer-account/).
[2] Apple, [Choosing a Membership](https://developer.apple.com/support/compare-memberships/).
[3] Expo, [Internal distribution](https://docs.expo.dev/build/internal-distribution/).
