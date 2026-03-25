package com.flutterchat.sdk

import android.content.Context

/**
 * Main entry point for the Flutter Chat SDK in native Android apps.
 *
 * Usage:
 * ```kotlin
 * // Optional: listen for events from the chat UI
 * FlutterChatSDK.setCallback(object : FlutterChatCallback {
 *     override fun onChatClosed() { /* ... */ }
 * })
 *
 * // Open the chat
 * FlutterChatSDK.openChat(context, ChatUser(id = "1", name = "John", email = "john@example.com"))
 * ```
 */
object FlutterChatSDK {

    private var callback: FlutterChatCallback? = null

    /**
     * Register a callback to receive events from the Flutter chat UI.
     * Set to `null` to remove the callback.
     */
    fun setCallback(callback: FlutterChatCallback?) {
        this.callback = callback
    }

    internal fun getCallback(): FlutterChatCallback? = callback

    /**
     * Launch the Flutter-powered chat screen for the given user.
     *
     * @param context  Android context (Activity or Application).
     * @param user     The user whose chat session to open.
     */
    fun openChat(context: Context, user: ChatUser) {
        val intent = FlutterChatActivity.createIntent(
            context = context,
            userId = user.id,
            name = user.name,
            email = user.email,
        )
        context.startActivity(intent)
    }
}
