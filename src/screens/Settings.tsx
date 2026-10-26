import React, { useState } from 'react';
import {
  User, SlidersHorizontal, BellRing, Bell, ShieldCheck, Languages, LifeBuoy,
  Star, Info, ChevronRight, ChevronDown, Database, CalendarClock, Minus, Plus, Download, Trash2,
} from 'lucide-react';
import { useStore } from '../store';
import {
  Header, ScreenScroll, BottomNav, Field, inputCls, PrimaryButton, Toggle, Mascot,
} from '../components/ui';

/* ------------------------------------ More ---------------------------------- */

export function More() {
  const user = useStore((s) => s.user);
  const go = useStore((s) => s.go);
  const tabTo = useStore((s) => s.tabTo);
  const logout = useStore((s) => s.logout);
  const showToast = useStore((s) => s.showToast);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const rows = [
    { label: 'My Data', Icon: Database, onClick: () => go('reports') },
    { label: 'Period Delay Guide', Icon: CalendarClock, onClick: () => go('delay-guide') },
    { label: 'Reminders', Icon: Bell, onClick: () => go('reminders') },
    { label: 'Notification Settings', Icon: BellRing, onClick: () => go('settings') },
    { label: 'Privacy & Security', Icon: ShieldCheck, onClick: () => go('settings') },
    { label: 'Help & Support', Icon: LifeBuoy, onClick: () => go('ai') },
    { label: 'About', Icon: Info, onClick: () => go('settings') },
  ];

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="More" onBack={() => tabTo('home')} />
      <ScreenScroll withNav>
        <div className="px-5 pt-1">
          <button onClick={() => go('settings')} className="tap w-full flex items-center gap-3 bg-white rounded-[22px] shadow-card border border-blush-line/60 px-4 py-3.5 text-left animate-fade-up">
            <span className="w-[52px] h-[52px] rounded-full overflow-hidden bg-primary-soft shrink-0">
              <Mascot src="/images/woman-avatar.png" blend={false} className="w-full h-full object-cover" alt="" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-black truncate">{user.name || 'Gargi'}</span>
              <span className="block text-[11.5px] font-semibold text-ink-mute truncate">{user.email || 'gargi@email.com'}</span>
            </span>
            <ChevronRight size={16} className="text-ink-faint" strokeWidth={2.6} />
          </button>

          <div className="bg-white rounded-[22px] shadow-card border border-blush-line/60 mt-4 divide-y divide-blush-line/60 overflow-hidden">
            {rows.map(({ label, Icon, onClick }) => (
              <button key={label} onClick={onClick} className="tap w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <Icon size={18} strokeWidth={2.2} className="text-ink-soft shrink-0" />
                <span className="flex-1 text-[13px] font-extrabold">{label}</span>
                <ChevronRight size={15} className="text-ink-faint" strokeWidth={2.6} />
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (confirmLogout) { logout(); showToast('Logged out. See you soon 🌸'); }
              else setConfirmLogout(true);
            }}
            className="tap w-full h-[50px] mt-5 rounded-full bg-white border-[1.5px] border-primary-light text-primary font-extrabold text-[14px]"
          >
            {confirmLogout ? 'Tap again to confirm log out' : 'Log Out'}
          </button>
          <p className="text-center text-[10px] font-semibold text-ink-faint mt-3">Your data stays safely on this device.</p>
        </div>
      </ScreenScroll>

      <BottomNav active="more" />
    </div>
  );
}

/* ---------------------------------- Settings -------------------------------- */

