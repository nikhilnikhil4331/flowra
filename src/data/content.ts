/* Static content drawn from the MyFlo reference screens */

export interface FlowColorInfo {
  id: string;
  name: string;
  hex: string;
  short: string;
  description: string;
  reasons: string[];
  consult: string[];
}

export const FLOW_COLORS: FlowColorInfo[] = [
  {
    id: 'bright-red',
    name: 'Bright Red',
    hex: '#F04E7A',
    short: 'Usually fresh menstrual blood',
    description:
      'This is a common and normal color at the beginning of your period when the blood is fresh.',
    reasons: ['Normal menstruation', 'Higher flow day', 'Hormonal shedding of uterine lining'],
    consult: ['If bleeding is very heavy', 'If it lasts longer than usual', 'If you have severe pain'],
  },
  {
    id: 'dark-red',
    name: 'Dark Red',
    hex: '#A31640',
    short: 'May be older blood',
    description:
      'Dark red blood often appears when flow is slower, such as right after waking up or towards the middle of your period.',
    reasons: ['Slower flow', 'Blood took longer to leave the uterus', 'Common in the morning'],
    consult: ['If it has an unusual smell', 'If flow suddenly becomes very heavy', 'If you feel dizzy or unwell'],
  },
  {
    id: 'brown',
    name: 'Brown',
    hex: '#8A5A33',
    short: 'Often old blood or end of period',
    description:
      'Brown blood is usually older blood that has oxidized. It is very common at the start or end of a period.',
    reasons: ['Old blood from previous cycle', 'Light flow days', 'Beginning or end of period'],
    consult: ['If brown discharge persists for weeks', 'If accompanied by itching or odour', 'If you might be pregnant'],
  },
  {
    id: 'pink',
    name: 'Pink',
    hex: '#F7A8C4',
    short: 'May be light flow or mixed with fluids',
    description:
      'Pink blood usually means fresh blood mixed with cervical fluid. It often shows up as spotting or on very light days.',
    reasons: ['Light flow', 'Spotting between periods', 'Low estrogen levels', 'Recent exercise or weight change'],
    consult: ['If spotting happens often', 'If periods become unusually light for months', 'If you have other symptoms'],
  },
  {
    id: 'orange',
    name: 'Orange',
    hex: '#F08A3C',
    short: 'Could be due to infection or other causes',
    description:
      'Orange-tinted blood or discharge can be blood mixed with cervical fluid, but it may sometimes signal an infection.',
    reasons: ['Blood mixed with discharge', 'Possible vaginal infection', 'Implantation spotting (rare)'],
    consult: ['If there is itching or discomfort', 'If there is a strong or unusual odour', 'If it continues for several days'],
  },
  {
    id: 'clots',
    name: 'Clots',
    hex: '#7A1230',
    short: 'Can be normal, but large clots frequently should be checked',
    description:
      'Small jelly-like clots are common on heavier days. They form when blood pools before leaving the body.',
    reasons: ['Heavy flow day', 'Sitting or lying down for long', 'Normal uterine shedding'],
    consult: ['If clots are larger than a coin often', 'If you soak a pad every hour', 'If you feel weak or pale'],
  },
  {
    id: 'other',
    name: 'Other / Unusual',
    hex: '#9B7ED9',
    short: 'Monitor with other symptoms',
    description:
      'Grey, green or otherwise unusual coloured discharge is not typical for menstrual blood and is worth paying attention to.',
    reasons: ['Possible infection', 'Medication side effects', 'Foreign object (e.g. forgotten tampon)'],
    consult: ['If colour is grey or green', 'If there is fever or pelvic pain', 'If anything feels different from usual'],
  },
];

export interface DischargeInfo {
  name: string;
  desc: string;
  hex: string;
}

export const DISCHARGE_INFO: DischargeInfo[] = [
  { name: 'Clear & Stretchy', desc: 'Fertile cervical mucus, common around ovulation', hex: '#CFE8F7' },
  { name: 'White & Creamy', desc: 'Common after ovulation, usually normal', hex: '#F7F1E3' },
  { name: 'Sticky', desc: 'Typical right after your period ends', hex: '#F3E3CF' },
  { name: 'Watery', desc: 'Normal at different points in your cycle', hex: '#DDEFF8' },
  { name: 'Yellow / Green', desc: 'May indicate infection — consider seeing a doctor', hex: '#DCE8A6' },
  { name: 'Grey', desc: 'Can be a sign of bacterial vaginosis, get it checked', hex: '#C9C9C9' },
];

