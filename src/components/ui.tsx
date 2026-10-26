import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Home, CalendarDays, BarChart3, LayoutGrid,
  Camera, Pill, Sparkles, Droplets, Activity, Heart, Wifi, BatteryMedium, X,
} from 'lucide-react';
import { useStore, ScreenId } from '../store';

/* ---------------------------------- shell ---------------------------------- */

export function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-1 text-ink shrink-0 select-none" aria-hidden>
      <span className="text-[13px] font-extrabold tracking-wide">09:41</span>
      <div className="flex items-center gap-1.5">
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h) => (
            <span key={h} className="w-[3px] rounded bg-ink" style={{ height: h }} />
          ))}
        </span>
        <Wifi size={14} strokeWidth={2.6} />
        <BatteryMedium size={20} strokeWidth={1.8} />
      </div>
    </div>
  );
}

export function Petals({ count = 7 }: { count?: number }) {
  const petals = React.useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37 + 8) % 92}%`,
        size: 9 + ((i * 7) % 10),
        dur: 9 + ((i * 3) % 8),
        delay: -((i * 2.7) % 12),
        o: 0.35 + ((i * 13) % 40) / 100,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-petal-fall"
          style={{ left: p.left, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, opacity: p.o }}
        >
          <PetalShape size={p.size} />
        </span>
      ))}
    </div>
  );
}

export function PetalShape({ size = 14, color = '#F8B4CD' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2c4 4 6 8 6 12a6 6 0 1 1-12 0c0-4 2-8 6-12z" fill={color} opacity="0.9" />
      <path d="M12 5v14" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export function ScreenScroll({
  children, withNav = false, className = '',
}: { children: React.ReactNode; withNav?: boolean; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const drag = React.useRef<{ y: number; top: number; moved: boolean; id: number } | null>(null);

  // Touch uses native scrolling; this adds mouse drag-to-scroll for desktop testing.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select')) return; // let sliders & fields work normally
    const el = ref.current;
    if (!el) return;
    drag.current = { y: e.clientY, top: el.scrollTop, moved: false, id: e.pointerId };
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el || e.pointerId !== d.id) return;
    const dy = d.y - e.clientY;
    if (!d.moved && Math.abs(dy) > 6) {
      d.moved = true;
      try { el.setPointerCapture(e.pointerId); } catch { /* noop */ }
      el.style.cursor = 'grabbing';
    }
    if (d.moved) el.scrollTop = d.top + dy;
  };
  const endDrag = () => {
    const d = drag.current;
    const el = ref.current;
    if (!d || !el) return;
    el.style.cursor = '';
    if (d.moved) {
      // swallow the click that follows a drag so buttons don't fire accidentally
      const block = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
      el.addEventListener('click', block, { capture: true, once: true });
      setTimeout(() => el.removeEventListener('click', block, { capture: true }), 80);
    }
    drag.current = null;
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      className={`flex-1 min-h-0 overflow-y-auto no-scrollbar myflo-scroll ${withNav ? 'pb-28' : 'pb-6'} ${className}`}
    >
      {children}
    </div>
  );
}

/* --------------------------------- headers --------------------------------- */

export function Header({
  title, onBack, right, subtitle,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  subtitle?: string;
}) {
  const back = useStore((s) => s.back);
  return (
    <header className="relative flex items-center px-4 pt-1 pb-2 shrink-0">
      <button
        onClick={onBack ?? back}
        aria-label="Go back"
        className="tap w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center text-ink z-10"
      >
        <ChevronLeft size={19} strokeWidth={2.6} />
      </button>
      <div className="absolute inset-x-0 text-center pointer-events-none px-14">
        <h1 className="text-[16.5px] font-extrabold text-ink leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-ink-mute font-semibold truncate">{subtitle}</p>}
      </div>
      <div className="ml-auto z-10 flex items-center">{right}</div>
    </header>
  );
}

export function CheckButton({ onClick, label = 'Save' }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="tap w-9 h-9 rounded-full bg-grad-pink shadow-btn flex items-center justify-center text-white"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
    </button>
  );
}

/* --------------------------------- buttons --------------------------------- */

export function PrimaryButton({
  children, onClick, className = '', disabled, type,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type ?? 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`tap w-full h-[52px] rounded-full bg-grad-pink text-white font-extrabold text-[15px] shadow-btn flex items-center justify-center gap-2 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SoftButton({
  children, onClick, className = '',
}: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`tap h-[52px] rounded-full bg-white border-[1.5px] border-primary-light text-primary font-extrabold text-[15px] flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- forms ---------------------------------- */

export function Field({
  label, children, className = '',
}: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block text-[12px] font-bold text-ink-soft mb-1.5 pl-1">{label}</span>}
      {children}
    </label>
  );
}

export const inputCls =
  'w-full h-[50px] px-4 rounded-2xl bg-white/80 border border-blush-line text-[14px] font-semibold text-ink placeholder:text-ink-faint placeholder:font-semibold focus:border-primary-light focus:bg-white outline-none transition shadow-[0_2px_8px_rgba(242,91,138,0.05)]';

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label ?? 'toggle'}
      onClick={() => onChange(!on)}
      className={`tap shrink-0 w-[46px] h-[27px] rounded-full p-[3px] transition-colors duration-200 ${on ? 'bg-grad-pink shadow-soft' : 'bg-[#EBD5DB]'}`}
    >
      <span
        className={`block w-[21px] h-[21px] rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-[19px]' : 'translate-x-0'}`}
      />
    </button>
  );
}

