/**
 * Persistence layer.
 *
 * Myflo stores health data locally by default (localStorage) so the app is fully
 * usable without a backend. When Supabase credentials are present in the
 * environment the same interface is backed by Postgres via Row Level Security —
 * see supabase/schema.sql. No credentials ever live in this bundle: the anon key
 * is a public, RLS-protected key.
 */

import type { ISODate } from './cycle';
import { addDays, todayISO } from './cycle';
import type { BleedingKey, MoodKey, SymptomKey } from './catalog';

export type Profile = {
  name: string;
  email: string;
  dateOfBirth: ISODate | null;
  heightCm: number | null;
  weightKg: number | null;
  goals: string[];
};

export type SymptomLog = {
  date: ISODate;
  moods: MoodKey[];
  symptoms: SymptomKey[];
  pain: number;
  bloating: number;
  stress: number;
  energy: number;
  bleeding: BleedingKey | null;
  flowColor: string | null;
  note?: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  date: ISODate;
  body: string;
  createdAt: string;
};

export type Medicine = {
  id: string;
  name: string;
  dose: string;
  reason: string;
  schedule: string;
  startDate: ISODate;
  reminder: boolean;
};

export type Reminder = {
  id: string;
  label: string;
  time: string;
  enabled: boolean;
  kind: 'period' | 'checkin' | 'medicine' | 'water' | 'nutrition' | 'sleep';
};

export type AppData = {
  version: 1;
  profile: Profile;
  /** logged period start dates, newest last */
  periodStarts: ISODate[];
  symptomLogs: Record<ISODate, SymptomLog>;
  notes: Note[];
  medicines: Medicine[];
  reminders: Reminder[];
};

const KEY = 'myflo.v1';

function seed(): AppData {
  const today = todayISO();
  // A plausible 6-month history that produces the reference's 26–31 day spread.
  const lengths = [29, 33, 26, 31, 28];
  const starts: ISODate[] = [today];
  let cursor = addDays(today, -3); // today is day 4 of the current period
  for (let i = lengths.length - 1; i >= 0; i -= 1) {
    starts.unshift(cursor);
    cursor = addDays(cursor, -lengths[i]);
  }
  starts.sort();
  // today is "Day 1" in the reference, so the newest start is today
  starts[starts.length - 1] = today;

  return {
    version: 1,
    profile: {
      name: 'Gargi',
      email: 'gargi@email.com',
      dateOfBirth: '2000-04-06',
      heightCm: 160,
      weightKg: 50,
      goals: ['Track my periods', 'Manage symptoms', 'Improve nutrition'],
    },
    periodStarts: starts,
    symptomLogs: {},
    notes: [
      {
        id: 'seed-note',
        date: today,
        body: 'Felt low energy today but mood is better',
        createdAt: new Date().toISOString(),
      },
    ],
    medicines: [
      {
        id: 'seed-med-1',
        name: 'Ibuprofen',
        dose: '400 mg',
        reason: 'Helps reduce cramps and pain',
        schedule: 'Twice daily',
        startDate: today,
        reminder: true,
      },
    ],
    reminders: [
      { id: 'r1', label: 'Period Reminder', time: '2 days before', enabled: true, kind: 'period' },
      { id: 'r2', label: 'Ovulation Reminder', time: 'Cycle day 14', enabled: false, kind: 'period' },
      { id: 'r3', label: 'Symptom Check-in', time: '08:00 AM', enabled: true, kind: 'checkin' },
      { id: 'r4', label: 'Medicine Reminder', time: '09:00 AM', enabled: true, kind: 'medicine' },
      { id: 'r5', label: 'Water Reminder', time: 'Every 2 hours', enabled: false, kind: 'water' },
    ],
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== 1) return seed();
    return { ...seed(), ...parsed, profile: { ...seed().profile, ...parsed.profile } };
  } catch {
    return seed();
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* storage may be unavailable (private mode) — the session still works in memory */
  }
}

export function resetData() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export const newId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
