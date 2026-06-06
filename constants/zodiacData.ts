export interface ZodiacSignData {
  sign: string;
  glyph: string;
  element: string;
  tagline: string;
  guidance: string;
  reflection: string;
}

export const zodiacData: Record<string, ZodiacSignData> = {
  Aries: {
    sign: "Aries",
    glyph: "♈",
    element: "Fire",
    tagline: "BOLD · INITIATING · PASSIONATE",
    guidance: "Today calls for decisive action. The moon illuminates your sector of courage, urging you to step forward into the unknown. Trust your raw instincts, but ensure your energy is channeled productively rather than impulsively.",
    reflection: "True power lies not in asserting dominance, but in having the courage to lead with an open heart."
  },
  Taurus: {
    sign: "Taurus",
    glyph: "♉",
    element: "Earth",
    tagline: "GROUNDED · PATIENT · RESILIENT",
    guidance: "Focus on your immediate environment and sensory experiences today. The stars invite you to slow down, build steady foundations, and find pleasure in the simpler aspects of life. Patience is your greatest ally.",
    reflection: "Growth cannot be rushed; like the ancient trees, we must stand firm in our roots to reach the light."
  },
  Gemini: {
    sign: "Gemini",
    glyph: "♊",
    element: "Air",
    tagline: "EXPRESSIVE · CURIOUS · ADAPTABLE",
    guidance: "A day filled with intellectual stimulation and connection. Communication channels are wide open, making it the perfect time to share ideas or seek clarity in your relationships. Stay open to unexpected insights.",
    reflection: "To ask the right questions is often more valuable than having all the quick answers."
  },
  Cancer: {
    sign: "Cancer",
    glyph: "♋",
    element: "Water",
    tagline: "INTUITIVE · NURTURING · PROTECTIVE",
    guidance: "Your emotional sensitivity is heightened today. Create a safe, comfortable sanctuary for yourself. Listen deeply to the whispers of your intuition; it points you toward healing and home-centered restoration.",
    reflection: "Your sensitivity is not a vulnerability; it is the radar that guides you through life's storms."
  },
  Leo: {
    sign: "Leo",
    glyph: "♌",
    element: "Fire",
    tagline: "CREATIVE · RADIANT · LEADING",
    guidance: "Your natural radiance is in high demand today. Express yourself through creative outlets and share your warmth with those around you. Remember to lead with generosity and uplift others with your light.",
    reflection: "Shine so brightly that others can find their way out of the shadows using your light."
  },
  Virgo: {
    sign: "Virgo",
    glyph: "♍",
    element: "Earth",
    tagline: "ANALYTICAL · MINDFUL · HELPFUL",
    guidance: "Focus on organization and wellness today. Small, intentional adjustments in your routine will yield great benefits. Avoid perfectionism; instead, focus on mindfulness and being of service to your own needs.",
    reflection: "Order in the external world brings a quiet peace to the universe within."
  },
  Libra: {
    sign: "Libra",
    glyph: "♎",
    element: "Air",
    tagline: "HARMONIOUS · DIPLOMATIC · BEAUTY-SEEKING",
    guidance: "Balance and harmony are your focal points today. Seek middle ground in any conflicts and surround yourself with art, music, or nature. Your relationships benefit from mutual listening and shared beauty.",
    reflection: "In the scales of life, peace is found not by standing still, but by adjusting to every tilt."
  },
  Scorpio: {
    sign: "Scorpio",
    glyph: "♏",
    element: "Water",
    tagline: "INTENSE · TRANSFORMATIVE · POWERFUL",
    guidance: "A powerful day for deep self-reflection and release. The cosmic currents urge you to let go of old patterns that no longer serve your evolution. Dive beneath the surface; truth awaits you in the depths.",
    reflection: "Only by shedding the old skin can we discover the magnificent wings waiting beneath."
  },
  Sagittarius: {
    sign: "Sagittarius",
    glyph: "♐",
    element: "Fire",
    tagline: "ADVENTUROUS · PHILOSOPHICAL · SEEKING",
    guidance: "Your spirit seeks expansion and learning today. Take a step back to view the grander picture of your path. A new philosophical perspective or adventure will revitalize your drive and restore your optimism.",
    reflection: "The journey is not merely about changing landscapes, but about obtaining new eyes."
  },
  Capricorn: {
    sign: "Capricorn",
    glyph: "♑",
    element: "Earth",
    tagline: "DISCIPLINED · AMBITIOUS · WISE",
    guidance: "Professional goals and long-term ambitions are highlighted. The stars support disciplined action and strategic planning. Stand tall in your authority and take responsibility for your destiny.",
    reflection: "The summit is reached not by a single giant leap, but by persistent, steady climbing."
  },
  Aquarius: {
    sign: "Aquarius",
    glyph: "♒",
    element: "Air",
    tagline: "INDEPENDENT · THOUGHTFUL · FUTURE-FACING",
    guidance: "Your innovative ideas and humanitarian instincts are strong today. Look for ways to bring unique perspectives to current problems. Connect with community or like-minded groups to spark future growth.",
    reflection: "To build a better tomorrow, we must have the courage to stand apart from the crowd today."
  },
  Pisces: {
    sign: "Pisces",
    glyph: "♓",
    element: "Water",
    tagline: "DREAMY · COMPASSIONATE · MYSTICAL",
    guidance: "Allow your imagination and dreams to guide your steps today. The boundary between the material and spiritual is thin, making it a beautiful time for meditation, artistic expression, and radical empathy.",
    reflection: "We are all waves of the same ocean, connected by the invisible pull of the cosmic tide."
  }
};
