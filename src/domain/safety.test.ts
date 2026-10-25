import { describe, expect, it } from 'vitest'
import { evaluateSafety } from './safety'
import type { DailyLog } from './types'

function log(overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    id: 'log_1', date: '2026-10-25', painScore: 2, painLocations: [], painWorsening: false, painInterferes: false,
    bleeding: 'light', productsChanged: 'not_applicable', fullySoaked: false, leakage: false, largeClots: false,
    possiblePregnancy: false, fainting: false, fever: false, shortnessBreath: false, bloatingScore: 1, stressScore: 3,
    energyScore: 6, symptoms: [], createdAt: '2026-10-25T00:00:00.000Z', updatedAt: '2026-10-25T00:00:00.000Z',
    ...overrides,
  }
}

describe('deterministic safety gate', () => {
  it('escalates possible pregnancy with bleeding or clinically relevant pain', () => {
    const alerts = evaluateSafety(log({ possiblePregnancy: true, bleeding: 'spotting', painScore: 4 }))
    expect(alerts.some((alert) => alert.id === 'pregnancy_bleeding_or_pain' && alert.severity === 'urgent')).toBe(true)
  })

  it('escalates severe worsening pain', () => {
    const alerts = evaluateSafety(log({ painScore: 8, painWorsening: true }))
    expect(alerts.some((alert) => alert.id === 'severe_or_worsening_pain' && alert.severity === 'urgent')).toBe(true)
  })

  it('escalates rapid heavy bleeding with practical warning signs', () => {
    const alerts = evaluateSafety(log({ bleeding: 'heavy', productsChanged: 'less_than_2h', largeClots: true, leakage: true }))
    expect(alerts.some((alert) => alert.id === 'very_heavy_bleeding' && alert.severity === 'urgent')).toBe(true)
  })

  it('does not turn an ordinary low-pain log into an urgent alert', () => {
    const alerts = evaluateSafety(log())
    expect(alerts.some((alert) => alert.severity === 'urgent')).toBe(false)
  })
})
