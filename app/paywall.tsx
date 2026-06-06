import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';

export default function PaywallScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const displayName = onboardingData.name || "Seeker";

  // 1. Ambient ceiling glow breathing animation
  const glowOpacity = useRef(new Animated.Value(0.12)).current;

  // 2. Timeline active dot pulsing animation
  const timelinePulse = useRef(new Animated.Value(1)).current;

  // 3. Staggered slide-up entrance animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(24)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresTranslateY = useRef(new Animated.Value(24)).current;
  const timelineOpacity = useRef(new Animated.Value(0)).current;
  const timelineTranslateY = useRef(new Animated.Value(24)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const ctaTranslateY = useRef(new Animated.Value(24)).current;

  // 4. CTA Scale feedback animation
  const ctaScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Breathing loop for top glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.18,
          duration: 2600,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.12,
          duration: 2600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulsing loop for the timeline dot
    Animated.loop(
      Animated.sequence([
        Animated.timing(timelinePulse, {
          toValue: 1.25,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(timelinePulse, {
          toValue: 0.95,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Trigger staggered entry transitions
    Animated.parallel([
      // Header slide-up (delay 100ms)
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      // Features slide-up (delay 250ms)
      Animated.timing(featuresOpacity, {
        toValue: 1,
        duration: 600,
        delay: 250,
        useNativeDriver: true,
      }),
      Animated.timing(featuresTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 250,
        useNativeDriver: true,
      }),
      // Timeline card slide-up (delay 400ms)
      Animated.timing(timelineOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(timelineTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      // Bottom CTA slide-up (delay 550ms)
      Animated.timing(ctaOpacity, {
        toValue: 1,
        duration: 600,
        delay: 550,
        useNativeDriver: true,
      }),
      Animated.timing(ctaTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 550,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    glowOpacity,
    timelinePulse,
    headerOpacity,
    headerTranslateY,
    featuresOpacity,
    featuresTranslateY,
    timelineOpacity,
    timelineTranslateY,
    ctaOpacity,
    ctaTranslateY,
  ]);

  const handleStartTrial = () => {
    // Transition out gracefully before routing
    Animated.parallel([
      Animated.timing(headerOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(headerTranslateY, { toValue: -15, duration: 250, useNativeDriver: true }),
      Animated.timing(featuresOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(featuresTranslateY, { toValue: -15, duration: 200, useNativeDriver: true }),
      Animated.timing(timelineOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(timelineTranslateY, { toValue: -15, duration: 250, useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(ctaTranslateY, { toValue: -15, duration: 250, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      router.push('/(tabs)/horoscope');
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Moon Glow */}
        <Animated.View style={[styles.glowContainer, { opacity: glowOpacity }]}>
          <View style={[styles.glowRing, { width: 440, height: 200, borderRadius: 220, opacity: 0.03 }]} />
          <View style={[styles.glowRing, { width: 300, height: 140, borderRadius: 150, opacity: 0.05 }]} />
          <View style={[styles.glowRing, { width: 180, height: 90, borderRadius: 90, opacity: 0.08 }]} />
        </Animated.View>

        {/* Header Block */}
        <Animated.View style={{ opacity: headerOpacity, transform: [{ translateY: headerTranslateY }] }}>
          <View style={styles.headerContainer}>
            <Text style={styles.eyebrowText}>HERE'S WHAT TO EXPECT</Text>
            <Text style={styles.headingText}>Welcome, {displayName}!</Text>
          </View>
        </Animated.View>

        {/* Feature Checklists */}
        <Animated.View style={{ opacity: featuresOpacity, transform: [{ translateY: featuresTranslateY }] }}>
          <View style={styles.featuresContainer}>
            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Text style={styles.featureCircleText}>1</Text>
              </View>
              <Text style={styles.featureBodyText} selectable>
                Personalized guidance for your current season
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Text style={styles.featureCircleText}>2</Text>
              </View>
              <Text style={styles.featureBodyText} selectable>
                Daily check-ins when you need direction
              </Text>
            </View>

            <View style={styles.featureRow}>
              <View style={styles.featureCircle}>
                <Text style={styles.featureCircleText}>3</Text>
              </View>
              <Text style={styles.featureBodyText} selectable>
                Tools for glow-up, relationships, and decisions
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Trial Timeline Section */}
        <Animated.View style={{ opacity: timelineOpacity, transform: [{ translateY: timelineTranslateY }] }}>
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>YOUR TRIAL JOURNEY</Text>
            
            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <Animated.View style={[
                  styles.timelineDot, 
                  styles.glowDot,
                  { transform: [{ scale: timelinePulse }] }
                ]} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.timelineDayText}>Today</Text>
                <Text style={styles.timelineDescText} selectable>Unlock Oria for free</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.timelineDayText}>Day 5</Text>
                <Text style={styles.timelineDescText} selectable>We'll remind you before your trial ends</Text>
              </View>
            </View>

            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, styles.finalDot]} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.timelineDayText}>Day 7</Text>
                <Text style={styles.timelineDescText} selectable>Continue for $6.99/week, cancel anytime</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* CTA & Subtext */}
        <Animated.View style={{ opacity: ctaOpacity, transform: [{ translateY: ctaTranslateY }], width: '100%' }}>
          <View style={styles.ctaContainer}>
            <Animated.View style={{ transform: [{ scale: ctaScale }], width: '100%' }}>
              <Pressable 
                onPress={handleStartTrial}
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
              >
                <Text style={styles.ctaButtonText}>Start my 7-day free trial</Text>
              </Pressable>
            </Animated.View>
            <Text style={styles.pricingSubtext} selectable>
              7-day free trial, then $6.99 per week
            </Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerLinkText} selectable>
            Terms · Privacy · Restore
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    gap: 32,
  },
  glowContainer: {
    height: 180,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: '#C8E6FF',
    transform: [{ scaleY: 0.5 }], // Flattens the circles to make a sleek ceiling glow
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: -40,
  },
  eyebrowText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 3,
    marginBottom: 8,
  },
  headingText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  featuresContainer: {
    gap: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featureCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    backgroundColor: '#060606',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCircleText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
  },
  featureBodyText: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#E0E0E0',
    lineHeight: 20,
  },
  timelineCard: {
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderCurve: 'continuous',
  },
  timelineTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 2,
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333333',
    zIndex: 2,
  },
  glowDot: {
    backgroundColor: '#C8E6FF',
    shadowColor: '#C8E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  finalDot: {
    backgroundColor: '#555555',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: '#1E1E1E',
    marginVertical: 4,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 16,
  },
  timelineDayText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: '#E0E0E0',
    marginBottom: 2,
  },
  timelineDescText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#8A8A8A',
  },
  ctaContainer: {
    alignItems: 'center',
    gap: 12,
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
  ctaButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#000000',
  },
  pricingSubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#555555',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerLinkText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#555555',
    letterSpacing: 1,
  },
});
