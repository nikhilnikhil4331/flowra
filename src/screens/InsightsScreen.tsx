import { AlertTriangle, ArrowRight, Bot, Camera, ChevronRight, CircleHelp, Droplets, HeartPulse, ImagePlus, Info, Leaf, LoaderCircle, MessageCircleHeart, Plus, Salad, Send, Sparkles, Trash2, TrendingUp, Utensils, X } from 'lucide-react'
import { useMemo, useState, type ChangeEvent } from 'react'
import type { AppData, CyclePrediction, MealEntry, MealNutrients } from '../domain/types'
import { getCurrentCycleDay, getCyclePhase, humanDate, todayKey } from '../domain/cycle'
import { evaluateSafety } from '../domain/safety'
import { emptyNutrients, findFoodReference, formatNutrient, scaleNutrients, totalNutrients } from '../domain/nutrition'
import { Button, Card, EmptyState, Notice, Pill, ProgressBar } from '../components/ui'
import { createId, nowIso } from '../lib/store'

type InsightTab = 'overview' | 'nutrition' | 'companion'

interface InsightsScreenProps {
  data: AppData
  prediction: CyclePrediction
  onAddMeal: (meal: MealEntry) => void
  onDeleteMeal: (id: string) => void
  onOpenTrack: () => void
}

const nutrientFields: { key: keyof MealNutrients; label: string; unit: string; step: string }[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', step: '1' },
  { key: 'proteinG', label: 'Protein', unit: 'g', step: '0.1' },
  { key: 'carbsG', label: 'Carbohydrates', unit: 'g', step: '0.1' },
  { key: 'fatG', label: 'Total fat', unit: 'g', step: '0.1' },
  { key: 'fiberG', label: 'Fiber', unit: 'g', step: '0.1' },
  { key: 'ironMg', label: 'Iron', unit: 'mg', step: '0.1' },
  { key: 'zincMg', label: 'Zinc', unit: 'mg', step: '0.1' },
  { key: 'calciumMg', label: 'Calcium', unit: 'mg', step: '1' },
  { key: 'vitaminB12McG', label: 'Vitamin B12', unit: 'µg', step: '0.1' },
  { key: 'folateMcG', label: 'Folate', unit: 'µg', step: '1' },
]

