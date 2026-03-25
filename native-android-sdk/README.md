# Flutter Chat SDK — Native Android (Kotlin)

A thin Kotlin wrapper around the Flutter Chat module that lets you embed a Flutter-powered chat UI in any native Android app — **no Flutter SDK required on the consumer side**.

## Architecture

```
┌────────────────────────┐
│   Your Kotlin App      │ ← calls FlutterChatSDK.openChat()
├────────────────────────┤
│   native-android-sdk   │ ← Kotlin API + FlutterChatActivity
├────────────────────────┤
│   flutter_chat_module  │ ← Flutter UI (compiled to AAR)
├────────────────────────┤
│   Flutter Engine        │ ← from storage.googleapis.com
└────────────────────────┘
```

## Installation

### From GitHub Pages Maven (recommended — no token, no credentials)

**1. Add to your root `build.gradle`:**

```groovy
allprojects {
    repositories {
        google()
        mavenCentral()
        // Flutter Chat SDK — public, no authentication needed
        maven { url "https://neerajj911.github.io/flutter-chat-sdk/maven" }
    }
}
```

**2. Add the dependency** in your app's `build.gradle`:

```groovy
dependencies {
    implementation 'com.flutterchat:chat-sdk:1.0.0'
}
```

That's it. No GitHub token. No credentials. Any consumer just adds the URL and the dependency.

## Usage

### Open the chat

```kotlin
import com.flutterchat.sdk.ChatUser
import com.flutterchat.sdk.FlutterChatSDK

// Create a user
val user = ChatUser(
    id    = "user_123",
    name  = "Jane Doe",
    email = "jane@example.com",
)

// Open the Flutter chat screen
FlutterChatSDK.openChat(context = this, user = user)
```

### Listen for events (optional)

```kotlin
import com.flutterchat.sdk.FlutterChatCallback

FlutterChatSDK.setCallback(object : FlutterChatCallback {
    override fun onChatEvent(event: String, data: Map<String, Any>?) {
        Log.d("Chat", "Event: $event, data: $data")
    }

    override fun onChatClosed() {
        Log.d("Chat", "Chat was closed")
    }
})
```

## API Reference

| Class / Object | Description |
|---|---|
| `FlutterChatSDK` | Singleton entry point. Call `openChat()` and `setCallback()`. |
| `ChatUser` | Data class: `id`, `name`, `email`. |
| `FlutterChatCallback` | Interface with `onChatEvent()` and `onChatClosed()`. |
| `FlutterChatActivity` | Internal — the Activity hosting the Flutter engine. Declared in the SDK manifest; merged automatically. |

## Publishing (for SDK maintainers)

### One-time setup
1. Go to your repo on GitHub → **Settings → Pages**
2. Set Source to **"Deploy from a branch"**, branch: **`gh-pages`**, folder: **`/ (root)`**
3. Create the `gh-pages` branch if it doesn't exist:
   ```bash
   git checkout --orphan gh-pages
   git commit --allow-empty -m "init gh-pages"
   git push origin gh-pages
   git checkout main
   ```

### Releasing a new version
1. Go to **GitHub → Actions → "Publish Native Android SDK" → Run workflow**
2. Enter version (e.g. `1.2.0`) — no `v` prefix
3. CI builds the Flutter AAR, publishes to `gh-pages/maven/`, creates a tag and GitHub Release
4. The Maven URL is live at `https://YOUR_USERNAME.github.io/flutter-chat-sdk/maven`

**No AAR files are committed to git. Everything is built and published in CI.**

## Local Development

To develop the SDK and demo app together:

1. Build the Flutter AAR locally:
   ```bash
   cd flutter_chat_module
   flutter build aar --no-profile --no-debug --build-number 1
   ```

2. Copy the AAR repo:
   ```bash
   cp -r flutter_chat_module/build/host/outputs/repo native-android-sdk/sdk/libs/flutter_repo
   ```

3. Open `KotlinDemoApp/` in Android Studio — it references the SDK via `project(':sdk')`.
