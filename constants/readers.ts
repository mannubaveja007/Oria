export interface Reader {
  id: number;
  name: string;
  sign: string;
  specialty: string;
  available: "now" | "today";
  initial: string;
}

export const readers: Reader[] = [
  {
    id: 1,
    name: "Mira",
    sign: "Pisces",
    specialty: "Emotional clarity readings",
    available: "now",
    initial: "M"
  },
  {
    id: 2,
    name: "Kabir",
    sign: "Libra",
    specialty: "Relationship compatibility",
    available: "now",
    initial: "K"
  },
  {
    id: 3,
    name: "Anaya",
    sign: "Cancer",
    specialty: "Moon and intuition readings",
    available: "today",
    initial: "A"
  },
  {
    id: 4,
    name: "Rhea",
    sign: "Scorpio",
    specialty: "Deep transformation guidance",
    available: "now",
    initial: "R"
  }
];
