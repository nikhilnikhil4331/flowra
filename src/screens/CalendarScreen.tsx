import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Droplet, Edit3, NotebookPen, Plus, Sparkles, Trash2, Waves, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import type { AppData, CycleEntry, CyclePrediction } from '../domain/types'
import { dateIsEstimatedPeriod, dateIsFertile, dateIsRecordedPeriod, humanDate, todayKey, toDateKey } from '../domain/cycle'
import { Button, Notice, Pill } from '../components/ui'
import { Chibi } from '../components/MyfloArt'
import { createId, nowIso } from '../lib/store'

interface CalendarScreenProps {
  data: AppData
  prediction: CyclePrediction
  onSaveCycle: (cycle: CycleEntry) => void
  onDeleteCycle: (id: string) => void
  onNavigate: (view: 'home' | 'track' | 'insights' | 'more' | 'periodLog') => void
  onBack?: () => void
}

const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'UTC' })

function calendarDays(monthDate: Date): Date[] {
  const first = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1))
  first.setUTCDate(first.getUTCDate() - first.getUTCDay())
  return Array.from({ length: 42 }, (_, index) => { const date = new Date(first); date.setUTCDate(first.getUTCDate() + index); return date })
}

export function CalendarScreen({ data, prediction, onSaveCycle, onDeleteCycle, onNavigate, onBack }: CalendarScreenProps) {
  const today = todayKey()
  const [cursor, setCursor] = useState(() => { const date = new Date(`${today}T00:00:00Z`); return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)) })
  const [selected, setSelected] = useState(today)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CycleEntry | null>(null)
  const [formError, setFormError] = useState('')
  const days = useMemo(() => calendarDays(cursor), [cursor])
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(Date.UTC(2023, 0, 1 + index))).slice(0, 3))
  const currentMonth = cursor.getUTCMonth()
  const selectedLog = data.dailyLogs.find((entry) => entry.date === selected)
  const selectedCycle = data.cycles.find((entry) => selected >= entry.startDate && selected <= (entry.endDate ?? entry.startDate))

  const openEditCycle = (cycle: CycleEntry) => { setEditing(cycle); setFormError(''); setShowForm(true) }
  const previousMonth = () => setCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1)))
  const nextMonth = () => setCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1)))

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const startDate = String(values.get('startDate') ?? '')
    const endDate = String(values.get('endDate') ?? '') || undefined
    const notes = String(values.get('notes') ?? '').trim() || undefined
    if (!startDate) { setFormError('Please select when the period started.'); return }
    if (endDate && endDate < startDate) { setFormError('The end date cannot be before the start date.'); return }
    const stamp = nowIso()
    onSaveCycle({ id: editing?.id ?? createId('cycle'), startDate, endDate, notes, createdAt: editing?.createdAt ?? stamp, updatedAt: stamp })
    setShowForm(false)
  }

  return <div className="screen myflo-calendar-screen">
    <header className="myflo-page-header"><button className="myflo-back-button" onClick={onBack ?? (() => onNavigate('home'))} aria-label="Back to home"><ArrowLeft size={20} /></button><h1>Calendar</h1><button className="myflo-header-icon myflo-calendar-add" onClick={() => onNavigate('periodLog')} aria-label="Log a period"><Plus size={20} /></button></header>

    <section className="myflo-calendar-panel">
      <div className="myflo-calendar-month"><button onClick={previousMonth} aria-label="Previous month"><ChevronLeft size={19} /></button><strong>{monthFormatter.format(cursor)}</strong><button onClick={nextMonth} aria-label="Next month"><ChevronRight size={19} /></button></div>
      <div className="myflo-calendar-weekdays">{weekdays.map((day) => <span key={day}>{day}</span>)}</div>
      <div className="myflo-calendar-grid" role="grid" aria-label={monthFormatter.format(cursor)}>
        {days.map((date) => {
          const key = toDateKey(date)
          const outside = date.getUTCMonth() !== currentMonth
          const actual = dateIsRecordedPeriod(key, data.cycles)
          const estimated = !actual && dateIsEstimatedPeriod(key, prediction)
          const fertile = !actual && !estimated && dateIsFertile(key, prediction)
          const ovulation = key === prediction.ovulationDate
          const isToday = key === today
          const hasLog = data.dailyLogs.some((entry) => entry.date === key)
          return <button key={key} role="gridcell" onClick={() => setSelected(key)} aria-selected={key === selected} className={`myflo-calendar-day ${outside ? 'is-outside' : ''} ${actual ? 'is-period' : ''} ${estimated ? 'is-estimated' : ''} ${fertile ? 'is-fertile' : ''} ${ovulation ? 'is-ovulation' : ''} ${isToday ? 'is-today' : ''} ${key === selected ? 'is-selected' : ''}`}><span>{date.getUTCDate()}</span>{hasLog && <i />}</button>
        })}
      </div>
    </section>

    <div className="myflo-calendar-legend"><span><i className="legend-period" />Period</span><span><i className="legend-fertile" />Fertile window</span><span><i className="legend-ovulation" />Ovulation</span><span><i className="legend-today" />Today</span></div>

    <section className="myflo-calendar-events"><h2>Cycle Events</h2><div><button className="myflo-event-card myflo-event-card--lavender" onClick={() => onNavigate('periodLog')}><Droplet size={23} fill="currentColor" /><span>Periods</span></button><button className="myflo-event-card myflo-event-card--peach" onClick={() => onNavigate('track')}><Waves size={23} /><span>Mucus</span></button><button className="myflo-event-card myflo-event-card--blush" onClick={() => prediction.ovulationDate && setSelected(prediction.ovulationDate)}><Sparkles size={23} /><span>Ovulation</span></button><button className="myflo-event-card myflo-event-card--blue" onClick={() => onNavigate('track')}><Chibi mood="calm" size="xs" /><span>Symptoms</span></button></div></section>

    <section className="myflo-calendar-note"><div className="myflo-section-title"><h2>Notes</h2><button onClick={() => onNavigate('track')}><Plus size={15} /> Add</button></div>{selectedCycle ? <button className="myflo-selected-note" onClick={() => openEditCycle(selectedCycle)}><span><Droplet size={17} fill="currentColor" /></span><div><strong>Recorded period</strong><small>{humanDate(selectedCycle.startDate)}{selectedCycle.endDate ? ` – ${humanDate(selectedCycle.endDate)}` : ''}{selectedCycle.notes ? ` · ${selectedCycle.notes}` : ''}</small></div><Edit3 size={16} /></button> : selectedLog?.notes ? <button className="myflo-selected-note" onClick={() => onNavigate('track')}><span className="is-note"><NotebookPen size={16} /></span><div><strong>{selectedLog.notes}</strong><small>{humanDate(selected, { weekday: 'short', day: 'numeric', month: 'short' })} · daily reflection</small></div><Edit3 size={16} /></button> : <button className="myflo-empty-note" onClick={() => onNavigate('track')}><NotebookPen size={17} /><span>Add a private note for {humanDate(selected, { day: 'numeric', month: 'short' })}</span><ChevronRight size={16} /></button>}</section>

    <section className="myflo-calendar-estimate"><span><CalendarDays size={19} /></span><div><small>Cycle prediction</small><strong>{prediction.nextPeriodStart ? `Next estimate: ${humanDate(prediction.nextPeriodStart)}` : 'More history will personalise estimates'}</strong><em>{prediction.nextPeriodStart ? `${prediction.confidence} confidence · predictions are not guarantees` : 'Add two recorded starts to begin'}</em></div><CircleHelp size={16} /></section>

    {showForm && <div className="modal-backdrop" role="presentation"><section className="modal myflo-modal" role="dialog" aria-modal="true" aria-labelledby="period-form-title"><div className="modal__header"><div><p>Period record</p><h2 id="period-form-title">{editing ? 'Edit period' : 'Log period'}</h2></div><button className="small-icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={19} /></button></div><form onSubmit={handleSave} className="stack-form"><div className="field-grid"><label className="field"><span>Start date</span><input name="startDate" type="date" required defaultValue={editing?.startDate ?? selected} max={today} /></label><label className="field"><span>End date <em>Optional</em></span><input name="endDate" type="date" defaultValue={editing?.endDate ?? ''} max={today} /></label></div><label className="field"><span>Note <em>Optional</em></span><textarea name="notes" maxLength={280} rows={3} placeholder="Anything you would like to remember" defaultValue={editing?.notes ?? ''} /></label>{formError && <Notice tone="warning">{formError}</Notice>}<Notice tone="info">Recorded dates stay separate from future estimates.</Notice><div className="form-actions">{editing && <Button type="button" variant="danger" onClick={() => { onDeleteCycle(editing.id); setShowForm(false) }}><Trash2 size={16} /> Delete</Button>}<span className="form-actions__spacer" /><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save period</Button></div></form></section></div>}
  </div>
}
