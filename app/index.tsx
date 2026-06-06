import React, { useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, ActivityIndicator, DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '../context/OnboardingContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Star {
  id: number;
  top: DimensionValue;
  left: DimensionValue;
  size: number;
  isBlinking: boolean;
}

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, onboardingData, loading } = useOnboarding();

  // Create a blinking animation for a premium atmospheric effect
  const blinkAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1.0,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0.4,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1.0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [blinkAnim, fadeAnim]);

  // Generate sparse stars field once using useMemo to avoid jumping on re-renders
  const stars = useMemo<Star[]>(() => {
    const starArray: Star[] = [];
    for (let i = 0; i < 45; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1; // 1px to 3px
      const isBlinking = Math.random() > 0.4;
      starArray.push({ id: i, top: `${top}%`, left: `${left}%`, size, isBlinking });
    }
    return starArray;
  }, []);

  const handleContinue = () => {
    if (loading) return;

    if (!session) {
      router.push('/auth');
    } else {
      // If signed in, check if profile exists (meaning they completed onboarding)
      const hasProfile = onboardingData.name && onboardingData.dob && onboardingData.zodiacSign;
      if (hasProfile) {
        router.push('/horoscope');
      } else {
        router.push('/onboarding');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Star Field */}
      <View style={StyleSheet.absoluteFill}>
        {stars.map((star) => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.isBlinking ? blinkAnim : 0.6,
              },
            ]}
          />
        ))}
      </View>

      {/* Layered Moon Glow behind the branding */}
      <View style={styles.glowContainer}>
        <View style={[styles.glowRing, { width: 420, height: 420, borderRadius: 210, opacity: 0.02 }]} />
        <View style={[styles.glowRing, { width: 300, height: 300, borderRadius: 150, opacity: 0.04 }]} />
        <View style={[styles.glowRing, { width: 200, height: 200, borderRadius: 100, opacity: 0.06 }]} />
        <View style={[styles.glowRing, { width: 100, height: 100, borderRadius: 50, opacity: 0.09 }]} />
      </View>

      {/* Centered Oria Branding */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Oria</Text>
        <Text style={styles.subtitleText}>YOUR CELESTIAL GUIDE</Text>
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Pressable 
          onPress={handleContinue} 
          style={({ pressed }) => [
            styles.ctaButton,
            pressed && styles.ctaButtonPressed,
            loading && styles.ctaButtonDisabled
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.ctaButtonText}>Continue</Text>
          )}
        </Pressable>

        <Text style={styles.legalText} selectable>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: '#C8E6FF',
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 2,
    marginTop: -40,
  },
  logoText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 72,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 80,
  },
  subtitleText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#777777',
    letterSpacing: 6,
    marginTop: 12,
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 3,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPressed: {
    opacity: 0.95,
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#000000',
  },
  legalText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#555555',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
