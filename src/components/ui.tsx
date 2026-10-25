import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { Bell, CalendarDays, HeartPulse, Home, Leaf, MoreHorizontal, Sparkles } from 'lucide-react'

export type AppView = 'home' | 'calendar' | 'track' | 'insights' | 'more'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Flowra">
      <span className="brand__leaf" aria-hidden="true"><Leaf size={compact ? 22 : 29} strokeWidth={1.8} /></span>
      <span>
        <strong>Flowra</strong>
        {!compact && <small>Your cycle. Your health. Your story.</small>}
      </span>
    </div>
  )
}

export function Card({ children, className = '', labelledBy }: PropsWithChildren<{ className?: string; labelledBy?: string }>) {
  return <section className={`card ${className}`} aria-labelledby={labelledBy}>{children}</section>
}

export function Button({ children, className = '', variant = 'primary', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' }>) {
  return <button className={`button button--${variant} ${className}`} {...props}>{children}</button>
}

export function IconButton({ label, children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement> & { label: string }>) {
  return <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (value: boolean) => void; label: string; description?: string }) {
  return (
    <label className="toggle-row">
      <span><strong>{label}</strong>{description && <small>{description}</small>}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="toggle" aria-hidden="true"><span /></span>
    </label>
  )
}

export function Pill({ children, tone = 'rose' }: PropsWithChildren<{ tone?: 'rose' | 'sage' | 'lavender' | 'ivory' | 'warning' }>) {
  return <span className={`pill pill--${tone}`}>{children}</span>
}

export function ProgressBar({ value, max = 100, label, tone = 'rose' }: { value: number; max?: number; label?: string; tone?: 'rose' | 'sage' | 'lavender' | 'amber' }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="progress-wrap">
      {label && <div className="progress-label"><span>{label}</span><strong>{Math.round(percentage)}%</strong></div>}
      <div className="progress" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}>
        <span className={`progress__fill progress__fill--${tone}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return <div className="skeleton-group" aria-label="Loading content" aria-busy="true">{Array.from({ length: lines }, (_, index) => <span key={index} className="skeleton" />)}</div>
}

const navItems: { id: AppView; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'track', label: 'Track', icon: HeartPulse },
  { id: 'insights', label: 'Insights', icon: Sparkles },
  { id: 'more', label: 'More', icon: MoreHorizontal },
]

export function AppNavigation({ current, onNavigate }: { current: AppView; onNavigate: (view: AppView) => void }) {
  return (
    <>
      <nav className="desktop-nav" aria-label="Main navigation">
        <BrandMark />
        <div className="desktop-nav__links">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className={current === id ? 'is-active' : ''} onClick={() => onNavigate(id)}>
              <Icon size={19} strokeWidth={current === id ? 2.4 : 1.85} />{label}
            </button>
          ))}
        </div>
        <div className="desktop-nav__privacy"><Bell size={16} /> Private by default</div>
      </nav>
      <nav className="bottom-nav" aria-label="Main navigation">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} className={current === id ? 'is-active' : ''} onClick={() => onNavigate(id)} aria-current={current === id ? 'page' : undefined}>
            <span className={id === 'track' ? 'track-nav-icon' : ''}><Icon size={id === 'track' ? 22 : 21} strokeWidth={current === id ? 2.5 : 1.85} /></span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-state__icon">{icon}</span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function Notice({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'warning' | 'urgent' | 'success' }>) {
  return <div className={`notice notice--${tone}`} role={tone === 'urgent' ? 'alert' : undefined}>{children}</div>
}
