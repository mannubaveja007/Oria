import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface OnboardingData {
  name: string;
  dob: Date | null;
  birthTime: Date | null;
  birthCity: string | null;
  zodiacSign: string | null;
  goal: string | null;
}

export interface OnboardingContextProps {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  saveOnboardingToSupabase: () => Promise<{ success: boolean; error?: string }>;
  loadProfile: (userId: string) => Promise<boolean>;
  clearOnboardingData: () => void;
  session: any;
  loading: boolean;
}

const defaultOnboardingData: OnboardingData = {
  name: "",
  dob: null,
  birthTime: null,
  birthCity: null,
  zodiacSign: null,
  goal: null,
};

export const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize authentication state with Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }: any) => {
      if (currentSession?.user) {
        // Verify token with backend database (important if user was deleted manually)
        supabase.auth.getUser().then(({ data: { user }, error }: any) => {
          if (error || !user) {
            supabase.auth.signOut().then(() => {
              setSession(null);
              setLoading(false);
            });
          } else {
            setSession(currentSession);
            loadProfile(currentSession.user.id).finally(() => setLoading(false));
          }
        });
      } else {
        setSession(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, currentSession: any) => {
      setSession(currentSession);
      if (currentSession?.user) {
        setLoading(true);
        loadProfile(currentSession.user.id).finally(() => setLoading(false));
      } else {
        setOnboardingData(defaultOnboardingData);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const loadProfile = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error("Error loading profile from Supabase:", error);
        }
        return false;
      }

      if (data && data.name && data.dob && data.zodiac_sign) {
        setOnboardingData({
          name: data.name,
          dob: data.dob ? new Date(data.dob) : null,
          birthTime: data.birth_time ? new Date(`1970-01-01T${data.birth_time}`) : null,
          birthCity: data.birth_city || null,
          zodiacSign: data.zodiac_sign || null,
          goal: data.goal || null,
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error("Failed to parse saved profile data:", e);
      return false;
    }
  };

  const saveOnboardingToSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    // Fetch the latest session directly from Supabase to prevent React state race conditions
    const { data: { session: activeSession } }: any = await supabase.auth.getSession();
    const currentUser = activeSession?.user || session?.user;

    if (!currentUser) {
      return { success: false, error: "No authenticated user session found." };
    }

    try {
      // Formats for postgres (Date -> YYYY-MM-DD, birthTime -> HH:MM:SS)
      const formattedDob = onboardingData.dob 
        ? onboardingData.dob.toISOString().split('T')[0] 
        : null;

      const formattedBirthTime = onboardingData.birthTime
        ? onboardingData.birthTime.toTimeString().split(' ')[0]
        : null;

      const profilePayload = {
        id: currentUser.id,
        name: onboardingData.name,
        dob: formattedDob,
        birth_time: formattedBirthTime,
        birth_city: onboardingData.birthCity,
        zodiac_sign: onboardingData.zodiacSign,
        goal: onboardingData.goal,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profilePayload);

      if (error) {
        console.error("Failed to upsert profile to Supabase:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (e: any) {
      console.error("Unhandled error saving onboarding details:", e);
      return { success: false, error: e.message || "An unexpected error occurred." };
    }
  };

  const clearOnboardingData = () => {
    setOnboardingData(defaultOnboardingData);
  };

  return (
    <OnboardingContext.Provider
      value={{
        onboardingData,
        updateOnboardingData,
        saveOnboardingToSupabase,
        loadProfile,
        clearOnboardingData,
        session,
        loading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = React.useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
