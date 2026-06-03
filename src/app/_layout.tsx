import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginScreen from '@/screens/LoginScreen';
import IndexScreen from './index';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Проверяю вход...</Text>
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <IndexScreen />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: '#0f0f11',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#aaa6a0',
    fontSize: 14,
  },
});