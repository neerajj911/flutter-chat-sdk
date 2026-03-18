package com.flutterchat.sdk

import android.content.Intent
import com.facebook.react.bridge.*
import io.flutter.embedding.android.FlutterActivity

class FlutterChatModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "FlutterChatModule"

    @ReactMethod
    fun openChat(options: ReadableMap) {
        val id    = options.getString("id")    ?: ""
        val name  = options.getString("name")  ?: ""
        val email = options.getString("email") ?: ""

        val activity = currentActivity ?: run {
            reactContext.emitEvent("FlutterChatError", "No current activity found")
            return
        }

        val intent = FlutterChatActivity.createIntent(
            context = activity,
            userId  = id,
            name    = name,
            email   = email,
        )

        activity.startActivity(intent)
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private fun ReactContext.emitEvent(name: String, message: String) {
        getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(name, message)
    }
}