function shortDate(date: string) {
  return humanDate(date, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatMood(value?: string) {
  return value ? value.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Not recorded'
}

export function InsightsScreen({ data, prediction, onAddMeal, onDeleteMeal, onOpenTrack }: InsightsScreenProps) {
  const [tab, setTab] = useState<InsightTab>('overview')
  const today = todayKey()
  const todayLog = data.dailyLogs.find((entry) => entry.date === today)
  const alerts = todayLog ? evaluateSafety(todayLog) : []

  return <div className="screen screen--insights">
    <header className="screen-header"><div><p className="eyebrow">Patterns, not assumptions</p><h1>Health & insights</h1><p className="subtitle">Your records can reveal useful patterns. They cannot prove a cause or replace medical care.</p></div><span className="screen-leaf"><Leaf size={27} /></span></header>
    <div className="segment-control" role="tablist" aria-label="Insights sections"><button role="tab" aria-selected={tab === 'overview'} className={tab === 'overview' ? 'is-selected' : ''} onClick={() => setTab('overview')}>This cycle</button><button role="tab" aria-selected={tab === 'nutrition'} className={tab === 'nutrition' ? 'is-selected' : ''} onClick={() => setTab('nutrition')}>Nutrition</button><button role="tab" aria-selected={tab === 'companion'} className={tab === 'companion' ? 'is-selected' : ''} onClick={() => setTab('companion')}>Companion</button></div>
    {alerts.length > 0 && <Notice tone={alerts.some((alert) => alert.severity === 'urgent') ? 'urgent' : 'warning'}><AlertTriangle size={19} /><div><strong>{alerts[0].title}</strong><span>{alerts[0].action}</span></div></Notice>}
    {tab === 'overview' && <CycleOverview data={data} prediction={prediction} onOpenTrack={onOpenTrack} />}
    {tab === 'nutrition' && <NutritionDashboard data={data} onAddMeal={onAddMeal} onDeleteMeal={onDeleteMeal} />}
    {tab === 'companion' && <Companion data={data} />}
  </div>
}

function CycleOverview({ data, prediction, onOpenTrack }: { data: AppData; prediction: CyclePrediction; onOpenTrack: () => void }) {
  const today = todayKey()
  const cycleDay = getCurrentCycleDay(data.cycles, today)
  const phase = getCyclePhase(cycleDay, prediction)
  const recentLogs = [...data.dailyLogs].sort((a, b) => a.date.localeCompare(b.date)).slice(-8)
  const symptomsLogged = data.dailyLogs.slice(0, 12)
  const bloatingCount = symptomsLogged.filter((log) => log.symptoms.includes('bloating') || log.bloatingScore >= 5).length
  const fatigueCount = symptomsLogged.filter((log) => log.symptoms.includes('fatigue')).length
  const highStressCount = symptomsLogged.filter((log) => log.stressScore >= 7).length
  const maxPoint = Math.max(10, ...recentLogs.flatMap((log) => [log.painScore, log.bloatingScore, log.stressScore]))

  return <>
    <section className="insight-overview-grid">
      <Card className="cycle-overview-card"><div className="card-title-row"><div><p className="eyebrow">Cycle overview</p><h2>{cycleDay ? `Day ${cycleDay}` : 'No current cycle yet'}</h2></div><Pill tone={prediction.confidence === 'higher' ? 'sage' : prediction.confidence === 'moderate' ? 'lavender' : 'ivory'}>{prediction.confidence} confidence</Pill></div><div className="overview-numbers"><div><span>Current phase</span><strong>{phase}</strong></div><div><span>Typical cycle</span><strong>{prediction.averageCycleLength ? `${prediction.averageCycleLength} days` : '—'}</strong></div><div><span>Next estimate</span><strong>{prediction.nextPeriodStart ? humanDate(prediction.nextPeriodStart) : 'Need history'}</strong></div></div><p className="fine-print">{prediction.nextPeriodStart ? `Estimate based on ${prediction.basis} recorded interval${prediction.basis === 1 ? '' : 's'}.` : 'Log two period starts to create a personal estimate.'} Cycle phase and ovulation estimates are educational only.</p></Card>
      <Card className="check-in-prompt"><span className="metric-icon metric-icon--lavender"><HeartPulse size={20} /></span><p className="eyebrow">Today’s check-in</p><h2>{data.dailyLogs.some((log) => log.date === today) ? 'Your log is saved.' : 'A small check-in can help.'}</h2><p>{data.dailyLogs.some((log) => log.date === today) ? 'Update it whenever your symptoms change.' : 'Pain, energy, stress, sleep, and flow are all optional.'}</p><Button variant="secondary" onClick={onOpenTrack}>{data.dailyLogs.some((log) => log.date === today) ? 'Review today’s log' : 'Log today'} <ArrowRight size={17} /></Button></Card>
    </section>

    <section className="section-heading"><div><p className="eyebrow">Your recorded trend</p><h2>Pain, bloating & stress</h2></div><Pill tone="ivory">Last {recentLogs.length || 0} check-ins</Pill></section>
    <Card className="trend-card">{recentLogs.length >= 2 ? <><div className="trend-key"><span><i className="trend-key__dot trend-key__dot--pain" />Pain</span><span><i className="trend-key__dot trend-key__dot--bloating" />Bloating</span><span><i className="trend-key__dot trend-key__dot--stress" />Stress</span></div><div className="line-chart" aria-label="Trend chart of recorded scores">{recentLogs.map((log) => <div className="line-chart__group" key={log.id}><div className="line-chart__columns"><i className="chart-bar chart-bar--pain" style={{ height: `${Math.max(4, (log.painScore / maxPoint) * 100)}%` }} title={`Pain ${log.painScore}/10`} /><i className="chart-bar chart-bar--bloating" style={{ height: `${Math.max(4, (log.bloatingScore / maxPoint) * 100)}%` }} title={`Bloating ${log.bloatingScore}/10`} /><i className="chart-bar chart-bar--stress" style={{ height: `${Math.max(4, (log.stressScore / maxPoint) * 100)}%` }} title={`Stress ${log.stressScore}/10`} /></div><span>{humanDate(log.date, { day: 'numeric', month: 'short' })}</span></div>)}</div><p className="fine-print">This chart only describes your entries. It does not establish why scores changed.</p></> : <EmptyState icon={<TrendingUp size={25} />} title="More check-ins will make a trend" description="Save at least two daily logs to compare your own recorded scores over time." action={<Button variant="secondary" onClick={onOpenTrack}>Add a check-in</Button>} />}</Card>

    <section className="section-heading"><div><p className="eyebrow">Observed patterns</p><h2>What your logs show</h2></div></section>
    <div className="patterns-grid">
      <PatternCard icon={<Droplets size={20} />} label="Bloating" value={bloatingCount} total={symptomsLogged.length} description={symptomsLogged.length ? `Recorded in ${bloatingCount} of your last ${symptomsLogged.length} check-ins.` : 'No check-ins to compare yet.'} tone="rose" />
      <PatternCard icon={<Sparkles size={20} />} label="Fatigue" value={fatigueCount} total={symptomsLogged.length} description={symptomsLogged.length ? `Recorded in ${fatigueCount} of your last ${symptomsLogged.length} check-ins.` : 'No check-ins to compare yet.'} tone="lavender" />
      <PatternCard icon={<HeartPulse size={20} />} label="High stress" value={highStressCount} total={symptomsLogged.length} description={symptomsLogged.length ? `Stress of 7 or higher in ${highStressCount} of your last ${symptomsLogged.length} check-ins.` : 'No check-ins to compare yet.'} tone="sage" />
    </div>
    <Notice tone="info"><Info size={19} /><div><strong>Observed, not proven.</strong><span>Repeated entries can be useful to discuss with a clinician. They do not prove that sleep, food, stress, or a cycle phase caused a symptom.</span></div></Notice>
  </>
}

function PatternCard({ icon, label, value, total, description, tone }: { icon: React.ReactNode; label: string; value: number; total: number; description: string; tone: 'rose' | 'lavender' | 'sage' }) {
  return <Card className={`pattern-card pattern-card--${tone}`}><span className="metric-icon">{icon}</span><p>{label}</p><strong>{total ? `${value}/${total}` : '—'}</strong><small>{description}</small></Card>
}

function NutritionDashboard({ data, onAddMeal, onDeleteMeal }: { data: AppData; onAddMeal: (meal: MealEntry) => void; onDeleteMeal: (id: string) => void }) {
  const today = todayKey()
  const todayMeals = data.meals.filter((entry) => entry.date === today)
  const total = totalNutrients(todayMeals)
  const weeklyDates = Array.from({ length: 7 }, (_, index) => { const date = new Date(`${today}T00:00:00Z`); date.setUTCDate(date.getUTCDate() - (6 - index)); return date.toISOString().slice(0, 10) })
  const weeklyCalories = weeklyDates.map((date) => ({ date, total: totalNutrients(data.meals.filter((entry) => entry.date === date)).calories }))
  const maxCalories = Math.max(500, ...weeklyCalories.map((entry) => entry.total))
  const [showComposer, setShowComposer] = useState(false)

  return <>
    <section className="nutrition-summary-grid"><Card className="nutrition-total-card"><div><p className="eyebrow">Today’s estimated intake</p><h2>{total.calories} <small>kcal</small></h2><p>From {todayMeals.length} saved meal{todayMeals.length === 1 ? '' : 's'}. Values are editable estimates.</p></div><span className="metric-icon metric-icon--amber"><Salad size={22} /></span></Card><Card className="macro-card"><div><span>Protein</span><strong>{formatNutrient(total.proteinG, 'g', 1)}</strong><ProgressBar value={total.proteinG} max={50} tone="sage" /></div><div><span>Fiber</span><strong>{formatNutrient(total.fiberG, 'g', 1)}</strong><ProgressBar value={total.fiberG} max={25} tone="lavender" /></div><div><span>Iron</span><strong>{formatNutrient(total.ironMg, 'mg', 1)}</strong><ProgressBar value={total.ironMg ?? 0} max={18} tone="rose" /></div><div><span>Zinc</span><strong>{formatNutrient(total.zincMg, 'mg', 1)}</strong><ProgressBar value={total.zincMg ?? 0} max={8} tone="amber" /></div></Card></section>
    <Notice tone="info"><Info size={19} /><div><strong>Nutrition estimates are not lab results.</strong><span>Portion size, recipes, oil, ghee, sauces, and ingredients can meaningfully change results. This dashboard does not diagnose nutrient deficiencies.</span></div></Notice>

    <Card className="scanner-card"><div className="scanner-card__top"><div><p className="eyebrow">Food photo scanner</p><h2>Confirm before you save.</h2><p>Photos cannot reliably identify every ingredient, portion, or hidden oil. Flowra keeps you in control of every estimate.</p></div><span className="scanner-icon"><Camera size={28} /></span></div><div className="scanner-steps"><span><b>1</b> Add photo or meal name</span><span><b>2</b> Confirm portion & ingredients</span><span><b>3</b> Review nutrition estimate</span><span><b>4</b> Save it to your day</span></div><Button onClick={() => setShowComposer(true)}><Plus size={18} /> Add a meal manually</Button><p className="fine-print"><strong>Cloud photo analysis is not configured in this build.</strong> A production server-side vision provider and validated nutrition database are required before food-photo analysis can be enabled. No uploaded image is sent anywhere here.</p></Card>

    <section className="section-heading"><div><p className="eyebrow">Today’s meals</p><h2>Saved meal log</h2></div><Button variant="secondary" onClick={() => setShowComposer(true)}><Plus size={17} /> Add meal</Button></section>
    {todayMeals.length ? <div className="meal-list">{todayMeals.map((meal) => <Card key={meal.id} className="meal-row"><span className="metric-icon metric-icon--amber"><Utensils size={20} /></span><div><strong>{meal.name}</strong><small>{meal.mealType[0].toUpperCase() + meal.mealType.slice(1)} · {meal.portionLabel} · {meal.confidence === 'estimated' ? 'Editable estimate' : 'User-entered'}</small><span className="meal-nutrients">{meal.nutrients.calories} kcal · {meal.nutrients.proteinG}g protein · {meal.nutrients.fiberG}g fiber</span></div><button className="small-icon-button" onClick={() => onDeleteMeal(meal.id)} aria-label={`Delete ${meal.name}`}><Trash2 size={17} /></button></Card>)}</div> : <Card><EmptyState icon={<Utensils size={25} />} title="No meals logged today" description="Add a meal when it helps—not every meal needs to be perfectly tracked." action={<Button onClick={() => setShowComposer(true)}>Add a meal</Button>} /></Card>}

    <section className="section-heading"><div><p className="eyebrow">Week in view</p><h2>Estimated energy by day</h2></div><Pill tone="ivory">Log-based only</Pill></section><Card className="week-chart-card"><div className="week-chart">{weeklyCalories.map((day) => <div key={day.date}><strong>{day.total || 0}</strong><span className="week-chart__bar"><i style={{ height: `${Math.max(day.total ? 9 : 2, (day.total / maxCalories) * 100)}%` }} /></span><small>{humanDate(day.date, { weekday: 'short' }).slice(0, 3)}</small></div>)}</div><p className="fine-print">This is a record of saved estimates, not a measure of what your body needs or absorbs.</p></Card>
    {showComposer && <MealComposer onClose={() => setShowComposer(false)} onSave={(meal) => { onAddMeal(meal); setShowComposer(false) }} />}
  </>
}

function MealComposer({ onClose, onSave }: { onClose: () => void; onSave: (meal: MealEntry) => void }) {
  const today = todayKey()
  const [name, setName] = useState('')
  const [mealType, setMealType] = useState<MealEntry['mealType']>('lunch')
  const [portion, setPortion] = useState(1)
  const [portionLabel, setPortionLabel] = useState('1 serving')
  const [date, setDate] = useState(today)
  const [nutrients, setNutrients] = useState<MealNutrients>(emptyNutrients())
  const [source, setSource] = useState<MealEntry['source']>('manual')
  const [notes, setNotes] = useState('')
  const [imageName, setImageName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | undefined>()
  const [error, setError] = useState('')
  const reference = findFoodReference(name)

  const applyReference = () => {
    if (!reference) return
    setNutrients(scaleNutrients(reference.nutrients, portion || 1))
    setPortionLabel(`${portion || 1} × ${reference.serving}`)
    setSource('reference')
  }

  const changePortion = (value: number) => {
    const safeValue = Math.min(10, Math.max(0.1, value || 1))
    setPortion(safeValue)
    if (reference && source === 'reference') setNutrients(scaleNutrients(reference.nutrients, safeValue))
  }

  const fileSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setImageName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(typeof reader.result === 'string' ? reader.result : undefined)
    reader.readAsDataURL(file)
  }

  const save = () => {
    if (!name.trim()) { setError('Please enter a food or meal name before saving.'); return }
    if (nutrients.calories < 0 || nutrientFields.some(({ key }) => (nutrients[key] ?? 0) < 0)) { setError('Nutrient values cannot be negative.'); return }
    onSave({ id: createId('meal'), date, name: name.trim(), mealType, portionLabel: portionLabel.trim() || `${portion} serving`, nutrients, source, confidence: source === 'reference' ? 'estimated' : 'user_entered', notes: notes.trim() || undefined, createdAt: nowIso() })
  }

  return <div className="modal-backdrop" role="presentation"><section className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="meal-composer-title"><div className="modal__header"><div><p className="eyebrow">Nutrition log</p><h2 id="meal-composer-title">Add a meal</h2></div><button className="small-icon-button" aria-label="Close meal form" onClick={onClose}><X size={19} /></button></div><div className="meal-composer-layout"><div className="stack-form"><label className="field"><span>Meal name</span><input value={name} onChange={(event) => { setName(event.target.value); setSource('manual') }} maxLength={100} placeholder="e.g. dal, rice and vegetables" autoFocus /></label><div className="field-grid"><label className="field"><span>Meal type</span><select value={mealType} onChange={(event) => setMealType(event.target.value as MealEntry['mealType'])}>{(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>)}</select></label><label className="field"><span>Date</span><input type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} /></label></div><div className="field-grid"><label className="field"><span>Portion multiplier</span><input type="number" min="0.1" max="10" step="0.1" value={portion} onChange={(event) => changePortion(Number(event.target.value))} /></label><label className="field"><span>Portion description</span><input value={portionLabel} maxLength={80} onChange={(event) => setPortionLabel(event.target.value)} placeholder="e.g. 1 medium bowl" /></label></div>{reference ? <Notice tone="info"><div><strong>Starter reference found: {reference.name}</strong><span>{reference.serving} · This is an editable local starting estimate, not a live database response.</span></div><Button type="button" variant="secondary" onClick={applyReference}>Use & review</Button></Notice> : name.trim() ? <Notice tone="warning"><CircleHelp size={18} /><span>No local starter reference matches this meal. Enter a portion and review the values below; mixed dishes need ingredient context.</span></Notice> : null}<label className="field"><span>Notes <em>Optional</em></span><input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={200} placeholder="Recipe, ingredients, oil, ghee, or anything to remember" /></label></div><div className="photo-picker"><label className="photo-dropzone"><input type="file" accept="image/png,image/jpeg,image/webp" capture="environment" onChange={fileSelected} /><ImagePlus size={25} /><strong>{imageName ? 'Photo attached locally' : 'Attach a food photo'}</strong><small>{imageName || 'PNG, JPG or WebP · stays in this browser preview only'}</small></label>{imagePreview && <img src={imagePreview} alt="Selected meal preview" />}<Notice tone="warning"><Camera size={18} /><span><strong>Photo analysis unavailable.</strong> A photo alone cannot reliably calculate nutrients. Confirm ingredients and portion manually before saving.</span></Notice></div></div><div className="nutrient-editor"><div><p className="eyebrow">Review estimate</p><h3>Nutrition breakdown</h3><p>These values are always editable. Missing values can be left at zero.</p></div><div className="nutrient-input-grid">{nutrientFields.map(({ key, label, unit, step }) => <label key={key}><span>{label} <em>{unit}</em></span><input type="number" min="0" step={step} value={nutrients[key] ?? 0} onChange={(event) => setNutrients((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div><p className="fine-print">Do not use a meal estimate to self-diagnose iron, zinc, vitamin B12, or other nutrient deficiencies.</p></div>{error && <Notice tone="warning">{error}</Notice>}<div className="form-actions"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}><Plus size={17} /> Save meal</Button></div></section></div>
}

function Companion({ data }: { data: AppData }) {
  const [question, setQuestion] = useState('')
  const [reply, setReply] = useState<string | null>(null)
  const today = todayKey()
  const todayLog = data.dailyLogs.find((entry) => entry.date === today)
  const recentLogs = data.dailyLogs.slice(0, 8)

  const ask = () => {
    const lower = question.toLowerCase()
    const urgentWords = ['faint', 'pass out', 'pregnan', 'severe pain', 'can\'t breathe', 'cannot breathe', 'heavy bleeding', 'soaking']
    if (urgentWords.some((word) => lower.includes(word))) {
      setReply('Because you mentioned a possible warning sign, Flowra cannot safely answer this as a routine wellness question. If you have severe or rapidly worsening pain, fainting, difficulty breathing, very heavy bleeding, or possible pregnancy with pain or bleeding, seek prompt in-person medical assessment. If you feel in immediate danger, contact local emergency services.'); return
    }
    if (!todayLog) {
      setReply('I do not have a check-in for today yet, so I cannot personalize this safely. You can log pain, flow, energy, stress, and symptoms first. In general, I can help you turn your own records into questions to discuss with a clinician, but I cannot diagnose a condition.'); return
    }
    const safety = evaluateSafety(todayLog)
    if (safety.some((alert) => alert.severity === 'urgent')) {
      setReply(`Your saved check-in includes a concern that should come before a general answer: ${safety.find((alert) => alert.severity === 'urgent')?.action} Flowra cannot determine the cause.`); return
    }
    const recurringBloating = recentLogs.filter((log) => log.bloatingScore >= 5).length
    const descriptors = [`today you recorded pain ${todayLog.painScore}/10`, `stress ${todayLog.stressScore}/10`, `energy ${todayLog.energyScore}/10`, `and mood ${formatMood(todayLog.mood).toLowerCase()}`]
    const pattern = recurringBloating >= 3 ? ` You recorded higher bloating on ${recurringBloating} of your last ${recentLogs.length} check-ins; that is an observation, not proof of a cause.` : ''
    setReply(`Based on the entries you chose to save, ${descriptors.join(', ')}.${pattern} I cannot diagnose why you feel this way. If symptoms are new, worsening, unusually severe, or affecting daily life, consider speaking with a qualified clinician. Gentle rest, hydration, a warm compress, or movement may be reasonable only if they feel safe and comfortable for you. What feels different from your usual pattern?`)
  }

  return <>
    <Card className="companion-hero"><div><span className="companion-orb"><Bot size={29} /></span><p className="eyebrow">Flowra Health Companion</p><h2>Private, safety-first reflection.</h2><p>This local prototype uses your saved entries and deterministic safety rules. It is not a clinician, diagnostic service, or cloud AI integration.</p></div><Pill tone="sage">No data sent</Pill></Card>
    <Notice tone="warning"><AlertTriangle size={19} /><div><strong>Always use urgent care when needed.</strong><span>The companion will not diagnose, prescribe medication, infer pregnancy, or reassure away severe warning signs.</span></div></Notice>
    <Card className="companion-chat"><div className="companion-chat__intro"><MessageCircleHeart size={22} /><div><h3>What would you like to understand?</h3><p>Try: “My period is due soon, I have cramps, and my stress is high.”</p></div></div>{reply && <div className="companion-reply"><span>Flowra</span><p>{reply}</p></div>}<label className="companion-input"><textarea value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 500))} rows={4} maxLength={500} placeholder="Tell Flowra what is going on…" /><Button onClick={ask} disabled={!question.trim()} aria-label="Ask companion"><Send size={18} /> Ask</Button></label><p className="fine-print">Your question is processed in this browser only in the current build. A server-side health AI provider must be explicitly configured and consented to before any cloud processing is introduced.</p></Card>
    <Card className="companion-context"><p className="eyebrow">Available context</p><h3>The companion can only use what you save.</h3><div>{['Cycle history', 'Daily symptoms & scores', 'Sleep & water', 'Saved meal estimates', 'Medication records'].map((item) => <span key={item}><Sparkles size={15} /> {item}</span>)}</div><p>It does not infer missing health data, and it does not claim that one tracked factor caused another.</p></Card>
  </>
}
