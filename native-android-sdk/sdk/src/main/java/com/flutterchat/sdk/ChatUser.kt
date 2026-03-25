package com.flutterchat.sdk

/**
 * Data class representing a chat user passed from the host app to the Flutter UI.
 */
data class ChatUser(
    val id: String,
    val name: String,
    val email: String,
)
