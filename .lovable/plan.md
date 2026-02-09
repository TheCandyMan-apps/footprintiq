

# iOS App Build Setup with Apple Developer Account

## Overview
Configure your Apple Developer account credentials so the existing GitHub Actions pipeline can build your iOS app automatically -- no Mac required after initial setup.

## Step-by-step Guide

### Step 1: Get your Apple Team ID
1. Log in to [developer.apple.com](https://developer.apple.com)
2. Go to **Account** > **Membership Details**
3. Copy your **Team ID** (a 10-character string like `ABC1234DEF`)

### Step 2: Create an App ID
1. In the Developer portal, go to **Certificates, Identifiers & Profiles**
2. Click **Identifiers** > **+** button
3. Select **App IDs** > **App**
4. Set Bundle ID to: `com.footprintiq.app` (must match your Capacitor config)
5. Set Description to: `FootprintIQ`
6. Register it

### Step 3: Create a Distribution Certificate
This step requires a Mac (or cloud Mac like MacinCloud for ~$1/hour):

1. Open **Keychain Access** on the Mac
2. Go to **Keychain Access** > **Certificate Assistant** > **Request a Certificate from a Certificate Authority**
3. Enter your email, select **Saved to disk**, click Continue
4. This creates a `.certSigningRequest` file
5. In the Apple Developer portal, go to **Certificates** > **+**
6. Select **Apple Distribution**, upload the `.certSigningRequest`
7. Download the `.cer` file and double-click to install it in Keychain
8. In Keychain Access, find the certificate, right-click > **Export** as `.p12` file
9. Set a password for the `.p12` file (this becomes your `P12_PASSWORD`)

### Step 4: Create a Provisioning Profile
1. In the Developer portal, go to **Profiles** > **+**
2. Select **App Store Connect** (under Distribution)
3. Select your App ID (`com.footprintiq.app`)
4. Select your Distribution Certificate
5. Name it `FootprintIQ Distribution` (must match `exportOptions.plist`)
6. Download the `.mobileprovision` file

### Step 5: Base64-encode the files
On the Mac (or any terminal with base64):

```text
base64 -i your_certificate.p12 | pbcopy
```
Save this output -- it's your `BUILD_CERTIFICATE_BASE64`.

```text
base64 -i your_profile.mobileprovision | pbcopy
```
Save this output -- it's your `BUILD_PROVISION_PROFILE_BASE64`.

On Windows (PowerShell), if you transferred the files:
```text
[Convert]::ToBase64String([IO.File]::ReadAllBytes("your_certificate.p12"))
[Convert]::ToBase64String([IO.File]::ReadAllBytes("your_profile.mobileprovision"))
```

### Step 6: Add GitHub Secrets
In your GitHub repo, go to **Settings** > **Secrets and variables** > **Actions** and add these 5 secrets:

| Secret Name | Value |
|---|---|
| `APPLE_TEAM_ID` | Your 10-character Team ID from Step 1 |
| `BUILD_CERTIFICATE_BASE64` | Base64-encoded `.p12` file from Step 5 |
| `P12_PASSWORD` | The password you set when exporting the `.p12` |
| `BUILD_PROVISION_PROFILE_BASE64` | Base64-encoded `.mobileprovision` from Step 5 |
| `KEYCHAIN_PASSWORD` | Any strong password (used temporarily during build) |

### Step 7: Trigger the Build
Either:
- Push a version tag: `git tag v1.0.0 && git push --tags`
- Or go to **Actions** tab in GitHub and manually trigger the workflow

The build will produce an IPA file as a downloadable artifact.

### Step 8: Upload to App Store Connect
1. Download the IPA from GitHub Actions artifacts
2. Use **Transporter** app (available on Mac, or use altool via the cloud Mac) to upload to App Store Connect
3. Complete the App Store listing in [appstoreconnect.apple.com](https://appstoreconnect.apple.com)

## Mac Access Requirement
The only step that strictly requires a Mac is Step 3 (creating the signing certificate). Options:
- **MacinCloud** (~$1/hour, pay-as-you-go)
- **MacStadium** (hourly cloud Macs)
- **GitHub Codespaces with macOS** (if available)
- Borrow a friend's Mac for 10 minutes

Once the certificate is created, everything else can be done from Windows.

## Technical Notes
- The `capacitor.config.ts` currently has `appId: 'com.footprintiq.app'` which matches the workflow
- The `exportOptions.plist` is already configured for App Store distribution with manual signing
- The GitHub Actions workflow uses `macos-latest` runners which include Xcode
- The workflow builds the web app, syncs Capacitor, and produces an IPA automatically

