import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PeriodLog, DateKey, toKey, add, today, uid } from './lib/cycle';

export type ScreenId =
  | 'splash' | 'onboard1' | 'onboard2' | 'onboard3'
  | 'signup' | 'login' | 'profile' | 'goals'
  | 'home' | 'calendar' | 'insights' | 'more'
  | 'log-period' | 'log-symptoms' | 'body-tracker'
  | 'food-scanner' | 'nutrition-result' | 'daily-nutrition'
  | 'flow-color' | 'flow-guide' | 'delay-guide' | 'cycle-history'
  | 'medicine' | 'add-medicine' | 'reminders' | 'reminder-detail'
  | 'ai' | 'reports' | 'settings';

export interface NavEntry {
  screen: ScreenId;
  params?: Record<string, unknown>;
}

export interface UserProfile {
  name: string;
  email: string;
  dob: string;
  height: number; // cm
  weight: number; // kg
  goals: string[];
  cycleLen?: number; // preferred typical cycle length (fallback for predictions)
  periodLen?: number; // preferred typical period length
}

export interface DayLog {
  mood?: string;
  symptoms: string[];
  pain: number; // 0-10 (lower abdomen)
  bleeding?: 'Spotting' | 'Light' | 'Moderate' | 'Heavy';
  bloating: number;
  stress: number;
  energy: number;
  note?: string;
  noteTime?: string;
  water?: number; // ml of water drank that day
}

export interface Meal {
  id: string;
  date: DateKey;
  name: string;
  desc: string;
  emoji: string;
  image?: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
}

export interface Medicine {
  id: string;
  name: string;
  dose: string;
  reason: string;
  desc?: string;
  startDate: DateKey;
  reminder: boolean;
}

export interface Reminder {
  id: string;
  kind: 'period' | 'ovulation' | 'symptom' | 'medicine' | 'water' | 'nutrition' | 'sleep';
  title: string;
  desc: string;
  enabled: boolean;
  leadDays: number;
  time: string;
  repeat: string;
}

export interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  text: string;
}

const emptyDay = (): DayLog => ({ symptoms: [], pain: 0, bloating: 0, stress: 0, energy: 5 });

