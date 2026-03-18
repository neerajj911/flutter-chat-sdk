package com.flutterchat.sdk

import android.content.Context
import android.content.Intent
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class FlutterChatActivity : FlutterActivity() {

    private val channelName = "com.flutterchat.sdk/bridge"
    private var channel: MethodChannel? = null

    // User data passed via Intent extras
    private val userId  by lazy { intent.getStringExtra(EXTRA_USER_ID)  ?: "" }
    private val name    by lazy { intent.getStringExtra(EXTRA_NAME)      ?: "" }
    private val email   by lazy { intent.getStringExtra(EXTRA_EMAIL)     ?: "" }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        channel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            channelName,
        )

        channel?.setMethodCallHandler { call, result ->
            when (call.method) {
                // Flutter signals it has mounted and is ready
                "flutterReady" -> {
                    sendInitData()
                    result.success(null)
                }
                // Flutter is sending an event back to RN (future use)
                "rnEvent" -> {
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    /** Push user data into Flutter after it signals ready */
    private fun sendInitData() {
        channel?.invokeMethod(
            "initData",
            mapOf(
                "id"    to userId,
                "name"  to name,
                "email" to email,
            )
        )
    }

    override fun onDestroy() {
        channel = null
        super.onDestroy()
    }

    companion object {
        private const val EXTRA_USER_ID = "EXTRA_USER_ID"
        private const val EXTRA_NAME    = "EXTRA_NAME"
        private const val EXTRA_EMAIL   = "EXTRA_EMAIL"

        fun createIntent(
            context: Context,
            userId: String,
            name: String,
            email: String,
        ): Intent = Intent(context, FlutterChatActivity::class.java).apply {
            putExtra(EXTRA_USER_ID, userId)
            putExtra(EXTRA_NAME,    name)
            putExtra(EXTRA_EMAIL,   email)
        }
    }
}
