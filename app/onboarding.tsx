import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  Modal, 
  ActivityIndicator,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { useOnboarding } from '../context/OnboardingContext';
import { getZodiacSign } from '../utils/zodiac';
import { supabase } from '../lib/supabase';
import CelestialBackground from '../components/CelestialBackground';

interface Message {
  id: string;
  sender: 'oria' | 'user';
  text: string;
}

interface AnimatedBubbleProps {
  children: React.ReactNode;
}

function AnimatedBubble({ children }: AnimatedBubbleProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
      {children}
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { onboardingData, updateOnboardingData, saveOnboardingToSupabase } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [oriaTyping, setOriaTyping] = useState(false);
  const [step, setStep] = useState(1); // 1: Name, 2: Birthday, 3: BirthTime, 4: BirthCity, 5: Goal

  // User input states for different steps
  const [nameInput, setNameInput] = useState('');
  const [dateInput, setDateInput] = useState<Date>(new Date(1995, 0, 1));
  const [timeInput, setTimeInput] = useState<Date>(new Date(1995, 0, 1, 12, 0));
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Mock city list
  const mockCities = [
    "Jodhpur, Rajasthan, IND",
    "Mumbai, Maharashtra, IND",
    "Delhi, IND",
    "Bengaluru, Karnataka, IND"
  ];

  const filteredCities = mockCities.filter(city => 
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Helper to add Oria message with custom 600ms delay
  const addOriaMessage = (text: string) => {
    setOriaTyping(true);
    setTimeout(() => {
      setOriaTyping(false);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'oria',
        text
      }]);
    }, 600);
  };

  // Helper to add User message
  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Math.random().toString(),
      sender: 'user',
      text
    }]);
  };

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, oriaTyping]);

  // Step 1 Trigger on Mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: activeSession } }: any) => {
      if (!activeSession?.user) {
        router.replace('/auth');
        return;
      }
      addOriaMessage("Welcome to Oria. Let's get you set up. To start, what can I call you?");
    });
  }, []);

  // Handle name submission (Step 1 -> Step 2)
  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    
    const name = nameInput.trim();
    addUserMessage(name);
    updateOnboardingData({ name });
    setNameInput('');
    setStep(2);

    addOriaMessage(`${name}, what a lovely name.\n\nNow, when's your birthday?`);
  };

  // Handle birthday submission (Step 2 -> Step 3)
  const handleBirthdaySubmit = () => {
    addUserMessage(dateInput.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }));
    
    // Calculate zodiac sign
    const zodiacData = getZodiacSign(dateInput);
    updateOnboardingData({ 
      dob: dateInput,
      zodiacSign: zodiacData.sign
    });
    setStep(3);

    addOriaMessage(`Ah, an ${zodiacData.sign} - brilliant.\n\nNow, do you know the exact time you were born?`);
  };

  // Handle birth time submission (Step 3 -> Step 4)
  const handleTimeSubmit = (skipped = false) => {
    if (skipped) {
      addUserMessage("I don't know my birth time");
      updateOnboardingData({ birthTime: null });
    } else {
      addUserMessage(timeInput.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
      updateOnboardingData({ birthTime: timeInput });
    }
    setStep(4);

    addOriaMessage("Do you know what city you were born in?");
  };

  // Handle birth city Yes/No (Step 4 -> Step 5 or City selection)
  const handleCityDecision = (knowsCity: boolean) => {
    if (knowsCity) {
      setShowCityModal(true);
    } else {
      addUserMessage("No, I don't know");
      updateOnboardingData({ birthCity: null });
      setStep(5);
      addOriaMessage("Last question! What brings you to Oria?");
    }
  };

  // Handle selecting city from modal list
  const handleCitySelect = (city: string) => {
    addUserMessage(city);
    updateOnboardingData({ birthCity: city });
    setShowCityModal(false);
    setStep(5);

    addOriaMessage("Last question! What brings you to Oria?");
  };

  // Handle goal selection (Step 5 -> Supabase persist & paywall)
  const handleGoalSelect = async (goal: string) => {
    addUserMessage(goal);
    // Note: React state is async, so we pass the final payload explicitly or update it in-line
    updateOnboardingData({ goal });
    
    setSaveLoading(true);
    setSaveError(null);

    // Verify authentication session directly to avoid state race conditions
    const { data: { session: activeSession } }: any = await supabase.auth.getSession();
    if (!activeSession?.user) {
      setSaveLoading(false);
      setSaveError("No active session found. Redirecting to login...");
      setTimeout(() => {
        router.replace('/auth');
      }, 1500);
      return;
    }

    // Give a short timeout for State synchronization, then attempt save
    setTimeout(async () => {
      try {
        // Prepare local model with manual overrides since setOnboardingData runs asynchronously
        onboardingData.goal = goal; 
        
        const result = await saveOnboardingToSupabase();
        if (result.success) {
          router.push('/paywall');
        } else {
          setSaveError(result.error || "Failed to save data. Please try again.");
        }
      } catch (err: any) {
        setSaveError(err.message || "Something went wrong.");
      } finally {
        setSaveLoading(false);
      }
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CelestialBackground density="medium" showConstellation={false} intensity={0.45} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        {/* Scrollable Conversation History */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => {
            const isOria = msg.sender === 'oria';
            return (
              <AnimatedBubble key={msg.id}>
                <View style={[styles.bubbleWrapper, isOria ? styles.oriaWrapper : styles.userWrapper]}>
                  {isOria && (
                    <View style={styles.avatar}>
                      <Image 
                        source={require('../assets/images/mira.png')} 
                        style={styles.avatarImage} 
                        contentFit="cover"
                      />
                    </View>
                  )}
                  <View style={[styles.bubble, isOria ? styles.oriaBubble : styles.userBubble]}>
                    <Text style={[styles.bubbleText, isOria ? styles.oriaText : styles.userText]} selectable>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              </AnimatedBubble>
            );
          })}

          {oriaTyping && (
            <AnimatedBubble key="typing">
              <View style={[styles.bubbleWrapper, styles.oriaWrapper]}>
                <View style={styles.avatar}>
                  <Image 
                    source={require('../assets/images/mira.png')} 
                    style={styles.avatarImage} 
                    contentFit="cover"
                  />
                </View>
                <View style={[styles.bubble, styles.oriaBubble, styles.typingBubble]}>
                  <Text style={styles.typingText}>Oria is typing...</Text>
                </View>
              </View>
            </AnimatedBubble>
          )}

          {saveError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText} selectable>{saveError}</Text>
              <Pressable 
                onPress={() => onboardingData.goal && handleGoalSelect(onboardingData.goal)}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Retry Saving</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* Conditional Controls Area at Bottom */}
        <View style={styles.controlsContainer}>
          {oriaTyping || saveLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator color="#C8E6FF" />
            </View>
          ) : (
            <>
              {/* STEP 1: Name Input */}
              {step === 1 && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Enter your first name..."
                    placeholderTextColor="#555555"
                    autoFocus={true}
                    value={nameInput}
                    onChangeText={setNameInput}
                    onSubmitEditing={handleNameSubmit}
                  />
                  <Pressable
                    style={[styles.arrowButton, !nameInput.trim() && styles.arrowButtonDisabled]}
                    disabled={!nameInput.trim()}
                    onPress={handleNameSubmit}
                  >
                    <Text style={styles.arrowButtonText}>➔</Text>
                  </Pressable>
                </View>
              )}

              {/* STEP 2: Birthday Picker */}
              {step === 2 && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={dateInput}
                    mode="date"
                    display="spinner"
                    textColor="#FFFFFF"
                    themeVariant="dark"
                    onChange={(_, selectedDate) => selectedDate && setDateInput(selectedDate)}
                    style={styles.datePicker}
                  />
                  <Pressable style={styles.ctaButton} onPress={handleBirthdaySubmit}>
                    <Text style={styles.ctaButtonText}>Confirm Birthday</Text>
                  </Pressable>
                </View>
              )}

              {/* STEP 3: Birth Time Picker */}
              {step === 3 && (
                <View style={styles.pickerContainer}>
                  <DateTimePicker
                    value={timeInput}
                    mode="time"
                    display="spinner"
                    textColor="#FFFFFF"
                    themeVariant="dark"
                    onChange={(_, selectedTime) => selectedTime && setTimeInput(selectedTime)}
                    style={styles.datePicker}
                  />
                  <View style={styles.buttonRow}>
                    <Pressable style={[styles.ctaButton, styles.flexButton, styles.skipButton]} onPress={() => handleTimeSubmit(true)}>
                      <Text style={styles.skipButtonText}>Skip</Text>
                    </Pressable>
                    <Pressable style={[styles.ctaButton, styles.flexButton]} onPress={() => handleTimeSubmit(false)}>
                      <Text style={styles.ctaButtonText}>Confirm Time</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* STEP 4: City Yes/No Options */}
              {step === 4 && (
                <View style={styles.buttonRow}>
                  <Pressable style={[styles.ctaButton, styles.flexButton, styles.secondaryButton]} onPress={() => handleCityDecision(false)}>
                    <Text style={styles.secondaryButtonText}>No</Text>
                  </Pressable>
                  <Pressable style={[styles.ctaButton, styles.flexButton]} onPress={() => handleCityDecision(true)}>
                    <Text style={styles.ctaButtonText}>Yes</Text>
                  </Pressable>
                </View>
              )}

              {/* STEP 5: Goal Selector Grid */}
              {step === 5 && (
                <View style={styles.goalGridContainer}>
                  <View style={styles.gridRow}>
                    <Pressable style={styles.gridCell} onPress={() => handleGoalSelect("Transits")}>
                      <Text style={styles.gridCellText}>Transits</Text>
                    </Pressable>
                    <Pressable style={styles.gridCell} onPress={() => handleGoalSelect("Asking Oria questions")}>
                      <Text style={styles.gridCellText}>Asking Oria questions</Text>
                    </Pressable>
                  </View>
                  <View style={styles.gridRow}>
                    <Pressable style={styles.gridCell} onPress={() => handleGoalSelect("Live readings")}>
                      <Text style={styles.gridCellText}>Live readings</Text>
                    </Pressable>
                    <Pressable style={styles.gridCell} onPress={() => handleGoalSelect("Other")}>
                      <Text style={styles.gridCellText}>Other</Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* STEP 4: Location Search Modal */}
      <Modal
        visible={showCityModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Enter Birth Location</Text>
            <Pressable onPress={() => setShowCityModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.searchBar}
            placeholder="Search city (e.g. Mumbai)"
            placeholderTextColor="#8A8A8A"
            autoFocus={true}
            value={citySearch}
            onChangeText={setCitySearch}
          />

          <ScrollView style={styles.cityList} keyboardShouldPersistTaps="handled">
            {filteredCities.map((city) => (
              <Pressable 
                key={city} 
                style={styles.cityItem} 
                onPress={() => handleCitySelect(city)}
              >
                <Text style={styles.cityItemText}>{city}</Text>
              </Pressable>
            ))}

            <Pressable 
              style={styles.cityItem} 
              onPress={() => handleCitySelect(citySearch.trim() || "Unknown Location")}
            >
              <Text style={[styles.cityItemText, styles.specialCityText]}>
                {citySearch.trim() ? `Use "${citySearch.trim()}"` : "I don't see the location"}
              </Text>
            </Pressable>
          </ScrollView>
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
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '100%',
    marginVertical: 4,
  },
  oriaWrapper: {
    justifyContent: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E1E1E',
    backgroundColor: '#080808',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  avatarText: {
    color: '#C8E6FF',
    fontSize: 14,
    lineHeight: 18,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  oriaBubble: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderCurve: 'continuous',
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
    borderCurve: 'continuous',
  },
  typingBubble: {
    opacity: 0.6,
  },
  bubbleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  oriaText: {
    color: '#FFFFFF',
  },
  userText: {
    color: '#000000',
    fontFamily: 'DMSans-Medium',
  },
  typingText: {
    color: '#8A8A8A',
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#111111',
    backgroundColor: '#000000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    backgroundColor: '#060606',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderCurve: 'continuous',
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowButtonDisabled: {
    opacity: 0.3,
  },
  arrowButtonText: {
    color: '#000000',
    fontSize: 16,
  },
  pickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePicker: {
    width: '100%',
    height: 180,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#000000',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  flexButton: {
    flex: 1,
  },
  skipButton: {
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  skipButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#8A8A8A',
  },
  secondaryButton: {
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#1E1E1E',
  },
  secondaryButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  goalGridContainer: {
    gap: 12,
    width: '100%',
    paddingVertical: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  gridCell: {
    flex: 1,
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  gridCellText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingWrapper: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#110c0c',
    borderWidth: 1,
    borderColor: '#442222',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    borderCurve: 'continuous',
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#FF6B6B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  retryButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#000000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#060606',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'CormorantGaramond-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    flex: 1,
  },
  modalCloseText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
    color: '#8A8A8A',
  },
  searchBar: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    backgroundColor: '#0A0A0A',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderCurve: 'continuous',
  },
  cityList: {
    flex: 1,
  },
  cityItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#161616',
  },
  cityItemText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  specialCityText: {
    color: '#C8E6FF',
    fontFamily: 'DMSans-Medium',
  },
});
