#!/usr/bin/env node

/**
 * react-native-flutter-chat — postinstall setup
 *
 * Automatically patches the host RN app's Android files.
 * Runs automatically after: npm install react-native-flutter-chat
 *
 * What it does:
 *   1. Fixes sdk.dir backslashes in local.properties
 *   2. Points gradle-wrapper to a cached Gradle version
 *   3. Adds Flutter Maven repos to android/build.gradle (with uri() for Windows)
 *   4. Bumps minSdkVersion to 24 in android/app/build.gradle
 *   5. Adds xmlns:tools + FlutterChatActivity to AndroidManifest.xml
 *   6. Adds :react-native-flutter-chat subproject to android/settings.gradle
 *   7. Ensures android/gradle.properties has useAndroidX, Jetifier, newArch flags
 *
 * FlutterChatPackage registration is handled automatically by React Native autolinking
 * via react-native.config.js — no manual MainApplication.kt changes needed.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

// Find the host app root (3 levels up from node_modules/react-native-flutter-chat/)
const PKG_DIR  = path.resolve(__dirname);
const ROOT     = path.resolve(PKG_DIR, '..', '..');
const ANDROID  = path.join(ROOT, 'android');

const log     = (msg) => console.log(`\x1b[36m[flutter-chat]\x1b[0m ${msg}`);
const ok      = (msg) => console.log(`\x1b[32m[flutter-chat] ✔\x1b[0m  ${msg}`);
const warning = (msg) => console.log(`\x1b[33m[flutter-chat] ⚠\x1b[0m  ${msg}`);
const skip    = (file) => warning(`${file} not found — skipping`);

// ── helpers ──────────────────────────────────────────────────────────────────

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// ── 1. local.properties — fix backslashes ────────────────────────────────────

function fixLocalProperties() {
  const file = path.join(ANDROID, 'local.properties');
  if (!fileExists(file)) { skip('local.properties'); return; }

  let content = read(file);
  const fixed = content.replace(/sdk\.dir=(.+)/g, (_, p) =>
    `sdk.dir=${p.trim().replace(/\\/g, '/')}`
  );

  if (fixed === content) { ok('local.properties already clean'); return; }
  write(file, fixed);
  ok('local.properties — backslashes fixed in sdk.dir');
}

// ── 2. gradle-wrapper.properties — point to cached Gradle ────────────────────

function fixGradleWrapper() {
  const file = path.join(ANDROID, 'gradle', 'wrapper', 'gradle-wrapper.properties');
  if (!fileExists(file)) { skip('gradle-wrapper.properties'); return; }

  // Check which Gradle versions are locally cached
  const distsDir = path.join(os.homedir(), '.gradle', 'wrapper', 'dists');
  let bestVersion = null;

  const preferred = ['gradle-8.6-bin', 'gradle-8.6-all', 'gradle-8.3-all', 'gradle-8.3-bin'];

  if (fileExists(distsDir)) {
    for (const v of preferred) {
      const vDir = path.join(distsDir, v);
      if (fileExists(vDir)) {
        // Check if it's fully downloaded (has a subdir with gradle-wrapper jar)
        const sub = fs.readdirSync(vDir);
        if (sub.length > 0) {
          bestVersion = v;
          break;
        }
      }
    }
  }

  if (!bestVersion) {
    warning('No cached Gradle found — keeping existing wrapper version');
    return;
  }

  const zipType = bestVersion.includes('-all') ? 'all' : 'bin';
  const version = bestVersion.replace('gradle-', '').replace(`-${zipType}`, '');
  const newUrl   = `https\\://services.gradle.org/distributions/gradle-${version}-${zipType}.zip`;

  let content = read(file);
  const updated = content.replace(/distributionUrl=.+/, `distributionUrl=${newUrl}`);

  if (updated === content) { ok('gradle-wrapper.properties already correct'); return; }
  write(file, updated);
  ok(`gradle-wrapper.properties — using cached Gradle ${version}-${zipType}`);
}

// ── 3. android/settings.gradle — add subproject ──────────────────────────────

function fixSettingsGradle() {
  const file = path.join(ANDROID, 'settings.gradle');
  if (!fileExists(file)) { skip('android/settings.gradle'); return; }

  let content = read(file);
  if (content.includes('react-native-flutter-chat')) {
    ok('android/settings.gradle — subproject already included');
    return;
  }

  const block = `
include ':react-native-flutter-chat'
project(':react-native-flutter-chat').projectDir = new File(
    rootProject.projectDir,
    '../node_modules/react-native-flutter-chat/android'
)
`;
  write(file, content + block);
  ok('android/settings.gradle — :react-native-flutter-chat subproject added');
}

// ── 4. android/build.gradle — add Maven repos ────────────────────────────────

function fixRootBuildGradle() {
  const file = path.join(ANDROID, 'build.gradle');
  if (!fileExists(file)) { skip('android/build.gradle'); return; }

  let content = read(file);
  if (content.includes('flutter_repo')) {
    ok('android/build.gradle — Flutter repos already present');
    return;
  }

  // uri() is mandatory on Windows — raw path strings fail as Maven URLs
  const block = `
allprojects {
    repositories {
        google()
        mavenCentral()
        maven {
            url uri("$rootDir/../node_modules/react-native-flutter-chat/android/libs/flutter_repo")
        }
        maven {
            url "https://storage.googleapis.com/download.flutter.io"
        }
    }
}
`;
  write(file, content + block);
  ok('android/build.gradle — Flutter Maven repos added (with uri() for Windows)');
}

// ── 5. android/app/build.gradle — bump minSdkVersion ────────────────────────

function fixAppBuildGradle() {
  const file = path.join(ANDROID, 'app', 'build.gradle');
  if (!fileExists(file)) { skip('android/app/build.gradle'); return; }

  let content = read(file);
  const match = content.match(/minSdkVersion\s*[=:]?\s*(\d+)/);
  if (!match) { warning('minSdkVersion not found in app/build.gradle'); return; }

  const current = parseInt(match[1]);
  if (current >= 24) { ok(`android/app/build.gradle — minSdkVersion already ${current}`); return; }

  const updated = content.replace(
    /minSdkVersion\s*[=:]?\s*\d+/,
    `minSdkVersion = 24`
  );
  write(file, updated);
  ok(`android/app/build.gradle — minSdkVersion bumped ${current} → 24`);
}

// ── 6. AndroidManifest.xml — add tools namespace + FlutterChatActivity ───────

function fixAndroidManifest() {
  const file = path.join(ANDROID, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fileExists(file)) { skip('AndroidManifest.xml'); return; }

  let content = read(file);
  let changed = false;

  // Add xmlns:tools to <manifest> tag
  if (!content.includes('xmlns:tools')) {
    content = content.replace(
      '<manifest ',
      '<manifest xmlns:tools="http://schemas.android.com/tools" '
    );
    changed = true;
  }

  // Add FlutterChatActivity declaration with tools:replace
  if (!content.includes('FlutterChatActivity')) {
    const activityBlock = `
        <activity
            android:name="com.flutterchat.sdk.FlutterChatActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize"
            tools:replace="android:configChanges" />`;

    content = content.replace('</application>', `${activityBlock}\n    </application>`);
    changed = true;
  }

  if (!changed) { ok('AndroidManifest.xml — already patched'); return; }
  write(file, content);
  ok('AndroidManifest.xml — xmlns:tools + FlutterChatActivity added');
}

// ── 7. android/gradle.properties — ensure required flags ────────────────────

function fixGradleProperties() {
  const file = path.join(ANDROID, 'gradle.properties');
  if (!fileExists(file)) { skip('android/gradle.properties'); return; }

  let content = read(file);
  let changed = false;

  // Ensure a key=value pair is present, add or update if not
  function ensure(key, value) {
    const regex = new RegExp(`^${key}\\s*=.*`, 'm');
    if (regex.test(content)) {
      const current = content.match(regex)[0];
      if (current !== `${key}=${value}`) {
        content = content.replace(regex, `${key}=${value}`);
        changed = true;
      }
    } else {
      content += `\n${key}=${value}`;
      changed = true;
    }
  }

  ensure('android.useAndroidX', 'true');
  ensure('android.enableJetifier', 'true');
  ensure('newArchEnabled', 'false');

  if (!changed) { ok('android/gradle.properties — flags already correct'); return; }
  write(file, content);
  ok('android/gradle.properties — useAndroidX, Jetifier, newArchEnabled=false set');
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log('');
log('Setting up react-native-flutter-chat...');
console.log('');

try {
  fixLocalProperties();
  fixGradleWrapper();
  fixSettingsGradle();
  fixRootBuildGradle();
  fixAppBuildGradle();
  fixAndroidManifest();
  fixGradleProperties();

  console.log('');
  console.log('\x1b[32m[flutter-chat] 🎉 Setup complete!\x1b[0m');
  console.log('');
  console.log('  ⚡ All Android files patched automatically.');
  console.log('  ⚡ FlutterChatPackage is registered via React Native autolinking.');
  console.log('  ⚡ Just run: npx react-native run-android');
  console.log('');
} catch (err) {
  console.error('\x1b[31m[flutter-chat] Setup failed:\x1b[0m', err.message);
  process.exit(1);
}
