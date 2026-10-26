import React, { useMemo, useState } from 'react';
import { format, subMonths, startOfMonth } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { computeCycle, fromKey, toKey, add, today } from '../lib/cycle';
import { SYMPTOMS, MOODS } from '../data/content';
import { BarChart, LineChart, HBar } from '../components/charts';
import {
  Header, ScreenScroll, BottomNav, UnderlineTabs, Card, SectionTitle,
  MascotAvatar, EmptyState,
} from '../components/ui';

/* ------------------------------ data helpers -------------------------------- */

function useAnalytics() {
  const periods = useStore((s) => s.periods);
  const dayLogs = useStore((s) => s.dayLogs);
  const meals = useStore((s) => s.meals);
  const user = useStore((s) => s.user);
  const cycle = useMemo(() => computeCycle(periods, user.cycleLen ?? 28, user.periodLen ?? 5), [periods, user.cycleLen, user.periodLen]);

  return useMemo(() => {
    const hist = cycle.cyclesHistory;
    const lenData = hist.filter((h) => h.length).slice(-6).map((h) => ({ label: format(fromKey(h.start), 'MMM'), value: h.length as number }));
    const durData = hist.slice(-6).map((h) => ({ label: format(fromKey(h.start), 'MMM'), value: h.periodLen }));
    const lens = lenData.map((d) => d.value);
    const durs = durData.map((d) => d.value);

    // symptom frequency (% of logged days)
    const entries = Object.values(dayLogs);
    const loggedDays = Math.max(1, entries.length);
    const counts = new Map<string, number>();
    entries.forEach((l) => l.symptoms.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1)));
    const symFreq = [...counts.entries()]
      .map(([id, n]) => ({ label: SYMPTOMS.find((s) => s.id === id)?.label ?? id, pct: Math.round((n / loggedDays) * 100) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    // monthly average pain (last 6 months)
    const now = today();
    const painTrend = Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(startOfMonth(now), 5 - i);
      const mk = format(m, 'yyyy-MM');
      const vals = Object.entries(dayLogs)
        .filter(([k, l]) => k.startsWith(mk) && l.pain > 0)
        .map(([, l]) => l.pain);
      return { label: format(m, 'MMM'), value: vals.length ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0 };
    });

    // last 7 days calories
    const kcal7 = Array.from({ length: 7 }, (_, i) => {
      const d = add(now, i - 6);
      const sum = meals.filter((m) => m.date === toKey(d)).reduce((a, m) => a + m.calories, 0);
      return { label: format(d, 'EEE')[0] + format(d, 'd'), value: sum };
    });
    const protein7 = meals.filter((m) => m.date >= toKey(add(now, -6))).reduce((a, m) => a + m.protein, 0);
    const iron7 = meals.filter((m) => m.date >= toKey(add(now, -6))).reduce((a, m) => a + m.iron, 0);

    // mood distribution
    const moodCounts = new Map<string, number>();
    entries.forEach((l) => { if (l.mood) moodCounts.set(l.mood, (moodCounts.get(l.mood) ?? 0) + 1); });
    const moodTotal = Math.max(1, [...moodCounts.values()].reduce((a, b) => a + b, 0));
    const moodFreq = MOODS
      .map((m) => ({ label: `${m.emoji} ${m.label}`, pct: Math.round(((moodCounts.get(m.id) ?? 0) / moodTotal) * 100) }))
      .filter((m) => m.pct > 0)
      .sort((a, b) => b.pct - a.pct);

    return {
      cycle, lenData, durData,
      lo: lens.length ? Math.min(...lens) : cycle.avgCycle,
      hi: lens.length ? Math.max(...lens) : cycle.avgCycle,
      dLo: durs.length ? Math.min(...durs) : cycle.avgPeriodLen,
      dHi: durs.length ? Math.max(...durs) : cycle.avgPeriodLen,
      symFreq, painTrend, kcal7, protein7: Math.round(protein7), iron7: Number(iron7.toFixed(1)),
      moodFreq, hasData: periods.length >= 2,
    };
  }, [cycle, dayLogs, meals, periods.length]);
}

function StatHead({ title, sub, avg }: { title: string; sub: string; avg: string }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <SectionTitle>{title}</SectionTitle>
        <p className="text-[11px] font-semibold text-ink-mute mt-0.5 leading-snug max-w-[200px]">{sub}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[9.5px] font-bold text-ink-faint block">Avg</span>
        <span className="text-[13px] font-black text-primary">{avg}</span>
      </div>
    </div>
  );
}

