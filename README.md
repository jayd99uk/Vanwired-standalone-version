# Van Wired

A Vite + React app built with Capacitor for Android.

## Running the app

```bash
npm install
npm run dev
```

## Building for Google Play Store

### Prerequisites
- Node.js
- JDK 21 (Eclipse Temurin 21 recommended)
- Android SDK
- Keystore file at `android/app/upload-keystore.jks`

### Steps

1. **Bump the version** in `android/app/build.gradle`:
   ```gradle
   versionCode 3        // increment by 1 each release
   versionName "1.2"    // human-readable version
   ```

2. **Build and sync:**
   ```bash
   npm run build
   npx cap sync android
   ```

3. **Generate signed AAB:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   > If Java isn't in your PATH, set it first:
   > `export JAVA_HOME="/c/Program Files/Eclipse Adoptium/jdk-21.0.9.10-hotspot" && export PATH="$JAVA_HOME/bin:$PATH"`

4. **Copy output to builds folder:**
   ```bash
   mkdir -p builds/v1.2-versionCode3
   cp android/app/build/outputs/bundle/release/app-release.aab builds/v1.2-versionCode3/vanwired-v1.2-release.aab
   ```

5. **Upload** `builds/v1.2-versionCode3/vanwired-v1.2-release.aab` to Google Play Console.

## Build History

| Version | versionCode | File |
|---------|-------------|------|
| 1.0     | 1           | (uploaded from Ubuntu - internal testing) |
| 1.1     | 2           | builds/v1.1-versionCode2/vanwired-v1.1-release.aab |

## Keystore

- Location: `android/app/upload-keystore.jks`
- Backup: OneDrive Desktop
- Alias: `upload`
- App ID: `com.vanwired.app`
