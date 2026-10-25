import type { DailyLog, SafetyAlert } from './types'

/**
 * Deterministic pre-response safety gate. This is intentionally conservative,
 * transparent, and independent from any AI service. It provides escalation
 * guidance—not diagnoses.
 */
export function evaluateSafety(log: Pick<DailyLog,
  | 'painScore'
  | 'bleeding'
  | 'painWorsening'
  | 'painInterferes'
  | 'possiblePregnancy'
  | 'fainting'
  | 'fever'
  | 'shortnessBreath'
  | 'fullySoaked'
  | 'productsChanged'
  | 'leakage'
  | 'largeClots'
  | 'flowColor'
>): SafetyAlert[] {
  const alerts: SafetyAlert[] = []
  const hasBleeding = log.bleeding !== 'none'
  const rapidSoaking = log.productsChanged === 'less_than_2h' || log.fullySoaked

  if (log.fainting || log.shortnessBreath) {
    alerts.push({
      id: 'fainting_or_breathing',
      severity: 'urgent',
      title: 'Seek urgent medical evaluation now',
      message: 'Fainting or difficulty breathing alongside menstrual or pelvic symptoms needs prompt in-person assessment.',
      action: 'Contact local emergency services or go to the nearest emergency department. Do not drive yourself if you feel faint.',
    })
  }

  if (log.possiblePregnancy && (hasBleeding || log.painScore >= 4)) {
    alerts.push({
      id: 'pregnancy_bleeding_or_pain',
      severity: 'urgent',
      title: 'Possible pregnancy with pain or bleeding',
      message: 'Bleeding or pelvic pain when pregnancy is possible needs prompt clinical assessment. This app cannot determine the cause.',
      action: 'Seek urgent medical advice today, especially for one-sided, sudden, or worsening pain.',
    })
  }

  if (log.painScore >= 8 && (log.painWorsening || log.painInterferes)) {
    alerts.push({
      id: 'severe_or_worsening_pain',
      severity: 'urgent',
      title: 'Severe or worsening pain recorded',
      message: 'Your pain score is severe and is affecting you or getting worse. Do not rely on wellness tips alone.',
      action: 'Arrange urgent medical assessment now, especially if the pain is new, sudden, or different from your usual pattern.',
    })
  }

  if (log.bleeding === 'heavy' && rapidSoaking && (log.largeClots || log.leakage || log.painScore >= 7)) {
    alerts.push({
      id: 'very_heavy_bleeding',
      severity: 'urgent',
      title: 'Very heavy bleeding needs urgent assessment',
      message: 'Rapidly soaked products or heavy bleeding with large clots, leakage, or severe pain can need urgent care.',
      action: 'Seek urgent clinical advice today. If you are dizzy, faint, short of breath, or rapidly soaking products, seek emergency care.',
    })
  }

  if (log.fever && (log.painScore >= 5 || log.flowColor === 'orange_unusual')) {
    alerts.push({
      id: 'fever_with_pain_or_unusual_discharge',
      severity: 'soon',
      title: 'Arrange medical advice soon',
      message: 'Fever with pelvic pain or unusual discharge should be assessed by a qualified clinician.',
      action: 'Contact a clinician or urgent care service today. Seek urgent care earlier if symptoms worsen.',
    })
  }

  if (log.painScore >= 7 && !alerts.some((alert) => alert.severity === 'urgent')) {
    alerts.push({
      id: 'severe_pain',
      severity: 'soon',
      title: 'Severe pain recorded',
      message: 'A pain score of 7 or more can significantly affect daily life. It does not diagnose a condition, but deserves attention when new, persistent, or different for you.',
      action: 'Consider contacting a clinician, particularly if rest and your usual safe comfort measures are not helping.',
    })
  }

  if (log.bleeding === 'heavy' || rapidSoaking || log.largeClots) {
    alerts.push({
      id: 'heavy_bleeding_checkin',
      severity: 'watch',
      title: 'Monitor bleeding closely',
      message: 'Heavy bleeding cannot be measured exactly from a log. Practical details such as rapid soaking, leakage, large clots, dizziness, or shortness of breath matter.',
      action: 'If these occur or bleeding feels unusually heavy for you, seek medical advice.',
    })
  }

  if (log.flowColor === 'orange_unusual') {
    alerts.push({
      id: 'unusual_discharge_context',
      severity: 'watch',
      title: 'Unusual discharge needs context',
      message: 'Color alone cannot diagnose infection or a hormonal issue. Odour, itching, fever, or pelvic pain are important context.',
      action: 'Arrange medical advice if associated symptoms are present or you are concerned.',
    })
  }

  return dedupeAlerts(alerts)
}

function dedupeAlerts(alerts: SafetyAlert[]): SafetyAlert[] {
  return alerts.filter((alert, index) => alerts.findIndex((candidate) => candidate.id === alert.id) === index)
}

export function buildDailySummary(log: Pick<DailyLog, 'painScore' | 'bleeding' | 'bloatingScore' | 'stressScore' | 'energyScore' | 'symptoms'>, previousLogs: DailyLog[]): string {
  const pieces = [
    `Pain: ${log.painScore}/10`,
    `Bleeding: ${formatBleeding(log.bleeding)}`,
    `Bloating: ${log.bloatingScore}/10`,
    `Stress: ${log.stressScore}/10`,
    `Energy: ${log.energyScore}/10`,
  ]

  const recent = previousLogs.slice(0, 14)
  const averagePain = recent.length ? recent.reduce((total, item) => total + item.painScore, 0) / recent.length : undefined
  const averageEnergy = recent.length ? recent.reduce((total, item) => total + item.energyScore, 0) / recent.length : undefined
  const changes: string[] = []

  if (averagePain !== undefined && log.painScore >= averagePain + 2) changes.push('Your pain is higher than your recent recorded level.')
  if (averageEnergy !== undefined && log.energyScore <= averageEnergy - 2) changes.push('Your energy is lower than your recent recorded level.')
  if (log.stressScore >= 7) changes.push('Your stress is high today.')
  if (log.symptoms.includes('fatigue')) changes.push('You also logged fatigue.')

  const gentleNextStep = log.painScore >= 7 || log.energyScore <= 3
    ? 'Consider resting if possible, hydrating, and seeking medical advice if symptoms are new, worsening, or affecting daily activities.'
    : 'Gentle movement, hydration, balanced meals, or a rest break may help if these feel comfortable for you.'

  return `${pieces.join(' · ')}. ${changes.length ? `${changes.join(' ')} ` : ''}${gentleNextStep}`
}

export function formatBleeding(bleeding: DailyLog['bleeding']): string {
  return bleeding === 'none' ? 'None' : bleeding[0].toUpperCase() + bleeding.slice(1)
}
