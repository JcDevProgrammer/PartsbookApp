# PartsBook App

## Overview
An Expo React Native application (PartsBook App) that serves as a parts catalog/book viewer. The app can run on Android, iOS, and web. In this Replit environment, it runs as a web app.

## Architecture
- **Framework**: Expo (SDK 52) with Expo Router for file-based routing
- **Language**: JavaScript/JSX with TypeScript support
- **Navigation**: Expo Router (file-based routing in `app/` directory)
- **State/Forms**: React Hook Form + Yup
- **Backend Integration**: Firebase (via `firebase` and `firebase-admin` packages)
- **HTTP Client**: Axios

## Project Structure
- `app/` - File-based routing screens (Expo Router)
  - `_layout.jsx` - Root layout with Stack navigator
  - `index.jsx` - Entry point → SelectModelScreen
  - `home-screen/` - Home screen
  - `model-list/` - Model listing
  - `select-model/` - Model selection
  - `select-folder/` - Folder selection
  - `pdf-viewer/` - PDF viewing
  - `video-manual/` - Video manual viewer
  - `user-manual/` - User manual
  - `user-setting/` - User settings
  - `language-setting/` - Language settings
  - `information/` - App information
- `src/screens/` - Screen implementations
- `components/` - Shared components
- `constants/` - App constants
- `assets/` - Images, fonts, icons
- `build/` - Pre-built web assets (Firebase hosting)

## Running the App
The app is configured to run on port 5000 using Metro bundler in web mode:
```
RCT_METRO_PORT=5000 npx expo start --web --localhost
```

The `RCT_METRO_PORT` environment variable is required to override Expo's default port (8081).

## Configuration Files
- `app.json` - Expo configuration (name, icons, plugins)
- `babel.config.js` - Babel with expo preset and reanimated plugin
- `firebase.json` - Firebase hosting configuration
- `eas.json` - EAS Build configuration
- `tsconfig.json` - TypeScript configuration

## Notes
- The app has both web and mobile (Android APK included: `app-release.apk`) versions
- Firebase is used for backend services
- The `build/` directory contains pre-built assets for Firebase hosting deployment