export const MOODS = [
  { id: 'calm', label: 'Calm', emoji: '😌' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'anxious', label: 'Anxious', emoji: '😟' },
  { id: 'sensitive', label: 'Sensitive', emoji: '🥺' },
  { id: 'sad', label: 'Sad', emoji: '😢' },
  { id: 'irritable', label: 'Irritable', emoji: '😤' },
];

export const SYMPTOMS = [
  { id: 'cramps', label: 'Cramps', emoji: '🥴' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'bloating', label: 'Bloating', emoji: '🫃' },
  { id: 'back-pain', label: 'Back Pain', emoji: '😣' },
  { id: 'acne', label: 'Acne', emoji: '😖' },
  { id: 'breast-pain', label: 'Breast Pain', emoji: '😔' },
  { id: 'nausea', label: 'Nausea', emoji: '🤢' },
  { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { id: 'cravings', label: 'Food Cravings', emoji: '🍫' },
  { id: 'mood-swings', label: 'Mood Swings', emoji: '🎢' },
  { id: 'insomnia', label: 'Insomnia', emoji: '🌙' },
  { id: 'dizziness', label: 'Dizziness', emoji: '💫' },
];

export const QUICK_SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Back Pain', 'Fatigue', 'Acne', 'Nausea', 'Mood Swings'];

export interface MedicineCatalogItem {
  name: string;
  dose: string;
  desc: string;
  category: 'recommended' | 'pain';
}

export const MEDICINE_CATALOG: MedicineCatalogItem[] = [
  { name: 'Ibuprofen', dose: '400 mg', desc: 'Helps reduce cramps and pain', category: 'recommended' },
  { name: 'Mefenamic Acid', dose: '500 mg', desc: 'Use as advised by doctor', category: 'recommended' },
  { name: 'Paracetamol', dose: '500 mg', desc: 'For mild pain and headache', category: 'recommended' },
  { name: 'Vitamin B6', dose: '', desc: 'May help reduce PMS symptoms', category: 'recommended' },
  { name: 'Magnesium', dose: '', desc: 'Helps with cramps, mood and sleep', category: 'recommended' },
  { name: 'Iron (if needed)', dose: '', desc: 'Helps prevent fatigue', category: 'recommended' },
  { name: 'Ibuprofen', dose: '400 mg', desc: 'Anti-inflammatory, good for cramps', category: 'pain' },
  { name: 'Paracetamol', dose: '650 mg', desc: 'Gentle option for mild pain', category: 'pain' },
  { name: 'Heat Patch', dose: '', desc: 'Soothes lower abdomen & back', category: 'pain' },
  { name: 'Drotaverine', dose: '40 mg', desc: 'For spasmodic cramp pain — doctor advised', category: 'pain' },
];

export interface FoodItem {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  image?: string;
  portion: string;
  nutrition: {
    calories: number; protein: number; carbs: number; fat: number; fiber: number;
    iron: number; zinc: number; calcium: number; b12: number;
  };
  tip: string;
}

export const FOODS: FoodItem[] = [
  {
    id: 'chicken-bowl', name: 'Grilled Chicken Bowl', desc: 'Rice, chicken, broccoli, carrots', emoji: '🍗',
    image: '/images/food-bowl.jpg', portion: '1 bowl (250g)',
    nutrition: { calories: 420, protein: 28, carbs: 52, fat: 12, fiber: 6, iron: 2.8, zinc: 2.1, calcium: 120, b12: 1.2 },
    tip: 'Good choice! High in protein and rich in fiber.',
  },
  {
    id: 'oats', name: 'Oats with milk', desc: 'Oatmeal, milk, honey', emoji: '🥣',
    image: '/images/food-oats.jpg', portion: '1 bowl (200g)',
    nutrition: { calories: 220, protein: 8, carbs: 34, fat: 6, fiber: 4, iron: 1.6, zinc: 0.9, calcium: 150, b12: 0.5 },
    tip: 'A warm, iron-friendly start to the day. Add berries for vitamin C!',
  },
  {
    id: 'apple', name: 'Apple', desc: 'Fresh fruit · 1 medium', emoji: '🍎', portion: '1 medium (150g)',
    nutrition: { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, iron: 0.2, zinc: 0.1, calcium: 10, b12: 0 },
    tip: 'Light and hydrating — great between meals.',
  },
  {
    id: 'salmon', name: 'Grilled Salmon & Veggies', desc: 'Salmon, beans, lemon', emoji: '🐟', portion: '1 plate (280g)',
    nutrition: { calories: 460, protein: 34, carbs: 18, fat: 26, fiber: 5, iron: 1.8, zinc: 1.2, calcium: 60, b12: 3.4 },
    tip: 'Omega-3 rich — wonderful for easing inflammation and cramps.',
  },
  {
    id: 'salad', name: 'Garden Salad', desc: 'Greens, tomato, cucumber, seeds', emoji: '🥗', portion: '1 bowl (180g)',
    nutrition: { calories: 160, protein: 5, carbs: 14, fat: 9, fiber: 5, iron: 2.2, zinc: 0.8, calcium: 90, b12: 0 },
    tip: 'Leafy greens support iron — squeeze lemon to boost absorption.',
  },
  {
    id: 'dal-rice', name: 'Dal & Rice', desc: 'Lentil dal, steamed rice, Desi Ghee tadka', emoji: '🍛', portion: '1 plate (300g)',
    nutrition: { calories: 430, protein: 14, carbs: 64, fat: 11, fiber: 8, iron: 3.4, zinc: 1.6, calcium: 55, b12: 0.1 },
    tip: 'Comforting and iron-rich — a period-week hero meal.',
  },
  {
    id: 'eggs-toast', name: 'Eggs & Toast', desc: 'Boiled eggs, Multigrain toast', emoji: '🍳', portion: '2 eggs + 1 toast',
    nutrition: { calories: 290, protein: 15, carbs: 22, fat: 15, fiber: 3, iron: 1.9, zinc: 1.3, calcium: 70, b12: 1.1 },
    tip: 'Protein and B12 to keep your energy steady.',
  },
  {
    id: 'smoothie', name: 'Berry Smoothie', desc: 'Banana, berries, curd/yogurt', emoji: '🥤', portion: '1 glass (250ml)',
    nutrition: { calories: 210, protein: 6, carbs: 38, fat: 3, fiber: 5, iron: 0.8, zinc: 0.5, calcium: 130, b12: 0.4 },
    tip: 'Vitamin C helps your body absorb iron from other meals.',
  },
  {
    id: 'chocolate', name: 'Dark Chocolate', desc: '70% cocoa · a few squares', emoji: '🍫', portion: '30g',
    nutrition: { calories: 170, protein: 2, carbs: 13, fat: 12, fiber: 3, iron: 2.3, zinc: 1.0, calcium: 22, b12: 0 },
    tip: 'A little magnesium-rich comfort — you have earned it!',
  },
  {
    id: 'nuts', name: 'Mixed Nuts & Seeds', desc: 'Almonds, walnuts, pumpkin seeds', emoji: '🥜', portion: '1 handful (30g)',
    nutrition: { calories: 180, protein: 6, carbs: 6, fat: 15, fiber: 3, iron: 1.4, zinc: 1.7, calcium: 45, b12: 0 },
    tip: 'Healthy fats + zinc support mood and skin this week.',
  },
];

export const GOALS = [
  { id: 'track', label: 'Track my periods', emoji: '🗓️' },
  { id: 'symptoms', label: 'Manage symptoms', emoji: '🌸' },
  { id: 'nutrition', label: 'Improve nutrition', emoji: '🥗' },
  { id: 'mood', label: 'Track mood & stress', emoji: '💗' },
  { id: 'sleep', label: 'Better sleep', emoji: '🌙' },
  { id: 'all', label: 'All of the above', emoji: '✨' },
];

export const PERIOD_TIPS: Record<string, string[]> = {
  Period: [
    'Use a warm compress on your lower abdomen',
    'Stay hydrated — aim for 6–8 glasses of water',
    'Try light movement or gentle stretching',
    'Ensure adequate sleep — rest when you need to',
    'Iron-rich foods help replace what you lose',
  ],
  Follicular: [
    'Energy usually rises now — a good time for workouts',
    'Fresh, light meals feel great in this phase',
    'Skin tends to glow — keep up your routine',
  ],
  'Fertile Window': [
    'You may notice clear, stretchy discharge — that is normal',
    'Hydrate well and enjoy your energy peak',
    'This is your high-fertility window',
  ],
  Ovulation: [
    'Mild one-sided cramps can happen today',
    'Stay hydrated and eat antioxidant-rich foods',
    'Fertility is at its peak around today',
  ],
  Luteal: [
    'Magnesium-rich foods can ease PMS moods',
    'Gentle yoga or walks help with bloating',
    'Prepare your period kit a few days early',
  ],
  Late: [
    'A delay of a few days can be normal with stress',
    'Rest, eat warm nourishing food, and stay hydrated',
    'If you are concerned, a home test can help',
  ],
};

export const MEDICAL_DISCLAIMER =
  'Myflo offers general wellness information and is not a substitute for medical advice. If pain is severe or different from your usual pattern, please consult a doctor.';
