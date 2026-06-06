import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { 
  CormorantGaramond_400Regular, 
  CormorantGaramond_400Regular_Italic, 
  CormorantGaramond_700Bold 
} from '@expo-google-fonts/cormorant-garamond';
import { 
  DMSans_400Regular, 
  DMSans_500Medium, 
  DMSans_700Bold 
} from '@expo-google-fonts/dm-sans';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { OnboardingProvider } from '../context/OnboardingContext';
import * as SplashScreen from 'expo-splash-screen';
import { isSupabaseConfigured } from '../lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

// Prevent the native splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'CormorantGaramond-Regular': CormorantGaramond_400Regular,
    'CormorantGaramond-Italic': CormorantGaramond_400Regular_Italic,
    'CormorantGaramond-Bold': CormorantGaramond_700Bold,
    'DMSans-Regular': DMSans_400Regular,
    'DMSans-Medium': DMSans_500Medium,
    'DMSans-Bold': DMSans_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (!isSupabaseConfigured) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontFamily: 'CormorantGaramond-Bold', fontSize: 32, color: '#FF6B6B', textAlign: 'center', marginBottom: 16 }}>
          Supabase Required
        </Text>
        <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 15, color: '#E0E0E0', textAlign: 'center', lineHeight: 22, marginBottom: 24 }} selectable>
          Please configure your Supabase Project URL and Anon Key inside your <Text style={{ fontFamily: 'DMSans-Bold', color: '#C8E6FF' }}>.env</Text> file.
        </Text>
        <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 13, color: '#555555', textAlign: 'center', lineHeight: 18 }} selectable>
          Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to run authentication and profile persistence.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <OnboardingProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="call" />
      </Stack>
    </OnboardingProvider>
  );
}
