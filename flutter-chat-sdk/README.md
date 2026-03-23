# flutter-chat-sdk

Monorepo containing the Flutter chat UI module, the React Native SDK that wraps it, a demo RN app, and the CI/CD pipeline that publishes everything automatically.

---

## Folder Structure

```
flutter-chat-sdk/
│
├── flutter_chat_module/              # Flutter module — chat UI source
│   ├── lib/
│   │   ├── main.dart                 # Entry point, boots Flutter app
│   │   ├── models/
│   │   │   └── chat_user.dart        # ChatUser & ChatMessage models
│   │   ├── screens/
│   │   │   └── chat_screen.dart      # Full chat UI screen
│   │   ├── services/
│   │   │   └── platform_channel.dart # MethodChannel ↔ Kotlin bridge
│   │   └── widgets/
│   │       ├── message_bubble.dart   # Chat bubble widget
│   │       └── message_input.dart    # Text input + send button
│   └── pubspec.yaml
│
├── react-native-flutter-chat/        # npm package (the SDK)
│   ├── src/
│   │   ├── index.ts                  # openFlutterChat() — public API
│   │   └── types/
│   │       └── index.ts              # TypeScript types
│   ├── android/
│   │   ├── src/main/
│   │   │   ├── java/com/flutterchat/sdk/
│   │   │   │   ├── FlutterChatModule.kt    # RN NativeModule bridge
│   │   │   │   ├── FlutterChatActivity.kt  # Boots Flutter engine
│   │   │   │   └── FlutterChatPackage.kt   # Registers the module
│   │   │   ├── res/values/styles.xml
│   │   │   └── AndroidManifest.xml         # Declares FlutterChatActivity
│   │   ├── libs/                           # AARs land here (built by CI)
│   │   └── build.gradle
│   └── package.json
│
├── RNDemoApp/                        # React Native test & demo app
│   ├── src/screens/
│   │   └── HomeScreen.tsx            # Demo screen with "Open Chat" button
│   ├── android/
│   │   ├── app/src/main/
│   │   │   ├── java/com/rndemoapp/
│   │   │   │   ├── MainApplication.kt    # Registers FlutterChatPackage
│   │   │   │   └── MainActivity.kt
│   │   │   ├── res/values/
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle
│   │   └── settings.gradle
│   ├── index.js
│   ├── metro.config.js               # Watches local SDK for live reload
│   └── package.json
│
└── .github/
    └── workflows/
        ├── publish-sdk.yml           # Manual: enter version tag → build AAR → GitHub Release
        └── pr-validation.yml         # PR guard: analyze + test + build AAR
```

---

## How to Use the SDK (3rd-party developer)

### Install

```bash
# npm  (replace YOUR_GITHUB_USERNAME and the version tag)
npm install github:YOUR_GITHUB_USERNAME/flutter-chat-sdk/react-native-flutter-chat#v1.0.15

# yarn
yarn add github:YOUR_GITHUB_USERNAME/flutter-chat-sdk#v1.0.15
```

Or pin a specific version in your `package.json`:

```json
"dependencies": {
  "react-native-flutter-chat": "github:YOUR_GITHUB_USERNAME/flutter-chat-sdk#v1.0.15"
}
```

Then run `npm install` (or `yarn`). The `postinstall` script patches your Android project automatically.

### Upgrade to a newer version

Change the tag in your `package.json` to the new version (e.g. `#v1.1.0`) and run `npm install` again.

### Usage

```ts
import { openFlutterChat } from 'react-native-flutter-chat';

openFlutterChat({
  id: 'usr_001',
  name: 'John Doe',
  email: 'john@example.com',
});
```

---

## Local Development

### 1. Build the Flutter AAR manually
```bash
cd flutter_chat_module
flutter pub get
flutter build aar --no-profile --no-debug
```

### 2. Copy AARs to SDK
```bash
cp -r flutter_chat_module/build/host/outputs/repo \
  react-native-flutter-chat/android/libs/flutter_repo
```

### 3. Run the Demo App
```bash
cd RNDemoApp
npm install
npx react-native run-android
```

---

## Releasing a New Version

Versioning is **manual** — you control exactly when and what version gets released.

1. Make your code changes and push to `main`.
2. Go to **GitHub → Actions → Release SDK → Run workflow**.
3. Enter the version tag (e.g. `v1.2.0`) and optional release notes.
4. CI will:
   - Build the Flutter AAR
   - Copy it into `react-native-flutter-chat/android/libs/`
   - Update `version` in `package.json` to match
   - Commit the built artifacts back to `main`
   - Create and push the git tag
   - Create a GitHub Release with copy-paste install instructions
5. Consumers update their dependency tag to get the new version.

> **Tip:** Follow [Semantic Versioning](https://semver.org/) — `v<major>.<minor>.<patch>`.

---

## CI/CD

| Workflow | Trigger | What it does |
|---|---|---|
| `publish-sdk.yml` | Manual (Actions UI) | Build AAR → commit → tag → GitHub Release |
| `pr-validation.yml` | Pull Request to `main` | Flutter analyze + test + AAR build check |

### One-time setup
1. Add `GH_PAT` secret (GitHub → Settings → Developer Settings → PAT classic → `repo` + `workflow`)
2. Settings → Actions → General → enable **Read and write permissions**

> No NPM_TOKEN needed — the SDK is distributed via GitHub only.

---

## Data Flow

```
RN: openFlutterChat({ id, name, email })
        ↓
Kotlin: FlutterChatModule.openChat()
        ↓
Kotlin: FlutterChatActivity launches
        ↓
Flutter engine boots
        ↓
Flutter: PlatformChannel.signalReady()  →  invokeMethod('flutterReady')
        ↓
Kotlin: receives 'flutterReady'  →  sends invokeMethod('initData', { id, name, email })
        ↓
Flutter: receives initData  →  setState()  →  ChatScreen renders
        ↓
User sees chat. Presses back  →  returns to RN
```
