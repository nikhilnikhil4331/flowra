import React, { useState } from 'react';
import {
  Plus, Check, Pill, Trash2, Bell, Droplets, Egg, Heart, GlassWater,
  UtensilsCrossed, Moon, ChevronRight, Info,
} from 'lucide-react';
import { useStore, useNav, Reminder } from '../store';
import { MEDICINE_CATALOG } from '../data/content';
import { format } from 'date-fns';
import { fromKey, todayKey } from '../lib/cycle';
import {
  Header, ScreenScroll, Segmented, PrimaryButton, Field, inputCls,
  Toggle, EmptyState, Mascot, SectionTitle,
} from '../components/ui';

const fmtTime = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 || 12;
  return `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

function reminderDesc(r: Reminder): string {
  switch (r.kind) {
    case 'period':
    case 'ovulation':
      return r.leadDays === 0 ? 'On expected date' : `Notify ${r.leadDays} day${r.leadDays === 1 ? '' : 's'} before`;
    case 'symptom':
      return `Daily at ${fmtTime(r.time)}`;
    case 'medicine':
      return 'Take on time';
    case 'water':
      return 'Stay hydrated';
    case 'nutrition':
      return 'Log your meals';
    case 'sleep':
      return `Go to bed at ${fmtTime(r.time)}`;
  }
}

/* ------------------------------ Medicine & Care ----------------------------- */

export function Medicine() {
  const go = useStore((s) => s.go);
  const medicines = useStore((s) => s.medicines);
  const addMedicine = useStore((s) => s.addMedicine);
  const deleteMedicine = useStore((s) => s.deleteMedicine);
  const showToast = useStore((s) => s.showToast);
  const [tab, setTab] = useState<'recommended' | 'mine' | 'pain'>('recommended');

  const inMine = (name: string, dose: string) => medicines.some((m) => m.name === name && m.dose === dose);

  const catalogList = MEDICINE_CATALOG.filter((c) => (tab === 'recommended' ? c.category === 'recommended' : c.category === 'pain'));

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header
        title="Medicine & Care"
        right={
          <button onClick={() => go('add-medicine')} aria-label="Add medicine" className="tap w-9 h-9 rounded-full bg-grad-pink shadow-btn text-white flex items-center justify-center">
            <Plus size={18} strokeWidth={2.8} />
          </button>
        }
      />
      <div className="px-5 pb-2 shrink-0">
        <Segmented
          options={[
            { id: 'recommended', label: 'Recommended' },
            { id: 'mine', label: 'My Medicine' },
            { id: 'pain', label: 'Pain Relief' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <ScreenScroll>
        <div className="px-5 pt-1 pb-4">
          {tab !== 'mine' ? (
            <div className="space-y-2">
              {catalogList.map((c, i) => {
                const added = inMine(c.name, c.dose);
                return (
                  <div key={`${c.name}-${c.dose}-${i}`} className="flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 px-3.5 py-3 animate-fade-up" style={{ animationDelay: `${i * 35}ms` }}>
                    <span className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary shrink-0">
                      <Pill size={18} strokeWidth={2.2} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-extrabold leading-tight">
                        {c.name} {c.dose && <span className="text-ink-mute font-bold">({c.dose})</span>}
                      </span>
                      <span className="block text-[11px] font-semibold text-ink-mute">{c.desc}</span>
                    </span>
                    <button
                      onClick={() => {
                        if (added) return;
                        addMedicine({ name: c.name, dose: c.dose, reason: c.desc, desc: c.desc, startDate: todayKey(), reminder: false });
                        showToast(`${c.name} added to My Medicine 💊`);
                      }}
                      aria-label={added ? `${c.name} already added` : `Add ${c.name}`}
                      className={`tap w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${added ? 'bg-minty/20 text-minty' : 'bg-primary-pale text-primary'}`}
                    >
                      {added ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : medicines.length === 0 ? (
            <div>
              <EmptyState emoji="💊" title="No medicines saved yet" desc="Add from Recommendations or tap + to add your own." />
              <PrimaryButton onClick={() => go('add-medicine')}>Add Medicine</PrimaryButton>
            </div>
          ) : (
            <div className="space-y-2">
              {medicines.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 px-3.5 py-3 animate-fade-up">
                  <span className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary shrink-0">
                    <Pill size={18} strokeWidth={2.2} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-extrabold leading-tight">
                      {m.name} {m.dose && <span className="text-ink-mute font-bold">{m.dose}</span>}
                    </span>
                    <span className="block text-[11px] font-semibold text-ink-mute truncate">
                      {m.reason} · from {format(fromKey(m.startDate), 'd MMM yyyy')}
                    </span>
                  </span>
                  {m.reminder && <Bell size={15} className="text-primary shrink-0" />}
                  <button onClick={() => { deleteMedicine(m.id); showToast('Removed'); }} aria-label={`Remove ${m.name}`} className="tap text-ink-faint hover:text-red-400 shrink-0">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-4 bg-[#FFF6EC] border border-[#FBE3C2] rounded-2xl p-3">
            <Info size={15} className="text-[#B9791F] shrink-0 mt-[1px]" />
            <p className="text-[11px] font-semibold text-[#97722F] leading-relaxed">
              Remember: Always consult a doctor before starting any medication.
            </p>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}

/* -------------------------------- Add Medicine ------------------------------ */

export function AddMedicine() {
  const addMedicine = useStore((s) => s.addMedicine);
  const replace = useStore((s) => s.replace);
  const showToast = useStore((s) => s.showToast);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(todayKey());
  const [reminder, setReminder] = useState(false);
  const [repeat, setRepeat] = useState('Only this cycle');
  const [err, setErr] = useState('');

  const save = () => {
    if (name.trim().length < 2) return setErr('Please enter the medicine name.');
    addMedicine({ name: name.trim(), dose: dose.trim(), reason: reason.trim() || 'General', startDate, reminder });
    showToast('Medicine saved 💊');
    replace('medicine');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Add Medicine" right={<Mascot src="/images/woman-avatar.png" className="w-9 h-9 rounded-full object-cover" blend={false} alt="" />} />
      <ScreenScroll>
        <div className="px-5 pt-2 space-y-4">
          <Field label="Medicine Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ibuprofen" className={inputCls} />
          </Field>
          <Field label="Dose">
            <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 400 mg" className={inputCls} />
          </Field>
          <Field label="Reason">
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Cramps" className={inputCls} />
          </Field>
          <Field label="Start Date">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
          </Field>

          <div className="bg-white rounded-2xl shadow-card border border-blush-line/60 px-4 py-3 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-extrabold">Reminder</p>
                <p className="text-[11px] font-semibold text-ink-mute">{repeat}</p>
              </div>
              <Toggle on={reminder} onChange={setReminder} label="Medicine reminder" />
            </div>
            {reminder && (
              <Segmented
                options={[
                  { id: 'Only this cycle', label: 'This cycle' },
                  { id: 'Every day', label: 'Every day' },
                ]}
                value={repeat}
                onChange={setRepeat}
              />
            )}
          </div>

          {err && <p className="text-[12px] font-bold text-red-500" role="alert">{err}</p>}

          <PrimaryButton onClick={save}>Save Medicine</PrimaryButton>
          <div className="h-2" />
        </div>
      </ScreenScroll>
    </div>
  );
}

/* --------------------------------- Reminders -------------------------------- */

const KIND_ICON: Record<Reminder['kind'], { Icon: typeof Droplets; tint: string }> = {
  period: { Icon: Droplets, tint: '#F25B8A' },
  ovulation: { Icon: Egg, tint: '#FFB657' },
  symptom: { Icon: Heart, tint: '#F78FB0' },
  medicine: { Icon: Pill, tint: '#4ECDC4' },
  water: { Icon: GlassWater, tint: '#6FA8E8' },
  nutrition: { Icon: UtensilsCrossed, tint: '#FF9F68' },
  sleep: { Icon: Moon, tint: '#B9A7F2' },
};

async function askNotificationPermission() {
  try {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  } catch {
    /* notifications unsupported — reminders still saved in-app */
  }
}

export function Reminders() {
  const reminders = useStore((s) => s.reminders);
  const setReminder = useStore((s) => s.setReminder);
  const go = useStore((s) => s.go);

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Smart Reminders" />
      <ScreenScroll>
        <div className="px-5 pt-1 pb-5 space-y-2">
          {reminders.map((r, i) => {
            const { Icon, tint } = KIND_ICON[r.kind];
            return (
              <div key={r.id} className="flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 pl-3 pr-3.5 py-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <button onClick={() => go('reminder-detail', { id: r.id })} className="tap flex items-center gap-3 flex-1 min-w-0 text-left" aria-label={`Edit ${r.title}`}>
                  <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `${tint}1F`, color: tint }}>
                    <Icon size={18} strokeWidth={2.3} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13.5px] font-extrabold leading-tight">{r.title}</span>
                    <span className="block text-[11px] font-semibold text-ink-mute">{reminderDesc(r)}</span>
                  </span>
                  <ChevronRight size={15} className="text-ink-faint shrink-0" strokeWidth={2.6} />
                </button>
                <Toggle
                  on={r.enabled}
                  label={r.title}
                  onChange={(v) => {
                    setReminder(r.id, { enabled: v });
                    if (v) void askNotificationPermission();
                  }}
                />
              </div>
            );
          })}

          <p className="text-[11px] font-semibold text-ink-faint text-center pt-3 px-6 leading-relaxed">
            Reminders are saved on this device. Enable browser notifications to get gentle nudges even when Myflo is closed. 🌸
          </p>
        </div>
      </ScreenScroll>
    </div>
  );
}

/* ------------------------------ Reminder Detail ----------------------------- */

export function ReminderDetail() {
  const nav = useNav();
  const reminders = useStore((s) => s.reminders);
  const setReminder = useStore((s) => s.setReminder);
  const showToast = useStore((s) => s.showToast);
  const back = useStore((s) => s.back);

  const r = reminders.find((x) => x.id === nav.params?.id) ?? reminders[0];
  const [leadDays, setLeadDays] = useState(r?.leadDays ?? 0);
  const [time, setTime] = useState(r?.time ?? '09:00');
  const [repeat, setRepeat] = useState(r?.repeat ?? 'Every cycle');
  const [enabled, setEnabled] = useState(r?.enabled ?? true);

  if (!r) {
    return (
      <div className="flex flex-col flex-1">
        <Header title="Reminder Settings" />
        <EmptyState emoji="🔔" title="No reminder found" desc="" />
      </div>
    );
  }

  const isCycleKind = r.kind === 'period' || r.kind === 'ovulation';
  const leadOptions = [
    { value: 3, label: '3 days before' },
    { value: 1, label: '1 day before' },
    { value: 0, label: 'On expected date' },
  ];

  const save = () => {
    const patch: Partial<Reminder> = { leadDays, time, repeat, enabled };
    setReminder(r.id, { ...patch, desc: reminderDesc({ ...r, ...patch }) });
    showToast(`${r.title} saved 🔔`);
    back();
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Reminder Settings" />
      <ScreenScroll>
        <div className="px-5 pt-1 space-y-4">
          <div className="flex items-center justify-between">
            <SectionTitle className="text-[15px]">{r.title}</SectionTitle>
            <Toggle on={enabled} onChange={(v) => { setEnabled(v); if (v) void askNotificationPermission(); }} label={`Enable ${r.title}`} />
          </div>

          {isCycleKind && (
            <div className="space-y-2" role="radiogroup" aria-label="When to remind">
              {leadOptions.map((o) => {
                const on = leadDays === o.value;
                return (
                  <button
                    key={o.value}
                    role="radio"
                    aria-checked={on}
                    onClick={() => setLeadDays(o.value)}
                    className={`tap w-full flex items-center justify-between rounded-2xl border-[1.5px] px-4 py-3.5 ${on ? 'bg-primary-pale border-primary-light' : 'bg-white border-blush-line'}`}
                  >
                    <span className="text-[13px] font-extrabold">{o.label}</span>
                    <span className={`w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center ${on ? 'border-primary' : 'border-blush-line'}`}>
                      {on && <span className="w-[11px] h-[11px] rounded-full bg-grad-pink" />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-card border border-blush-line/60 divide-y divide-blush-line/60">
            <label className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] font-extrabold">Time</span>
              <span className="flex items-center gap-2">
                <span className="text-[12.5px] font-bold text-ink-mute">{fmtTime(time)}</span>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-[34px] h-8 opacity-70 cursor-pointer" aria-label="Reminder time" />
              </span>
            </label>
            <label className="flex items-center justify-between px-4 py-3">
              <span className="text-[13px] font-extrabold">Repeat</span>
              <select value={repeat} onChange={(e) => setRepeat(e.target.value)} className="bg-transparent text-[12.5px] font-bold text-ink-mute outline-none cursor-pointer" aria-label="Repeat">
                <option>Every cycle</option>
                <option>Every day</option>
                <option>Weekdays</option>
                <option>Only once</option>
              </select>
            </label>
          </div>

          <PrimaryButton onClick={save}>Save</PrimaryButton>
          <div className="h-2" />
        </div>
      </ScreenScroll>
    </div>
  );
}
