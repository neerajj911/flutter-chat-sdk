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
        ├── publish-sdk.yml           # Auto: push to main → build → npm publish
        ├── manual-release.yml        # Manual: choose patch/minor/major
        └── pr-validation.yml         # PR guard: analyze + test + build AAR
```

---

## How to Use the SDK (3rd-party developer)

```bash
npm install react-native-flutter-chat
```

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

## CI/CD — Automated Pipeline

| Trigger | Workflow | What it does |
|---|---|---|
| Push to `main` (Flutter files changed) | `publish-sdk.yml` | Builds AAR → copies to SDK → bumps patch → publishes npm |
| Manual via GitHub Actions UI | `manual-release.yml` | Same, but you choose patch / minor / major |
| Pull Request to `main` | `pr-validation.yml` | Analyze + test + build check, posts PR comment |

### One-time setup
1. Add `NPM_TOKEN` secret (npmjs.com → Access Tokens → Automation type)
2. Add `GH_PAT` secret (GitHub → Settings → Developer Settings → PAT classic → `repo` + `workflow`)
3. Settings → Actions → General → enable **Read and write permissions**

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
