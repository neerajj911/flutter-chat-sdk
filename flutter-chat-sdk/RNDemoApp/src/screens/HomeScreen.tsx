import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { openFlutterChat } from 'react-native-flutter-chat';

// Demo user — in production this comes from your auth system
const DEMO_USER = {
  id: 'usr_001',
  name: 'John Doe',
  email: 'john@example.com',
};

export default function App() {
  const handleOpenChat = () => {
    try {
      openFlutterChat(DEMO_USER);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Flutter Chat SDK</Text>
        <Text style={styles.subtitle}>React Native Demo App</Text>

        <View style={styles.userCard}>
          <Text style={styles.cardLabel}>Logged in as</Text>
          <Text style={styles.cardName}>{DEMO_USER.name}</Text>
          <Text style={styles.cardEmail}>{DEMO_USER.email}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleOpenChat}>
          <Text style={styles.buttonText}>💬  Open Chat</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0066FF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 40,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  cardEmail: {
    fontSize: 13,
    color: '#666',
  },
  button: {
    backgroundColor: '#0066FF',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
