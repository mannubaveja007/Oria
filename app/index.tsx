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
  isTwinkling: boolean;
  twinkleIndex: number;
}

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, onboardingData, loading } = useOnboarding();

  // 1. Twinkle animations for 10 selected stars
  const twinkleAnims = useRef(
    Array.from({ length: 10 }, () => new Animated.Value(Math.random() * 0.75 + 0.25))
  ).current;

  // 2. Glow breathing animation
  const glowOpacityAnim = useRef(new Animated.Value(0.12)).current;

  // 3. Logo, Subtitle, and CTA entrance animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(10)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(6)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(12)).current;

  // 4. CTA Scale feedback animation
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start star twinkling loop with safe JS timeouts to avoid Animated.delay quirks
    const timeouts = twinkleAnims.map((anim, idx) => {
      const duration = 1200 + Math.random() * 1200;
      const delay = Math.random() * 2000;
      
      const runTwinkle = () => {
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.25,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1.0,
            duration: duration,
            useNativeDriver: true,
          }),
        ]).start(() => runTwinkle());
      };

      return setTimeout(runTwinkle, delay);
    });

    // Start central moon glow breathing loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacityAnim, {
          toValue: 0.18,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacityAnim, {
          toValue: 0.12,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Trigger sequential entrance in parallel using built-in delay parameters
    // This is 100% reliable with native driver on all React Native platforms
    Animated.parallel([
      // Logo Entrance (Starts immediately)
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(logoTranslateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      // Subtitle Entrance (Starts after 700ms logo + 200ms delay = 900ms)
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 900,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 900,
        useNativeDriver: true,
      }),
      // CTA Entrance (Starts after 900ms + 500ms subtitle + 150ms delay = 1550ms)
      Animated.timing(ctaOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1550,
        useNativeDriver: true,
      }),
      Animated.timing(ctaTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 1550,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [twinkleAnims, glowOpacityAnim, logoOpacity, logoTranslateY, subtitleOpacity, subtitleTranslateY, ctaOpacity, ctaTranslateY]);

  // Generate sparse stars field once
  const stars = useMemo<Star[]>(() => {
    const starArray: Star[] = [];
    let twinkleCount = 0;
    for (let i = 0; i < 45; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      const size = Math.random() * 2 + 1; // 1px to 3px
      const isTwinkling = i < 10;
      const twinkleIndex = isTwinkling ? twinkleCount++ : -1;
      starArray.push({ id: i, top: `${top}%`, left: `${left}%`, size, isTwinkling, twinkleIndex });
    }
    return starArray;
  }, []);

  const handleContinue = () => {
    if (loading) return;

    if (!session) {
      router.push('/auth');
    } else {
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
                opacity: star.isTwinkling ? twinkleAnims[star.twinkleIndex] : (star.id % 2 === 0 ? 0.5 : 0.3),
              },
            ]}
          />
        ))}
      </View>

      {/* Layered Moon Glow behind the branding */}
      <Animated.View style={[styles.glowContainer, { opacity: glowOpacityAnim }]}>
        <View style={[styles.glowRing, { width: 320, height: 320, borderRadius: 160, opacity: 0.15 }]} />
        <View style={[styles.glowRing, { width: 240, height: 240, borderRadius: 120, opacity: 0.25 }]} />
        <View style={[styles.glowRing, { width: 160, height: 160, borderRadius: 80, opacity: 0.35 }]} />
        <View style={[styles.glowRing, { width: 80, height: 80, borderRadius: 40, opacity: 0.50 }]} />
        {/* Large subtle crescent moon behind text */}
        <Text style={styles.crescentGlyph}>☾</Text>
      </Animated.View>

      {/* Centered Oria Branding */}
      <Animated.View style={[
        styles.logoContainer,
        {
          opacity: logoOpacity,
          transform: [{ translateY: logoTranslateY }]
        }
      ]}>
        <Text style={styles.logoText}>Oria</Text>
        
        <Animated.View style={{
          opacity: subtitleOpacity,
          transform: [{ translateY: subtitleTranslateY }],
          alignItems: 'center'
        }}>
          <Text style={styles.subtitleText}>YOUR CELESTIAL GUIDE</Text>
          
          {/* Moon phase indicator */}
          <Text style={styles.moonPhaseText}>🌒   🌓   ●   🌗   🌘</Text>
        </Animated.View>
      </Animated.View>

      {/* Bottom Actions */}
      <Animated.View style={[
        styles.bottomContainer, 
        { 
          paddingBottom: Math.max(insets.bottom, 24),
          opacity: ctaOpacity,
          transform: [{ translateY: ctaTranslateY }]
        }
      ]}>
        <Animated.View style={{ transform: [{ scale: ctaScale }], width: '100%' }}>
          <Pressable 
            onPress={handleContinue} 
            onPressIn={() => {
              Animated.spring(ctaScale, {
                toValue: 0.97,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(ctaScale, {
                toValue: 1.0,
                useNativeDriver: true,
              }).start();
            }}
            style={styles.ctaButton}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.ctaButtonText}>Continue</Text>
            )}
          </Pressable>
        </Animated.View>

        <Text style={styles.legalText} selectable>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </Animated.View>
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
  crescentGlyph: {
    position: 'absolute',
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 140,
    color: '#C8E6FF',
    opacity: 0.05,
    top: -30,
    transform: [{ rotate: '-15deg' }],
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 2,
    marginTop: -80,
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
  moonPhaseText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: '#C8E6FF',
    opacity: 0.35,
    letterSpacing: 2,
    marginTop: 16,
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
    marginTop: 20,
    lineHeight: 16,
    opacity: 0.8,
  },
});
