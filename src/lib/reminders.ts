import type { Reminder } from '../domain/types'

const MAX_TIMEOUT = 2_147_000_000

function isWithinQuietHours(now: Date, start?: string, end?: string): boolean {
  if (!start || !end) return false
  const current = now.getHours() * 60 + now.getMinutes()
  const toMinutes = (value: string) => {
    const [hours, minutes] = value.split(':').map(Number)
    return hours * 60 + minutes
  }
  const startMinutes = toMinutes(start)
  const endMinutes = toMinutes(end)
  return startMinutes <= endMinutes
    ? current >= startMinutes && current < endMinutes
    : current >= startMinutes || current < endMinutes
}

function nextOccurrence(time: string, now: Date): Date {
  const [hours, minutes] = time.split(':').map(Number)
  const candidate = new Date(now)
  candidate.setHours(hours, minutes, 0, 0)
  if (candidate <= now) candidate.setDate(candidate.getDate() + 1)
  return candidate
}

function plannedCycleOccurrence(time: string, targetDate: string | undefined, daysBefore: number | undefined, now: Date): Date | undefined {
  if (!targetDate) return undefined
  const [hours, minutes] = time.split(':').map(Number)
  const candidate = new Date(`${targetDate}T12:00:00`)
  candidate.setDate(candidate.getDate() - Math.max(0, daysBefore ?? 0))
  candidate.setHours(hours, minutes, 0, 0)
  return candidate > now ? candidate : undefined
}

/**
 * Local, in-tab reminder delivery. A service worker and server-side push provider
 * are intentionally required for notification delivery after the browser closes.
 */
export function scheduleLocalReminders(reminders: Reminder[], onDelivered: (id: string, at: string) => void, cycleDates?: { nextPeriodStart?: string; ovulationDate?: string }): () => void {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return () => undefined
  const timers: number[] = []
  const now = new Date()
  const dateKey = now.toISOString().slice(0, 10)

  reminders.filter((reminder) => reminder.enabled).forEach((reminder) => {
    if (reminder.lastNotifiedAt?.slice(0, 10) === dateKey) return
    if (isWithinQuietHours(now, reminder.quietHoursStart, reminder.quietHoursEnd)) return
    const scheduled = reminder.type === 'period'
      ? plannedCycleOccurrence(reminder.time, cycleDates?.nextPeriodStart, reminder.daysBefore, now)
      : reminder.type === 'appointment'
        ? plannedCycleOccurrence(reminder.time, cycleDates?.ovulationDate, reminder.daysBefore, now)
        : nextOccurrence(reminder.time, now)
    if (!scheduled) return
    const delay = scheduled.getTime() - now.getTime()
    if (delay <= 0 || delay > MAX_TIMEOUT) return
    const timer = window.setTimeout(() => {
      const deliveryTime = new Date()
      if (isWithinQuietHours(deliveryTime, reminder.quietHoursStart, reminder.quietHoursEnd)) return
      new Notification('Myflo', { body: reminder.title, tag: `myflo-${reminder.id}` })
      onDelivered(reminder.id, deliveryTime.toISOString())
    }, delay)
    timers.push(timer)
  })

  return () => timers.forEach((timer) => window.clearTimeout(timer))
}
