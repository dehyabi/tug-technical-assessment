# Wellness Mobile App

React Native mobile app for browsing wellness packages.

## Setup

```bash
# Install dependencies
npm install

# iOS (requires Xcode)
cd ios && pod install && cd ..
npx react-native run-ios

# Android (requires Android Studio)
npx react-native run-android
```

## Install on Physical Android Device via ADB

### Quick Install Script

The easiest way is using the provided `install.sh` script:

```bash
# Option A: adb reverse (RECOMMENDED — works over USB, any network)
./install.sh reverse

# Option B: Wi-Fi LAN IP (phone & PC must be on same network)
./install.sh wifi

# Option C: Emulator
./install.sh emulator

# Interactive mode (picks from menu)
./install.sh
```

**For most setups (including VMs, different Wi-Fi networks, etc.), use `./install.sh reverse`.**

---

### Manual Steps (if not using the script)

#### Step 1: Build the APK

```bash
cd android
./gradlew assembleDebug
cd ..
```

The APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 2: Install via ADB

```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

#### Step 3: Configure API Connection

Since the app runs on a **physical device**, `10.0.2.2` (emulator alias) will not work.

##### Option A — `adb reverse` (Recommended)

Forward the phone's port 3001 to your computer over USB. This works even if the phone and PC are on **different Wi-Fi networks** (or the PC is a VM).

```bash
# Run this BEFORE opening the app
adb reverse tcp:3001 tcp:3001
```

Then edit `src/services/api.ts` and set:

```ts
const ANDROID_API_URL = 'http://localhost:3001';
```

Rebuild and reinstall:

```bash
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

##### Option B — Wi-Fi LAN IP

Make sure your phone and computer are on the **same Wi-Fi network**.

Find your computer's local IP (Linux/macOS):

```bash
ip addr show | grep "inet " | grep -v "127.0.0.1"
# or
ifconfig | grep "inet " | grep -v "127.0.0.1"
```

Then edit `src/services/api.ts` and set:

```ts
const ANDROID_API_URL = 'http://192.168.1.xxx:3001'; // Replace with your PC's IP
```

Rebuild and reinstall.

### Step 4: Ensure Backend is Accessible

- Make sure the backend is running (`docker-compose up -d` or `npm run start:dev`)
- If using the LAN IP method, verify from your phone's browser: `http://<YOUR_PC_IP>:3001/mobile/packages`
- If that loads, the app should connect too.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Unable to load script" on Android | JS bundle not included in APK | Rebuild with `./gradlew assembleDebug` after setting `debuggableVariants = []` in `android/app/build.gradle` |
| "Network Error" on Android | Device can't reach backend | Use `adb reverse` or check LAN IP / firewall |
| Blank screen / crash | Metro bundler not running or JS bundle missing | Build with `./gradlew assembleDebug` (bundles JS into APK) |
| `ERR_CLEARTEXT_NOT_PERMITTED` | Android 9+ blocks HTTP by default | Already fixed in `AndroidManifest.xml` with `android:usesCleartextTraffic="true"` |

## Features
- Browse active wellness packages
- Pull-to-refresh
- Category badges with color coding
- Price and duration display

## Notes
- The app uses a platform-aware API base URL:
  - **Android emulator**: `http://10.0.2.2:3001` (maps to host machine)
  - **iOS simulator**: `http://localhost:3001`
- **For physical devices**: update `src/services/api.ts` to use your machine's LAN IP (e.g., `http://192.168.1.x:3001`) or use `adb reverse tcp:3001 tcp:3001` with `localhost`
- Ensure the backend is running and accessible from the device/emulator network
- Android 9+ requires `android:usesCleartextTraffic="true"` for HTTP traffic (already configured)