/* --------------------------------- Insights --------------------------------- */

export function Insights() {
  const go = useStore((s) => s.go);
  const a = useAnalytics();
  const [tab, setTab] = useState<'Cycle' | 'Symptoms' | 'Nutrition' | 'Mood'>('Cycle');

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Insights" />
      <div className="px-5 shrink-0">
        <UnderlineTabs options={['Cycle', 'Symptoms', 'Nutrition', 'Mood']} value={tab} onChange={setTab} />
      </div>

      <ScreenScroll withNav>
        <div className="px-5 pt-4 space-y-4">
          {tab === 'Cycle' && (
            <>
              <Card className="p-4 animate-fade-up">
                <StatHead title="Cycle Length" sub={`Your cycle length is usually between ${a.lo}–${a.hi} days`} avg={`${a.cycle.avgCycle} days`} />
                {a.lenData.length ? <BarChart data={a.lenData} max={Math.max(35, a.hi + 2)} unit=" days" /> : <EmptyState emoji="🌱" title="Not enough data yet" desc="Log two periods to unlock this chart." />}
              </Card>

              <Card className="p-4 animate-fade-up">
                <StatHead title="Period Duration" sub={`Your period usually lasts ${a.dLo}–${a.dHi} days`} avg={`${a.cycle.avgPeriodLen} days`} />
                {a.durData.length ? <BarChart data={a.durData} max={10} unit=" days" /> : <EmptyState emoji="🌱" title="Not enough data yet" desc="Log your period dates to see this chart." />}
              </Card>

              <button onClick={() => go('ai')} className="tap w-full flex items-start gap-2.5 bg-primary-pale border border-primary-soft rounded-3xl p-3.5 text-left">
                <MascotAvatar size={36} ring={false} />
                <span className="text-[12.5px] font-semibold text-ink-soft leading-snug pt-0.5">
                  {a.hasData
                    ? a.hi - a.lo <= 7
                      ? 'Your cycles look regular this year. Keep tracking! 🌸'
                      : 'Your cycle length varies a bit — that can be normal. Keep tracking and I\'ll watch the trend with you.'
                    : 'Log your periods regularly and I\'ll learn your pattern. 🌷'}
                </span>
              </button>

              <button onClick={() => go('reports')} className="tap w-full flex items-center justify-center gap-1 text-[12.5px] font-extrabold text-primary pb-2">
                View detailed reports <ChevronRight size={15} strokeWidth={3} />
              </button>
            </>
          )}

          {tab === 'Symptoms' && (
            <Card className="p-4 animate-fade-up">
              <SectionTitle className="mb-1">Most frequent symptoms</SectionTitle>
              <p className="text-[11px] font-semibold text-ink-mute mb-3">Based on your logged days</p>
              {a.symFreq.length ? (
                <div className="space-y-3">
                  {a.symFreq.map((s) => <HBar key={s.label} label={s.label} pct={s.pct} />)}
                </div>
              ) : (
                <EmptyState emoji="📝" title="No symptoms logged" desc="Use Log Symptoms to start spotting patterns." />
              )}
            </Card>
          )}

          {tab === 'Nutrition' && (
            <>
              <Card className="p-4 animate-fade-up">
                <StatHead title="Calories — last 7 days" sub="From your food diary" avg={`${Math.round(a.kcal7.reduce((x, d) => x + d.value, 0) / 7)} kcal`} />
                <BarChart data={a.kcal7} max={2200} unit=" kcal" />
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3.5 text-center">
                  <p className="text-[16px] font-black text-sky2">{a.protein7}g</p>
                  <p className="text-[10.5px] font-bold text-ink-mute">Protein this week</p>
                </Card>
                <Card className="p-3.5 text-center">
                  <p className="text-[16px] font-black text-minty">{a.iron7}mg</p>
                  <p className="text-[10.5px] font-bold text-ink-mute">Iron this week</p>
                </Card>
              </div>
              <button onClick={() => go('daily-nutrition')} className="tap w-full flex items-center justify-center gap-1 text-[12.5px] font-extrabold text-primary pb-2">
                Open food diary <ChevronRight size={15} strokeWidth={3} />
              </button>
            </>
          )}

          {tab === 'Mood' && (
            <Card className="p-4 animate-fade-up">
              <SectionTitle className="mb-1">How your moods flow</SectionTitle>
              <p className="text-[11px] font-semibold text-ink-mute mb-3">Share of days you logged each mood</p>
              {a.moodFreq.length ? (
                <div className="space-y-3">
                  {a.moodFreq.map((m) => <HBar key={m.label} label={m.label} pct={m.pct} />)}
                </div>
              ) : (
                <EmptyState emoji="💗" title="No moods logged yet" desc="Log your mood daily to reveal your emotional rhythm." />
              )}
            </Card>
          )}
        </div>
      </ScreenScroll>

      <BottomNav active="insights" />
    </div>
  );
}

