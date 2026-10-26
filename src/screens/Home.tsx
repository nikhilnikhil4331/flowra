import React, { useMemo } from 'react';
import { Menu, Bell, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '../store';
import { computeCycle, fmt, todayKey, add } from '../lib/cycle';
import { CycleWheel } from '../components/charts';
import { BottomNav, ScreenScroll, DropletIcon, AiTipCard, Mascot } from '../components/ui';
import { PERIOD_TIPS } from '../data/content';

export function Home() {
  const user = useStore((s) => s.user);
  const periods = useStore((s) => s.periods);
  const dayLogs = useStore((s) => s.dayLogs);
  const tabTo = useStore((s) => s.tabTo);
  const go = useStore((s) => s.go);

  const cycle = useMemo(() => computeCycle(periods), [periods]);
  const firstName = (user.name || 'Gargi').split(' ')[0];
  const todayLog = dayLogs[todayKey()];
  const tip = (PERIOD_TIPS[cycle.phase] ?? [])[0] ?? 'Take a gentle moment for yourself today.';

  const inDays =
    cycle.daysUntilNext === 0
      ? 'expected today'
      : cycle.daysUntilNext > 0
        ? `in ${cycle.daysUntilNext} day${cycle.daysUntilNext === 1 ? '' : 's'}`
        : `${Math.abs(cycle.daysUntilNext)} day${Math.abs(cycle.daysUntilNext) === 1 ? '' : 's'} late`;

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* header */}
      <div className="flex items-center gap-3 px-5 pt-1 pb-1 shrink-0">
        <button onClick={() => tabTo('more')} aria-label="Open menu" className="tap w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center">
          <Menu size={17} strokeWidth={2.6} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[16.5px] font-black leading-tight truncate">Hi, {firstName} 🌸</h1>
          <p className="text-[11px] font-semibold text-ink-mute leading-tight">Take care of yourself today</p>
        </div>
        <button onClick={() => go('reminders')} aria-label="Reminders" className="tap relative w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center">
          <Bell size={17} strokeWidth={2.4} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-primary border border-white" />
        </button>
      </div>

      <ScreenScroll withNav>
        {/* cycle wheel */}
        <div className="relative mt-1 animate-fade-up">
          <CycleWheel cycle={cycle} size={298} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-10">
            <span className="text-[30px] font-black leading-none">Day {cycle.cycleDay}</span>
            <span className="text-[12.5px] font-extrabold text-primary mt-1.5">{cycle.phaseLabel}</span>
            <span className="text-[10.5px] font-semibold text-ink-mute leading-snug mt-1">
              {cycle.pregnancyChance} of getting
              <br />pregnant
            </span>
          </div>
        </div>

        {/* next period card */}
        <div className="px-5 -mt-2">
          <div className="relative bg-white rounded-[22px] shadow-card border border-blush-line/60 px-4 py-3 flex items-center gap-3 overflow-hidden animate-fade-up">
            <span className="w-11 h-11 rounded-2xl bg-primary-pale flex items-center justify-center shrink-0">
              <DropletIcon size={19} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10.5px] font-bold text-ink-mute leading-tight">Next Period</p>
              <p className="text-[15px] font-black leading-tight">{fmt(cycle.nextPeriod)}</p>
              <p className="text-[10.5px] font-extrabold text-primary leading-tight">{inDays}</p>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-primary-soft">
                <Mascot src="/images/woman-avatar.png" blend={false} className="w-full h-full object-cover" alt="" />
              </div>
              <button onClick={() => go('log-period')} className="tap flex items-center gap-0.5 text-[9.5px] font-extrabold text-primary bg-primary-pale rounded-full px-2 py-[3px]">
                <Plus size={10} strokeWidth={3.4} /> Log
              </button>
            </div>
          </div>
        </div>

        {/* quick actions */}
        <div className="px-5 mt-3.5 grid grid-cols-3 gap-2.5">
          <QuickCard
            emoji="😊" title="Mood" sub={todayLog?.mood ? `Feeling ${todayLog.mood}` : 'How are you feeling?'}
            onClick={() => go('log-symptoms')}
          />
          <QuickCard
            emoji="🩹" title="Cramps" sub={todayLog && todayLog.pain > 0 ? `Pain ${todayLog.pain}/10 today` : 'Any symptoms?'}
            onClick={() => go('body-tracker')}
          />
          <QuickCard emoji="💊" title="Medicine" sub="View supplements" onClick={() => go('medicine')} />
        </div>

        {/* AI tip */}
        <div className="px-5 mt-3.5">
          <button onClick={() => go('ai')} className="tap w-full text-left">
            <AiTipCard text={`${tip} Tap to chat with Myflo AI 💬`} />
          </button>
        </div>

        {/* upcoming strip */}
        <div className="px-5 mt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[13.5px] font-extrabold">Coming up</h3>
            <button onClick={() => tabTo('calendar')} className="tap flex items-center gap-0.5 text-[11px] font-extrabold text-primary">
              Calendar <ChevronRight size={13} strokeWidth={3} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl shadow-card border border-blush-line/60 p-3">
              <p className="text-[10px] font-bold text-ink-mute">🌼 Ovulation</p>
              <p className="text-[13px] font-extrabold mt-0.5">{fmt(cycle.ovulation, 'EEE, d MMM')}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-card border border-blush-line/60 p-3">
              <p className="text-[10px] font-bold text-ink-mute">💜 Fertile window</p>
              <p className="text-[13px] font-extrabold mt-0.5">
                {fmt(cycle.fertileStart, 'd MMM')} – {fmt(add(cycle.fertileEnd, 0), 'd MMM')}
              </p>
            </div>
          </div>
        </div>
      </ScreenScroll>

      <BottomNav active="home" />
    </div>
  );
}

function QuickCard({ emoji, title, sub, onClick }: { emoji: string; title: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap bg-white rounded-[20px] shadow-card border border-blush-line/60 py-3 px-2 flex flex-col items-center text-center animate-fade-up"
    >
      <span className="text-[22px] leading-none">{emoji}</span>
      <span className="text-[12.5px] font-extrabold mt-1.5">{title}</span>
      <span className="text-[9px] font-semibold text-ink-mute leading-tight mt-0.5 line-clamp-2">{sub}</span>
    </button>
  );
}
