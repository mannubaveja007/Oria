import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { getZodiacSign } from '../../utils/zodiac';
import { zodiacData } from '../../constants/zodiacData';
import { supabase } from '../../lib/supabase';
import { triggerLight, triggerMedium } from '../../utils/haptics';
import CelestialBackground from '../../components/CelestialBackground';

export default function ProfileScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  const signOutScale = useRef(new Animated.Value(1)).current;

  // Resolve user zodiac sign context
  const resolvedSign = useMemo(() => {
    if (onboardingData.zodiacSign && zodiacData[onboardingData.zodiacSign]) {
      return zodiacData[onboardingData.zodiacSign];
    }
    if (onboardingData.dob) {
      return getZodiacSign(onboardingData.dob);
    }
    return zodiacData["Aquarius"];
  }, [onboardingData.zodiacSign, onboardingData.dob]);

  // Formatted date of birth
  const formattedDob = useMemo(() => {
    if (!onboardingData.dob) return "Not set";
    return onboardingData.dob.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [onboardingData.dob]);

  // Formatted birth time
  const formattedTime = useMemo(() => {
    if (!onboardingData.birthTime) return "Not set";
    return onboardingData.birthTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, [onboardingData.birthTime]);

  const handleSignOut = async () => {
    triggerMedium();
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CelestialBackground density="low" showConstellation={false} intensity={0.3} />
      
      {/* Header */}
      <View style={styles.topBar}>
        <Text style={styles.titleText}>Seeker Profile</Text>
        <Text style={styles.subtitleText}>Your celestial coordinates in the cosmos</Text>
      </View>

      {/* Profile Details Container */}
      <View style={styles.container}>
        {/* Glyph Card */}
        <View style={styles.glyphCard}>
          <Text style={styles.glyphText}>{resolvedSign.glyph}</Text>
          <Text style={styles.nameText}>{onboardingData.name || "Seeker"}</Text>
          <Text style={styles.zodiacSubText}>
            {resolvedSign.sign} · {resolvedSign.element} sign
          </Text>
        </View>

        {/* Coordinates List Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date of Birth</Text>
            <Text style={styles.detailValue}>{formattedDob}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time of Birth</Text>
            <Text style={styles.detailValue}>{formattedTime}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Place of Birth</Text>
            <Text style={styles.detailValue}>{onboardingData.birthCity || "Unknown"}</Text>
          </View>
          <View style={styles.rowDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Spiritual Goal</Text>
            <Text style={styles.detailValue}>{onboardingData.goal || "Self discovery"}</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Animated.View style={[styles.signOutBtnContainer, { transform: [{ scale: signOutScale }] }]}>
          <Pressable
            onPress={handleSignOut}
            onPressIn={() => {
              triggerLight();
              Animated.spring(signOutScale, { toValue: 0.97, useNativeDriver: true }).start();
            }}
            onPressOut={() => {
              Animated.spring(signOutScale, { toValue: 1.0, useNativeDriver: true }).start();
            }}
            style={styles.signOutBtn}
          >
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#111111',
  },
  titleText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 34,
  },
  subtitleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },
  glyphCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  glyphText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 72,
    color: '#C8E6FF',
    lineHeight: 78,
  },
  nameText: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 10,
  },
  zodiacSubText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#8A8A8A',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderCurve: 'continuous',
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#555555',
  },
  detailValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#161616',
    width: '100%',
  },
  signOutBtnContainer: {
    marginTop: 'auto',
    marginBottom: 40,
    width: '100%',
  },
  signOutBtn: {
    width: '100%',
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  signOutBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FF6B6B',
  },
});
