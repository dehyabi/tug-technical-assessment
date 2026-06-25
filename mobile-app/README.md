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

## Features
- Browse active wellness packages
- Pull-to-refresh
- Category badges with color coding
- Price and duration display

## Notes
- Update `src/services/api.ts` baseURL to match your backend IP if not running on localhost
- For physical devices, use your machine's local IP address instead of `localhost`
