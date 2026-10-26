import { addDays, differenceInCalendarDays, format, isSameDay, parseISO, startOfDay } from 'date-fns';

export type DateKey = string; // yyyy-MM-dd

export const toKey = (d: Date): DateKey => format(d, 'yyyy-MM-dd');
export const fromKey = (k: DateKey): Date => parseISO(k);
export const today = (): Date => startOfDay(new Date());
export const todayKey = (): DateKey => toKey(today());
export const fmt = (d: Date, p = 'd MMM yyyy'): string => format(d, p);
export const add = (d: Date, n: number): Date => addDays(d, n);
export const diffDays = (a: Date, b: Date): number => differenceInCalendarDays(a, b);
export const sameDay = isSameDay;

export interface PeriodLog {
  id: string;
  start: DateKey;
  end: DateKey;
  intensity: 'Light' | 'Moderate' | 'Heavy';
  color: string; // flow color id
  symptoms: string[];
}

export type Phase = 'Period' | 'Follicular' | 'Fertile Window' | 'Ovulation' | 'Luteal' | 'Late';

export interface CycleInfo {
  /** most recent period that has started (or the next predicted if none) */
  currentPeriod: PeriodLog | null;
  cycleDay: number; // 1-based day of current cycle
  phase: Phase;
  phaseLabel: string; // e.g. "Period Day"
  cycleStart: Date;
  nextPeriod: Date;
  daysUntilNext: number;
  ovulation: Date;
  fertileStart: Date;
  fertileEnd: Date;
  avgCycle: number;
  avgPeriodLen: number;
  pregnancyChance: 'Low chance' | 'Medium chance' | 'High chance';
  isPeriodDay: (d: Date) => boolean;
  isPredictedPeriod: (d: Date) => boolean;
  isFertile: (d: Date) => boolean;
  isOvulation: (d: Date) => boolean;
  cyclesHistory: { start: DateKey; length: number | null; periodLen: number }[];
}

export function periodLength(p: PeriodLog): number {
  return diffDays(fromKey(p.end), fromKey(p.start)) + 1;
}

export function computeCycle(periods: PeriodLog[], fallbackCycle = 28, fallbackLen = 5): CycleInfo {
  const sorted = [...periods].sort((a, b) => a.start.localeCompare(b.start));
  const now = today();

  // completed cycle lengths between consecutive starts
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const len = diffDays(fromKey(sorted[i].start), fromKey(sorted[i - 1].start));
    if (len >= 15 && len <= 60) lengths.push(len);
  }
  const avgCycle = lengths.length ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length) : fallbackCycle;
  const avgPeriodLen = sorted.length
    ? Math.max(2, Math.round(sorted.reduce((a, p) => a + periodLength(p), 0) / sorted.length))
    : fallbackLen;

  const started = sorted.filter((p) => fromKey(p.start) <= now);
  const currentPeriod = started.length ? started[started.length - 1] : null;

  let cycleStart: Date;
  if (currentPeriod) {
    cycleStart = fromKey(currentPeriod.start);
  } else if (sorted.length) {
    // all logged periods are in the future — project back a cycle
    cycleStart = add(fromKey(sorted[0].start), -avgCycle);
  } else {
    cycleStart = add(now, -10);
  }

  let nextPeriod = add(cycleStart, avgCycle);
  // if we're well past prediction (no new period logged), keep next as predicted (late)
  let cycleDay = diffDays(now, cycleStart) + 1;
  if (cycleDay > avgCycle + 21 && !currentPeriod) {
    // no data for a long time: restart cycle maths from today-ish
    cycleStart = add(now, -10);
    nextPeriod = add(cycleStart, avgCycle);
    cycleDay = diffDays(now, cycleStart) + 1;
  }

  const ovulation = add(nextPeriod, -14);
  const fertileStart = add(ovulation, -5);
  const fertileEnd = add(ovulation, 1);

  const inLoggedPeriod = sorted.some((p) => now >= fromKey(p.start) && now <= fromKey(p.end));
  const inPredicted = now >= nextPeriod && now <= add(nextPeriod, avgPeriodLen - 1);

  let phase: Phase;
  let phaseLabel: string;
  if (inLoggedPeriod) {
    phase = 'Period';
    phaseLabel = 'Period Day';
  } else if (inPredicted) {
    phase = 'Period';
    phaseLabel = 'Expected Period';
  } else if (sameDay(now, ovulation)) {
    phase = 'Ovulation';
    phaseLabel = 'Ovulation Day';
  } else if (now >= fertileStart && now <= fertileEnd) {
    phase = 'Fertile Window';
    phaseLabel = 'Fertile Window';
  } else if (now < fertileStart && cycleDay > 0) {
    phase = 'Follicular';
    phaseLabel = 'Follicular Phase';
  } else if (now > nextPeriod) {
    phase = 'Late';
    phaseLabel = 'Period Expected';
  } else {
    phase = 'Luteal';
    phaseLabel = 'Luteal Phase';
  }

  const pregnancyChance: CycleInfo['pregnancyChance'] =
    phase === 'Period' || phase === 'Late'
      ? 'Low chance'
      : phase === 'Ovulation' || phase === 'Fertile Window'
        ? 'High chance'
        : phase === 'Follicular' && cycleDay <= avgPeriodLen + 2
          ? 'Low chance'
          : 'Medium chance';

  const periodDaySet = new Set<string>();
  sorted.forEach((p) => {
    const s = fromKey(p.start);
    const len = periodLength(p);
    for (let i = 0; i < len; i++) periodDaySet.add(toKey(add(s, i)));
  });

  const predictedSet = new Set<string>();
  for (let c = 0; c < 4; c++) {
    const base = add(nextPeriod, c * avgCycle);
    for (let i = 0; i < avgPeriodLen; i++) predictedSet.add(toKey(add(base, i)));
  }

  const futureOv = (d: Date) => {
    for (let c = 0; c < 4; c++) {
      const ov = add(ovulation, c * avgCycle);
      if (sameDay(d, ov)) return true;
    }
    // also past ovulation estimate (current cycle backwards)
    const prevOv = add(cycleStart, avgCycle - 14);
    if (sameDay(d, prevOv)) return true;
    return false;
  };

  const futureFertile = (d: Date) => {
    for (let c = -1; c < 4; c++) {
      const ov = add(ovulation, c * avgCycle);
      if (d >= add(ov, -5) && d <= add(ov, 1)) return true;
    }
    return false;
  };

  const cyclesHistory = sorted.map((p, i) => ({
    start: p.start,
    length: i < sorted.length - 1 ? diffDays(fromKey(sorted[i + 1].start), fromKey(p.start)) : null,
    periodLen: periodLength(p),
  }));

  return {
    currentPeriod,
    cycleDay: Math.max(1, cycleDay),
    phase,
    phaseLabel,
    cycleStart,
    nextPeriod,
    daysUntilNext: diffDays(nextPeriod, now),
    ovulation,
    fertileStart,
    fertileEnd,
    avgCycle,
    avgPeriodLen,
    pregnancyChance,
    isPeriodDay: (d) => periodDaySet.has(toKey(d)),
    isPredictedPeriod: (d) => !periodDaySet.has(toKey(d)) && predictedSet.has(toKey(d)),
    isFertile: futureFertile,
    isOvulation: futureOv,
    cyclesHistory,
  };
}

export const uid = (): string => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
