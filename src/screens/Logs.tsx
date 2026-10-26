import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { useStore, useNav, DayLog } from '../store';
import { toKey, fromKey, add, fmt, todayKey } from '../lib/cycle';
import { FLOW_COLORS, MOODS, SYMPTOMS, QUICK_SYMPTOMS } from '../data/content';
import {
  Header, CheckButton, PrimaryButton, Field, inputCls, ScreenScroll, Chip,
  SectionTitle, Slider, DropletIcon, BottomNav, Mascot, MascotAvatar, DateStepper,
} from '../components/ui';

/* -------------------------------- Log Period ------------------------------- */

const INTENSITIES = [
  { id: 'Light', drops: 1 },
  { id: 'Moderate', drops: 2 },
  { id: 'Heavy', drops: 3 },
] as const;

export function LogPeriod() {
  const nav = useNav();
  const periods = useStore((s) => s.periods);
  const savePeriod = useStore((s) => s.savePeriod);
  const deletePeriod = useStore((s) => s.deletePeriod);
  const showToast = useStore((s) => s.showToast);
  const back = useStore((s) => s.back);
  const go = useStore((s) => s.go);

  const startKey = (nav.params?.date as string) || todayKey();
  const existing = useMemo(
    () => periods.find((p) => startKey >= p.start && startKey <= p.end),
    [periods, startKey],
  );

  const [start, setStart] = useState(existing?.start ?? startKey);
  const [end, setEnd] = useState(existing?.end ?? toKey(add(fromKey(startKey), 4)));
  const [intensity, setIntensity] = useState<'Light' | 'Moderate' | 'Heavy'>(existing?.intensity ?? 'Moderate');
  const [color, setColor] = useState(existing?.color ?? 'bright-red');
  const [syms, setSyms] = useState<string[]>(existing?.symptoms ?? []);
  const [err, setErr] = useState('');

  const toggleSym = (s: string) => setSyms((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const save = () => {
    if (!start || !end) return setErr('Please pick both dates.');
    if (fromKey(end) < fromKey(start)) return setErr('End date is before the start date.');
    savePeriod({ id: existing?.id, start, end, intensity, color, symptoms: syms });
    showToast(existing ? 'Period updated 🌸' : 'Period saved 🌸');
    back();
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Log Period" right={<CheckButton onClick={save} />} />
      <div className="relative px-5 -mt-1 flex items-end justify-between">
        <p className="text-[12px] font-semibold text-ink-mute pb-1">When did your period start & end?</p>
        <Mascot src="/images/woman-heart.png" className="h-[64px] w-auto" alt="" />
      </div>

      <ScreenScroll>
        <div className="px-5 space-y-4 pt-1">
          <Field label="Start Date">
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
          </Field>
          <Field label="End Date">
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
          </Field>

          <div>
            <SectionTitle className="mb-2">Flow Intensity</SectionTitle>
            <div className="grid grid-cols-3 gap-2.5">
              {INTENSITIES.map(({ id, drops }) => {
                const on = intensity === id;
                return (
                  <button
                    key={id}
                    onClick={() => setIntensity(id)}
                    aria-pressed={on}
                    className={`tap rounded-2xl border-[1.5px] py-2.5 flex flex-col items-center gap-1 transition-colors ${
                      on ? 'bg-primary-pale border-primary shadow-soft' : 'bg-white border-blush-line'
                    }`}
                  >
                    <span className="flex items-end h-6">
                      {[0, 1, 2].map((i) => (
                        <DropletIcon key={i} size={i < drops ? 13 : 11} color={i < drops ? '#EE4D7B' : '#F3D3DE'} />
                      ))}
                    </span>
                    <span className={`text-[11px] font-extrabold ${on ? 'text-primary' : 'text-ink-mute'}`}>{id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionTitle>Flow Color</SectionTitle>
              <button onClick={() => go('flow-color', { color })} className="tap flex items-center gap-1 text-[10.5px] font-extrabold text-primary">
                <Info size={12} /> What does it mean?
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar myflo-scroll-x px-0.5 pb-1">
              {FLOW_COLORS.map((c) => {
                const on = color === c.id;
                return (
                  <button key={c.id} onClick={() => setColor(c.id)} aria-pressed={on} className="tap flex flex-col items-center gap-1 shrink-0">
                    <span className={`w-[46px] h-[46px] rounded-full flex items-center justify-center bg-white border-2 transition-all ${on ? 'border-primary shadow-soft scale-105' : 'border-blush-line'}`}>
                      <DropletIcon size={17} color={c.hex} />
                    </span>
                    <span className={`text-[9px] font-extrabold max-w-[54px] text-center leading-tight ${on ? 'text-primary' : 'text-ink-mute'}`}>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <SectionTitle className="mb-2">Any Symptoms?</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {QUICK_SYMPTOMS.map((s) => (
                <Chip key={s} label={s} selected={syms.includes(s)} onClick={() => toggleSym(s)} />
              ))}
            </div>
          </div>

          {err && <p className="text-[12px] font-bold text-red-500" role="alert">{err}</p>}

          <PrimaryButton onClick={save} className="mt-1">Save</PrimaryButton>

          {existing && (
            <button
              onClick={() => { deletePeriod(existing.id); showToast('Period deleted'); back(); }}
              className="tap w-full text-center text-[12px] font-extrabold text-red-400 pb-3"
            >
              Delete this period
            </button>
          )}
        </div>
      </ScreenScroll>
    </div>
  );
}

/* ------------------------------- Log Symptoms ------------------------------ */

function useDayEditor(initialKey: string) {
  const dayLogs = useStore((s) => s.dayLogs);
  const setDayLog = useStore((s) => s.setDayLog);
  const [key, setKey] = useState(initialKey);
  const stored = dayLogs[key];
  const [draft, setDraft] = useState<DayLog | null>(null);

  const fallback: DayLog = { symptoms: [], pain: 0, bloating: 0, stress: 0, energy: 5 };
  const value: DayLog = draft ?? Object.assign({}, fallback, stored);
  const patch = (p: Partial<DayLog>) => setDraft({ ...value, ...p });
  const changeDay = (k: string) => { setKey(k); setDraft(null); };
  const commit = () => setDayLog(key, value);
  return { key, value, patch, changeDay, commit };
}

export function LogSymptoms() {
  const nav = useNav();
  const showToast = useStore((s) => s.showToast);
  const back = useStore((s) => s.back);
  const { key, value, patch, changeDay, commit } = useDayEditor((nav.params?.date as string) || todayKey());

  const save = () => {
    commit();
    showToast('Saved for ' + fmt(fromKey(key), 'd MMM') + ' 🌸');
    back();
  };

  const toggleSym = (id: string) =>
    patch({ symptoms: value.symptoms.includes(id) ? value.symptoms.filter((x) => x !== id) : [...value.symptoms, id] });

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Log Symptoms" right={<CheckButton onClick={save} />} />
      <DateStepper
        label={fmt(fromKey(key), 'd MMM yyyy')}
        onPrev={() => changeDay(toKey(add(fromKey(key), -1)))}
        onNext={() => changeDay(toKey(add(fromKey(key), 1)))}
        className="-mt-0.5 mb-1"
      />

      <ScreenScroll withNav>
        <div className="px-5 space-y-5 pt-1">
          <section>
            <p className="text-[12px] font-bold text-ink-soft mb-2">How are you feeling today?</p>
            <p className="text-[11px] font-extrabold text-ink-mute mb-2">Mood</p>
            <div className="flex justify-between">
              {MOODS.map((m) => {
                const on = value.mood === m.id;
                return (
                  <button key={m.id} onClick={() => patch({ mood: on ? undefined : m.id })} aria-pressed={on} className="tap flex flex-col items-center gap-1">
                    <span className={`w-[44px] h-[44px] rounded-full flex items-center justify-center text-[22px] border-2 transition-all ${on ? 'bg-primary-pale border-primary scale-110 shadow-soft' : 'bg-white border-blush-line'}`}>
                      {m.emoji}
                    </span>
                    <span className={`text-[9px] font-extrabold ${on ? 'text-primary' : 'text-ink-mute'}`}>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <SectionTitle className="mb-2.5">Physical Symptoms</SectionTitle>
            <div className="grid grid-cols-4 gap-y-3.5">
              {SYMPTOMS.map((s) => {
                const on = value.symptoms.includes(s.id);
                return (
                  <button key={s.id} onClick={() => toggleSym(s.id)} aria-pressed={on} className="tap flex flex-col items-center gap-1">
                    <span className={`relative w-[46px] h-[46px] rounded-full flex items-center justify-center text-[21px] border-2 transition-all ${on ? 'bg-primary-pale border-primary shadow-soft' : 'bg-white border-blush-line'}`}>
                      {s.emoji}
                      {on && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-grad-pink text-white flex items-center justify-center">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
                        </span>
                      )}
                    </span>
                    <span className={`text-[9px] font-extrabold text-center leading-tight max-w-[64px] ${on ? 'text-primary' : 'text-ink-mute'}`}>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <SectionTitle>
                Pain Level <span className="text-ink-mute font-bold text-[11.5px]">(Lower Abdomen)</span>
              </SectionTitle>
              <span className="text-[12px] font-black text-primary">{value.pain}/10</span>
            </div>
            <Slider value={value.pain} onChange={(v) => patch({ pain: v })} />
            <div className="flex justify-between text-[9px] font-bold text-ink-faint mt-1 px-0.5">
              <span>None</span><span>Mild</span><span>Severe</span>
            </div>
          </section>

          <section>
            <SectionTitle className="mb-2">Note</SectionTitle>
            <textarea
              value={value.note ?? ''}
              onChange={(e) => patch({ note: e.target.value, noteTime: fmt(new Date(), 'hh:mm a') })}
              placeholder="Felt low energy today but mood is better…"
              rows={3}
              className="w-full rounded-2xl bg-white/80 border border-blush-line px-4 py-3 text-[13px] font-semibold placeholder:text-ink-faint outline-none focus:border-primary-light resize-none"
            />
          </section>
        </div>
      </ScreenScroll>

      <BottomNav active="home" />
    </div>
  );
}

/* ------------------------------- Body Tracker ------------------------------ */

const BLEEDING = ['Spotting', 'Light', 'Moderate', 'Heavy'] as const;

function TrackerRow({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <MascotAvatar size={24} ring={false} />
        <span className="flex-1 text-[13px] font-extrabold">{label}</span>
        <span className="text-[12px] font-black text-ink-soft">{value}<span className="text-ink-faint">/10</span></span>
      </div>
      <Slider value={value} onChange={onChange} />
    </div>
  );
}

export function BodyTracker() {
  const nav = useNav();
  const showToast = useStore((s) => s.showToast);
  const back = useStore((s) => s.back);
  const { key, value, patch, changeDay, commit } = useDayEditor((nav.params?.date as string) || todayKey());

  const save = () => {
    commit();
    showToast('Body check-in saved 💗');
    back();
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Body Tracker" right={<CheckButton onClick={save} />} />
      <DateStepper
        label={fmt(fromKey(key), 'd MMM yyyy')}
        onPrev={() => changeDay(toKey(add(fromKey(key), -1)))}
        onNext={() => changeDay(toKey(add(fromKey(key), 1)))}
        className="-mt-0.5 mb-1"
      />

      <ScreenScroll withNav>
        <div className="px-5 space-y-5 pt-2">
          <TrackerRow label="Pain Level" value={value.pain} onChange={(v) => patch({ pain: v })} />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <DropletIcon size={14} />
              <span className="text-[13px] font-extrabold">Bleeding Amount</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 bg-primary-pale rounded-full p-1">
              {BLEEDING.map((b) => {
                const on = value.bleeding === b;
                return (
                  <button
                    key={b}
                    onClick={() => patch({ bleeding: on ? undefined : b })}
                    aria-pressed={on}
                    className={`tap h-8 rounded-full text-[10.5px] font-extrabold transition-colors ${on ? 'bg-grad-pink text-white shadow-btn' : 'text-ink-mute'}`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>

          <TrackerRow label="Bloating Level" value={value.bloating} onChange={(v) => patch({ bloating: v })} />
          <TrackerRow label="Stress Level" value={value.stress} onChange={(v) => patch({ stress: v })} />
          <TrackerRow label="Energy Level" value={value.energy} onChange={(v) => patch({ energy: v })} />

          <div className="bg-primary-pale border border-primary-soft rounded-3xl p-3.5 flex gap-2.5 items-start">
            <MascotAvatar size={34} ring={false} />
            <p className="text-[12.5px] font-semibold text-ink-soft leading-snug pt-0.5">
              {value.pain >= 7
                ? 'That sounds like a tough day 💗 A warm compress and rest can help. If pain stays severe, please see a doctor.'
                : value.energy <= 3
                  ? 'Low-energy day noted 🌙 Be gentle with yourself — hydration and an early night help.'
                  : 'Thanks for checking in! Daily logs help Myflo spot your patterns. 🌸'}
            </p>
          </div>
        </div>
      </ScreenScroll>

      <BottomNav active="home" />
    </div>
  );
}
