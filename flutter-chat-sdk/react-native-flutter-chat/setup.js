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

// ── 2. gradle-wrapper.properties — enforce minimum Gradle version ────────────

// React Native 0.76+ / AGP 8.7+ requires Gradle 8.13 minimum.
// Always set this unconditionally — do NOT rely on local cache detection.
const MIN_GRADLE_VERSION = '8.13';
const MIN_GRADLE_URL = `https\\://services.gradle.org/distributions/gradle-${MIN_GRADLE_VERSION}-bin.zip`;

function parseGradleVersion(url) {
  const m = url.match(/gradle-(\d+\.\d+(?:\.\d+)?)-/);
  return m ? m[1].split('.').map(Number) : [0];
}

function isVersionLt(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff < 0;
  }
  return false;
}

function fixGradleWrapper() {
  const file = path.join(ANDROID, 'gradle', 'wrapper', 'gradle-wrapper.properties');
  if (!fileExists(file)) { skip('gradle-wrapper.properties'); return; }

  let content = read(file);
  const currentMatch = content.match(/distributionUrl=(.+)/);
  const currentUrl   = currentMatch ? currentMatch[1].trim() : '';
  const currentVer   = parseGradleVersion(currentUrl);
  const minVer       = parseGradleVersion(MIN_GRADLE_URL);

  if (!isVersionLt(currentVer, minVer)) {
    ok(`gradle-wrapper.properties — Gradle already >= ${MIN_GRADLE_VERSION}`);
    return;
  }

  const updated = content.replace(/distributionUrl=.+/, MIN_GRADLE_URL);
  write(file, updated);
  ok(`gradle-wrapper.properties — Gradle updated to ${MIN_GRADLE_VERSION}`);
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

  // Remove enableJetifier — not needed for RN 0.71+ (fully AndroidX); enabling it
  // causes Jetifier to process all AARs including large RN ones, leading to Java heap OOM.
  if (/^android\.enableJetifier\s*=.*/m.test(content)) {
    content = content.replace(/^android\.enableJetifier\s*=.*\n?/m, '');
    changed = true;
  }

  // Ensure JVM heap is sufficient for Gradle transforms (Flutter AAR + RN AARs can be large)
  ensure('org.gradle.jvmargs', '-Xmx4096m -XX:MaxMetaspaceSize=512m');

  // Remove newArchEnabled if present — unsupported in RN 0.82+ (new arch is always on)
  // The SDK bridge works via the legacy interop layer automatically
  if (/^newArchEnabled\s*=.*/m.test(content)) {
    content = content.replace(/^newArchEnabled\s*=.*\n?/m, '');
    changed = true;
  }

  if (!changed) { ok('android/gradle.properties — flags already correct'); return; }
  write(file, content);
  ok('android/gradle.properties — useAndroidX set, enableJetifier removed, JVM heap set to 4096m, newArchEnabled removed');
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