function Row({
  Icon, label, value, onClick, open,
}: {
  Icon: typeof User; label: string; value?: string; onClick: () => void; open?: boolean;
}) {
  return (
    <button onClick={onClick} className="tap w-full flex items-center gap-3 px-4 py-3.5 text-left" aria-expanded={open}>
      <Icon size={18} strokeWidth={2.2} className="text-ink-soft shrink-0" />
      <span className="flex-1 text-[13px] font-extrabold">{label}</span>
      {value && <span className="text-[11.5px] font-bold text-ink-mute">{value}</span>}
      {open === undefined ? (
        <ChevronRight size={15} className="text-ink-faint" strokeWidth={2.6} />
      ) : (
        <ChevronDown size={15} className={`text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={2.6} />
      )}
    </button>
  );
}

function StepperRow({ label, value, unit, onChange }: { label: string; value: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[12.5px] font-extrabold text-ink-soft">{label}</span>
      <div className="flex items-center gap-2.5">
        <button onClick={() => onChange(value - 1)} aria-label={`Decrease ${label}`} className="tap w-7 h-7 rounded-full bg-primary-pale text-primary flex items-center justify-center"><Minus size={14} strokeWidth={3} /></button>
        <span className="text-[13px] font-black min-w-[54px] text-center">{value} {unit}</span>
        <button onClick={() => onChange(value + 1)} aria-label={`Increase ${label}`} className="tap w-7 h-7 rounded-full bg-primary-pale text-primary flex items-center justify-center"><Plus size={14} strokeWidth={3} /></button>
      </div>
    </div>
  );
}

const NOTIF_KEY = 'myflo-notif-prefs';

export function Settings() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const go = useStore((s) => s.go);
  const showToast = useStore((s) => s.showToast);
  const resetAll = useStore((s) => s.resetAll);

  const [open, setOpen] = useState<string | null>(null);
  const toggleSection = (id: string) => setOpen(open === id ? null : id);

  // profile draft
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [dob, setDob] = useState(user.dob);
  const [height, setHeight] = useState(String(user.height));
  const [weight, setWeight] = useState(String(user.weight));

  const [cycleLen, setCycleLen] = useState(user.cycleLen ?? 28);
  const [periodLen, setPeriodLen] = useState(user.periodLen ?? 5);

  const [notif, setNotif] = useState(() => {
    try {
      return { all: true, sound: false, weekly: true, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') };
    } catch {
      return { all: true, sound: false, weekly: true };
    }
  });
  const saveNotif = (patch: Partial<typeof notif>) => {
    const next = { ...notif, ...patch };
    setNotif(next);
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)); } catch { /* private mode */ }
    if (next.all) {
      try {
        if ('Notification' in window && Notification.permission === 'default') void Notification.requestPermission();
      } catch { /* unsupported */ }
    }
  };

  const [stars, setStars] = useState(0);
  const [confirmWipe, setConfirmWipe] = useState(false);

  const exportData = () => {
    const state = useStore.getState();
    const blob = new Blob(
      [JSON.stringify({ user: state.user, periods: state.periods, dayLogs: state.dayLogs, meals: state.meals, medicines: state.medicines, reminders: state.reminders }, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myflo-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Your data was exported 💾');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Settings" />
      <ScreenScroll>
        <div className="px-5 pt-1 pb-6">
          <div className="bg-white rounded-[22px] shadow-card border border-blush-line/60 divide-y divide-blush-line/60 overflow-hidden">
            {/* My Profile */}
            <div>
              <Row Icon={User} label="My Profile" open={open === 'profile'} onClick={() => toggleSection('profile')} />
              {open === 'profile' && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
                  <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
                  <Field label="Date of Birth"><input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Height (cm)"><input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, ''))} className={inputCls} /></Field>
                    <Field label="Weight (kg)"><input inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))} className={inputCls} /></Field>
                  </div>
                  <PrimaryButton
                    className="!h-11 !text-[13px]"
                    onClick={() => {
                      setUser({ name: name.trim() || user.name, email: email.trim(), dob, height: Number(height) || user.height, weight: Number(weight) || user.weight });
                      showToast('Profile updated 🌸');
                    }}
                  >
                    Save Profile
                  </PrimaryButton>
                </div>
              )}
            </div>

            {/* Cycle Preferences */}
            <div>
              <Row Icon={SlidersHorizontal} label="Cycle Preferences" open={open === 'cycle'} onClick={() => toggleSection('cycle')} />
              {open === 'cycle' && (
                <div className="px-4 pb-4 animate-fade-in">
                  <p className="text-[11px] font-semibold text-ink-mute pb-1">Used for predictions until Myflo learns your rhythm.</p>
                  <StepperRow label="Typical cycle length" value={cycleLen} unit="days" onChange={(v) => {
                    const n = Math.min(45, Math.max(18, v));
                    setCycleLen(n); setUser({ cycleLen: n });
                  }} />
                  <StepperRow label="Typical period length" value={periodLen} unit="days" onChange={(v) => {
                    const n = Math.min(10, Math.max(2, v));
                    setPeriodLen(n); setUser({ periodLen: n });
                  }} />
                </div>
              )}
            </div>

            <Row Icon={BellRing} label="Reminder Settings" onClick={() => go('reminders')} />

            {/* Notifications */}
            <div>
              <Row Icon={Bell} label="Notification Settings" open={open === 'notif'} onClick={() => toggleSection('notif')} />
              {open === 'notif' && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  {[
                    { k: 'all' as const, label: 'Allow notifications', desc: 'Gentle cycle & care nudges' },
                    { k: 'sound' as const, label: 'Sound', desc: 'Play a soft chime' },
                    { k: 'weekly' as const, label: 'Weekly summary', desc: 'Every Sunday evening' },
                  ].map((it) => (
                    <div key={it.k} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[12.5px] font-extrabold">{it.label}</p>
                        <p className="text-[11px] font-semibold text-ink-mute">{it.desc}</p>
                      </div>
                      <Toggle on={notif[it.k]} onChange={(v) => saveNotif({ [it.k]: v })} label={it.label} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy */}
            <div>
              <Row Icon={ShieldCheck} label="Privacy & Security" open={open === 'privacy'} onClick={() => toggleSection('privacy')} />
              {open === 'privacy' && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  <p className="text-[12px] font-semibold text-ink-soft leading-relaxed">
                    Your health data is stored only on this device — never sold, never shared. You are in full control. 💗
                  </p>
                  <button onClick={exportData} className="tap w-full h-11 rounded-full bg-primary-pale text-primary text-[12.5px] font-extrabold flex items-center justify-center gap-2">
                    <Download size={15} /> Export my data (JSON)
                  </button>
                  <button
                    onClick={() => {
                      if (confirmWipe) { resetAll(); showToast('All data deleted'); }
                      else setConfirmWipe(true);
                    }}
                    className="tap w-full h-11 rounded-full bg-red-50 text-red-500 text-[12.5px] font-extrabold flex items-center justify-center gap-2"
                  >
                    <Trash2 size={15} /> {confirmWipe ? 'Tap again to delete everything' : 'Delete all my data'}
                  </button>
                </div>
              )}
            </div>

            <Row Icon={Languages} label="Language" value="English" onClick={() => showToast('More languages blooming soon 🌸')} />
            <Row Icon={LifeBuoy} label="Help & Support" onClick={() => go('ai')} />

            {/* Rate */}
            <div>
              <Row Icon={Star} label="Rate Myflo" open={open === 'rate'} onClick={() => toggleSection('rate')} />
              {open === 'rate' && (
                <div className="px-4 pb-4 text-center animate-fade-in">
                  <div className="flex justify-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => { setStars(n); showToast(`Thank you for ${n} star${n === 1 ? '' : 's'}! 💖`); }} aria-label={`Rate ${n} stars`} className="tap">
                        <Star size={28} className={n <= stars ? 'text-sunny' : 'text-blush-line'} fill={n <= stars ? '#FFB657' : 'transparent'} strokeWidth={2} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold text-ink-mute">{stars ? 'We\'re so glad Myflo helps you!' : 'Tap a star to rate us'}</p>
                </div>
              )}
            </div>

            {/* About */}
            <div>
              <Row Icon={Info} label="About" open={open === 'about'} onClick={() => toggleSection('about')} />
              {open === 'about' && (
                <div className="px-4 pb-4 animate-fade-in">
                  <p className="text-[12px] font-semibold text-ink-soft leading-relaxed">
                    <span className="font-script text-[20px] text-primary align-middle mr-1">Myflo</span>
                    v1.0 — Your Cycle. Your Health. Your Story.<br /><br />
                    Myflo helps you track periods, symptoms, mood, nutrition and more, with gentle AI guidance.
                    It provides general wellness information and is not a substitute for medical advice.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}
