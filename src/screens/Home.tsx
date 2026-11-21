import React, { useMemo } from 'react';
import { Menu, Bell, ChevronRight, Plus, Minus } from 'lucide-react';
import { useStore } from '../store';
import { computeCycle, fmt, todayKey, add } from '../lib/cycle';
import { CycleWheel } from '../components/charts';
import { BottomNav, ScreenScroll, DropletIcon, AiTipCard, Mascot, FloralBg } from '../components/ui';
import { PERIOD_TIPS } from '../data/content';

const WATER_GOAL = 2000; // ml per day
const GLASS = 250; // ml per glass

export function Home() {
  const user = useStore((s) => s.user);
  const periods = useStore((s) => s.periods);
  const dayLogs = useStore((s) => s.dayLogs);
  const setDayLog = useStore((s) => s.setDayLog);
  const showToast = useStore((s) => s.showToast);
  const tabTo = useStore((s) => s.tabTo);
  const go = useStore((s) => s.go);

  const cycle = useMemo(
    () => computeCycle(periods, user.cycleLen ?? 28, user.periodLen ?? 5),
    [periods, user.cycleLen, user.periodLen],
  );
  const firstName = (user.name || 'Gargi').split(' ')[0];
  const tip = (PERIOD_TIPS[cycle.phase] ?? [])[0] ?? 'Take a gentle moment for yourself today.';

  const drank = dayLogs[todayKey()]?.water ?? 0;
  const glassesTotal = WATER_GOAL / GLASS;
  const glassesDone = Math.floor(drank / GLASS);
  const changeWater = (delta: number) => {
    const next = Math.min(WATER_GOAL * 2, Math.max(0, drank + delta));
    setDayLog(todayKey(), { water: next });
    if (delta > 0 && drank < WATER_GOAL && next >= WATER_GOAL) {
      showToast('Water goal complete! 💧 Well done');
    }
  };

  const inDays =
    cycle.daysUntilNext === 0
      ? 'expected today'
      : cycle.daysUntilNext > 0
        ? `in ${cycle.daysUntilNext} day${cycle.daysUntilNext === 1 ? '' : 's'}`
        : `${Math.abs(cycle.daysUntilNext)} day${Math.abs(cycle.daysUntilNext) === 1 ? '' : 's'} late`;

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <FloralBg />

      {/* header — exactly like reference */}
      <div className="flex items-start gap-3 px-5 pt-2 pb-1 shrink-0 relative z-10">
        <button onClick={() => tabTo('more')} aria-label="Open menu" className="tap mt-[5px] text-ink">
          <Menu size={22} strokeWidth={2.4} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[19px] font-black leading-tight truncate">
            Hi, {firstName} <span className="text-[15px] align-middle">🌸</span>
          </h1>
          <p className="text-[12px] font-semibold text-ink-mute leading-tight mt-0.5">Take care of yourself today</p>
        </div>
        <button
          onClick={() => go('reminders')}
          aria-label="Reminders"
          className="tap w-10 h-10 rounded-full bg-white/80 border-[1.5px] border-ink/70 flex items-center justify-center text-ink shrink-0"
        >
          <Bell size={17} strokeWidth={2.2} />
        </button>
      </div>

      <ScreenScroll withNav className="relative z-10">
        {/* cycle dial */}
        <div className="relative mt-1 animate-fade-up">
          <CycleWheel cycle={cycle} size={310} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-16">
            <DropletIcon size={19} />
            <span className="text-[27px] font-black leading-none mt-1.5">Day {cycle.cycleDay}</span>
            <span className="text-[12.5px] font-bold text-ink mt-1">{cycle.phaseLabel}</span>
            <span className="text-[10.5px] font-semibold text-ink-mute leading-snug mt-1">
              {cycle.pregnancyChance} of getting
              <br />pregnant
            </span>
          </div>
        </div>

        {/* next period card */}
        <div className="px-5 mt-1">
          <button
            onClick={() => go('log-period')}
            className="tap relative w-full text-left bg-[#FFF8FB] rounded-[24px] border border-primary-soft shadow-card px-4 py-3.5 flex items-center gap-3 overflow-hidden animate-fade-up"
            aria-label={`Next period ${fmt(cycle.nextPeriod)}, ${inDays}. Tap to log period.`}
          >
            <span className="relative shrink-0 pl-1">
              <DropletIcon size={27} />
              <span className="absolute -top-1.5 -left-1 text-primary-light text-[9px]">✦</span>
              <span className="absolute -bottom-1 -right-1.5 text-primary-light text-[8px]">✦</span>
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[11px] font-bold text-ink-mute leading-tight">Next Period</span>
              <span className="block text-[17px] font-black leading-tight mt-0.5">{fmt(cycle.nextPeriod)}</span>
              <span className={`block text-[11px] font-bold mt-0.5 ${cycle.daysUntilNext < 0 ? 'text-primary' : 'text-ink-mute'}`}>{inDays}</span>
            </span>
            <Mascot
              src="/images/mascot-heart.png"
              alt=""
              className="h-[86px] w-auto -mr-2 -mb-4 self-end shrink-0"
            />
          </button>
        </div>

        {/* late period alert */}
        {cycle.daysUntilNext < 0 && (
          <div className="px-5 mt-3">
            <button onClick={() => go('delay-guide')} className="tap w-full flex items-center gap-3 bg-[#FFF6EC] border border-[#FBE3C2] rounded-[22px] px-4 py-3 text-left animate-fade-up">
              <span className="text-[20px]">⏳</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13px] font-extrabold text-[#9A6B1E] leading-tight">
                  Period is {Math.abs(cycle.daysUntilNext)} day{Math.abs(cycle.daysUntilNext) === 1 ? '' : 's'} late
                </span>
                <span className="block text-[11px] font-semibold text-[#B98A3A]">See first precautions & care steps</span>
              </span>
              <ChevronRight size={16} className="text-[#C79A4B] shrink-0" strokeWidth={2.8} />
            </button>
          </div>
        )}

        {/* quick actions — blob cards like reference */}
        <div className="px-5 mt-4 grid grid-cols-3 gap-2.5">
          <BlobCard
            bg="#FBE9D4" tilt="-3deg" title="Mood" sub="How are you feeling?"
            onClick={() => go('log-symptoms')}
            icon={<span className="w-[42px] h-[42px] rounded-full overflow-hidden inline-block"><Mascot src="/images/mascot-avatar.png" blend={false} className="w-full h-full object-cover" alt="" /></span>}
          />
          <BlobCard
            bg="#FBE0EC" tilt="2deg" title="Cramps" sub="Any symptoms?"
            onClick={() => go('body-tracker')}
            icon={<span className="text-[30px] leading-none">🥴</span>}
          />
          <BlobCard
            bg="#DDEEFA" tilt="-2deg" title="Medicine" sub="Taken any supplements?"
            onClick={() => go('medicine')}
            icon={<span className="text-[30px] leading-none inline-block -rotate-[24deg]">💊</span>}
          />
        </div>

        {/* water tracker */}
        <div className="px-5 mt-3.5">
          <div className="bg-white rounded-[22px] shadow-card border border-blush-line/60 px-4 py-3.5 animate-fade-up">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center shrink-0">
                <DropletIcon size={17} color="#38BDF8" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-extrabold leading-tight">Water Intake</p>
                <p className="text-[11px] font-bold text-ink-mute leading-tight mt-0.5">
                  <span className="text-[#1E9BD8] font-extrabold">{drank} ml</span> piya · abhi{' '}
                  <span className="font-extrabold text-ink-soft">{Math.max(0, WATER_GOAL - drank)} ml</span> aur peena hai
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => changeWater(-GLASS)}
                  disabled={drank <= 0}
                  aria-label="Remove one glass of water"
                  className="tap w-8 h-8 rounded-full bg-primary-pale text-primary flex items-center justify-center disabled:opacity-40"
                >
                  <Minus size={15} strokeWidth={3} />
                </button>
                <button
                  onClick={() => changeWater(GLASS)}
                  aria-label="Add one glass of water"
                  className="tap w-9 h-9 rounded-full bg-[#38BDF8] text-white shadow-[0_6px_16px_rgba(56,189,248,0.45)] flex items-center justify-center"
                >
                  <Plus size={17} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* glasses row + progress */}
            <div className="flex items-end justify-between mt-3 px-0.5">
              {Array.from({ length: glassesTotal }, (_, i) => (
                <DropletIcon key={i} size={15} color={i < glassesDone ? '#38BDF8' : '#D8EEFA'} />
              ))}
            </div>
            <div className="h-[7px] rounded-full bg-[#EAF5FC] mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7DD3FC] to-[#38BDF8]"
                style={{ width: `${Math.min(100, (drank / WATER_GOAL) * 100)}%`, transition: 'width .5s cubic-bezier(.22,.9,.35,1)' }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-bold text-ink-mute">
              <span>{glassesDone} / {glassesTotal} glasses</span>
              <span>Goal: {WATER_GOAL} ml / day</span>
            </div>
          </div>
        </div>

        {/* AI tip */}
        <div className="px-5 mt-3.5">
          <button onClick={() => go('ai')} className="tap w-full text-left">
            <AiTipCard text={`${tip} Tap to chat with Myflo AI 💬`} />
          </button>
        </div>

        {/* coming up */}
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

          <button onClick={() => go('delay-guide')} className="tap w-full mt-2.5 flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 px-3.5 py-3 text-left">
            <span className="text-[19px]">🌸</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[12.5px] font-extrabold leading-tight">Period Delay Guide</span>
              <span className="block text-[10.5px] font-semibold text-ink-mute">Precautions & what to do first if it's late</span>
            </span>
            <ChevronRight size={15} className="text-ink-faint shrink-0" strokeWidth={2.8} />
          </button>
        </div>
      </ScreenScroll>

      <BottomNav active="home" />
    </div>
  );
}

function BlobCard({
  bg, tilt, icon, title, sub, onClick,
}: {
  bg: string; tilt: string; icon: React.ReactNode; title: string; sub: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="tap relative rounded-[22px] pt-1.5 pb-3 px-1.5 overflow-hidden text-center animate-fade-up shadow-card"
      style={{ background: bg }}
    >
      <span className="relative flex items-center justify-center h-[58px]">
        <span
          className="absolute inset-x-1 top-0.5 bottom-0 bg-white shadow-[0_3px_10px_rgba(61,44,51,0.06)]"
          style={{ borderRadius: '52% 48% 55% 45% / 62% 60% 40% 38%', transform: `rotate(${tilt})` }}
          aria-hidden
        />
        <span className="relative z-10 flex items-center justify-center">{icon}</span>
      </span>
      <span className="block text-[13px] font-extrabold mt-1.5">{title}</span>
      <span className="block text-[9.5px] font-semibold text-ink-soft/80 leading-tight mt-0.5 px-1">{sub}</span>
    </button>
  );
}
