import { AlertTriangle, ArrowLeft, BatteryMedium, Brain, Check, ChevronRight, CircleHelp, Droplet, HeartPulse, Lightbulb, Moon, NotebookPen, Smile, Sparkles, Thermometer, Trash2, Waves } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type { DailyLog, Mood, PainLocation, Symptom } from '../domain/types'
import { todayKey } from '../domain/cycle'
import { buildDailySummary, evaluateSafety } from '../domain/safety'
import { Button, Card, Notice, Toggle } from '../components/ui'
import { Chibi } from '../components/MyfloArt'
import { createId, nowIso } from '../lib/store'

interface TrackScreenProps {
  logs: DailyLog[]
  onSave: (log: DailyLog) => void
  onDelete: (id: string) => void
  onOpenFlowGuide: () => void
  onOpenBodyTracker: () => void
  onBack: () => void
}

type FormState = Omit<DailyLog, 'id' | 'createdAt' | 'updatedAt'>

function blankLog(date: string): FormState {
  return {
    date,
    painScore: 0,
    painLocations: [],
    painDuration: '',
    painWorsening: false,
    painInterferes: false,
    medicationTaken: '',
    medicationHelped: 'unsure',
    bleeding: 'none',
    flowColor: undefined,
    flowConsistency: '',
    productsChanged: 'not_applicable',
    fullySoaked: false,
    leakage: false,
    largeClots: false,
    possiblePregnancy: false,
    fainting: false,
    fever: false,
    shortnessBreath: false,
    bloatingScore: 0,
    stressScore: 0,
    energyScore: 5,
    mood: undefined,
    symptoms: [],
    sleepHours: undefined,
    sleepQuality: undefined,
    waterMl: undefined,
    notes: '',
  }
}

function fromLog(log: DailyLog | undefined, date: string): FormState {
  if (!log) return blankLog(date)
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...rest } = log
  return rest
}

const moods: { id: Mood; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'happy', label: 'Happy' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'irritable', label: 'Good' },
  { id: 'sleepy', label: 'Sleepy' },
]

const symptoms: { id: Symptom; label: string; icon: string }[] = [
  { id: 'cramps', label: 'Cramps', icon: 'ϟ' },
  { id: 'headache', label: 'Headache', icon: '◒' },
  { id: 'bloating', label: 'Bloating', icon: '◡' },
  { id: 'acne', label: 'Acne', icon: '·' },
  { id: 'fatigue', label: 'Fatigue', icon: '▱' },
  { id: 'back_pain', label: 'Back pain', icon: '↕' },
  { id: 'nausea', label: 'Nausea', icon: '⌇' },
  { id: 'food_cravings', label: 'Food cravings', icon: '◐' },
]

const painLocations: { id: PainLocation; label: string }[] = [
  { id: 'lower_abdomen', label: 'Lower abdomen' },
  { id: 'back', label: 'Back' },
  { id: 'head', label: 'Head' },
  { id: 'pelvis', label: 'Pelvis' },
  { id: 'other', label: 'Other' },
]

function ScoreSlider({ label, helper, value, onChange, lowLabel, highLabel, icon }: { label: string; helper: string; value: number; onChange: (value: number) => void; lowLabel: string; highLabel: string; icon: ReactNode }) {
  const id = `score-${label.toLowerCase().replace(/\s/g, '-')}`
  return <div className="score-slider"><div className="score-slider__header"><div><span className="score-slider__icon">{icon}</span><div><h3>{label}</h3><p>{helper}</p></div></div><strong>{value}<small>/10</small></strong></div><input id={id} type="range" min="0" max="10" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label={`${label}: ${value} out of 10`} style={{ '--range-progress': `${value * 10}%` } as CSSProperties} /><div className="slider-labels"><span>{lowLabel}</span><span>{highLabel}</span></div></div>
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={`choice-chip ${active ? 'is-selected' : ''}`} aria-pressed={active} onClick={onClick}>{active && <Check size={14} />}{children}</button>
}

