export interface Reader {
  id: number;
  name: string;
  sign: string;
  specialty: string;
  available: "now" | "today";
  rating: number;
  image: string;
  tags: string[];
}

export const readers: Reader[] = [
  {
    id: 1,
    name: "Divine Bioenergetics",
    sign: "Leo",
    specialty: "Spiritual Advisor · Energy",
    available: "now",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    tags: ["Energy", "Clarity"]
  },
  {
    id: 2,
    name: "Ethan Psyche",
    sign: "Scorpio",
    specialty: "Tarot · Relationships",
    available: "now",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=300&auto=format&fit=crop",
    tags: ["Love", "Relationships"]
  },
  {
    id: 3,
    name: "Hawi the Mystic",
    sign: "Pisces",
    specialty: "Moon intuition · Clarity",
    available: "today",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    tags: ["Moon", "Clarity"]
  },
  {
    id: 4,
    name: "Intuitive Hits",
    sign: "Taurus",
    specialty: "Deep guidance · Timing",
    available: "now",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    tags: ["Clarity", "Timing"]
  },
  {
    id: 5,
    name: "Mira",
    sign: "Cancer",
    specialty: "Emotional clarity readings",
    available: "now",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=300&auto=format&fit=crop",
    tags: ["Clarity", "Moon"]
  },
  {
    id: 6,
    name: "Kabir",
    sign: "Libra",
    specialty: "Relationship compatibility",
    available: "today",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    tags: ["Love", "Relationships"]
  }
];
