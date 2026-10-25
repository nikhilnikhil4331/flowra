import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react'
import { CalendarDays, ChartNoAxesCombined, Droplet, Home, Menu, NotebookPen, Pill as PillIcon, Plus, ScanLine, Stethoscope, X } from 'lucide-react'

export type PrimaryView = 'home' | 'calendar' | 'track' | 'insights' | 'more'
export type AppView = PrimaryView | 'periodLog' | 'bodyTracker' | 'foodScanner' | 'nutritionResult' | 'dailyNutrition' | 'flowColor' | 'flowGuide' | 'medicineCare' | 'addMedicine'
export type QuickAction = 'period' | 'symptoms' | 'food' | 'medicine' | 'note'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`} aria-label="Myflo">
      <span className="brand__mark" aria-hidden="true">✦</span>
      <span><strong>myflo</strong>{!compact && <small>your gentle daily companion</small>}</span>
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
      <span>{label && <strong>{label}</strong>}{description && <small>{description}</small>}</span>
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
  return <div className="progress-wrap">{label && <div className="progress-label"><span>{label}</span><strong>{Math.round(percentage)}%</strong></div>}<div className="progress" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}><span className={`progress__fill progress__fill--${tone}`} style={{ width: `${percentage}%` }} /></div></div>
}

export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return <div className="skeleton-group" aria-label="Loading content" aria-busy="true">{Array.from({ length: lines }, (_, index) => <span key={index} className="skeleton" />)}</div>
}

const navItems: { id: Exclude<PrimaryView, 'track'>; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'insights', label: 'Insights', icon: ChartNoAxesCombined },
  { id: 'more', label: 'More', icon: Menu },
]

export function AppNavigation({ current, onNavigate, onQuickAction }: { current: AppView; onNavigate: (view: AppView) => void; onQuickAction: () => void }) {
  const section: PrimaryView = current === 'periodLog' ? 'calendar' : current === 'bodyTracker' ? 'track' : ['foodScanner', 'nutritionResult', 'dailyNutrition'].includes(current) ? 'insights' : ['flowColor', 'flowGuide', 'medicineCare', 'addMedicine'].includes(current) ? 'more' : current as PrimaryView
  return <nav className="bottom-nav myflo-bottom-nav" aria-label="Main navigation">
    {navItems.slice(0, 2).map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'is-active' : ''} onClick={() => onNavigate(id)} aria-current={section === id ? 'page' : undefined}><span><Icon size={20} strokeWidth={section === id ? 2.45 : 1.8} /></span><small>{label}</small></button>)}
    <button className={`quick-add ${section === 'track' ? 'is-active' : ''}`} onClick={onQuickAction} aria-label="Open quick actions" aria-haspopup="dialog"><span><Plus size={28} strokeWidth={2.2} /></span></button>
    {navItems.slice(2).map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'is-active' : ''} onClick={() => onNavigate(id)} aria-current={section === id ? 'page' : undefined}><span><Icon size={20} strokeWidth={section === id ? 2.45 : 1.8} /></span><small>{label}</small></button>)}
  </nav>
}

const actions: { id: QuickAction; label: string; description: string; icon: typeof Droplet; tone: string }[] = [
  { id: 'period', label: 'Log period', description: 'Start or update a period', icon: Droplet, tone: 'pink' },
  { id: 'symptoms', label: 'Log symptoms', description: 'Mood, pain & body scores', icon: Stethoscope, tone: 'peach' },
  { id: 'food', label: 'Scan food', description: 'Save an editable meal', icon: ScanLine, tone: 'blue' },
  { id: 'medicine', label: 'Add medicine', description: 'Record existing medication', icon: PillIcon, tone: 'lavender' },
  { id: 'note', label: 'Add a note', description: 'Private daily reflection', icon: NotebookPen, tone: 'sage' },
]

export function QuickActionSheet({ onClose, onSelect }: { onClose: () => void; onSelect: (action: QuickAction) => void }) {
  return <div className="quick-sheet-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="quick-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-actions-title"><div className="quick-sheet__handle" /><div className="quick-sheet__header"><div><p>Quick actions</p><h2 id="quick-actions-title">How would you like to check in?</h2></div><button className="small-icon-button" onClick={onClose} aria-label="Close quick actions"><X size={18} /></button></div><div className="quick-sheet__items">{actions.map(({ id, label, description, icon: Icon, tone }) => <button key={id} onClick={() => onSelect(id)} className={`quick-sheet__item quick-sheet__item--${tone}`}><span><Icon size={19} /></span><div><strong>{label}</strong><small>{description}</small></div></button>)}</div></section></div>
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><span className="empty-state__icon">{icon}</span><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function Notice({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'warning' | 'urgent' | 'success' }>) {
  return <div className={`notice notice--${tone}`} role={tone === 'urgent' ? 'alert' : undefined}>{children}</div>
}
