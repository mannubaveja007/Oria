# Oria ✦ Celestial Guide & Astrology Matcher

Oria is a premium, moon-inspired React Native Expo iOS application built to serve as a celestial guide and astrology reader matcher. The app features a dark, minimalist luxury editorial design with sleek typography, subtle ambient glows, and rhythmic chat reveals.

---

## ✦ Core Features

1. **Celestial Welcome Screen**: Dark canvas featuring a memoized stars field with blinking animations and a layered cyan moon glow backdrop.
2. **Seamless Authentication**: Minimalist email/password signup and sign-in flow powered by Supabase.
3. **Interactive Chat Onboarding**: A conversational setup flow guiding the user to enter their name, birthdate, birth time, and location, complete with smooth slide-up reveal animations and a realistic portrait of their guide, Mira.
4. **Premium 7-Day Trial Paywall**: A timeline explainer showing trial progression with custom iOS glow drop shadows.
5. **Daily Horoscope Dashboard**: Displaying personalized daily guidance, reflection quotes, zodiac details grid, and a subtle backdrop halo glow behind the zodiac glyph.
6. **Celestial Guides Matcher**: Match and select specialized guides (Mira, Kabir, Anaya, Rhea) using high-quality realistic portraits.
7. **Pulsing Radar Call Request**: Ripple wave animation representing call pending states, automatically transitioning to a call-accepted state that links to an video room.
8. **Sign Out & Back Navigation**: Fixed header bars for easy account logout and cross-screen navigation.

---

## ✦ Tech Stack

*   **Framework**: [Expo SDK 51](https://expo.dev/) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction/) (file-based navigation).
*   **Backend**: [Supabase](https://supabase.com/) for authentication and profile database persistence.
*   **Styling**: Vanilla React Native stylesheet tokens supporting premium continuous curves (`borderCurve: 'continuous'`).
*   **Typography**: Cormorant Garamond (editorial serif) and DM Sans (clean geometric sans-serif) via Expo Google Fonts.
*   **Animations**: Built-in high-performance React Native `Animated` loops and transitions.

---

## ✦ Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [Git](https://git-scm.com/)
*   iOS Simulator (via Xcode) or the [Expo Go](https://expo.dev/client) app on your physical iPhone

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/mannubaveja007/Oria.git
cd Oria
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase SQL Schema
Run the following script inside the **Supabase SQL Editor** to create the required `profiles` table and set up Row Level Security (RLS):

```sql
-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  dob date,
  birth_time time,
  birth_city text,
  zodiac_sign text,
  goal text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert/update own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
```

### 5. Running the Application
Start the Metro development server:
```bash
npx expo start --ios
```
*   Press **`i`** to open the app on your iOS Simulator.
*   Scan the QR code with your camera app to load it in **Expo Go** on a physical iPhone.

---

## ✦ Architecture & Design Token System

To maintain visual excellence, the application uses a strict token and spacing system:
*   **Canvas**: Solid black (`#000000`)
*   **Surfaces & Cards**: Graphite dark gray (`#0A0A0A`)
*   **Borders**: Thin dark borders (`#1E1E1E` or `#161616`)
*   **Accent Glow**: Soft celestial cyan (`#C8E6FF`)
*   **Continuous Curves**: All buttons and cards enforce `borderCurve: 'continuous'` with unified radii (`16` for cards, `28` for primary buttons).
*   **Typography Hierarchy**:
    *   *Display Serif*: `CormorantGaramond-Regular` / `Bold` (used for large headers and zodiac glyphs)
    *   *Body / UI*: `DMSans-Regular` / `Medium` / `Bold` (used for form fields, uppercase tags, and secondary action items)
