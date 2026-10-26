import React, { useMemo, useState } from 'react';
import {
  addMonths, subMonths, startOfMonth, getDaysInMonth, getDay, format,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Droplets, Heart, Egg, BookOpen, CalendarCheck2, Pencil } from 'lucide-react';
import { useStore } from '../store';
import { computeCycle, today, toKey, fromKey, add } from '../lib/cycle';
import { BottomNav, ScreenScroll, Card, SectionTitle } from '../components/ui';
import { MOODS } from '../data/content';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarScreen() {
  const periods = useStore((s) => s.periods);
  const dayLogs = useStore((s) => s.dayLogs);
  const go = useStore((s) => s.go);
  const back = useStore((s) => s.back);

  const cycle = useMemo(() => computeCycle(periods), [periods]);
  const now = today();
  const [cursor, setCursor] = useState<Date>(startOfMonth(now));
  const [selected, setSelected] = useState<Date>(now);

  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const blanks = getDay(first);
    const total = getDaysInMonth(cursor);
    const cells: (Date | null)[] = [];
    for (let i = 0; i < blanks; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return cells;
  }, [cursor]);

  const selKey = toKey(selected);
  const selLog = dayLogs[selKey];
  const selMood = MOODS.find((m) => m.id === selLog?.mood);

  const badges: string[] = [];
  if (cycle.isPeriodDay(selected)) badges.push('🩸 Period day');
  else if (cycle.isPredictedPeriod(selected)) badges.push('🩸 Predicted period');
  if (cycle.isOvulation(selected)) badges.push('🌼 Ovulation');
  else if (cycle.isFertile(selected)) badges.push('💜 Fertile window');
  if (toKey(selected) === toKey(now)) badges.push('✨ Today');

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* header */}
      <header className="relative flex items-center px-4 pt-1 pb-2 shrink-0">
        <button onClick={back} aria-label="Go back" className="tap w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center z-10">
          <ChevronLeft size={19} strokeWidth={2.6} />
        </button>
        <h1 className="absolute inset-x-0 text-center text-[16.5px] font-extrabold pointer-events-none">Calendar</h1>
        <button
          onClick={() => { setCursor(startOfMonth(now)); setSelected(now); }}
          aria-label="Jump to today"
          className="tap ml-auto w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center text-primary z-10"
        >
          <CalendarCheck2 size={17} strokeWidth={2.4} />
        </button>
      </header>

      <ScreenScroll withNav>
        <div className="px-5">
          {/* month nav */}
          <div className="flex items-center justify-center gap-4 mt-1">
            <button onClick={() => setCursor(subMonths(cursor, 1))} aria-label="Previous month" className="tap text-ink-soft">
              <ChevronLeft size={18} strokeWidth={3} />
            </button>
            <h2 className="text-[14.5px] font-black min-w-[120px] text-center">{format(cursor, 'MMMM, yyyy')}</h2>
            <button onClick={() => setCursor(addMonths(cursor, 1))} aria-label="Next month" className="tap text-ink-soft">
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>

          {/* weekday header */}
          <div className="grid grid-cols-7 mt-3 mb-1">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={`text-center text-[10px] font-extrabold ${i === 0 || i === 6 ? 'text-primary-light' : 'text-ink-mute'}`}>{d}</div>
            ))}
          </div>

          {/* cells */}
          <div className="grid grid-cols-7">
            {days.map((d, i) => {
              if (!d) return <div key={`b-${i}`} />;
              const key = toKey(d);
              const isSel = key === selKey;
              const isToday = key === toKey(now);
              const isPer = cycle.isPeriodDay(d);
              const isPred = cycle.isPredictedPeriod(d);
              const isOv = cycle.isOvulation(d);
              const isFert = cycle.isFertile(d);
              const logged = !!dayLogs[key];
              const dot = isPer || isPred ? '#EE4D7B' : isOv ? '#FFB657' : isFert ? '#9DB8EC' : logged ? '#F78FB0' : null;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(d)}
                  aria-label={`${format(d, 'EEEE d MMMM')}${isPer ? ', period day' : ''}`}
                  aria-pressed={isSel}
                  className="tap relative flex flex-col items-center justify-center h-[46px]"
                >
                  <span
                    className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12.5px] font-extrabold transition-all ${
                      isSel
                        ? 'bg-grad-pink text-white shadow-btn'
                        : isPer
                          ? 'bg-primary text-white'
                          : isPred
                            ? 'bg-primary-soft text-primary border border-dashed border-primary-light'
                            : isToday
                              ? 'border-2 border-primary text-primary'
                              : isFert
                                ? 'bg-[#EDF2FD] text-ink-soft'
                                : 'text-ink-soft'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                  {dot && !isSel && <span className="absolute bottom-[3px] w-[5px] h-[5px] rounded-full" style={{ background: dot }} />}
                </button>
              );
            })}
          </div>

          {/* legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3 text-[10px] font-bold text-ink-soft">
            <Legend color="#F25B8A" label="Period" solid />
            <Legend color="#FDE9F0" label="Predicted" ring />
            <Legend color="#9DB8EC" label="Fertile Window" dot />
            <Legend color="#FFB657" label="Ovulation" dot />
          </div>

          {/* cycle events */}
          <SectionTitle className="mt-5 mb-2.5">Cycle Events</SectionTitle>
          <div className="flex justify-between px-1">
            <EventBtn icon={<Droplets size={19} />} label="Period" tint="#F25B8A" onClick={() => go('log-period', { date: selKey })} />
            <EventBtn icon={<Heart size={19} />} label="Symptoms" tint="#F78FB0" onClick={() => go('log-symptoms', { date: selKey })} />
            <EventBtn icon={<Egg size={19} />} label="Ovulation" tint="#FFB657" onClick={() => go('insights')} />
            <EventBtn icon={<BookOpen size={19} />} label="Flow Guide" tint="#B9A7F2" onClick={() => go('flow-guide')} />
          </div>

          {/* selected day details */}
          <Card className="mt-5 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[14px] font-black">{format(selected, 'EEEE, d MMMM')}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {badges.length === 0 && <span className="text-[10.5px] font-bold text-ink-mute bg-blush-bg rounded-full px-2 py-1">No cycle event</span>}
                  {badges.map((b) => (
                    <span key={b} className="text-[10.5px] font-extrabold text-primary bg-primary-pale rounded-full px-2 py-1">{b}</span>
                  ))}
                </div>
              </div>
              {selMood && <span className="text-[26px]" title={selMood.label}>{selMood.emoji}</span>}
            </div>

            {selLog?.symptoms?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selLog.symptoms.map((s) => (
                  <span key={s} className="text-[10.5px] font-bold text-ink-soft bg-blush-bg border border-blush-line rounded-full px-2 py-1 capitalize">
                    {s.replace(/-/g, ' ')}
                  </span>
                ))}
                {selLog.pain > 0 && <span className="text-[10.5px] font-bold text-ink-soft bg-blush-bg border border-blush-line rounded-full px-2 py-1">Pain {selLog.pain}/10</span>}
              </div>
            ) : null}

            <div className="mt-3.5 pt-3 border-t border-blush-line/70">
              <p className="text-[11px] font-extrabold text-ink-mute">Notes</p>
              {selLog?.note ? (
                <p className="text-[12.5px] font-semibold text-ink-soft mt-1">
                  {selLog.note}
                  {selLog.noteTime && <span className="text-ink-faint"> · {selLog.noteTime}</span>}
                </p>
              ) : (
                <p className="text-[12px] font-semibold text-ink-faint mt-1">No note for this day yet.</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              <button onClick={() => go('log-period', { date: selKey })} className="tap h-10 rounded-full bg-grad-pink text-white text-[12px] font-extrabold shadow-btn flex items-center justify-center gap-1.5">
                <Droplets size={14} /> Log Period
              </button>
              <button onClick={() => go('log-symptoms', { date: selKey })} className="tap h-10 rounded-full bg-white border-[1.5px] border-primary-light text-primary text-[12px] font-extrabold flex items-center justify-center gap-1.5">
                <Pencil size={14} /> Log Day
              </button>
            </div>
          </Card>

          {/* recent periods */}
          {periods.length > 0 && (
            <div className="mt-5 pb-2">
              <SectionTitle className="mb-2">Recent periods</SectionTitle>
              <div className="space-y-2">
                {[...periods]
                  .sort((a, b) => b.start.localeCompare(a.start))
                  .slice(0, 3)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        const d = fromKey(p.start);
                        setCursor(startOfMonth(d));
                        setSelected(d);
                      }}
                      className="tap w-full flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 px-3.5 py-2.5 text-left"
                    >
                      <span className="text-base">🩸</span>
                      <span className="flex-1 text-[12.5px] font-bold">
                        {format(fromKey(p.start), 'd MMM')} – {format(fromKey(p.end), 'd MMM yyyy')}
                      </span>
                      <span className="text-[11px] font-extrabold text-primary">{p.intensity}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScreenScroll>

      <BottomNav active="calendar" />
    </div>
  );
}

function Legend({ color, label, dot, ring, solid }: { color: string; label: string; dot?: boolean; ring?: boolean; solid?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {dot ? (
        <span className="w-[7px] h-[7px] rounded-full" style={{ background: color }} />
      ) : ring ? (
        <span className="w-[12px] h-[12px] rounded-full border border-dashed border-primary-light" style={{ background: color }} />
      ) : (
        <span className="w-[12px] h-[12px] rounded-full" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}

function EventBtn({ icon, label, tint, onClick }: { icon: React.ReactNode; label: string; tint: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="tap flex flex-col items-center gap-1.5 w-[68px]">
      <span className="w-[46px] h-[46px] rounded-full flex items-center justify-center" style={{ background: `${tint}1F`, color: tint }}>
        {icon}
      </span>
      <span className="text-[10px] font-extrabold text-ink-soft text-center leading-tight">{label}</span>
    </button>
  );
}
