import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Animated, 
  ActivityIndicator,
  Linking 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { readers } from '../constants/readers';

const avatarImages: Record<number, any> = {
  1: require('../assets/images/mira.png'),
  2: require('../assets/images/kabir.png'),
  3: require('../assets/images/anaya.png'),
  4: require('../assets/images/rhea.png'),
};

export default function CallScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [accepted, setAccepted] = useState(false);

  // Look up selected reader
  const reader = readers.find(r => r.id.toString() === id) || readers[0];

  // Animated values for overlapping pulse rings
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Overlapping ripple timing functions
    const startPulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      ).start();
    };

    startPulse(pulse1, 0);
    startPulse(pulse2, 1100);
  }, [pulse1, pulse2]);

  // Handle 3 second state transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setAccepted(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleCallAction = () => {
    if (accepted) {
      Linking.openURL("https://demo.daily.co/hello").catch(err => {
        console.error("Failed to open video call link:", err);
      });
    }
  };

  // Pulse interpolation configurations
  const scale1 = pulse1.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const opacity1 = pulse1.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  const scale2 = pulse2.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const opacity2 = pulse2.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back to Readers Button */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to readers</Text>
        </Pressable>
      </View>

      <View style={styles.mainContent}>
        {/* Radar Animation Area */}
        <View style={styles.radarContainer}>
          {/* Pulsing rings */}
          {!accepted && (
            <>
              <Animated.View 
                style={[
                  styles.pulseRing, 
                  { transform: [{ scale: scale1 }], opacity: opacity1 }
                ]} 
              />
              <Animated.View 
                style={[
                  styles.pulseRing, 
                  { transform: [{ scale: scale2 }], opacity: opacity2 }
                ]} 
              />
            </>
          )}

          {/* Central Avatar */}
          <View style={[styles.avatarCircle, accepted && styles.avatarCircleAccepted]}>
            <Image 
              source={reader.image ? { uri: reader.image } : (avatarImages[reader.id] || avatarImages[1])} 
              style={styles.avatarImage} 
              contentFit="cover"
            />
          </View>
        </View>

        {/* Reader Profile Details */}
        <View style={styles.profileDetails}>
          <Text style={styles.readerName} selectable>{reader.name}</Text>
          <Text style={styles.readerSign} selectable>{reader.sign.toUpperCase()}</Text>
          <Text style={styles.readerSpecialty} selectable>{reader.specialty}</Text>
        </View>

        {/* Status Prompt */}
        <View style={styles.statusContainer}>
          {accepted ? (
            <Text style={[styles.statusText, styles.statusTextAccepted]} selectable>
              {reader.name} accepted ✦
            </Text>
          ) : (
            <View style={styles.pendingRow}>
              <ActivityIndicator size="small" color="#555555" style={{ marginRight: 6 }} />
              <Text style={styles.statusText} selectable>
                REQUEST SENT ···
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action CTA Button */}
      <View style={styles.bottomBar}>
        <Pressable
          onPress={handleCallAction}
          disabled={!accepted}
          style={({ pressed }) => [
            styles.actionButton,
            accepted ? styles.actionButtonAccepted : styles.actionButtonPending,
            pressed && styles.actionButtonPressed
          ]}
        >
          <Text style={[styles.actionButtonText, accepted && styles.actionButtonTextAccepted]}>
            {accepted ? "Join Video Call" : `Waiting for ${reader.name}...`}
          </Text>
        </Pressable>
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
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 6,
  },
  backButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#8A8A8A',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
    marginTop: -20,
  },
  radarContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#C8E6FF',
    backgroundColor: 'rgba(200, 230, 255, 0.05)',
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  avatarCircleAccepted: {
    borderColor: '#C8E6FF',
    shadowColor: '#C8E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 5,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarLetter: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 44,
    color: '#FFFFFF',
    lineHeight: 50,
  },
  profileDetails: {
    alignItems: 'center',
    gap: 6,
  },
  readerName: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 32,
    color: '#FFFFFF',
  },
  readerSign: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 2,
  },
  readerSpecialty: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#8A8A8A',
    textAlign: 'center',
    marginTop: 4,
  },
  statusContainer: {
    height: 24,
    justifyContent: 'center',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#555555',
    letterSpacing: 2.5,
  },
  statusTextAccepted: {
    color: '#2EA84F',
    letterSpacing: 1.5,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  actionButton: {
    width: '100%',
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPending: {
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  actionButtonAccepted: {
    backgroundColor: '#C8E6FF',
  },
  actionButtonPressed: {
    opacity: 0.95,
  },
  actionButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#555555',
  },
  actionButtonTextAccepted: {
    color: '#000000',
  },
});