/* ---------------------------------- Reports --------------------------------- */

export function Reports() {
  const periods = useStore((s) => s.periods);
  const a = useAnalytics();
  const [tab, setTab] = useState<'Cycle' | 'Symptoms' | 'Nutrition'>('Symptoms');

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Reports" />
      <div className="px-5 shrink-0">
        <UnderlineTabs options={['Cycle', 'Symptoms', 'Nutrition']} value={tab} onChange={setTab} />
      </div>

      <ScreenScroll>
        <div className="px-5 pt-4 space-y-4 pb-4">
          {tab === 'Symptoms' && (
            <>
              <Card className="p-4 animate-fade-up">
                <SectionTitle className="mb-3">Symptom Frequency</SectionTitle>
                {a.symFreq.length ? (
                  <div className="space-y-3">
                    {a.symFreq.map((s) => <HBar key={s.label} label={s.label} pct={s.pct} />)}
                  </div>
                ) : (
                  <EmptyState emoji="📝" title="No symptoms logged" desc="Patterns will appear as you log." />
                )}
              </Card>

              <Card className="p-4 animate-fade-up">
                <SectionTitle className="mb-1">Pain Trend</SectionTitle>
                <p className="text-[11px] font-semibold text-ink-mute mb-2">Average pain level per month (0–10)</p>
                <LineChart data={a.painTrend} max={10} />
              </Card>
            </>
          )}

          {tab === 'Cycle' && (
            <>
              <Card className="p-4 animate-fade-up">
                <StatHead title="Cycle Length" sub={`Usually ${a.lo}–${a.hi} days`} avg={`${a.cycle.avgCycle} days`} />
                {a.lenData.length ? <BarChart data={a.lenData} max={Math.max(35, a.hi + 2)} /> : <EmptyState emoji="🌱" title="Not enough data" desc="" />}
              </Card>
              <Card className="p-4 animate-fade-up">
                <SectionTitle className="mb-3">Cycle history</SectionTitle>
                <div className="space-y-2.5">
                  {[...a.cycle.cyclesHistory].reverse().map((h, i) => (
                    <div key={i} className="flex items-center text-[12px] font-semibold">
                      <span className="text-primary mr-2">🩸</span>
                      <span className="flex-1">{format(fromKey(h.start), 'd MMM yyyy')}</span>
                      <span className="text-ink-mute mr-3">{h.periodLen} period days</span>
                      <span className="font-extrabold">{h.length ? `${h.length}-day cycle` : 'current'}</span>
                    </div>
                  ))}
                  {periods.length === 0 && <EmptyState emoji="🌱" title="No periods logged" desc="Your history will appear here." />}
                </div>
              </Card>
            </>
          )}

          {tab === 'Nutrition' && (
            <>
              <Card className="p-4 animate-fade-up">
                <SectionTitle className="mb-1">Daily calories</SectionTitle>
                <p className="text-[11px] font-semibold text-ink-mute mb-2">Last 7 days from your diary</p>
                <BarChart data={a.kcal7} max={2200} />
              </Card>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3.5 text-center">
                  <p className="text-[16px] font-black text-sky2">{a.protein7}g</p>
                  <p className="text-[10.5px] font-bold text-ink-mute">Weekly protein</p>
                </Card>
                <Card className="p-3.5 text-center">
                  <p className="text-[16px] font-black text-minty">{a.iron7}mg</p>
                  <p className="text-[10.5px] font-bold text-ink-mute">Weekly iron</p>
                </Card>
              </div>
            </>
          )}
        </div>
      </ScreenScroll>
    </div>
  );
}
