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

/**
 * Local, in-tab reminder delivery. A service worker and server-side push provider
 * are intentionally required for notification delivery after the browser closes.
 */
export function scheduleLocalReminders(reminders: Reminder[], onDelivered: (id: string, at: string) => void): () => void {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') return () => undefined
  const timers: number[] = []
  const now = new Date()
  const dateKey = now.toISOString().slice(0, 10)

  reminders.filter((reminder) => reminder.enabled).forEach((reminder) => {
    if (reminder.lastNotifiedAt?.slice(0, 10) === dateKey) return
    if (isWithinQuietHours(now, reminder.quietHoursStart, reminder.quietHoursEnd)) return
    const scheduled = nextOccurrence(reminder.time, now)
    const delay = scheduled.getTime() - now.getTime()
    if (delay <= 0 || delay > MAX_TIMEOUT) return
    const timer = window.setTimeout(() => {
      const deliveryTime = new Date()
      if (isWithinQuietHours(deliveryTime, reminder.quietHoursStart, reminder.quietHoursEnd)) return
      new Notification('Flowra', { body: reminder.title, tag: `flowra-${reminder.id}` })
      onDelivered(reminder.id, deliveryTime.toISOString())
    }, delay)
    timers.push(timer)
  })

  return () => timers.forEach((timer) => window.clearTimeout(timer))
}
