import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

/**
 * SQL MIGRATION FOR SUPABASE:
 * 
 * create table profiles (
 *   id uuid primary key references auth.users(id) on delete cascade,
 *   name text,
 *   dob date,
 *   birth_time time,
 *   birth_city text,
 *   zodiac_sign text,
 *   goal text,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now()
 * );
 * 
 * -- Enable Row Level Security
 * alter table profiles enable row level security;
 * 
 * -- Policies
 * create policy "Users can read their own profile" on profiles
 *   for select using (auth.uid() = id);
 * 
 * create policy "Users can update their own profile" on profiles
 *   for update using (auth.uid() = id);
 * 
 * create policy "Users can insert their own profile" on profiles
 *   for insert with check (auth.uid() = id);
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const isMockMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl === 'placeholder' || supabaseAnonKey === 'placeholder';

if (isMockMode) {
  console.warn('Oria Warning: Supabase URL or Anon Key is missing. Operating in Mock Demo Mode.');
}

// Custom mock database builder for a cohesive developer experience in demo-mode
class MockQueryBuilder {
  private table: string;
  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    return {
      eq: (column: string, value: any) => ({
        single: async () => {
          if (this.table === 'profiles') {
            const profileStr = await AsyncStorage.getItem('mock_profile');
            if (profileStr) {
              const profile = JSON.parse(profileStr);
              if (profile.id === value) {
                return { data: profile, error: null };
              }
            }
            return { data: null, error: { message: 'Profile not found', code: 'PGRST116' } };
          }
          return { data: null, error: null };
        }
      }),
      single: async () => {
        if (this.table === 'profiles') {
          const profileStr = await AsyncStorage.getItem('mock_profile');
          if (profileStr) {
            return { data: JSON.parse(profileStr), error: null };
          }
          return { data: null, error: { message: 'Profile not found', code: 'PGRST116' } };
        }
        return { data: null, error: null };
      }
    };
  }

  upsert(values: any) {
    const handleUpsert = async () => {
      if (this.table === 'profiles') {
        const sessionStr = await AsyncStorage.getItem('mock_session');
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        const profileData = {
          ...values,
          id: values.id || (session?.user?.id || 'mock-user-id'),
          updated_at: new Date().toISOString()
        };
        await AsyncStorage.setItem('mock_profile', JSON.stringify(profileData));
        return { data: profileData, error: null };
      }
      return { data: values, error: null };
    };

    return {
      select: () => ({
        single: async () => {
          return await handleUpsert();
        }
      }),
      then: async (resolve: any) => {
        const result = await handleUpsert();
        return resolve(result);
      }
    };
  }

  update(values: any) {
    return {
      eq: (column: string, value: any) => ({
        then: async (resolve: any) => {
          if (this.table === 'profiles') {
            const existingStr = await AsyncStorage.getItem('mock_profile');
            const existing = existingStr ? JSON.parse(existingStr) : {};
            const updated = {
              ...existing,
              ...values,
              updated_at: new Date().toISOString()
            };
            await AsyncStorage.setItem('mock_profile', JSON.stringify(updated));
            return resolve({ data: updated, error: null });
          }
          return resolve({ data: values, error: null });
        }
      })
    };
  }
}

// In-memory callbacks for auth changes in mock mode
const authStateCallbacks = new Set<(event: string, session: any) => void>();

const mockSupabase = {
  auth: {
    signUp: async ({ email, password }: any) => {
      const user = { id: 'mock-user-id-' + email.split('@')[0], email };
      const session = { access_token: 'mock-token', user };
      await AsyncStorage.setItem('mock_session', JSON.stringify(session));
      
      // Trigger callbacks
      authStateCallbacks.forEach(cb => cb('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },
    signInWithPassword: async ({ email, password }: any) => {
      const user = { id: 'mock-user-id-' + email.split('@')[0], email };
      const session = { access_token: 'mock-token', user };
      await AsyncStorage.setItem('mock_session', JSON.stringify(session));
      
      // Trigger callbacks
      authStateCallbacks.forEach(cb => cb('SIGNED_IN', session));
      return { data: { user, session }, error: null };
    },
    signOut: async () => {
      await AsyncStorage.removeItem('mock_session');
      authStateCallbacks.forEach(cb => cb('SIGNED_OUT', null));
      return { error: null };
    },
    getSession: async () => {
      const sessionStr = await AsyncStorage.getItem('mock_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      return { data: { session }, error: null };
    },
    onAuthStateChange: (callback: any) => {
      authStateCallbacks.add(callback);
      // Immediately run with current session
      AsyncStorage.getItem('mock_session').then(sessionStr => {
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        callback(session ? 'INITIAL_SESSION' : 'SIGNED_OUT', session);
      });
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authStateCallbacks.delete(callback);
            }
          }
        }
      };
    }
  },
  from: (table: string) => {
    return new MockQueryBuilder(table);
  }
};

const realSupabase = !isMockMode
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export const supabase = isMockMode ? (mockSupabase as any) : realSupabase!;
export const isSupabaseConfigured = !isMockMode;
