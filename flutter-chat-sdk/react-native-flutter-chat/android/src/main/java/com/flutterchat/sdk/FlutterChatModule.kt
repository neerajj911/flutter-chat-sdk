package com.flutterchat.sdk

import android.content.Intent
import com.facebook.react.bridge.*

class FlutterChatModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "FlutterChatModule"

    @ReactMethod
    fun openChat(options: ReadableMap) {
        val id    = options.getString("id")    ?: ""
        val name  = options.getString("name")  ?: ""
        val email = options.getString("email") ?: ""

        val activity = currentActivity ?: return

        val intent = FlutterChatActivity.createIntent(
            context = activity,
            userId  = id,
            name    = name,
            email   = email,
        )

        activity.startActivity(intent)
    }
}
