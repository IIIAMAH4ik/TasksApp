import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppThemeProvider } from '@/context/appthemecontext';
import OnboardingScreen from '@/screens/OnboardingScreen';
import {
  getLocalOnboardingCompleted,
  saveLocalOnboardingCompleted,
} from '@/services/localfileservice';
import IndexScreen from './index';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  async function loadOnboardingState() {
    try {
      const completed = await getLocalOnboardingCompleted();
      setHasCompletedOnboarding(completed);
    } catch (error) {
      console.log('load onboarding state error:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function completeOnboarding() {
    try {
      await saveLocalOnboardingCompleted(true);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.log('save onboarding state error:', error);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Загружаю планер...</Text>
      </View>
    );
  }

  return (
    <AppThemeProvider>
      {!hasCompletedOnboarding ? (
        <OnboardingScreen onStart={completeOnboarding} />
      ) : (
        <IndexScreen />
      )}
    </AppThemeProvider>
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