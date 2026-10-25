import { useCallback, useEffect, useState } from 'react'
import type { AppData, CycleEntry, DailyLog, MealEntry, MedicationRecord, Reminder } from '../domain/types'

const STORAGE_KEY = 'flowra.private-data.v1'

export const nowIso = () => new Date().toISOString()

export function createId(prefix: string): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return `${prefix}_${random}`
}

export function defaultAppData(): AppData {
  return {
    schemaVersion: 1,
    profile: {
      displayName: '',
      cycleIsIrregular: false,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      setupComplete: false,
    },
    cycles: [],
    dailyLogs: [],
    meals: [],
    reminders: [
      { id: 'reminder_period', type: 'period', title: 'Period Reminder', enabled: true, time: '09:00', daysBefore: 3, repeat: 'every_cycle', createdAt: nowIso() },
      { id: 'reminder_ovulation', type: 'appointment', title: 'Ovulation Reminder', enabled: true, time: '09:00', daysBefore: 1, repeat: 'every_cycle', createdAt: nowIso() },
      { id: 'reminder_daily_log', type: 'daily_log', title: 'Symptom Check-in', enabled: true, time: '20:00', repeat: 'daily', createdAt: nowIso() },
      { id: 'reminder_medication', type: 'medication', title: 'Medicine Reminder', enabled: true, time: '09:00', createdAt: nowIso() },
      { id: 'reminder_water', type: 'water', title: 'Water Reminder', enabled: false, time: '13:00', repeat: 'daily', createdAt: nowIso() },
      { id: 'reminder_nutrition', type: 'nutrition', title: 'Nutrition Reminder', enabled: true, time: '13:00', repeat: 'daily', createdAt: nowIso() },
      { id: 'reminder_sleep', type: 'sleep', title: 'Sleep Reminder', enabled: false, time: '22:00', repeat: 'daily', createdAt: nowIso() },
    ],
    medications: [],
    consent: {
      analytics: false,
      aiProcessing: false,
      localNotifications: false,
      dataRetention: 'until_deleted',
    },
  }
}

export function hydrateAppData(raw: string | null): AppData {
  if (!raw) return defaultAppData()
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>
    if (parsed.schemaVersion !== 1) return defaultAppData()
    const defaults = defaultAppData()
    return {
      ...defaults,
      ...parsed,
      profile: { ...defaults.profile, ...parsed.profile },
      consent: { ...defaults.consent, ...parsed.consent },
      cycles: Array.isArray(parsed.cycles) ? parsed.cycles : [],
      dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [],
      meals: Array.isArray(parsed.meals) ? parsed.meals : [],
      reminders: Array.isArray(parsed.reminders) ? parsed.reminders : defaults.reminders,
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
    }
  } catch {
    return defaultAppData()
  }
}

export function loadAppData(): AppData {
  if (typeof window === 'undefined') return defaultAppData()
  return hydrateAppData(window.localStorage.getItem(STORAGE_KEY))
}

export function persistAppData(data: AppData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

// Keeps the legacy storage key so existing private records remain available after the Myflo rebrand.
export function useMyfloStore() {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [storageError, setStorageError] = useState(false)

  useEffect(() => {
    if (!persistAppData(data)) setStorageError(true)
  }, [data])

  const update = useCallback((updater: (current: AppData) => AppData) => {
    setData((current) => updater(current))
  }, [])

  const upsertLog = useCallback((log: DailyLog) => {
    update((current) => ({
      ...current,
      dailyLogs: [log, ...current.dailyLogs.filter((item) => item.date !== log.date)].sort((a, b) => b.date.localeCompare(a.date)),
    }))
  }, [update])

  const deleteLog = useCallback((id: string) => {
    update((current) => ({ ...current, dailyLogs: current.dailyLogs.filter((item) => item.id !== id) }))
  }, [update])

  const upsertCycle = useCallback((cycle: CycleEntry) => {
    update((current) => ({
      ...current,
      cycles: [...current.cycles.filter((item) => item.id !== cycle.id), cycle].sort((a, b) => b.startDate.localeCompare(a.startDate)),
    }))
  }, [update])

  const deleteCycle = useCallback((id: string) => {
    update((current) => ({ ...current, cycles: current.cycles.filter((item) => item.id !== id) }))
  }, [update])

  const addMeal = useCallback((meal: MealEntry) => {
    update((current) => ({ ...current, meals: [meal, ...current.meals].sort((a, b) => b.date.localeCompare(a.date)) }))
  }, [update])

  const deleteMeal = useCallback((id: string) => {
    update((current) => ({ ...current, meals: current.meals.filter((item) => item.id !== id) }))
  }, [update])

  const upsertReminder = useCallback((reminder: Reminder) => {
    update((current) => ({ ...current, reminders: [...current.reminders.filter((item) => item.id !== reminder.id), reminder] }))
  }, [update])

  const deleteReminder = useCallback((id: string) => {
    update((current) => ({ ...current, reminders: current.reminders.filter((item) => item.id !== id) }))
  }, [update])

  const addMedication = useCallback((medication: MedicationRecord) => {
    update((current) => ({ ...current, medications: [medication, ...current.medications] }))
  }, [update])

  const deleteMedication = useCallback((id: string) => {
    update((current) => ({ ...current, medications: current.medications.filter((item) => item.id !== id) }))
  }, [update])

  const updateProfile = useCallback((profile: Partial<AppData['profile']>) => {
    update((current) => ({ ...current, profile: { ...current.profile, ...profile } }))
  }, [update])

  const updateConsent = useCallback((consent: Partial<AppData['consent']>) => {
    update((current) => ({ ...current, consent: { ...current.consent, ...consent } }))
  }, [update])

  const replaceData = useCallback((next: AppData) => setData(next), [])
  const resetData = useCallback(() => setData(defaultAppData()), [])

  return {
    data,
    storageError,
    update,
    upsertLog,
    deleteLog,
    upsertCycle,
    deleteCycle,
    addMeal,
    deleteMeal,
    upsertReminder,
    deleteReminder,
    addMedication,
    deleteMedication,
    updateProfile,
    updateConsent,
    replaceData,
    resetData,
  }
}

export function exportData(data: AppData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `myflo-export-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
