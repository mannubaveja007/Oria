import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';

export default function PaywallScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();
  const displayName = onboardingData.name || "Seeker";

  const handleStartTrial = () => {
    router.push('/horoscope');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Moon Glow */}
        <View style={styles.glowContainer}>
          <View style={[styles.glowRing, { width: 440, height: 200, borderRadius: 220, opacity: 0.03 }]} />
          <View style={[styles.glowRing, { width: 300, height: 140, borderRadius: 150, opacity: 0.05 }]} />
          <View style={[styles.glowRing, { width: 180, height: 90, borderRadius: 90, opacity: 0.08 }]} />
        </View>

        {/* Header Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.eyebrowText}>HERE'S WHAT TO EXPECT</Text>
          <Text style={styles.headingText}>Welcome, {displayName}!</Text>
        </View>

        {/* Feature Checklists */}
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

        {/* Trial Timeline Section */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>YOUR TRIAL JOURNEY</Text>
          
          <View style={styles.timelineRow}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineDot, styles.glowDot]} />
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

        {/* CTA & Subtext */}
        <View style={styles.ctaContainer}>
          <Pressable 
            onPress={handleStartTrial}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed
            ]}
          >
            <Text style={styles.ctaButtonText}>Start my 7-day free trial</Text>
          </Pressable>
          <Text style={styles.pricingSubtext} selectable>
            7-day free trial, then $6.99 per week
          </Text>
        </View>

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
