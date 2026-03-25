package com.flutterchat.sdk

/**
 * Callback interface for receiving events from the Flutter chat UI.
 */
interface FlutterChatCallback {
    /** Called when the Flutter chat sends an event (e.g. "messageSent", "unreadCount"). */
    fun onChatEvent(event: String, data: Map<String, Any>?) {}

    /** Called when the Flutter chat Activity is destroyed. */
    fun onChatClosed() {}
}