export function TrackScreen({ logs, onSave, onDelete, onOpenFlowGuide, onOpenBodyTracker, onBack }: TrackScreenProps) {
  const today = todayKey()
  const [date, setDate] = useState(today)
  const [form, setForm] = useState<FormState>(() => fromLog(logs.find((entry) => entry.date === today), today))
  const [saved, setSaved] = useState(false)
  const existing = logs.find((entry) => entry.date === date)

  useEffect(() => {
    setForm(fromLog(logs.find((entry) => entry.date === date), date))
    setSaved(false)
  }, [date, logs])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))
  const safetyAlerts = useMemo(() => evaluateSafety(form), [form])
  const selectedSymptoms = (symptom: Symptom) => update('symptoms', form.symptoms.includes(symptom) ? form.symptoms.filter((entry) => entry !== symptom) : [...form.symptoms, symptom])
  const selectedLocation = (location: PainLocation) => update('painLocations', form.painLocations.includes(location) ? form.painLocations.filter((entry) => entry !== location) : [...form.painLocations, location])
  const hasBleeding = form.bleeding !== 'none'

  const save = () => {
    const stamp = nowIso()
    onSave({ ...form, id: existing?.id ?? createId('log'), date, createdAt: existing?.createdAt ?? stamp, updatedAt: stamp })
    setSaved(true)
    window.setTimeout(() => setSaved(false), 5000)
  }

  return <div className="screen screen--track myflo-track-screen">
    <header className="myflo-page-header myflo-track-header"><button className="myflo-back-button" onClick={onBack} aria-label="Back to home"><ArrowLeft size={20} /></button><h1>Log Symptoms</h1><button className="myflo-save-circle" onClick={save} aria-label="Save daily log"><Check size={21} /></button></header>
    <p className="myflo-track-prompt">How are you feeling today?</p>

    <Card className="date-switcher myflo-date-switcher"><button type="button" aria-label="Previous day" onClick={() => { const current = new Date(`${date}T00:00:00Z`); current.setUTCDate(current.getUTCDate() - 1); setDate(current.toISOString().slice(0, 10)) }}><ChevronRight size={20} className="flip-horizontal" /></button><label><span>Check-in date</span><input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} /></label><button type="button" aria-label="Next day" disabled={date >= today} onClick={() => { const current = new Date(`${date}T00:00:00Z`); current.setUTCDate(current.getUTCDate() + 1); setDate(current.toISOString().slice(0, 10)) }}><ChevronRight size={20} /></button></Card>

    {safetyAlerts.map((alert) => <Notice key={alert.id} tone={alert.severity === 'urgent' ? 'urgent' : alert.severity === 'soon' ? 'warning' : 'info'}><div className="safety-notice"><AlertTriangle size={20} /><div><strong>{alert.title}</strong><span>{alert.message}</span><small>{alert.action}</small></div></div></Notice>)}

    <Card className="mood-card">
      <div className="card-title-row"><div><h2>Mood</h2><p>Choose the closest fit.</p></div><Smile size={22} /></div>
      <div className="mood-options" role="group" aria-label="Mood">
        {moods.map((mood) => <button type="button" key={mood.id} onClick={() => update('mood', form.mood === mood.id ? undefined : mood.id)} aria-pressed={form.mood === mood.id} className={`mood-option ${form.mood === mood.id ? 'is-selected' : ''}`}><Chibi mood={mood.id} size="xs" />{mood.label}</button>)}
      </div>
    </Card>

    <Card className="symptoms-card"><div className="card-title-row"><div><h2>Physical Symptoms</h2><p>Select all that apply.</p></div><Sparkles size={21} /></div><div className="symptom-grid">{symptoms.map((symptom) => <button type="button" key={symptom.id} onClick={() => selectedSymptoms(symptom.id)} aria-pressed={form.symptoms.includes(symptom.id)} className={`symptom-option ${form.symptoms.includes(symptom.id) ? 'is-selected' : ''}`}><Chibi mood={symptom.id === 'cramps' ? 'anxious' : 'calm'} size="xs" />{symptom.label}</button>)}</div></Card>
    <Card className="myflo-flow-score-card"><ScoreSlider label="Flow Score" helper="Luteal symptoms" value={form.painScore} onChange={(value) => update('painScore', value)} lowLabel="0" highLabel="10" icon={<Droplet size={19} fill="currentColor" />} /></Card>

    <div className="track-grid">
      <Card className="pain-card">
        <ScoreSlider label="Pain" helper="0 = no pain · 7–10 = severe" value={form.painScore} onChange={(value) => update('painScore', value)} lowLabel="No pain" highLabel="Severe" icon={<HeartPulse size={20} />} />
        <div className="mini-field"><strong>Where do you feel it? <em>Optional</em></strong><div className="chip-row">{painLocations.map((location) => <ToggleChip key={location.id} active={form.painLocations.includes(location.id)} onClick={() => selectedLocation(location.id)}>{location.label}</ToggleChip>)}</div></div>
        {form.painScore > 0 && <div className="field-grid field-grid--compact"><label className="field"><span>Duration <em>Optional</em></span><select value={form.painDuration} onChange={(event) => update('painDuration', event.target.value)}><option value="">Not recorded</option><option value="under_1_hour">Under 1 hour</option><option value="1_to_4_hours">1–4 hours</option><option value="most_of_day">Most of the day</option><option value="more_than_day">More than a day</option></select></label><label className="field"><span>Medication taken <em>Optional</em></span><input value={form.medicationTaken} onChange={(event) => update('medicationTaken', event.target.value)} maxLength={80} placeholder="Name only" /></label></div>}
        <div className="check-row"><Toggle checked={form.painWorsening} onChange={(value) => update('painWorsening', value)} label="Pain is getting worse" /><Toggle checked={form.painInterferes} onChange={(value) => update('painInterferes', value)} label="It interferes with daily activities" /></div>
      </Card>

      <Card className="bleeding-card">
        <div className="card-title-row"><div><h2>Bleeding & flow</h2><p>Use your own practical experience—not exact blood-loss estimates.</p></div><Droplet size={22} /></div>
        <div className="bleeding-options" role="group" aria-label="Bleeding level">{(['none', 'spotting', 'light', 'moderate', 'heavy'] as const).map((level) => <button type="button" key={level} onClick={() => update('bleeding', level)} aria-pressed={form.bleeding === level} className={`bleeding-option bleeding-option--${level} ${form.bleeding === level ? 'is-selected' : ''}`}><span><Droplet size={level === 'heavy' ? 24 : 19} fill={level === 'none' ? 'transparent' : 'currentColor'} /></span>{level === 'none' ? 'None' : level[0].toUpperCase() + level.slice(1)}</button>)}</div>
        {hasBleeding && <><div className="mini-field"><div className="mini-field__heading"><strong>Flow colour <em>Optional</em></strong><button type="button" className="text-button" onClick={onOpenFlowGuide}>Flow Guide <ChevronRight size={15} /></button></div><div className="chip-row flow-color-chips">{([['bright_red', 'Bright red'], ['dark_red', 'Dark red'], ['brown', 'Brown'], ['pink', 'Pink'], ['orange_unusual', 'Orange / unusual'], ['other_unsure', 'Other / unsure']] as const).map(([color, label]) => <ToggleChip key={color} active={form.flowColor === color} onClick={() => update('flowColor', form.flowColor === color ? undefined : color)}><i className={`flow-dot flow-dot--${color}`} />{label}</ToggleChip>)}</div></div><label className="field"><span>Consistency or anything notable <em>Optional</em></span><input value={form.flowConsistency} onChange={(event) => update('flowConsistency', event.target.value)} maxLength={140} placeholder="For example: watery, clots, different from usual" /></label><details className="practical-questions"><summary>Practical bleeding questions <CircleHelp size={16} /></summary><p>These details help the safety check understand your experience. They do not calculate exact blood loss.</p><label className="field"><span>How often are products needing to be changed?</span><select value={form.productsChanged} onChange={(event) => update('productsChanged', event.target.value as FormState['productsChanged'])}><option value="not_applicable">Not sure / not applicable</option><option value="less_than_2h">Less than every 2 hours</option><option value="2_to_4h">Every 2–4 hours</option><option value="4_to_8h">Every 4–8 hours</option><option value="more_than_8h">Less often than every 8 hours</option></select></label><div className="check-row"><Toggle checked={form.fullySoaked} onChange={(value) => update('fullySoaked', value)} label="Products are fully soaked" /><Toggle checked={form.leakage} onChange={(value) => update('leakage', value)} label="Leakage is happening" /><Toggle checked={form.largeClots} onChange={(value) => update('largeClots', value)} label="Unusually large clots" /></div></details></>}
      </Card>
    </div>

        <div className="scores-grid">
      <Card><ScoreSlider label="Bloating" helper="Fullness, gas, or discomfort" value={form.bloatingScore} onChange={(value) => update('bloatingScore', value)} lowLabel="None" highLabel="Very uncomfortable" icon={<Waves size={20} />} /></Card>
      <Card><ScoreSlider label="Stress" helper="0 = very relaxed · 10 = extremely stressed" value={form.stressScore} onChange={(value) => update('stressScore', value)} lowLabel="Relaxed" highLabel="Extremely stressed" icon={<Brain size={20} />} /></Card>
      <Card><ScoreSlider label="Energy" helper="How energetic do you feel?" value={form.energyScore} onChange={(value) => update('energyScore', value)} lowLabel="Low energy" highLabel="Very energetic" icon={<BatteryMedium size={20} />} /></Card>
    </div>

    <div className="track-grid">
      <Card className="rest-card"><div className="card-title-row"><div><h2>Sleep & water</h2><p>Optional context for your own trends.</p></div><Moon size={21} /></div><div className="field-grid"><label className="field"><span>Sleep hours</span><input type="number" inputMode="decimal" min="0" max="24" step="0.5" value={form.sleepHours ?? ''} onChange={(event) => update('sleepHours', event.target.value === '' ? undefined : Number(event.target.value))} placeholder="e.g. 7.5" /></label><label className="field"><span>Sleep quality <em>0–10</em></span><input type="number" inputMode="numeric" min="0" max="10" value={form.sleepQuality ?? ''} onChange={(event) => update('sleepQuality', event.target.value === '' ? undefined : Number(event.target.value))} placeholder="e.g. 6" /></label><label className="field"><span>Water <em>ml</em></span><input type="number" inputMode="numeric" min="0" max="10000" step="50" value={form.waterMl ?? ''} onChange={(event) => update('waterMl', event.target.value === '' ? undefined : Number(event.target.value))} placeholder="e.g. 1500" /></label></div></Card>
      <Card className="context-card"><div className="card-title-row"><div><h2>Important context</h2><p>Only share what feels relevant. It helps surface safety guidance.</p></div><Thermometer size={21} /></div><div className="check-row"><Toggle checked={form.possiblePregnancy} onChange={(value) => update('possiblePregnancy', value)} label="Pregnancy is possible" /><Toggle checked={form.fainting} onChange={(value) => update('fainting', value)} label="Fainting or near-fainting" /><Toggle checked={form.fever} onChange={(value) => update('fever', value)} label="Fever" /><Toggle checked={form.shortnessBreath} onChange={(value) => update('shortnessBreath', value)} label="Difficulty breathing" /></div><Notice tone="info">This is a safety check, not a diagnosis. If you feel seriously unwell, seek medical assessment rather than waiting for an app response.</Notice></Card>
    </div>

    <Card className="notes-card"><div className="card-title-row"><div><h2>Anything else to remember?</h2><p>Optional private note · up to 500 characters</p></div><NotebookPen size={21} /></div><textarea value={form.notes} onChange={(event) => update('notes', event.target.value.slice(0, 500))} rows={4} maxLength={500} placeholder="How has today felt? What seemed to help?" /><span className="character-count">{form.notes?.length ?? 0}/500</span></Card>

    <Card className="save-log-card"><div><span className="metric-icon metric-icon--rose"><Lightbulb size={20} /></span><div><h2>Your daily summary</h2><p>{buildDailySummary(form, logs.filter((entry) => entry.date !== date))}</p></div></div><div><p className="fine-print">Saving records exactly what you entered. It does not infer a diagnosis or send data to an AI service.</p>{saved && <Notice tone="success"><Check size={17} /> Your private daily log was saved.</Notice>}<Button onClick={save}><Check size={18} /> {existing ? 'Update daily log' : 'Save daily log'}</Button>{existing && <Button variant="ghost" className="myflo-delete-log" onClick={() => { if (window.confirm('Delete this daily check-in? This cannot be undone.')) { onDelete(existing.id); onBack() } }}><Trash2 size={15} /> Delete this log</Button>}</div></Card>
    <button className="myflo-body-tracker-link" onClick={onOpenBodyTracker}>Continue to Body Tracker <ChevronRight size={16} /></button>
  </div>
}
