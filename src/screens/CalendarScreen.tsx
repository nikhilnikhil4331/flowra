import { CalendarDays, ChevronLeft, ChevronRight, CircleHelp, Droplet, Edit3, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { AppData, CycleEntry, CyclePrediction } from '../domain/types'
import { addDays, dateIsEstimatedPeriod, dateIsFertile, dateIsRecordedPeriod, humanDate, todayKey, toDateKey } from '../domain/cycle'
import { Button, Card, EmptyState, Notice, Pill } from '../components/ui'
import { createId, nowIso } from '../lib/store'

interface CalendarScreenProps {
  data: AppData
  prediction: CyclePrediction
  onSaveCycle: (cycle: CycleEntry) => void
  onDeleteCycle: (id: string) => void
  onNavigate: (view: 'track' | 'insights') => void
}

const monthFormatter = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const weekdayFormatter = new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'UTC' })

function startOfCalendar(monthDate: Date): Date {
  const first = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), 1))
  first.setUTCDate(first.getUTCDate() - first.getUTCDay())
  return first
}

function calendarDays(monthDate: Date): Date[] {
  const start = startOfCalendar(monthDate)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    return date
  })
}

export function CalendarScreen({ data, prediction, onSaveCycle, onDeleteCycle, onNavigate }: CalendarScreenProps) {
  const today = todayKey()
  const [cursor, setCursor] = useState(() => {
    const date = new Date(`${today}T00:00:00Z`)
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
  })
  const [selected, setSelected] = useState(today)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CycleEntry | null>(null)
  const [formError, setFormError] = useState('')

  const days = useMemo(() => calendarDays(cursor), [cursor])
  const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(Date.UTC(2023, 0, 1 + index))))
  const selectedLog = data.dailyLogs.find((entry) => entry.date === selected)
  const selectedCycle = data.cycles.find((entry) => selected >= entry.startDate && selected <= (entry.endDate ?? entry.startDate))
  const currentMonth = cursor.getUTCMonth()

  const openNewCycle = () => { setEditing(null); setFormError(''); setShowForm(true) }
  const openEditCycle = (cycle: CycleEntry) => { setEditing(cycle); setFormError(''); setShowForm(true) }

  const handleCycleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const startDate = String(formData.get('startDate') ?? '')
    const endDate = String(formData.get('endDate') ?? '') || undefined
    const notes = String(formData.get('notes') ?? '').trim() || undefined
    if (!startDate) { setFormError('Please enter a period start date.'); return }
    if (endDate && endDate < startDate) { setFormError('The end date cannot be before the start date.'); return }
    const stamp = nowIso()
    onSaveCycle({ id: editing?.id ?? createId('cycle'), startDate, endDate, notes, createdAt: editing?.createdAt ?? stamp, updatedAt: stamp })
    setShowForm(false)
  }

  return (
    <div className="screen screen--calendar">
      <header className="screen-header"><div><p className="eyebrow">Your record, at a glance</p><h1>Cycle calendar</h1><p className="subtitle">Recorded dates stay distinct from estimates. Predictions are never guarantees.</p></div><Button onClick={openNewCycle}><Plus size={18} /> Log period</Button></header>

      <Card className="calendar-card">
        <div className="calendar-toolbar"><Button variant="icon" onClick={() => setCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() - 1, 1)))} aria-label="Previous month"><ChevronLeft size={20} /></Button><h2>{monthFormatter.format(cursor)}</h2><Button variant="icon" onClick={() => setCursor((current) => new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + 1, 1)))} aria-label="Next month"><ChevronRight size={20} /></Button></div>
        <div className="calendar-weekdays">{weekdays.map((day) => <span key={day}>{day.slice(0, 3)}</span>)}</div>
        <div className="calendar-grid" role="grid" aria-label={monthFormatter.format(cursor)}>
          {days.map((date) => {
            const key = toDateKey(date)
            const outside = date.getUTCMonth() !== currentMonth
            const recorded = dateIsRecordedPeriod(key, data.cycles)
            const estimated = !recorded && dateIsEstimatedPeriod(key, prediction)
            const fertile = !recorded && !estimated && dateIsFertile(key, prediction)
            const isOvulation = key === prediction.ovulationDate
            const hasLog = data.dailyLogs.some((entry) => entry.date === key)
            const selectedDate = key === selected
            return <button key={key} role="gridcell" aria-label={key} aria-selected={selectedDate} onClick={() => setSelected(key)} className={`calendar-day ${outside ? 'is-outside' : ''} ${recorded ? 'is-recorded-period' : ''} ${estimated ? 'is-estimated-period' : ''} ${fertile ? 'is-fertile' : ''} ${isOvulation ? 'is-ovulation' : ''} ${key === today ? 'is-today' : ''} ${selectedDate ? 'is-selected' : ''}`}><span>{date.getUTCDate()}</span>{hasLog && <i className="calendar-note-dot" aria-label="Daily log available" />}</button>
          })}
        </div>
        <div className="calendar-legend"><span><i className="legend-dot legend-dot--recorded" />Recorded period</span><span><i className="legend-dot legend-dot--estimated" />Estimated period</span><span><i className="legend-dot legend-dot--fertile" />Fertile window</span><span><i className="legend-dot legend-dot--ovulation" />Estimated ovulation</span><span><i className="legend-dot legend-dot--note" />Daily log</span></div>
      </Card>

      <div className="calendar-detail-grid">
        <Card className="date-detail-card">
          <div className="card-title-row"><div><p className="eyebrow">Selected day</p><h2>{humanDate(selected, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</h2></div><CalendarDays size={23} /></div>
          {selectedCycle ? <div className="selected-period"><span className="metric-icon metric-icon--rose"><Droplet size={18} /></span><div><strong>Recorded period</strong><small>{humanDate(selectedCycle.startDate)}{selectedCycle.endDate && selectedCycle.endDate !== selectedCycle.startDate ? ` – ${humanDate(selectedCycle.endDate)}` : ''}</small>{selectedCycle.notes && <p>{selectedCycle.notes}</p>}</div><button className="small-icon-button" aria-label="Edit period" onClick={() => openEditCycle(selectedCycle)}><Edit3 size={16} /></button></div> : selectedLog ? <div className="selected-period"><span className="metric-icon metric-icon--lavender"><Sparkles size={18} /></span><div><strong>Daily check-in saved</strong><small>Pain {selectedLog.painScore}/10 · {selectedLog.bleeding} bleeding · stress {selectedLog.stressScore}/10</small>{selectedLog.notes && <p>{selectedLog.notes}</p>}</div></div> : <EmptyState icon={<Sparkles size={24} />} title="Nothing logged for this date" description="You can add a daily check-in or record a period date whenever it is helpful." action={<Button variant="secondary" onClick={() => onNavigate('track')}>Log this day</Button>} />}
        </Card>

        <Card className="prediction-card">
          <div className="card-title-row"><div><p className="eyebrow">Cycle estimate</p><h2>What the record suggests</h2></div><CircleHelp size={18} aria-label="Predictions are estimates" /></div>
          {prediction.nextPeriodStart ? <><div className="prediction-date"><span>Next estimated period</span><strong>{humanDate(prediction.nextPeriodStart)} – {humanDate(prediction.nextPeriodEnd)}</strong><Pill tone={prediction.confidence === 'higher' ? 'sage' : prediction.confidence === 'moderate' ? 'lavender' : 'warning'}>{prediction.confidence} confidence</Pill></div><dl className="prediction-stats"><div><dt>Average cycle</dt><dd>{prediction.averageCycleLength} days</dd></div><div><dt>Average period</dt><dd>{prediction.averagePeriodLength} days</dd></div><div><dt>Estimated fertile days</dt><dd>{humanDate(prediction.fertileStart)} – {humanDate(prediction.fertileEnd)}</dd></div></dl><p className="fine-print">Based on {prediction.basis} recorded interval{prediction.basis === 1 ? '' : 's'}{prediction.variabilityDays !== undefined ? ` with ${prediction.variabilityDays}-day variation` : ''}. Ovulation and fertile dates are estimates, not contraception or a guarantee of fertility.</p></> : <><EmptyState icon={<CalendarDays size={25} />} title="More history needed" description="Log at least two period starts for a personal cycle-length estimate. Irregular cycles may remain less predictable." action={<Button variant="secondary" onClick={openNewCycle}>Add period date</Button>} /><p className="fine-print">Flowra does not assume a 28-day cycle.</p></>}
        </Card>
      </div>

      <Card className="history-card"><div className="section-heading"><div><p className="eyebrow">History</p><h2>Recorded periods</h2></div><Pill tone={data.profile.cycleIsIrregular ? 'lavender' : 'ivory'}>{data.profile.cycleIsIrregular ? 'Irregular cycle noted' : 'Cycle pattern not marked irregular'}</Pill></div>{data.cycles.length ? <div className="cycle-history-list">{[...data.cycles].sort((a, b) => b.startDate.localeCompare(a.startDate)).map((cycle) => <div key={cycle.id} className="cycle-history-row"><span className="metric-icon metric-icon--rose"><Droplet size={17} /></span><div><strong>{humanDate(cycle.startDate, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</strong><small>{cycle.endDate ? `${Math.max(1, Math.round((new Date(`${cycle.endDate}T00:00:00Z`).getTime() - new Date(`${cycle.startDate}T00:00:00Z`).getTime()) / 86_400_000) + 1)} days recorded` : 'End date not recorded'}{cycle.notes ? ` · ${cycle.notes}` : ''}</small></div><button className="small-icon-button" aria-label="Edit period entry" onClick={() => openEditCycle(cycle)}><Edit3 size={16} /></button></div>)}</div> : <EmptyState icon={<Droplet size={24} />} title="No periods recorded yet" description="Log start and end dates whenever you want. You can correct or delete them later." action={<Button onClick={openNewCycle}><Plus size={17} /> Log first period</Button>} />}</Card>

      {showForm && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="period-form-title"><div className="modal__header"><div><p className="eyebrow">Period entry</p><h2 id="period-form-title">{editing ? 'Edit recorded period' : 'Log a period'}</h2></div><button className="small-icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={19} /></button></div><form onSubmit={handleCycleSave} className="stack-form"><div className="field-grid"><label className="field"><span>Start date</span><input name="startDate" type="date" required defaultValue={editing?.startDate ?? selected} max={today} /></label><label className="field"><span>End date <em>Optional</em></span><input name="endDate" type="date" defaultValue={editing?.endDate ?? ''} max={today} /></label></div><label className="field"><span>Notes <em>Optional</em></span><textarea name="notes" maxLength={280} rows={3} placeholder="Anything you want to remember" defaultValue={editing?.notes ?? ''} /></label>{formError && <Notice tone="warning">{formError}</Notice>}<Notice tone="info">Only dates you record are shown as actual periods. Future dates remain clearly labeled as estimates.</Notice><div className="form-actions">{editing && <Button type="button" variant="danger" onClick={() => { onDeleteCycle(editing.id); setShowForm(false) }}><Trash2 size={16} /> Delete</Button>}<span className="form-actions__spacer" /><Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button><Button type="submit">Save period</Button></div></form></section></div>}
    </div>
  )
}
