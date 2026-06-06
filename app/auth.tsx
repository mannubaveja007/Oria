import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  Pressable, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useOnboarding } from '../context/OnboardingContext';

export default function AuthScreen() {
  const router = useRouter();
  const { loadProfile } = useOnboarding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async () => {
    if (!isFormValid || loading) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (!data.session) {
          setErrorMessage("Please confirm your email, then sign in.");
          return;
        }

        router.replace('/onboarding');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) throw error;

        if (data.session) {
          const profileExists = await loadProfile(data.session.user.id);
          if (profileExists) {
            router.replace('/horoscope');
          } else {
            router.replace('/onboarding');
          }
        } else {
          throw new Error("Unable to retrieve user session. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setErrorMessage(error.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Branding */}
          <View style={styles.headerContainer}>
            <Text style={styles.brandTitle}>Oria</Text>
            <Text style={styles.brandSubtitle}>
              {isSignUp ? 'CREATE YOUR CELESTIAL PROFILE' : 'SIGN IN TO YOUR GUIDE'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.textInput}
              placeholder="name@example.com"
              placeholderTextColor="#555555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              placeholderTextColor="#555555"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
            />

            {errorMessage && (
              <Text style={styles.errorText} selectable>
                {errorMessage}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={handleSubmit}
              disabled={!isFormValid || loading}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
                (!isFormValid || loading) && styles.ctaButtonDisabled
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text style={styles.ctaButtonText}>Continue</Text>
              )}
            </Pressable>

            <Pressable 
              onPress={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
              }}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {isSignUp 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandTitle: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 54,
    color: '#FFFFFF',
    lineHeight: 60,
  },
  brandSubtitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#777777',
    letterSpacing: 3,
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
    gap: 16,
  },
  inputLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 2,
    marginTop: 8,
  },
  textInput: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    backgroundColor: '#060606',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderCurve: 'continuous',
  },
  errorText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 16,
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
    opacity: 0.4,
  },
  ctaButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#000000',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#8A8A8A',
    letterSpacing: 0.5,
  },
});