export function seedDemoData() {
  const t = today();
  // cycle starts backwards from today (today = Day 1, like the reference home screen)
  const offsets = [0, -28, -55, -85, -111, -142, -170];
  const durations = [5, 4, 5, 4, 5, 4, 4];
  const intensities: PeriodLog['intensity'][] = ['Moderate', 'Moderate', 'Light', 'Moderate', 'Heavy', 'Moderate', 'Light'];
  const colors = ['bright-red', 'bright-red', 'dark-red', 'bright-red', 'dark-red', 'bright-red', 'brown'];
  const syms: string[][] = [
    ['Cramps', 'Bloating', 'Headache'],
    ['Cramps', 'Fatigue'],
    ['Cramps', 'Bloating', 'Acne'],
    ['Cramps', 'Headache', 'Mood Swings'],
    ['Cramps', 'Bloating', 'Fatigue', 'Back Pain'],
    ['Headache', 'Acne'],
    ['Cramps', 'Mood Swings'],
  ];
  const periods: PeriodLog[] = offsets.map((off, i) => ({
    id: uid(),
    start: toKey(add(t, off)),
    end: toKey(add(t, off + durations[i] - 1)),
    intensity: intensities[i],
    color: colors[i],
    symptoms: syms[i],
  }));

  const dayLogs: Record<DateKey, DayLog> = {};
  const painPattern = [6, 5, 4, 6, 5, 4, 6];
  offsets.forEach((off, i) => {
    for (let d = 0; d < durations[i]; d++) {
      dayLogs[toKey(add(t, off + d))] = {
        mood: d === 0 ? 'anxious' : d === 1 ? 'sad' : 'calm',
        symptoms: syms[i].map((s) => s.toLowerCase().replace(/ /g, '-')),
        pain: Math.max(1, painPattern[i] - d),
        bleeding: d === 0 ? 'Moderate' : d === 1 ? 'Heavy' : d === 2 ? 'Moderate' : 'Light',
        bloating: 4,
        stress: 5,
        energy: 3 + d,
      };
    }
    // a couple of mid-cycle logs
    dayLogs[toKey(add(t, off + 13))] = { mood: 'happy', symptoms: [], pain: 1, bloating: 2, stress: 3, energy: 8 };
    dayLogs[toKey(add(t, off + 21))] = { mood: 'confused', symptoms: ['acne', 'mood-swings'], pain: 2, bloating: 5, stress: 6, energy: 5 };
  });

  // today matches the reference "Day 1" story
  dayLogs[toKey(t)] = {
    mood: 'anxious',
    symptoms: ['cramps', 'bloating', 'headache'],
    pain: 6,
    bleeding: 'Moderate',
    bloating: 4,
    stress: 7,
    energy: 3,
    note: 'Felt low energy today but mood is better',
    noteTime: '06:30 PM',
  };

  const tk = toKey(t);
  const meals: Meal[] = [
    { id: uid(), date: tk, name: 'Oats with milk', desc: '220 kcal · 8g protein', emoji: '🥣', image: '/images/food-oats.jpg', time: '08:30 AM', calories: 220, protein: 8, carbs: 34, fat: 6, fiber: 4, iron: 1.6 },
    { id: uid(), date: tk, name: 'Apple', desc: '95 kcal', emoji: '🍎', time: '11:40 AM', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4, iron: 0.2 },
    { id: uid(), date: tk, name: 'Grilled Chicken Bowl', desc: '420 kcal · 28g protein', emoji: '🍗', image: '/images/food-bowl.jpg', time: '01:15 PM', calories: 420, protein: 28, carbs: 52, fat: 12, fiber: 6, iron: 2.8 },
  ];

  const reminders: Reminder[] = [
    { id: uid(), kind: 'period', title: 'Period Reminder', desc: 'Notify 3 days before', enabled: true, leadDays: 3, time: '09:00', repeat: 'Every cycle' },
    { id: uid(), kind: 'ovulation', title: 'Ovulation Reminder', desc: 'Notify 1 day before', enabled: true, leadDays: 1, time: '09:00', repeat: 'Every cycle' },
    { id: uid(), kind: 'symptom', title: 'Symptom Check-in', desc: 'Daily at 8:00 PM', enabled: true, leadDays: 0, time: '20:00', repeat: 'Every day' },
    { id: uid(), kind: 'medicine', title: 'Medicine Reminder', desc: 'Take on time', enabled: false, leadDays: 0, time: '09:00', repeat: 'Every day' },
    { id: uid(), kind: 'water', title: 'Water Reminder', desc: 'Stay hydrated', enabled: true, leadDays: 0, time: '11:00', repeat: 'Every day' },
    { id: uid(), kind: 'nutrition', title: 'Nutrition Reminder', desc: 'Log your meals', enabled: false, leadDays: 0, time: '13:00', repeat: 'Every day' },
    { id: uid(), kind: 'sleep', title: 'Sleep Reminder', desc: 'Go to bed at 10:00 PM', enabled: false, leadDays: 0, time: '22:00', repeat: 'Every day' },
  ];

  const chat: ChatMsg[] = [
    { id: uid(), role: 'ai', text: "Hi! I'm here to understand your cycle, symptoms, nutrition and lifestyle. How can I help you today?" },
    { id: uid(), role: 'user', text: 'My period has just started and I have cramps. What can I do?' },
    {
      id: uid(), role: 'ai',
      text: "I see you're on Day 1 of your cycle — cramps are common at this time. Here are some suggestions:\n• Use a warm compress\n• Stay hydrated\n• Try light movement or stretching\n• Ensure adequate sleep\n\nIf pain is severe or different from your usual pattern, please consult a doctor. 🌸",
    },
  ];

  return { periods, dayLogs, meals, reminders, chat };
}

interface State {
  onboarded: boolean;
  user: UserProfile;
  periods: PeriodLog[];
  dayLogs: Record<DateKey, DayLog>;
  meals: Meal[];
  medicines: Medicine[];
  reminders: Reminder[];
  chat: ChatMsg[];
  seeded: boolean;

  nav: NavEntry[];
  sheetOpen: boolean;
  toast: string | null;

