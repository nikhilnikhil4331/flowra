import { describe, expect, it } from 'vitest'
import { getCurrentCycleDay, getCyclePhase, predictCycle } from './cycle'
import type { CycleEntry } from './types'

const cycle = (startDate: string, endDate?: string): CycleEntry => ({ id: startDate, startDate, endDate, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' })

describe('cycle predictions', () => {
  it('does not force a 28-day estimate when there is insufficient history', () => {
    const prediction = predictCycle([cycle('2026-01-05', '2026-01-09')])
    expect(prediction.averageCycleLength).toBe(0)
    expect(prediction.nextPeriodStart).toBeUndefined()
    expect(prediction.confidence).toBe('low')
  })

  it('uses recorded start-date intervals and recorded period lengths', () => {
    const prediction = predictCycle([
      cycle('2026-01-01', '2026-01-05'),
      cycle('2026-01-30', '2026-02-03'),
      cycle('2026-02-28', '2026-03-04'),
      cycle('2026-03-29', '2026-04-02'),
    ])
    expect(prediction.averageCycleLength).toBe(29)
    expect(prediction.averagePeriodLength).toBe(5)
    expect(prediction.nextPeriodStart).toBe('2026-04-27')
    expect(prediction.ovulationDate).toBe('2026-04-13')
    expect(prediction.confidence).toBe('moderate')
  })

  it('keeps irregular histories cautious', () => {
    const prediction = predictCycle([
      cycle('2026-01-01'),
      cycle('2026-01-25'),
      cycle('2026-03-06'),
      cycle('2026-03-31'),
    ])
    expect(prediction.averageCycleLength).toBe(30)
    expect(prediction.variabilityDays).toBeGreaterThan(5)
    expect(prediction.confidence).toBe('low')
  })

  it('calculates a current cycle day and avoids phase claims under low confidence', () => {
    const entries = [cycle('2026-01-01'), cycle('2026-01-29'), cycle('2026-02-26')]
    const prediction = predictCycle(entries)
    expect(getCurrentCycleDay(entries, '2026-03-05')).toBe(8)
    expect(getCyclePhase(8, prediction)).toBe('Follicular')
    expect(getCyclePhase(8, { ...prediction, confidence: 'low' })).toBe('Not estimable')
  })
})
