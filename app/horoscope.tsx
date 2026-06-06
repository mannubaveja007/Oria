import React, { useMemo, useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useOnboarding } from '../context/OnboardingContext';
import { getZodiacSign } from '../utils/zodiac';
import { zodiacData } from '../constants/zodiacData';
import { supabase } from '../lib/supabase';
import { triggerLight, triggerMedium, triggerSuccess } from '../utils/haptics';
import { readers } from '../constants/readers';
import CelestialBackground from '../components/CelestialBackground';

const avatarImages: Record<number, any> = {
  1: require('../assets/images/mira.png'),
  2: require('../assets/images/kabir.png'),
  3: require('../assets/images/anaya.png'),
  4: require('../assets/images/rhea.png'),
};

export default function HoroscopeScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  // Save/Saved Reflection State
  const [isSaved, setIsSaved] = useState(false);
  const savePulse = useRef(new Animated.Value(1)).current;

  // Ask Oria Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answer, setAnswer] = useState("");

  // Staggered Entrance Animation Refs
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(15)).current;
  
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(15)).current;
  
  const birthOpacity = useRef(new Animated.Value(0)).current;
  const birthY = useRef(new Animated.Value(15)).current;
  
  const reflectionOpacity = useRef(new Animated.Value(0)).current;
  const reflectionY = useRef(new Animated.Value(15)).current;
  
  const readerOpacity = useRef(new Animated.Value(0)).current;
  const readerY = useRef(new Animated.Value(15)).current;

  // Button press scale values
  const askOriaScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const viewReadersScale = useRef(new Animated.Value(1)).current;
  const signOutScale = useRef(new Animated.Value(1)).current;

  // Retrieve or recalculate zodiac metrics based on context
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
      month: 'short',
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

  // Personalized greeting based on local time
  const greetingText = useMemo(() => {
    const hours = new Date().getHours();
    let salutation = "Good morning";
    if (hours >= 12 && hours < 17) {
      salutation = "Good afternoon";
    } else if (hours >= 17 || hours < 4) {
      salutation = "Good evening";
    }
    const name = onboardingData.name ? onboardingData.name.trim() : "Seeker";
    return `${salutation}, ${name}`;
  }, [onboardingData.name]);

  useEffect(() => {
    // Run staggered entrance cards reveal on mount
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(heroY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(birthOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(birthY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(reflectionOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(reflectionY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(readerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(readerY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleContinue = () => {
    triggerLight();
    router.push('/readers');
  };

  const handleSignOut = async () => {
    triggerMedium();
    try {
      await supabase.auth.signOut();
      router.replace('/auth');
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  const handleSaveToggle = () => {
    triggerMedium();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    
    // Trigger success pulse scale animation
    Animated.sequence([
      Animated.timing(savePulse, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.timing(savePulse, { toValue: 1.0, duration: 150, useNativeDriver: true })
    ]).start();
  };

  const handleAskOria = () => {
    triggerLight();
    setIsModalVisible(true);
    setQuestion("");
    setAnswer("");
  };

  const handleQuestionSubmit = () => {
    if (!question.trim()) return;
    triggerMedium();
    setIsSubmitting(true);
    setAnswer("");

    // Simulate astronomical response delay
    setTimeout(() => {
      triggerSuccess();
      setIsSubmitting(false);
      setAnswer(
        `Oria has aligned with your inquiry. Regarding "${question}", the current celestial alignments for your sign, ${resolvedSign.sign}, show a path of deep growth. As a ${resolvedSign.element} sign, trust your inner intuition to guide your actions through this current cosmic transit.`
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CelestialBackground density="low" showConstellation={true} intensity={0.35} constellationDelay={1000} />
      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <Text style={styles.brandText}>Oria</Text>
        <Animated.View style={{ transform: [{ scale: signOutScale }] }}>
          <Pressable 
            onPress={handleSignOut} 
            onPressIn={() => {
              triggerLight();
              Animated.spring(signOutScale, { toValue: 0.97, useNativeDriver: true }).start();
            }}
            onPressOut={() => {
              Animated.spring(signOutScale, { toValue: 1.0, useNativeDriver: true }).start();
            }}
            style={styles.signOutButton}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </Animated.View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Personalized Welcoming Header Card */}
        <Animated.View style={[
          styles.headerSection,
          { opacity: headerOpacity, transform: [{ translateY: headerY }] }
        ]}>
          <Text style={styles.greetingText}>{greetingText}</Text>
          <Text style={styles.signMetadataText}>{resolvedSign.sign} · {resolvedSign.element} sign</Text>
          
          {/* Subtle Moon Phase Strip */}
          <Text style={styles.moonStripText}>☾   ◐   ●   ◑   ☽</Text>
        </Animated.View>

        {/* Guidance Hero Card */}
        <Animated.View style={[
          styles.guidanceHeroCard,
          { opacity: heroOpacity, transform: [{ translateY: heroY }] }
        ]}>
          {/* Central Zodiac Glyph with soft glow */}
          <View style={styles.glyphWrapper}>
            <View style={styles.glyphGlow} />
            <Text style={styles.glyphText}>{resolvedSign.glyph}</Text>
          </View>
          
          <Text style={styles.signText}>{resolvedSign.sign.toUpperCase()}</Text>
          <Text style={styles.taglineText}>{resolvedSign.tagline}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.guidanceLabel}>TODAY'S GUIDANCE</Text>
          <Text style={styles.guidanceBody} selectable>{resolvedSign.guidance}</Text>
          
          {/* Ask Oria CTA */}
          <Animated.View style={[styles.askOriaContainer, { transform: [{ scale: askOriaScale }] }]}>
            <Pressable
              onPress={handleAskOria}
              onPressIn={() => {
                triggerLight();
                Animated.spring(askOriaScale, { toValue: 0.97, useNativeDriver: true }).start();
              }}
              onPressOut={() => {
                Animated.spring(askOriaScale, { toValue: 1.0, useNativeDriver: true }).start();
              }}
              style={styles.askOriaButton}
            >
              <Text style={styles.askOriaButtonText}>Ask Oria</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>

        {/* Compact Birth Details Row Card */}
        <Animated.View style={[
          styles.compactBirthCard,
          { opacity: birthOpacity, transform: [{ translateY: birthY }] }
        ]}>
          <View style={styles.birthColumn}>
            <Text style={styles.birthLabel}>BORN</Text>
            <Text style={styles.birthValue} numberOfLines={1} selectable>{formattedDob}</Text>
          </View>
          <View style={styles.verticalDivider} />
          
          <View style={styles.birthColumn}>
            <Text style={styles.birthLabel}>TIME</Text>
            <Text style={styles.birthValue} numberOfLines={1} selectable>{formattedTime}</Text>
          </View>
          <View style={styles.verticalDivider} />
          
          <View style={styles.birthColumn}>
            <Text style={styles.birthLabel}>PLACE</Text>
            <Text style={styles.birthValue} numberOfLines={1} selectable>
              {onboardingData.birthCity || "Not set"}
            </Text>
          </View>
          <View style={styles.verticalDivider} />
          
          <View style={styles.birthColumn}>
            <Text style={styles.birthLabel}>ELEMENT</Text>
            <Text style={styles.birthValue} numberOfLines={1} selectable>{resolvedSign.element}</Text>
          </View>
        </Animated.View>

        {/* Reflection Quote Card with Save Interaction */}
        <Animated.View style={[
          styles.reflectionCard,
          { opacity: reflectionOpacity, transform: [{ translateY: reflectionY }] }
        ]}>
          <View style={styles.reflectionHeader}>
            <Text style={styles.reflectionLabel}>DAILY REFLECTION</Text>
            <Animated.View style={{ transform: [{ scale: savePulse }] }}>
              <Pressable 
                onPress={handleSaveToggle}
                onPressIn={() => {
                  triggerLight();
                  Animated.spring(saveScale, { toValue: 0.97, useNativeDriver: true }).start();
                }}
                onPressOut={() => {
                  Animated.spring(saveScale, { toValue: 1.0, useNativeDriver: true }).start();
                }}
                style={styles.saveIconWrapper}
              >
                <Text style={[styles.saveIconText, isSaved && styles.saveIconActive]}>
                  {isSaved ? '★' : '☆'}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
          
          <Text style={styles.reflectionQuote} selectable>
            “{resolvedSign.reflection}”
          </Text>
        </Animated.View>

        {/* Reader Preview Card */}
        <Animated.View style={[
          styles.readerPreviewCard,
          { opacity: readerOpacity, transform: [{ translateY: readerY }] }
        ]}>
          <View style={styles.readerInfo}>
            <Text style={styles.readerEyebrow}>CELESTIAL GUIDES</Text>
            <Text style={styles.readerTitle}>Direct Alignment</Text>
            <Text style={styles.readerDescription}>
              Connect with a spiritual guide for a deeper natal reading.
            </Text>
          </View>
          
          <View style={styles.readerActionRow}>
            {/* Overlapping avatar preview of guides */}
            <View style={styles.avatarRow}>
              <View style={[styles.avatarOverlap, { zIndex: 3 }]}>
                <Image source={avatarImages[1]} style={styles.avatarImage} contentFit="cover" />
              </View>
              <View style={[styles.avatarOverlap, { zIndex: 2, marginLeft: -12 }]}>
                <Image source={avatarImages[2]} style={styles.avatarImage} contentFit="cover" />
              </View>
              <View style={[styles.avatarOverlap, { zIndex: 1, marginLeft: -12 }]}>
                <Image source={avatarImages[3]} style={styles.avatarImage} contentFit="cover" />
              </View>
            </View>

            {/* View Readers Button */}
            <Animated.View style={{ transform: [{ scale: viewReadersScale }] }}>
              <Pressable
                onPress={handleContinue}
                onPressIn={() => {
                  triggerLight();
                  Animated.spring(viewReadersScale, { toValue: 0.97, useNativeDriver: true }).start();
                }}
                onPressOut={() => {
                  Animated.spring(viewReadersScale, { toValue: 1.0, useNativeDriver: true }).start();
                }}
                style={styles.viewReadersBtn}
              >
                <Text style={styles.viewReadersBtnText}>View readers</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Ask Oria Slide-up Bottom Sheet Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsModalVisible(false)} />
          <View style={styles.modalContent}>
            {/* Handle bar */}
            <View style={styles.handleBar} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask Oria</Text>
              <Pressable onPress={() => setIsModalVisible(false)} style={styles.modalCloseIconWrapper}>
                <Text style={styles.modalCloseIcon}>×</Text>
              </Pressable>
            </View>

            {!answer && !isSubmitting ? (
              <>
                <Text style={styles.modalPromptText}>
                  Ask Oria anything about your celestial path or today's energy alignment.
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="What lies in my cosmic path today?"
                  placeholderTextColor="#444444"
                  multiline
                  numberOfLines={3}
                  value={question}
                  onChangeText={setQuestion}
                  maxLength={150}
                  autoFocus
                />
                <View style={styles.modalActionRow}>
                  <Pressable 
                    onPress={handleQuestionSubmit}
                    disabled={!question.trim()}
                    style={[styles.modalSubmitBtn, !question.trim() && styles.modalSubmitBtnDisabled]}
                  >
                    <Text style={styles.modalSubmitBtnText}>Send to Cosmos</Text>
                  </Pressable>
                </View>
              </>
            ) : isSubmitting ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#C8E6FF" />
                <Text style={styles.loaderText}>Consulting the celestial bodies...</Text>
              </View>
            ) : (
              <ScrollView style={styles.answerScroll} contentContainerStyle={styles.answerScrollContent}>
                <Text style={styles.questionQuote}>"{question}"</Text>
                <Text style={styles.answerBodyText} selectable>{answer}</Text>
                
                <Pressable 
                  onPress={() => {
                    triggerLight();
                    setQuestion("");
                    setAnswer("");
                  }} 
                  style={styles.askAnotherBtn}
                >
                  <Text style={styles.askAnotherBtnText}>Ask another question</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#111111',
  },
  brandText: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  signOutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderCurve: 'continuous',
  },
  signOutText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 16,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  greetingText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 32,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  signMetadataText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#8A8A8A',
    marginTop: 4,
    textAlign: 'center',
  },
  moonStripText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#C8E6FF',
    opacity: 0.25,
    letterSpacing: 4,
    marginTop: 12,
    textAlign: 'center',
  },
  guidanceHeroCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  glyphWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  glyphGlow: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#C8E6FF',
    opacity: 0.05,
    shadowColor: '#C8E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
  },
  glyphText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 64,
    color: '#C8E6FF',
    lineHeight: 70,
    zIndex: 2,
  },
  signText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#777777',
    letterSpacing: 4,
    marginTop: 4,
  },
  taglineText: {
    fontFamily: 'CormorantGaramond-Italic',
    fontSize: 20,
    color: '#FFFFFF',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#161616',
    width: '100%',
    marginVertical: 20,
  },
  guidanceLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 2,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  guidanceBody: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#8A8A8A',
    lineHeight: 24,
    alignSelf: 'flex-start',
  },
  askOriaContainer: {
    marginTop: 24,
    width: '100%',
  },
  askOriaButton: {
    width: '100%',
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  askOriaButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#C8E6FF',
    letterSpacing: 0.5,
  },
  compactBirthCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  birthColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  birthLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 8,
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  birthValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#1E1E1E',
  },
  reflectionCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderCurve: 'continuous',
    gap: 12,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 2,
  },
  saveIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIconText: {
    fontSize: 16,
    color: '#8A8A8A',
    marginTop: -2,
  },
  saveIconActive: {
    color: '#C8E6FF',
  },
  reflectionQuote: {
    fontFamily: 'CormorantGaramond-Italic',
    fontSize: 19,
    color: '#C8E6FF',
    textAlign: 'center',
    lineHeight: 26,
    paddingVertical: 6,
  },
  readerPreviewCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    borderCurve: 'continuous',
    gap: 16,
  },
  readerInfo: {
    gap: 6,
  },
  readerEyebrow: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 2.5,
  },
  readerTitle: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 22,
    color: '#FFFFFF',
  },
  readerDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 18,
  },
  readerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  viewReadersBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  viewReadersBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  modalContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#1D1D1D',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#222',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 26,
    color: '#FFFFFF',
  },
  modalCloseIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: '#8A8A8A',
    marginTop: -2,
  },
  modalPromptText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  modalActionRow: {
    marginTop: 8,
    width: '100%',
  },
  modalSubmitBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  modalSubmitBtnDisabled: {
    opacity: 0.4,
  },
  modalSubmitBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#000000',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#777777',
  },
  answerScroll: {
    maxHeight: 280,
  },
  answerScrollContent: {
    gap: 14,
    paddingVertical: 4,
  },
  questionQuote: {
    fontFamily: 'DMSans-Italic',
    fontSize: 14,
    color: '#555555',
  },
  answerBodyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#8A8A8A',
    lineHeight: 24,
  },
  askAnotherBtn: {
    backgroundColor: '#0E0E0E',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  askAnotherBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#C8E6FF',
  },
});