  go: (screen: ScreenId, params?: Record<string, unknown>) => void;
  back: () => void;
  tabTo: (screen: ScreenId) => void;
  replace: (screen: ScreenId, params?: Record<string, unknown>) => void;
  setSheet: (open: boolean) => void;
  showToast: (msg: string) => void;

  completeOnboarding: (user: UserProfile) => void;
  setUser: (patch: Partial<UserProfile>) => void;
  savePeriod: (p: Omit<PeriodLog, 'id'> & { id?: string }) => void;
  deletePeriod: (id: string) => void;
  setDayLog: (key: DateKey, patch: Partial<DayLog>) => void;
  addMeal: (m: Omit<Meal, 'id'>) => void;
  deleteMeal: (id: string) => void;
  addMedicine: (m: Omit<Medicine, 'id'>) => void;
  deleteMedicine: (id: string) => void;
  setReminder: (id: string, patch: Partial<Reminder>) => void;
  pushChat: (role: 'ai' | 'user', text: string) => void;
  logout: () => void;
  resetAll: () => void;
}

const blankUser: UserProfile = { name: '', email: '', dob: '', height: 160, weight: 50, goals: [] };

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      onboarded: false,
      user: blankUser,
      periods: [],
      dayLogs: {},
      meals: [],
      medicines: [],
      reminders: [],
      chat: [],
      seeded: false,

      nav: [{ screen: 'splash' }],
      sheetOpen: false,
      toast: null,

      go: (screen, params) => set((s) => ({ nav: [...s.nav, { screen, params }], sheetOpen: false })),
      back: () => set((s) => ({ nav: s.nav.length > 1 ? s.nav.slice(0, -1) : s.nav })),
      tabTo: (screen) => set({ nav: [{ screen }], sheetOpen: false }),
      replace: (screen, params) => set((s) => ({ nav: [...s.nav.slice(0, -1), { screen, params }] })),
      setSheet: (open) => set({ sheetOpen: open }),
      showToast: (msg) => {
        set({ toast: msg });
        setTimeout(() => {
          if (get().toast === msg) set({ toast: null });
        }, 2600);
      },

      completeOnboarding: (user) => {
        const demo = get().seeded ? {} : { ...seedDemoData(), seeded: true };
        set({ user, onboarded: true, ...demo, nav: [{ screen: 'home' }] });
      },
      setUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),

      savePeriod: (p) =>
        set((s) => {
          if (p.id) {
            return { periods: s.periods.map((x) => (x.id === p.id ? { ...x, ...p, id: x.id } : x)) };
          }
          return { periods: [...s.periods, { ...p, id: uid() }] };
        }),
      deletePeriod: (id) => set((s) => ({ periods: s.periods.filter((p) => p.id !== id) })),
      setDayLog: (key, patch) =>
        set((s) => ({ dayLogs: { ...s.dayLogs, [key]: { ...emptyDay(), ...s.dayLogs[key], ...patch } } })),
      addMeal: (m) => set((s) => ({ meals: [...s.meals, { ...m, id: uid() }] })),
      deleteMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      addMedicine: (m) => set((s) => ({ medicines: [...s.medicines, { ...m, id: uid() }] })),
      deleteMedicine: (id) => set((s) => ({ medicines: s.medicines.filter((m) => m.id !== id) })),
      setReminder: (id, patch) =>
        set((s) => ({ reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      pushChat: (role, text) => set((s) => ({ chat: [...s.chat, { id: uid(), role, text }] })),

      logout: () => set({ onboarded: false, nav: [{ screen: 'login' }] }),
      resetAll: () =>
        set({
          onboarded: false, user: blankUser, periods: [], dayLogs: {}, meals: [],
          medicines: [], reminders: [], chat: [], seeded: false, nav: [{ screen: 'splash' }],
        }),
    }),
    {
      name: 'myflo-store-v1',
      partialize: (s) => ({
        onboarded: s.onboarded,
        user: s.user,
        periods: s.periods,
        dayLogs: s.dayLogs,
        meals: s.meals,
        medicines: s.medicines,
        reminders: s.reminders,
        chat: s.chat,
        seeded: s.seeded,
      }),
    },
  ),
);

export const useNav = (): NavEntry => {
  const nav = useStore((s) => s.nav);
  return nav[nav.length - 1];
};
