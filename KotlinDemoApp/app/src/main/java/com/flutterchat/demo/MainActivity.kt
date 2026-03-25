package com.flutterchat.demo

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.flutterchat.demo.databinding.ActivityMainBinding
import com.flutterchat.sdk.ChatUser
import com.flutterchat.sdk.FlutterChatCallback
import com.flutterchat.sdk.FlutterChatSDK

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Listen for events from the Flutter chat UI
        FlutterChatSDK.setCallback(object : FlutterChatCallback {
            override fun onChatEvent(event: String, data: Map<String, Any>?) {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Chat event: $event", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onChatClosed() {
                runOnUiThread {
                    Toast.makeText(this@MainActivity, "Chat closed", Toast.LENGTH_SHORT).show()
                }
            }
        })

        binding.btnOpenChat.setOnClickListener {
            val name  = binding.editName.text.toString().ifBlank { "Demo User" }
            val email = binding.editEmail.text.toString().ifBlank { "demo@example.com" }

            val user = ChatUser(
                id    = "user_${System.currentTimeMillis()}",
                name  = name,
                email = email,
            )

            FlutterChatSDK.openChat(this, user)
        }
    }
}
