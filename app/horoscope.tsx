import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';
import { getZodiacSign } from '../utils/zodiac';
import { zodiacData } from '../constants/zodiacData';

export default function HoroscopeScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  // Retrieve or recalculate zodiac metrics based on context
  const resolvedSign = useMemo(() => {
    if (onboardingData.zodiacSign && zodiacData[onboardingData.zodiacSign]) {
      return zodiacData[onboardingData.zodiacSign];
    }
    if (onboardingData.dob) {
      return getZodiacSign(onboardingData.dob);
    }
    // Final fallback if they bypass onboarding directly
    return zodiacData["Aquarius"];
  }, [onboardingData.zodiacSign, onboardingData.dob]);

  // Formatted date of birth
  const formattedDob = useMemo(() => {
    if (!onboardingData.dob) return "Not provided";
    return onboardingData.dob.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [onboardingData.dob]);

  // Formatted birth time
  const formattedTime = useMemo(() => {
    if (!onboardingData.birthTime) return "Not provided";
    return onboardingData.birthTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [onboardingData.birthTime]);

  const handleContinue = () => {
    router.push('/readers');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Zodiac Branding Header */}
        <View style={styles.zodiacHeader}>
          <View style={styles.glyphGlow} />
          <Text style={styles.glyphText}>{resolvedSign.glyph}</Text>
          <Text style={styles.signText}>{resolvedSign.sign}</Text>
          <Text style={styles.taglineText} selectable>{resolvedSign.tagline}</Text>
        </View>

        {/* Thin Divider Line */}
        <View style={styles.divider} />

        {/* Birth Details Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <View style={styles.gridCard}>
              <Text style={styles.cardLabel}>DATE OF BIRTH</Text>
              <Text style={styles.cardValue} selectable>{formattedDob}</Text>
            </View>
            <View style={styles.gridCard}>
              <Text style={styles.cardLabel}>BIRTH TIME</Text>
              <Text style={styles.cardValue} selectable>{formattedTime}</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.gridCard}>
              <Text style={styles.cardLabel}>BIRTH PLACE</Text>
              <Text style={styles.cardValue} numberOfLines={2} selectable>
                {onboardingData.birthCity || "Not provided"}
              </Text>
            </View>
            <View style={styles.gridCard}>
              <Text style={styles.cardLabel}>ELEMENT</Text>
              <Text style={styles.cardValue} selectable>{resolvedSign.element}</Text>
            </View>
          </View>
        </View>

        {/* Today's Guidance Paragraph */}
        <View style={styles.guidanceSection}>
          <Text style={styles.sectionTitle}>TODAY'S GUIDANCE</Text>
          <Text style={styles.guidanceBody} selectable>
            {resolvedSign.guidance}
          </Text>
        </View>

        {/* Reflection Quote Card */}
        <View style={styles.reflectionCard}>
          <Text style={styles.reflectionQuote} selectable>
            “{resolvedSign.reflection}”
          </Text>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <Pressable 
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed
            ]}
          >
            <Text style={styles.ctaButtonText}>Continue</Text>
          </Pressable>
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
    paddingTop: 30,
    paddingBottom: 36,
    gap: 28,
  },
  zodiacHeader: {
    alignItems: 'center',
    marginTop: 10,
  },
  glyphGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C8E6FF',
    opacity: 0.08,
    top: -4,
    zIndex: -1,
    shadowColor: '#C8E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  glyphText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 76,
    color: '#C8E6FF',
    lineHeight: 84,
  },
  signText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 40,
    color: '#FFFFFF',
    marginTop: 4,
    lineHeight: 46,
  },
  taglineText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#777777',
    letterSpacing: 3,
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#161616',
    width: '100%',
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    minHeight: 84,
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  cardLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  guidanceSection: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 2,
  },
  guidanceBody: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#8A8A8A',
    lineHeight: 24,
  },
  reflectionCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  reflectionQuote: {
    fontFamily: 'CormorantGaramond-Italic',
    fontSize: 19,
    color: '#C8E6FF',
    textAlign: 'center',
    lineHeight: 26,
  },
  buttonContainer: {
    marginTop: 8,
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
});