export function Slider({
  value, onChange, accent = '#F25B8A',
}: { value: number; onChange: (v: number) => void; accent?: string }) {
  return (
    <input
      type="range"
      min={0}
      max={10}
      step={1}
      value={value}
      aria-label="level from 0 to 10"
      onChange={(e) => onChange(Number(e.target.value))}
      className="myflo-range"
      style={{ ['--fill' as string]: `${value * 10}%` }}
    />
  );
}

export function Chip({
  label, selected, onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`tap px-3.5 py-[7px] rounded-full text-[12px] font-bold border-[1.5px] transition-colors ${
        selected
          ? 'bg-primary text-white border-primary shadow-soft'
          : 'bg-white text-ink-soft border-blush-line'
      }`}
    >
      {label}
    </button>
  );
}

/* ---------------------------------- tabs ----------------------------------- */

export function Segmented<T extends string>({
  options, value, onChange,
}: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex bg-primary-pale rounded-full p-1 gap-1" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`tap flex-1 h-8 rounded-full text-[12px] font-extrabold transition-colors ${
            value === o.id ? 'bg-white text-primary shadow-card' : 'text-ink-mute'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function UnderlineTabs<T extends string>({
  options, value, onChange,
}: { options: T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex justify-between px-1 border-b border-blush-line" role="tablist">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`tap relative pb-2 pt-1 text-[13px] font-extrabold ${value === o ? 'text-primary' : 'text-ink-mute'}`}
        >
          {o}
          {value === o && <span className="absolute left-0 right-0 -bottom-[1px] h-[2.5px] rounded bg-grad-pink" />}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- droplet --------------------------------- */

export function DropletIcon({ color = '#F25B8A', size = 22, className = '' }: { color?: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.18} viewBox="0 0 24 28" className={className} aria-hidden>
      <path d="M12 1.5C12 1.5 3.5 12 3.5 17.5a8.5 8.5 0 0 0 17 0C20.5 12 12 1.5 12 1.5Z" fill={color} />
      <ellipse cx="9" cy="18.5" rx="2" ry="3" fill="#fff" opacity="0.35" transform="rotate(-18 9 18.5)" />
    </svg>
  );
}

/* --------------------------------- mascot ---------------------------------- */

export function Mascot({
  src, className = '', blend = true, alt = 'Myflo mascot',
}: { src: string; className?: string; blend?: boolean; alt?: string }) {
  const [err, setErr] = useState(false);
  if (err) return <div className={`${className} flex items-center justify-center text-5xl`} aria-hidden>🌸</div>;
  return <img src={src} alt={alt} draggable={false} onError={() => setErr(true)} className={`${blend ? 'blend-img' : ''} select-none ${className}`} />;
}

export function MascotAvatar({ size = 40, ring = true }: { size?: number; ring?: boolean }) {
  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 bg-primary-soft ${ring ? 'ring-2 ring-primary-soft' : ''}`}
      style={{ width: size, height: size }}
    >
      <Mascot src="/images/woman-avatar.png" blend={false} className="w-full h-full object-cover" alt="Myflo" />
    </div>
  );
}

export function AiTipCard({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`flex items-start gap-2.5 bg-primary-pale border border-primary-soft rounded-3xl p-3 ${className}`}>
      <MascotAvatar size={34} ring={false} />
      <p className="text-[12.5px] leading-snug font-semibold text-ink-soft pt-1">{text}</p>
    </div>
  );
}

/* ------------------------------- date stepper ------------------------------- */

export function DateStepper({
  label, onPrev, onNext, className = '',
}: { label: string; onPrev: () => void; onNext: () => void; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <button onClick={onPrev} aria-label="Previous day" className="tap w-6 h-6 flex items-center justify-center text-ink-soft">
        <ChevronLeft size={16} strokeWidth={3} />
      </button>
      <span className="text-[12.5px] font-extrabold text-ink min-w-[92px] text-center">{label}</span>
      <button onClick={onNext} aria-label="Next day" className="tap w-6 h-6 flex items-center justify-center text-ink-soft">
        <ChevronRight size={16} strokeWidth={3} />
      </button>
    </div>
  );
}

/* -------------------------------- bottom nav -------------------------------- */

const TABS: { id: ScreenId; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { id: 'insights', label: 'Insights', Icon: BarChart3 },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

export function BottomNav({ active }: { active: ScreenId }) {
  const tabTo = useStore((s) => s.tabTo);
  const setSheet = useStore((s) => s.setSheet);
  return (
    <nav className="absolute bottom-0 inset-x-0 z-30 pointer-events-none" aria-label="Main">
      <div className="relative mx-3 mb-3 bg-white/95 backdrop-blur rounded-[26px] shadow-card border border-blush-line pointer-events-auto">
        <div className="grid grid-cols-5 items-end px-1 pt-1.5 pb-2">
          {TABS.slice(0, 2).map((t) => (
            <NavBtn key={t.id} {...t} active={active === t.id} onClick={() => tabTo(t.id)} />
          ))}
          <div className="flex justify-center">
            <button
              onClick={() => setSheet(true)}
              aria-label="Quick add"
              className="tap -mt-7 w-[52px] h-[52px] rounded-full bg-grad-pink shadow-fab border-4 border-white text-white flex items-center justify-center"
            >
              <Plus size={26} strokeWidth={2.8} />
            </button>
          </div>
          {TABS.slice(2).map((t) => (
            <NavBtn key={t.id} {...t} active={active === t.id} onClick={() => tabTo(t.id)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function NavBtn({ label, Icon, active, onClick }: { label: string; Icon: typeof Home; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="tap flex flex-col items-center gap-[1px] py-0.5"
    >
      <Icon size={21} strokeWidth={active ? 2.6 : 2} className={active ? 'text-primary' : 'text-ink-faint'} />
      <span className={`text-[9.5px] font-extrabold ${active ? 'text-primary' : 'text-ink-faint'}`}>{label}</span>
      {active && <span className="w-1 h-1 rounded-full bg-primary" />}
    </button>
  );
}

/* ------------------------------ quick add sheet ----------------------------- */

export function QuickAddSheet() {
  const open = useStore((s) => s.sheetOpen);
  const setSheet = useStore((s) => s.setSheet);
  const go = useStore((s) => s.go);
  if (!open) return null;

  const items: { screen: ScreenId; label: string; desc: string; Icon: typeof Home; tint: string }[] = [
    { screen: 'log-period', label: 'Log Period', desc: 'Dates, flow & colour', Icon: Droplets, tint: '#F25B8A' },
    { screen: 'log-symptoms', label: 'Log Symptoms', desc: 'Mood & body check-in', Icon: Heart, tint: '#F78FB0' },
    { screen: 'body-tracker', label: 'Body Tracker', desc: 'Pain, stress & energy', Icon: Activity, tint: '#B9A7F2' },
    { screen: 'food-scanner', label: 'Scan Food', desc: 'Photo nutrition estimate', Icon: Camera, tint: '#FFB657' },
    { screen: 'add-medicine', label: 'Add Medicine', desc: 'Save a medicine', Icon: Pill, tint: '#4ECDC4' },
    { screen: 'ai', label: 'Ask Myflo AI', desc: 'Your health companion', Icon: Sparkles, tint: '#EE4D7B' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal aria-label="Quick add">
      <button className="absolute inset-0 bg-ink/30 backdrop-blur-[2px] animate-fade-in" aria-label="Close" onClick={() => setSheet(false)} />
      <div className="relative bg-white rounded-t-[28px] px-5 pt-3 pb-8 animate-sheet-up shadow-phone">
        <div className="w-10 h-1.5 rounded-full bg-blush-line mx-auto mb-4" />
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold">What would you like to log?</h2>
          <button onClick={() => setSheet(false)} aria-label="Close" className="tap w-8 h-8 rounded-full bg-primary-pale flex items-center justify-center text-ink-soft">
            <X size={16} strokeWidth={2.6} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {items.map(({ screen, label, desc, Icon, tint }) => (
            <button
              key={screen}
              onClick={() => go(screen)}
              className="tap flex items-center gap-2.5 rounded-2xl border border-blush-line bg-blush-bg/60 p-3 text-left"
            >
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: tint }}>
                <Icon size={18} strokeWidth={2.4} />
              </span>
              <span>
                <span className="block text-[12.5px] font-extrabold leading-tight">{label}</span>
                <span className="block text-[10px] font-semibold text-ink-mute leading-tight">{desc}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- toast ---------------------------------- */

export function ToastView() {
  const toast = useStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="absolute top-16 inset-x-0 z-[60] flex justify-center pointer-events-none px-8" role="status">
      <div className="animate-pop bg-ink text-white text-[12.5px] font-bold px-4 py-2.5 rounded-full shadow-phone flex items-center gap-2">
        <span className="text-primary-light">🌸</span> {toast}
      </div>
    </div>
  );
}

/* --------------------------------- misc ------------------------------------ */

export function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`text-[13.5px] font-extrabold text-ink ${className}`}>{children}</h3>;
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-[22px] shadow-card border border-blush-line/60 ${className}`}>{children}</div>;
}

export function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="text-4xl mb-2 animate-floaty inline-block">{emoji}</div>
      <p className="font-extrabold text-[14px]">{title}</p>
      <p className="text-[12px] font-semibold text-ink-mute mt-1">{desc}</p>
    </div>
  );
}

export function Dots({ total, active }: { total: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-[7px] rounded-full transition-all duration-300 ${i === active ? 'w-[18px] bg-primary' : 'w-[7px] bg-primary-soft'}`}
        />
      ))}
    </div>
  );
}
