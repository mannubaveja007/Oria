import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '../../context/OnboardingContext';
import { getZodiacSign } from '../../utils/zodiac';
import { zodiacData } from '../../constants/zodiacData';
import { triggerLight, triggerMedium, triggerSuccess } from '../../utils/haptics';
import CelestialBackground from '../../components/CelestialBackground';

interface ChatMessage {
  id: string;
  sender: 'oria' | 'user';
  text: string;
}

const PROMPT_CHIPS = ["Love", "Career", "Timing", "Energy"];

export default function AskOriaScreen() {
  const { onboardingData } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'oria',
      text: "Hello seeker. I am Oria, your cosmic advisor. What celestial questions do you hold today?"
    }
  ]);
  const [questionInput, setQuestionInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Staggered Entrance Anim for welcome
  const welcomeFade = useRef(new Animated.Value(0)).current;

  // Resolve user zodiac sign
  const resolvedSign = useMemo(() => {
    if (onboardingData.zodiacSign && zodiacData[onboardingData.zodiacSign]) {
      return zodiacData[onboardingData.zodiacSign];
    }
    if (onboardingData.dob) {
      return getZodiacSign(onboardingData.dob);
    }
    return zodiacData["Aquarius"];
  }, [onboardingData.zodiacSign, onboardingData.dob]);

  useEffect(() => {
    Animated.timing(welcomeFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSend = (textToSend = questionInput) => {
    if (!textToSend.trim()) return;

    triggerMedium();
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };
    
    setMessages(prev => [...prev, userMsg]);
    setQuestionInput('');
    setIsTyping(true);

    // Simulate astronomical consulting delay
    setTimeout(() => {
      triggerSuccess();
      setIsTyping(false);
      
      const zodiacName = resolvedSign.sign;
      const element = resolvedSign.element;
      
      const responses = [
        `Oria has aligned with your inquiry. As a ${zodiacName} (${element} sign), the stars indicate that you are transitioning through a cycle of reflection. Focus your energy inward and let your natural intuition guide you.`,
        `The current cosmic alignments for ${zodiacName} reveal that your paths are opening. A transit in your solar sector suggests that this is the perfect timing to embrace your true desires.`,
        `Regarding your path, Oria senses that today's celestial energies are urging you to build strong boundaries. As a ${element} sign, balancing emotional depth with clarity is your superpower right now.`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const oriaMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'oria',
        text: randomResponse,
      };

      setMessages(prev => [...prev, oriaMsg]);
    }, 1600);
  };

  const handleChipPress = (chip: string) => {
    triggerLight();
    const promptText = `How will the celestial energies affect my ${chip.toLowerCase()} today?`;
    handleSend(promptText);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CelestialBackground density="low" showConstellation={false} intensity={0.3} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={styles.titleText}>Ask Oria</Text>
          <Text style={styles.subtitleText}>A quiet space for what is on your mind</Text>
        </View>

        {/* Conversation List */}
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, index) => {
            const isOria = msg.sender === 'oria';
            return (
              <Animated.View 
                key={msg.id} 
                style={[
                  styles.bubbleWrapper, 
                  isOria ? styles.oriaWrapper : styles.userWrapper,
                  index === 0 && { opacity: welcomeFade }
                ]}
              >
                <View style={[styles.bubble, isOria ? styles.oriaBubble : styles.userBubble]}>
                  <Text style={[styles.bubbleText, isOria ? styles.oriaText : styles.userText]} selectable>
                    {msg.text}
                  </Text>
                </View>
              </Animated.View>
            );
          })}

          {isTyping && (
            <View style={[styles.bubbleWrapper, styles.oriaWrapper]}>
              <View style={[styles.bubble, styles.oriaBubble, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#C8E6FF" style={{ marginRight: 6 }} />
                <Text style={styles.typingText}>Oria is consulting the stars...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input & Suggestions Footer */}
        <View style={styles.footerContainer}>
          {/* Prompt Chips */}
          <View style={styles.chipsRow}>
            {PROMPT_CHIPS.map(chip => (
              <Pressable 
                key={chip} 
                style={styles.chip} 
                onPress={() => handleChipPress(chip)}
                disabled={isTyping}
              >
                <Text style={styles.chipText}>{chip}</Text>
              </Pressable>
            ))}
          </View>

          {/* Text Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything about your alignment..."
              placeholderTextColor="#555555"
              value={questionInput}
              onChangeText={setQuestionInput}
              onSubmitEditing={() => handleSend()}
              editable={!isTyping}
              maxLength={120}
            />
            <Pressable
              style={[
                styles.sendButton, 
                (!questionInput.trim() || isTyping) && styles.sendButtonDisabled
              ]}
              disabled={!questionInput.trim() || isTyping}
              onPress={() => handleSend()}
            >
              <Text style={styles.sendButtonText}>➔</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 2,
  },
  oriaWrapper: {
    justifyContent: 'flex-start',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  oriaBubble: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1C1C1C',
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
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.8,
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
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderColor: '#111111',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderCurve: 'continuous',
  },
  chipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    backgroundColor: '#060606',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderCurve: 'continuous',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.3,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 14,
  },
});
