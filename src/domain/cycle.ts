import type { CycleEntry, CyclePrediction } from './types'

const DAY_MS = 86_400_000

/** Date-only helpers deliberately use UTC to avoid DST / locale shifts. */
export function parseDate(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function todayKey(now = new Date()): string {
  return toDateKey(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())))
}

export function addDays(date: string, amount: number): string {
  const result = parseDate(date)
  result.setUTCDate(result.getUTCDate() + amount)
  return toDateKey(result)
}

export function daysBetween(earlier: string, later: string): number {
  return Math.round((parseDate(later).getTime() - parseDate(earlier).getTime()) / DAY_MS)
}

export function isDateInRange(date: string, start?: string, end?: string): boolean {
  if (!start || !end) return false
  return date >= start && date <= end
}

function mean(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length
}

function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0
  const average = mean(values)
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)))
}

function validCycles(entries: CycleEntry[]): CycleEntry[] {
  return [...entries]
    .filter((entry) => /^\d{4}-\d{2}-\d{2}$/.test(entry.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
}

/**
 * Estimates only from recorded starts. It intentionally does not invent a 28-day
 * cycle when there is not enough information.
 */
export function predictCycle(entries: CycleEntry[]): CyclePrediction {
  const cycles = validCycles(entries)
  const intervals = cycles
    .slice(1)
    .map((entry, index) => daysBetween(cycles[index].startDate, entry.startDate))
    .filter((days) => days >= 15 && days <= 90)
    .slice(-6)

  const periodLengths = cycles
    .map((entry) => (entry.endDate && entry.endDate >= entry.startDate ? daysBetween(entry.startDate, entry.endDate) + 1 : undefined))
    .filter((days): days is number => typeof days === 'number' && days >= 1 && days <= 14)
    .slice(-6)

  const averagePeriodLength = periodLengths.length ? Math.round(mean(periodLengths)) : 5

  if (!intervals.length || !cycles.length) {
    return {
      averageCycleLength: 0,
      averagePeriodLength,
      confidence: 'low',
      basis: intervals.length,
    }
  }

  const averageCycleLength = Math.round(mean(intervals))
  const variability = Math.round(standardDeviation(intervals) * 10) / 10
  const latest = cycles.at(-1)!
  const nextPeriodStart = addDays(latest.startDate, averageCycleLength)
  const nextPeriodEnd = addDays(nextPeriodStart, Math.max(averagePeriodLength - 1, 0))
  // Ovulation timing varies substantially; show it as an estimate only.
  const ovulationDate = addDays(nextPeriodStart, -14)

  return {
    averageCycleLength,
    averagePeriodLength,
    nextPeriodStart,
    nextPeriodEnd,
    fertileStart: addDays(ovulationDate, -5),
    fertileEnd: addDays(ovulationDate, 1),
    ovulationDate,
    confidence: intervals.length >= 4 && variability <= 3 ? 'higher' : intervals.length >= 2 && variability <= 7 ? 'moderate' : 'low',
    basis: intervals.length,
    variabilityDays: variability,
  }
}

export function getCurrentCycleDay(entries: CycleEntry[], currentDate = todayKey()): number | undefined {
  const mostRecent = validCycles(entries).filter((entry) => entry.startDate <= currentDate).at(-1)
  if (!mostRecent) return undefined
  return daysBetween(mostRecent.startDate, currentDate) + 1
}

export type CyclePhase = 'Menstrual' | 'Follicular' | 'Ovulation window' | 'Luteal' | 'Not estimable'

export function getCyclePhase(cycleDay: number | undefined, prediction: CyclePrediction): CyclePhase {
  if (!cycleDay || !prediction.averageCycleLength || prediction.confidence === 'low') return 'Not estimable'
  if (cycleDay <= prediction.averagePeriodLength) return 'Menstrual'
  const ovulationStart = Math.max(8, prediction.averageCycleLength - 16)
  const ovulationEnd = prediction.averageCycleLength - 12
  if (cycleDay >= ovulationStart && cycleDay <= ovulationEnd) return 'Ovulation window'
  if (cycleDay < ovulationStart) return 'Follicular'
  return 'Luteal'
}

export function dateIsRecordedPeriod(date: string, entries: CycleEntry[]): boolean {
  return entries.some((entry) => isDateInRange(date, entry.startDate, entry.endDate ?? entry.startDate))
}

export function dateIsEstimatedPeriod(date: string, prediction: CyclePrediction): boolean {
  return isDateInRange(date, prediction.nextPeriodStart, prediction.nextPeriodEnd)
}

export function dateIsFertile(date: string, prediction: CyclePrediction): boolean {
  return isDateInRange(date, prediction.fertileStart, prediction.fertileEnd)
}

export function humanDate(date?: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  if (!date) return 'Not enough history'
  return new Intl.DateTimeFormat('en-IN', { ...options, timeZone: 'UTC' }).format(parseDate(date))
}
