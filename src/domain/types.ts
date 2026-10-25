export type BleedingLevel = 'none' | 'spotting' | 'light' | 'moderate' | 'heavy'
export type FlowColor = 'bright_red' | 'dark_red' | 'brown' | 'pink' | 'orange_unusual' | 'other_unsure'
export type Mood = 'happy' | 'calm' | 'irritable' | 'anxious' | 'sad' | 'low' | 'confused' | 'sleepy'
export type Symptom =
  | 'cramps'
  | 'headache'
  | 'bloating'
  | 'acne'
  | 'fatigue'
  | 'back_pain'
  | 'nausea'
  | 'food_cravings'
  | 'breast_tenderness'
  | 'constipation'
  | 'diarrhea'
  | 'sleep_disturbance'

export type PainLocation = 'lower_abdomen' | 'back' | 'head' | 'pelvis' | 'other'

export interface CycleEntry {
  id: string
  startDate: string
  endDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DailyLog {
  id: string
  date: string
  painScore: number
  painLocations: PainLocation[]
  painDuration?: string
  painWorsening: boolean
  painInterferes: boolean
  medicationTaken?: string
  medicationHelped?: 'yes' | 'no' | 'unsure'
  bleeding: BleedingLevel
  flowColor?: FlowColor
  flowConsistency?: string
  productsChanged?: 'not_applicable' | 'less_than_2h' | '2_to_4h' | '4_to_8h' | 'more_than_8h'
  fullySoaked: boolean
  leakage: boolean
  largeClots: boolean
  possiblePregnancy: boolean
  fainting: boolean
  fever: boolean
  shortnessBreath: boolean
  bloatingScore: number
  stressScore: number
  energyScore: number
  mood?: Mood
  symptoms: Symptom[]
  sleepHours?: number
  sleepQuality?: number
  waterMl?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface MealNutrients {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  fiberG: number
  ironMg?: number
  zincMg?: number
  calciumMg?: number
  vitaminB12McG?: number
  folateMcG?: number
}

export interface MealEntry {
  id: string
  date: string
  name: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  portionLabel: string
  nutrients: MealNutrients
  source: 'manual' | 'reference'
  confidence: 'user_entered' | 'estimated'
  notes?: string
  createdAt: string
}

export type ReminderType =
  | 'daily_log'
  | 'water'
  | 'nutrition'
  | 'sleep'
  | 'period'
  | 'medication'
  | 'appointment'

export interface Reminder {
  id: string
  type: ReminderType
  title: string
  enabled: boolean
  time: string
  daysBefore?: number
  repeat?: 'every_cycle' | 'once' | 'daily'
  quietHoursStart?: string
  quietHoursEnd?: string
  lastNotifiedAt?: string
  createdAt: string
}

export interface MedicationRecord {
  id: string
  name: string
  dose?: string
  takenAt: string
  reason?: string
  sideEffects?: string
  helped?: 'yes' | 'no' | 'unsure'
  repeat?: 'only_this_cycle' | 'daily' | 'as_needed'
  createdAt: string
}

export interface ConsentSettings {
  analytics: boolean
  aiProcessing: boolean
  localNotifications: boolean
  dataRetention: 'until_deleted' | '12_months'
  acceptedAt?: string
}

export interface UserProfile {
  displayName: string
  cycleIsIrregular: boolean
  averageCycleLength?: number
  periodDuration?: number
  birthDate?: string
  heightCm?: number
  weightKg?: number
  goals?: string[]
  timezone: string
  setupComplete: boolean
}

export interface AppData {
  schemaVersion: 1
  profile: UserProfile
  cycles: CycleEntry[]
  dailyLogs: DailyLog[]
  meals: MealEntry[]
  reminders: Reminder[]
  medications: MedicationRecord[]
  consent: ConsentSettings
}

export interface CyclePrediction {
  averageCycleLength: number
  averagePeriodLength: number
  nextPeriodStart?: string
  nextPeriodEnd?: string
  fertileStart?: string
  fertileEnd?: string
  ovulationDate?: string
  confidence: 'low' | 'moderate' | 'higher'
  basis: number
  variabilityDays?: number
}

export interface SafetyAlert {
  id: string
  severity: 'urgent' | 'soon' | 'watch'
  title: string
  message: string
  action: string
}
