/** Static catalogues: moods, physical symptoms, bleeding amounts. */

export type MoodKey =
  | 'calm' | 'happy' | 'anxious' | 'sad'
  | 'depressed' | 'confused' | 'guilty' | 'sleepy';

export type SymptomKey =
  | 'cramps' | 'headache' | 'bloating' | 'acne'
  | 'nausea' | 'backpain' | 'fatigue' | 'foodcravings';

export type BleedingKey = 'spotting' | 'light' | 'moderate' | 'heavy';

export const MOODS: { key: MoodKey; label: string }[] = [
  { key: 'calm', label: 'Calm' },
  { key: 'happy', label: 'Happy' },
  { key: 'anxious', label: 'Anxious' },
  { key: 'sad', label: 'Sad' },
  { key: 'depressed', label: 'Depressed' },
  { key: 'confused', label: 'Confused' },
  { key: 'guilty', label: 'Guilty' },
  { key: 'sleepy', label: 'Sleepy' },
];

export const SYMPTOMS: { key: SymptomKey; label: string }[] = [
  { key: 'cramps', label: 'Cramps' },
  { key: 'headache', label: 'Headache' },
  { key: 'bloating', label: 'Bloating' },
  { key: 'acne', label: 'Acne' },
  { key: 'nausea', label: 'Nausea' },
  { key: 'backpain', label: 'Back Pain' },
  { key: 'fatigue', label: 'Fatigue' },
  { key: 'foodcravings', label: 'Food Cravings' },
];

export const BLEEDING: { key: BleedingKey; label: string }[] = [
  { key: 'spotting', label: 'Spotting' },
  { key: 'light', label: 'Light' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'heavy', label: 'Heavy' },
];

export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const moodArt = (k: MoodKey) => asset(`mood-${k}.png`);
export const symptomArt = (k: SymptomKey) => asset(`sym-${k}.png`);
export const bleedArt = (k: BleedingKey) => asset(`bleed-${k}.png`);
