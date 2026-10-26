/**
 * Cycle maths. Pure functions — no React, no side effects.
 *
 * Predictions are *estimates* derived from logged period start dates; the UI must
 * always label them as estimates.
 */

export type ISODate = string; // yyyy-mm-dd

export const MS_DAY = 86_400_000;

export function toISO(d: Date): ISODate {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffDays(a: ISODate, b: ISODate): number {
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / MS_DAY);
}

export function todayISO(): ISODate {
  return toISO(new Date());
}

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_MIN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function fmtLong(d: ISODate): string {
  const x = fromISO(d);
  return `${x.getDate()} ${MONTHS_SHORT[x.getMonth()]} ${x.getFullYear()}`;
}

export function fmtShort(d: ISODate): string {
  const x = fromISO(d);
  return `${x.getDate()} ${MONTHS_SHORT[x.getMonth()]}`;
}

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]}, ${year}`;
}

export type Cycle = {
  start: ISODate;
  end: ISODate; // last day before the next cycle started
  length: number;
  periodLength: number;
};

export type Phase = 'menstrual' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';

export type CycleModel = {
  cycles: Cycle[];
  averageLength: number;
  shortest: number;
  longest: number;
  currentStart: ISODate;
  cycleDay: number;
  nextPeriod: ISODate;
  daysUntilNext: number;
  ovulation: ISODate;
  fertileStart: ISODate;
  fertileEnd: ISODate;
  periodDays: Set<ISODate>;
  fertileDays: Set<ISODate>;
  ovulationDays: Set<ISODate>;
  isRegular: boolean;
  /** estimated period length used for the "menstrual" band */
  periodLength: number;
};

/**
 * Build a cycle model from logged period start dates (newest last).
 * Falls back to a 28-day estimate when there is not enough history.
 */
export function buildCycleModel(starts: ISODate[], periodLength = 5, today = todayISO()): CycleModel {
  const sorted = [...new Set(starts)].sort();
  const cycles: Cycle[] = sorted.map((start, i) => {
    const next = sorted[i + 1];
    const end = next ? addDays(next, -1) : addDays(start, 27);
    const length = next ? diffDays(start, next) : 28;
    return { start, end, length, periodLength };
  });

  const completed = cycles.filter((c) => c.length > 0);
  const lengths = completed.map((c) => c.length).filter((n) => n >= 18 && n <= 60);
  const averageLength = lengths.length
    ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
    : 28;
  const shortest = lengths.length ? Math.min(...lengths) : averageLength - 2;
  const longest = lengths.length ? Math.max(...lengths) : averageLength + 2;

  // the cycle that contains today (or the most recent one)
  let current = completed[completed.length - 1] ?? cycles[0];
  for (let i = completed.length - 1; i >= 0; i -= 1) {
    if (completed[i].start <= today) {
      current = completed[i];
      break;
    }
  }
  const currentStart = current?.start ?? today;
  let cycleDay = diffDays(currentStart, today) + 1;
  // if today is past the projected end, roll the cycle forward
  const len = averageLength;
  while (cycleDay > len) cycleDay -= len;

  const nextPeriod = addDays(currentStart, len);
  const daysUntilNext = Math.max(0, diffDays(today, nextPeriod));
  const ovulation = addDays(nextPeriod, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);
  const isRegular = longest - shortest <= 7;

  const periodDays = new Set<ISODate>();
  const fertileDays = new Set<ISODate>();
  const ovulationDays = new Set<ISODate>();

  cycles.forEach((c) => {
    for (let i = 0; i < periodLength; i += 1) periodDays.add(addDays(c.start, i));
  });
  // current + next predicted window
  for (let i = 0; i < periodLength; i += 1) periodDays.add(addDays(nextPeriod, i));

  [currentStart, nextPeriod].forEach((start) => {
    const ov = addDays(start, len - 14);
    ovulationDays.add(ov);
    for (let i = -5; i <= 1; i += 1) fertileDays.add(addDays(ov, i));
  });
  ovulationDays.add(ovulation);
  for (let i = 0; i < 7; i += 1) fertileDays.add(addDays(fertileStart, i));

  return {
    cycles,
    averageLength,
    shortest,
    longest,
    currentStart,
    cycleDay,
    nextPeriod,
    daysUntilNext,
    ovulation,
    fertileStart,
    fertileEnd,
    periodDays,
    fertileDays,
    ovulationDays,
    isRegular,
    periodLength,
  };
}

export function phaseFor(model: CycleModel, date: ISODate): Phase {
  if (model.periodDays.has(date)) return 'menstrual';
  if (model.ovulationDays.has(date)) return 'ovulation';
  if (model.fertileDays.has(date)) return 'fertile';
  const d = diffDays(model.currentStart, date);
  return d < model.averageLength / 2 ? 'follicular' : 'luteal';
}

const PHASE_COPY: Record<Phase, { title: string; note: string }> = {
  menstrual: { title: 'Period Day', note: 'Low chance of getting pregnant' },
  follicular: { title: 'Follicular Phase', note: 'Energy is building up' },
  fertile: { title: 'Fertile Window', note: 'Higher chance of getting pregnant' },
  ovulation: { title: 'Ovulation Day', note: 'Peak fertility — an estimate' },
  luteal: { title: 'Luteal Phase', note: 'Lower chance of getting pregnant' },
};

export function phaseCopy(phase: Phase) {
  return PHASE_COPY[phase];
}

export type MonthCell = {
  date: ISODate;
  day: number;
  inMonth: boolean;
  isToday: boolean;
};

/** Calendar grid, weeks starting Sunday (matches the reference header order). */
export function monthGrid(year: number, month: number, today = todayISO()): MonthCell[] {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: MonthCell[] = [];
  const gridStart = new Date(year, month, 1 - startOffset);
  const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  for (let i = 0; i < total; i += 1) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const iso = toISO(d);
    cells.push({
      date: iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month,
      isToday: iso === today,
    });
  }
  return cells;
}
