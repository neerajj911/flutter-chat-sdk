/**
 * User data passed to the Flutter chat screen.
 */
export interface ChatUser {
  /** Unique user identifier from your backend */
  id: string;
  /** Display name shown in the chat header */
  name: string;
  /** User email address */
  email: string;
}

/**
 * Optional configuration for the chat session.
 */
export interface ChatConfig {
  /** Custom title shown in the chat app bar. Defaults to "Chat Support" */
  title?: string;
}

/**
 * Combined options passed to openFlutterChat()
 */
export type OpenChatOptions = ChatUser & ChatConfig;
