import { useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import { AlertTriangle, ArrowLeft, Bell, BookOpen, Camera, ChevronDown, ChevronLeft, ChevronRight, CircleAlert, Clock3, Droplet, Edit3, Info, LockKeyhole, Minus, Pill, Plus, ScanLine, Sparkles, Trash2, Utensils, X } from 'lucide-react'
import type { BleedingLevel, DailyLog, FlowColor, MealEntry, MealNutrients, MedicationRecord, Reminder } from '../domain/types'
import { createId, nowIso } from '../lib/store'

const todayKey = () => new Date().toISOString().slice(0, 10)
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${date}T12:00:00`))
const addDays = (date: string, days: number) => {
  const result = new Date(`${date}T12:00:00`)
  result.setDate(result.getDate() + days)
  return result.toISOString().slice(0, 10)
}

function newLog(date: string): DailyLog {
  const stamp = nowIso()
  return {
    id: createId('log'), date, painScore: 0, painLocations: [], painWorsening: false, painInterferes: false,
    bleeding: 'none', fullySoaked: false, leakage: false, largeClots: false, possiblePregnancy: false,
    fainting: false, fever: false, shortnessBreath: false, bloatingScore: 0, stressScore: 0, energyScore: 5,
    symptoms: [], createdAt: stamp, updatedAt: stamp,
  }
}

function ReferenceHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: ReactNode }) {
  return <header className="reference-page-header">
    <button className="reference-back" onClick={onBack} aria-label="Go back"><ArrowLeft size={16} /></button>
    <h1>{title}</h1>
    {action ?? <span className="reference-header-space" />}
  </header>
}

function MiniNotice({ children, tone = 'lavender' }: { children: ReactNode; tone?: 'lavender' | 'blue' | 'peach' }) {
  return <div className={`reference-mini-notice reference-mini-notice--${tone}`}><Info size={14} />{children}</div>
}

const colorOptions: { id: FlowColor; label: string; shade: string }[] = [
  { id: 'orange_unusual', label: 'Orange', shade: '#f49762' },
  { id: 'dark_red', label: 'Dark red', shade: '#b51f35' },
  { id: 'brown', label: 'Brown', shade: '#8d4e3d' },
  { id: 'other_unsure', label: 'Other', shade: '#9874d4' },
]

export function PeriodLogScreen({ logs, onSaveCycle, onSaveLog, onBack }: {
  logs: DailyLog[]
  onSaveCycle: (cycle: { id: string; startDate: string; endDate?: string; notes?: string; createdAt: string; updatedAt: string }) => void
  onSaveLog: (log: DailyLog) => void
  onBack: () => void
}) {
  const [startDate, setStartDate] = useState(todayKey())
  const [endDate, setEndDate] = useState(() => addDays(todayKey(), 4))
  const [bleeding, setBleeding] = useState<BleedingLevel>('moderate')
  const [flowColor, setFlowColor] = useState<FlowColor>('dark_red')
  const [symptoms, setSymptoms] = useState<DailyLog['symptoms']>([])
  const [saved, setSaved] = useState(false)
  const intensity: { id: BleedingLevel; label: string; drops: number }[] = [
    { id: 'light', label: 'Light', drops: 1 }, { id: 'moderate', label: 'Moderate', drops: 2 }, { id: 'heavy', label: 'Heavy', drops: 3 },
  ]
  const symptomOptions: { id: DailyLog['symptoms'][number]; label: string }[] = [{ id: 'cramps', label: 'Cramps' }, { id: 'bloating', label: 'Bloating' }, { id: 'headache', label: 'Headache' }]
  const save = () => {
    const stamp = nowIso()
    onSaveCycle({ id: createId('cycle'), startDate, endDate: endDate || undefined, createdAt: stamp, updatedAt: stamp })
    const existing = logs.find((entry) => entry.date === startDate)
    onSaveLog({ ...(existing ?? newLog(startDate)), bleeding, flowColor, symptoms, updatedAt: stamp })
    setSaved(true)
  }
  const selectSymptom = (id: DailyLog['symptoms'][number]) => setSymptoms((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <div className="screen reference-screen period-log-screen">
    <ReferenceHeader title="Log Period" onBack={onBack} action={<button className="reference-page-header__action reference-page-header__action--pink" aria-label="Private log"><LockKeyhole size={15} /></button>} />
    <section className="period-log-art"><img src="/assets/period-chibi.png" alt="" aria-hidden="true" /></section>
    <section className="period-reference-fields"><strong>Start Date</strong><label><input type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (!endDate || endDate < event.target.value) setEndDate(addDays(event.target.value, 4)) }} /><span>{dateLabel(startDate)}</span><Clock3 size={14} /></label><label><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /><span>{endDate ? dateLabel(endDate) : 'Add end date'}</span><X size={13} /></label></section>
    <section className="period-log-section"><strong>Flow Intensity</strong><div className="period-intensity-grid">{intensity.map((item) => <button type="button" key={item.id} className={`period-intensity ${bleeding === item.id ? 'is-selected' : ''}`} onClick={() => setBleeding(item.id)}>{Array.from({ length: item.drops }, (_, index) => <Droplet key={index} size={16} fill="currentColor" />)}<span>{item.label}</span></button>)}</div></section>
    <section className="period-log-section"><strong>Flow Color</strong><div className="period-color-grid">{colorOptions.map((item) => <button type="button" key={item.id} className={`period-color-choice ${flowColor === item.id ? 'is-selected' : ''}`} onClick={() => setFlowColor(item.id)}><i style={{ '--drop-color': item.shade } as CSSProperties} /><span>{item.label}</span></button>)}</div></section>
    <section className="period-log-section period-log-section--symptoms"><strong>Any Symptoms?</strong><div className="period-chip-row">{symptomOptions.map((item) => <button key={item.id} className={`period-chip ${symptoms.includes(item.id) ? 'is-selected' : ''}`} onClick={() => selectSymptom(item.id)}>{item.label}</button>)}</div></section>
    {saved && <MiniNotice tone="lavender"><span>Saved privately on this device.</span></MiniNotice>}
    <button className="period-save-button" onClick={save}>Save</button>
  </div>
}

function TrackerSlider({ icon, label, value, onChange, tone = 'pink' }: { icon: ReactNode; label: string; value: number; onChange: (value: number) => void; tone?: 'pink' | 'peach' | 'lavender' }) {
  return <section className={`reference-slider reference-slider--${tone}`}><div><span className="reference-slider__title">{icon}{label}</span><strong>{value}<small>/10</small></strong></div><input type="range" min="0" max="10" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} style={{ '--range-progress': `${value * 10}%` } as CSSProperties} aria-label={`${label} ${value} out of 10`} /><div className="reference-slider__marks"><span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span></div></section>
}

export function BodyTrackerScreen({ logs, onSave, onBack }: { logs: DailyLog[]; onSave: (log: DailyLog) => void; onBack: () => void }) {
  const [date, setDate] = useState(todayKey())
  const forDate = logs.find((entry) => entry.date === date)
  const [form, setForm] = useState<DailyLog>(() => forDate ?? newLog(date))
  const [saved, setSaved] = useState(false)
  const setDateAndLog = (next: string) => { setDate(next); setForm(logs.find((entry) => entry.date === next) ?? newLog(next)); setSaved(false) }
  const update = (patch: Partial<DailyLog>) => { setForm((current) => ({ ...current, ...patch, updatedAt: nowIso() })); setSaved(false) }
  const bleeding: { id: BleedingLevel; label: string; drops: number }[] = [
    { id: 'spotting', label: 'Spotting', drops: 1 }, { id: 'light', label: 'Light', drops: 1 }, { id: 'moderate', label: 'Moderate', drops: 2 }, { id: 'heavy', label: 'Heavy', drops: 3 },
  ]
  const save = () => { onSave({ ...form, date, updatedAt: nowIso() }); setSaved(true) }
  return <div className="screen reference-screen body-tracker-screen">
    <ReferenceHeader title="Body Tracker" onBack={onBack} action={<button className="reference-page-header__action" onClick={save} aria-label="Save body tracker"><Sparkles size={16} /></button>} />
    <div className="body-tracker-date"><button onClick={() => setDateAndLog(addDays(date, -1))} aria-label="Previous day"><ChevronLeft size={15} /></button><span>{dateLabel(date)}</span><button onClick={() => setDateAndLog(addDays(date, 1))} aria-label="Next day"><ChevronRight size={15} /></button></div>
    <section className="body-tracker-card"><div className="body-tracker-card__heading"><span><Droplet size={16} /></span><div><strong>Pain Level</strong><small>How intense does it feel?</small></div></div><TrackerSlider icon={<span>◕</span>} label="Pain level" value={form.painScore} onChange={(value) => update({ painScore: value })} /></section>
    <section className="body-tracker-card"><div className="body-tracker-card__heading"><span><Droplet size={16} fill="currentColor" /></span><div><strong>Bleeding Amount</strong><small>Choose what fits today</small></div></div><div className="body-tracker-bleeding">{bleeding.map((item) => <button type="button" key={item.id} onClick={() => update({ bleeding: item.id })} className={form.bleeding === item.id ? 'is-selected' : ''}>{Array.from({ length: item.drops }, (_, index) => <Droplet key={index} size={13} fill="currentColor" />)}<span>{item.label}</span></button>)}</div></section>
    <section className="body-tracker-card body-tracker-card--slim"><TrackerSlider icon={<span>◌</span>} label="Bloating Level" value={form.bloatingScore} onChange={(value) => update({ bloatingScore: value })} tone="peach" /></section>
    <section className="body-tracker-card body-tracker-card--slim"><TrackerSlider icon={<span>✦</span>} label="Stress Level" value={form.stressScore} onChange={(value) => update({ stressScore: value })} tone="lavender" /></section>
    <section className="body-tracker-card body-tracker-card--slim"><TrackerSlider icon={<span>☼</span>} label="Energy Level" value={form.energyScore} onChange={(value) => update({ energyScore: value })} tone="peach" /></section>
    {saved && <MiniNotice tone="lavender"><span>Body tracker saved for {dateLabel(date)}.</span></MiniNotice>}
    <button className="body-tracker-save" onClick={save}>Save Tracker</button>
  </div>
}

export function FoodScannerScreen({ onBack, onContinue }: { meals: MealEntry[]; onBack: () => void; onContinue: (preview?: string) => void }) {
  const uploadRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | undefined>()
  const [mode, setMode] = useState<'photo' | 'manual' | 'recent'>('photo')
  const choosePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }
  return <div className="screen reference-screen food-scanner-screen">
    <ReferenceHeader title="Food Scanner" onBack={onBack} />
    <section className="food-scanner-illustration"><img src={preview ?? '/assets/food-bowl.png'} alt={preview ? 'Selected food to confirm' : 'Example food bowl'} /></section>
    <p className="food-scanner-tip">Click a photo or upload</p>
    <div className="food-scanner-round-actions"><button onClick={() => uploadRef.current?.click()} aria-label="Choose photo"><Camera size={18} /></button><button className="is-primary" onClick={() => uploadRef.current?.click()} aria-label="Take or upload a photo"><ScanLine size={20} /></button><button onClick={() => onContinue(preview)} aria-label="Continue manually"><Pill size={18} /></button><input ref={uploadRef} type="file" accept="image/*" capture="environment" onChange={choosePhoto} /></div>
    <div className="food-scanner-tabs" role="tablist"><button className={mode === 'photo' ? 'is-selected' : ''} onClick={() => { setMode('photo'); uploadRef.current?.click() }}>Photo</button><button className={mode === 'manual' ? 'is-selected' : ''} onClick={() => { setMode('manual'); onContinue(undefined) }}>Manual</button><button className={mode === 'recent' ? 'is-selected' : ''} onClick={() => setMode('recent')}>Recent</button></div>
    {preview && <div className="food-preview-card"><img src={preview} alt="Selected meal preview" /><div><strong>Photo selected</strong><small>You will enter and review every meal detail before saving.</small><button onClick={() => onContinue(preview)}>Review manually</button></div></div>}
    <MiniNotice tone="blue"><span>Tip: Keep food clearly visible for better results. Photo recognition is not configured here, so you will confirm the meal yourself.</span></MiniNotice>
  </div>
}

const defaultNutrients: MealNutrients = { calories: 420, proteinG: 28, carbsG: 52, fatG: 12, fiberG: 6, zincMg: 2.8, ironMg: 2.1, calciumMg: 120, vitaminB12McG: 1.2, folateMcG: 95 }

export function NutritionResultScreen({ preview, onBack, onSave, onSaved, onAddAnother }: { preview?: string; onBack: () => void; onSave: (meal: MealEntry) => void; onSaved: () => void; onAddAnother: () => void }) {
  const photoNeedsConfirmation = Boolean(preview)
  const [name, setName] = useState(photoNeedsConfirmation ? '' : 'Grilled Chicken Bowl')
  const [portion, setPortion] = useState('1 bowl (250g)')
  const [nutrients, setNutrients] = useState<MealNutrients>(photoNeedsConfirmation ? { ...defaultNutrients, calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, zincMg: 0, ironMg: 0, calciumMg: 0, vitaminB12McG: 0 } : defaultNutrients)
  const [editing, setEditing] = useState(photoNeedsConfirmation)
  const [error, setError] = useState('')
  const change = (key: keyof MealNutrients, value: string) => setNutrients((current) => ({ ...current, [key]: Math.max(0, Number(value) || 0) }))
  const save = () => {
    if (!name.trim()) { setError('Add a meal name before saving this photo.'); setEditing(true); return false }
    onSave({ id: createId('meal'), date: todayKey(), name: name.trim(), portionLabel: portion, mealType: 'lunch', nutrients, source: photoNeedsConfirmation ? 'manual' : 'reference', confidence: photoNeedsConfirmation ? 'user_entered' : 'estimated', createdAt: nowIso() })
    return true
  }
  const editor: { key: keyof MealNutrients; label: string; suffix: string }[] = [
    { key: 'calories', label: 'Calories', suffix: 'kcal' }, { key: 'proteinG', label: 'Protein', suffix: 'g' }, { key: 'carbsG', label: 'Carbs', suffix: 'g' }, { key: 'fatG', label: 'Fat', suffix: 'g' }, { key: 'fiberG', label: 'Fiber', suffix: 'g' }, { key: 'zincMg', label: 'Zinc', suffix: 'mg' }, { key: 'ironMg', label: 'Iron', suffix: 'mg' }, { key: 'calciumMg', label: 'Calcium', suffix: 'mg' }, { key: 'vitaminB12McG', label: 'B12', suffix: 'µg' },
  ]
  return <div className="screen reference-screen nutrition-result-screen">
    <ReferenceHeader title="Nutrition Result" onBack={onBack} action={<button className="reference-page-header__action" onClick={onBack} aria-label="Close"><X size={16} /></button>} />
    <section className="nutrition-result-meal"><img src={preview ?? '/assets/nutrition-meal.png'} alt="Meal to review" /><div><strong>{name || 'Name this meal'}</strong><small>{photoNeedsConfirmation ? 'No photo analysis was performed' : 'Rice, chicken, broccoli, carrot'}</small><button onClick={() => setEditing((value) => !value)}><Edit3 size={11} />{editing ? 'Done editing' : 'Edit details'}</button></div></section>
    {photoNeedsConfirmation && <MiniNotice tone="blue"><span>Your photo stays in this browser preview. Myflo has not identified ingredients or nutrients; enter and review them yourself.</span></MiniNotice>}
    {editing && <div className="nutrition-name-editor"><input value={name} onChange={(event) => { setName(event.target.value); setError('') }} aria-label="Meal name" placeholder="Meal name" /><input value={portion} onChange={(event) => setPortion(event.target.value)} aria-label="Portion" /></div>}
    {error && <MiniNotice tone="peach"><span>{error}</span></MiniNotice>}
    <label className="nutrition-portion-picker"><span>Portion Size</span><select value={portion} onChange={(event) => setPortion(event.target.value)}><option>1 bowl (250g)</option><option>Half bowl (125g)</option><option>Large bowl (350g)</option></select></label>
    <p className="nutrition-result-label">Nutrition (Estimated)</p>
    <section className="nutrition-reference-grid"><div><strong>{nutrients.calories}</strong><small>Calories</small></div><div><strong>{nutrients.proteinG}g</strong><small>Protein</small></div><div><strong>{nutrients.carbsG}g</strong><small>Carbs</small></div><div><strong>{nutrients.fatG}g</strong><small>Fat</small></div><div><strong>{nutrients.fiberG}g</strong><small>Fiber</small></div><div><strong>{nutrients.zincMg}mg</strong><small>Zinc</small></div><div><strong>{nutrients.ironMg}mg</strong><small>Iron</small></div><div><strong>{nutrients.calciumMg}mg</strong><small>Calcium</small></div><div><strong>{nutrients.vitaminB12McG}µg</strong><small>B12</small></div></section>
    {editing && <div className="nutrition-result-edit-grid">{editor.map((item) => <label key={item.key}>{item.label}<input type="number" min="0" step="0.1" value={nutrients[item.key] ?? 0} onChange={(event) => change(item.key, event.target.value)} /><small>{item.suffix}</small></label>)}</div>}
    <p className="reference-fine-print">Estimates may vary based on portion size and ingredients.</p>
    <div className="nutrition-result-note"><img src="/assets/home-chibi.png" alt="" /><div><strong>Good choice!</strong><span>High in protein and rich in fiber.</span></div></div>
    <div className="nutrition-result-actions"><button onClick={() => { if (save()) onSaved() }}>Save to Diary</button><button onClick={() => { if (save()) onAddAnother() }}>Add Another</button></div>
  </div>
}

function NutritionRing({ value, max, label, suffix, tone }: { value: number; max: number; label: string; suffix: string; tone: string }) {
  return <div className={`nutrition-ring nutrition-ring--${tone}`} style={{ '--ring': `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` } as CSSProperties}><div><strong>{Math.round(value)}{suffix}</strong><small>{label}</small></div></div>
}

export function DailyNutritionScreen({ data, onBack, onAdd }: { data: { meals: MealEntry[] }; onBack: () => void; onAdd: () => void }) {
  const meals = data.meals.filter((meal) => meal.date === todayKey())
  const totals = meals.reduce((sum, meal) => ({ calories: sum.calories + meal.nutrients.calories, protein: sum.protein + meal.nutrients.proteinG, zinc: sum.zinc + (meal.nutrients.zincMg ?? 0) }), { calories: 0, protein: 0, zinc: 0 })
  return <div className="screen reference-screen daily-nutrition-screen">
    <ReferenceHeader title="Daily Nutrition" onBack={onBack} />
    <div className="daily-nutrition-date"><p>‹ {dateLabel(todayKey())} ›</p></div>
    <section className="nutrition-rings nutrition-rings--daily"><NutritionRing value={totals.calories} max={1600} label="Kcal" suffix="" tone="protein" /><NutritionRing value={totals.protein} max={80} label="Protein" suffix="g" tone="carbs" /><NutritionRing value={totals.zinc} max={12} label="Zinc" suffix="mg" tone="fats" /></section>
    <div className="daily-nutrition-heading"><h2>Meals</h2><button onClick={onAdd}><Plus size={14} />Add meal</button></div>
    {meals.length === 0 ? <div className="daily-nutrition-empty"><Utensils size={22} /><p>No meals logged today. Add one when you are ready.</p></div> : <div className="daily-meal-list">{meals.map((meal, index) => <article className="daily-meal-row" key={meal.id}><span className={index % 2 ? 'is-green' : ''}><Utensils size={16} /></span><div><strong>{meal.name}</strong><small>{meal.nutrients.calories} kcal · {meal.nutrients.proteinG}g protein</small></div><b>{meal.mealType === 'breakfast' ? '08:30 AM' : meal.mealType === 'lunch' ? '01:15 PM' : '06:30 PM'}</b></article>)}</div>}
    <button className="daily-nutrition-add" onClick={onAdd}><Plus size={16} />Add Meal</button>
  </div>
}

type FlowChoice = FlowColor | 'clots'
const flowChoices: { id: FlowChoice; label: string; shade: string; detail: string; reasons: string[] }[] = [
  { id: 'bright_red', label: 'Bright Red', shade: '#f3466e', detail: 'Usually fresh menstrual blood.', reasons: ['Normal menstruation', 'Higher flow day', 'Hormonal shedding of uterine lining'] },
  { id: 'dark_red', label: 'Dark Red', shade: '#bd233b', detail: 'May be older blood.', reasons: ['Blood leaving more slowly', 'Beginning or end of a period'] },
  { id: 'brown', label: 'Brown', shade: '#914f3d', detail: 'Often old blood at end of period.', reasons: ['Older blood leaving the body', 'Light spotting'] },
  { id: 'orange_unusual', label: 'Orange', shade: '#f49061', detail: 'Could be due to infection or other discharge.', reasons: ['Mixed fluids can change colour', 'Consider other symptoms'] },
  { id: 'clots', label: 'Clots', shade: '#70393c', detail: 'Can be normal, but large clots should be checked.', reasons: ['Track size and amount', 'Seek advice if changes worry you'] },
  { id: 'other_unsure', label: 'Other', shade: '#9a74d3', detail: 'Monitor with other symptoms.', reasons: ['Lighting can change appearance', 'Patterns matter most'] },
]

export function FlowColorScreen({ logs, onSave, onBack, onOpenGuide }: { logs: DailyLog[]; onSave: (log: DailyLog) => void; onBack: () => void; onOpenGuide: () => void }) {
  const existing = logs.find((entry) => entry.date === todayKey())
  const initial: FlowChoice = existing?.largeClots ? 'clots' : existing?.flowColor ?? 'bright_red'
  const [selected, setSelected] = useState<FlowChoice>(initial)
  const option = flowChoices.find((item) => item.id === selected) ?? flowChoices[0]
  const choose = (choice: FlowChoice) => {
    setSelected(choice)
    const current = existing ?? newLog(todayKey())
    onSave({ ...current, flowColor: choice === 'clots' ? current.flowColor : choice, largeClots: choice === 'clots', updatedAt: nowIso() })
  }
  return <div className="screen reference-screen flow-color-screen">
    <ReferenceHeader title="Flow Color" onBack={onBack} />
    <div className="flow-color-droplets">{flowChoices.map((item) => <button key={item.id} className={`flow-color-droplet ${selected === item.id ? 'is-selected' : ''}`} onClick={() => choose(item.id)}><i className="flow-color-droplet__shape" style={{ '--drop-color': item.shade } as CSSProperties} /><span>{item.label}</span></button>)}</div>
    <section className="flow-color-result"><span className="flow-color-result__drop"><Droplet size={31} fill="currentColor" /></span><div><h2>{option.label}</h2><p>{option.detail}</p></div></section>
    <section className="flow-color-signals"><h2>Possible reasons</h2>{option.reasons.map((reason) => <div className="flow-color-signal" key={reason}><span>•</span><p>{reason}</p></div>)}</section>
    <section className="flow-color-doctor"><h2><CircleAlert size={14} />When to consult a doctor?</h2><p>• If bleeding is very heavy</p><p>• If it lasts longer than usual</p><p>• If you have severe pain, fainting, breathing trouble, or possible pregnancy with pain or bleeding</p></section>
    <p className="reference-fine-print">Colour alone cannot diagnose an infection, iron deficiency, or hormone condition.</p>
    <button className="flow-color-guide-button" onClick={onOpenGuide}><BookOpen size={15} />Open Flow Guide</button>
  </div>
}

type CareItem = { title: string; copy: string; tone: string; id?: string }

const careItems: CareItem[] = [
  { title: 'Ibuprofen (400 mg)', copy: 'Helps reduce cramps and pain', tone: 'blue' },
  { title: 'Mefenamic Acid (500 mg)', copy: 'Use as advised by a doctor', tone: 'lavender' },
  { title: 'Paracetamol (500 mg)', copy: 'For mild pain and headaches', tone: 'pink' },
  { title: 'Vitamin B6', copy: 'May help reduce PMS symptoms', tone: 'sage' },
  { title: 'Magnesium', copy: 'Helps with cramps, mood and sleep', tone: 'gray' },
  { title: 'Iron (if needed)', copy: 'Helps prevent fatigue', tone: 'coral' },
]

export function MedicineCareScreen({ medications, onBack, onAdd, onDelete }: { medications: MedicationRecord[]; onBack: () => void; onAdd: () => void; onDelete: (id: string) => void }) {
  const [tab, setTab] = useState<'recommended' | 'mine' | 'relief'>('recommended')
  const items: CareItem[] = tab === 'mine' ? medications.map((item) => ({ title: item.name, copy: [item.dose, item.reason, item.repeat === 'daily' ? 'Daily' : item.repeat === 'as_needed' ? 'As needed' : item.repeat ? 'This cycle' : undefined].filter(Boolean).join(' · ') || 'Medication log', tone: 'blue', id: item.id })) : tab === 'relief' ? careItems.slice(0, 3) : careItems
  return <div className="screen reference-screen medicine-care-screen">
    <ReferenceHeader title="Medicine & Care" onBack={onBack} />
    <div className="medicine-tab-row" role="tablist"><button className={tab === 'recommended' ? 'is-selected' : ''} onClick={() => setTab('recommended')}>Recommended</button><button className={tab === 'mine' ? 'is-selected' : ''} onClick={() => setTab('mine')}>My Medicine</button><button className={tab === 'relief' ? 'is-selected' : ''} onClick={() => setTab('relief')}>Pain Relief</button></div>
    {items.length === 0 ? <div className="medicine-empty"><Pill size={25} /><strong>No medicine records yet</strong><span>Use “Add Medicine” to record a medicine you already use.</span></div> : <div className="medicine-card-list">{items.map((item) => <article className={`medicine-care-card medicine-care-card--${item.tone}`} key={item.id ?? item.title}><span className="medicine-care-card__icon"><Pill size={17} /></span><div className="medicine-care-card__copy"><strong>{item.title}</strong><small>{item.copy}</small></div>{item.id ? <button onClick={() => onDelete(item.id!)} aria-label={`Delete ${item.title}`}><Trash2 size={13} /></button> : <ChevronRight size={16} />}</article>)}</div>}
    <div className="medicine-safety"><AlertTriangle size={17} /><div><strong>Remember</strong><p>Always consult a doctor before starting any medication.</p></div></div>
    {tab === 'mine' && <button className="medicine-care-add" onClick={onAdd}><Plus size={16} />Add Medicine</button>}
  </div>
}

export function AddMedicineScreen({ onBack, onSave, onAddReminder }: { onBack: () => void; onSave: (record: MedicationRecord) => void; onAddReminder: (reminder: Reminder) => void }) {
  const [name, setName] = useState('')
  const [dose, setDose] = useState('')
  const [reason, setReason] = useState('')
  const [startDate, setStartDate] = useState(todayKey())
  const [reminder, setReminder] = useState(true)
  const [repeat, setRepeat] = useState('Only this cycle')
  const [error, setError] = useState('')
  const save = () => {
    if (!name.trim()) { setError('Enter the medicine name before saving.'); return }
    const stamp = nowIso()
    onSave({ id: createId('med'), name: name.trim(), dose: dose.trim() || undefined, reason: reason.trim() || undefined, repeat: repeat === 'Daily' ? 'daily' : repeat === 'As needed' ? 'as_needed' : 'only_this_cycle', takenAt: `${startDate}T09:00:00`, createdAt: stamp })
    if (reminder) onAddReminder({ id: createId('reminder'), type: 'medication', title: `Medicine: ${name.trim()}`, enabled: true, time: '09:00', createdAt: stamp })
    onBack()
  }
  return <div className="screen reference-screen add-medicine-screen">
    <ReferenceHeader title="Add Medicine" onBack={onBack} action={<img className="add-medicine-header-art" src="/assets/medicine-chibi.png" alt="" aria-hidden="true" />} />
    <div className="add-medicine-form">
      <label className="add-medicine-field"><span>Medicine Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ibuprofen" autoComplete="off" /></label>
      <label className="add-medicine-field"><span>Dose</span><input value={dose} onChange={(event) => setDose(event.target.value)} placeholder="e.g. 400 mg" autoComplete="off" /></label>
      <label className="add-medicine-field"><span>Reason</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Cramps" autoComplete="off" /></label>
      <label className="add-medicine-field"><span>Start Date</span><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
      <label className="add-medicine-toggle"><span>Reminder<small>Open-tab notification only, if enabled.</small></span><input type="checkbox" checked={reminder} onChange={(event) => setReminder(event.target.checked)} /><i className="add-medicine-switch" /></label>
      <label className="add-medicine-field"><span>Repeat</span><select value={repeat} onChange={(event) => setRepeat(event.target.value)}><option>Only this cycle</option><option>Daily</option><option>As needed</option></select></label>
    </div>
    {error && <MiniNotice tone="peach"><span>{error}</span></MiniNotice>}
    <button className="add-medicine-save" onClick={save}><Pill size={15} />Save Medicine</button>
    <div className="add-medicine-disclaimer"><CircleAlert size={13} /><span>For tracking and reminders only. Follow your own clinician or label instructions; do not combine medicines with overlapping active ingredients without advice.</span></div>
  </div>
}
