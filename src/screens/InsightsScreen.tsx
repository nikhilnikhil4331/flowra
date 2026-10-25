import { AlertTriangle, ArrowRight, Bot, Camera, ChevronRight, CircleHelp, Droplets, HeartPulse, ImagePlus, Info, Leaf, LoaderCircle, MessageCircleHeart, Plus, Salad, Send, Sparkles, Trash2, TrendingUp, Utensils, X } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import type { AppData, CyclePrediction, MealEntry, MealNutrients } from '../domain/types'
import { daysBetween, humanDate, todayKey } from '../domain/cycle'
import { evaluateSafety } from '../domain/safety'
import { emptyNutrients, findFoodReference, formatNutrient, scaleNutrients, totalNutrients } from '../domain/nutrition'
import { Button, Card, EmptyState, Notice, Pill, ProgressBar } from '../components/ui'
import { Chibi } from '../components/MyfloArt'
import { createId, nowIso } from '../lib/store'

type InsightTab = 'history' | 'nutrition' | 'companion'
type HistoryTab = 'cycle' | 'symptoms' | 'mood'

interface InsightsScreenProps {
  data: AppData
  prediction: CyclePrediction
  onAddMeal: (meal: MealEntry) => void
  onDeleteMeal: (id: string) => void
  onOpenTrack: () => void
  initialScreen?: InsightTab
  openMealRequest?: number
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

export function InsightsScreen({ data, prediction, onAddMeal, onDeleteMeal, onOpenTrack, initialScreen = 'history', openMealRequest = 0 }: InsightsScreenProps) {
  const [tab, setTab] = useState<InsightTab>(initialScreen)
  const today = todayKey()
  const todayLog = data.dailyLogs.find((entry) => entry.date === today)
  const alerts = todayLog ? evaluateSafety(todayLog) : []

  useEffect(() => setTab(initialScreen), [initialScreen])

  return <div className="screen screen--insights myflo-insights-screen">
    <header className="myflo-page-header myflo-insights-header"><span className="myflo-back-button myflo-back-button--passive"><Leaf size={19} /></span><h1>{tab === 'history' ? 'Cycle History' : tab === 'nutrition' ? 'Food Scanner' : 'Myflo Companion'}</h1><button className="myflo-insights-switch" onClick={() => setTab((current) => current === 'history' ? 'nutrition' : current === 'nutrition' ? 'companion' : 'history')} aria-label="Switch insight section">•••</button></header>
    {tab !== 'history' && <div className="myflo-mini-tabs"><button onClick={() => setTab('history')}>History</button><button className={tab === 'nutrition' ? 'is-selected' : ''} onClick={() => setTab('nutrition')}>Food</button><button className={tab === 'companion' ? 'is-selected' : ''} onClick={() => setTab('companion')}>Companion</button></div>}
    {alerts.length > 0 && <Notice tone={alerts.some((alert) => alert.severity === 'urgent') ? 'urgent' : 'warning'}><AlertTriangle size={19} /><div><strong>{alerts[0].title}</strong><span>{alerts[0].action}</span></div></Notice>}
    {tab === 'history' && <CycleHistory data={data} prediction={prediction} onOpenTrack={onOpenTrack} />}
    {tab === 'nutrition' && <NutritionDashboard data={data} onAddMeal={onAddMeal} onDeleteMeal={onDeleteMeal} openMealRequest={openMealRequest} />}
    {tab === 'companion' && <Companion data={data} />}
  </div>
}

function CycleHistory({ data, prediction, onOpenTrack }: { data: AppData; prediction: CyclePrediction; onOpenTrack: () => void }) {
  const [active, setActive] = useState<HistoryTab>('cycle')
  const cycles = [...data.cycles].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const recorded = cycles.slice(1).map((entry, index) => ({
    entry,
    length: daysBetween(cycles[index].startDate, entry.startDate),
    periodLength: entry.endDate ? daysBetween(entry.startDate, entry.endDate) + 1 : undefined,
  })).filter((item) => item.length >= 15 && item.length <= 90)
  const recent = [...recorded].slice(-5).reverse()
  const average = recorded.length ? Math.round(recorded.reduce((total, item) => total + item.length, 0) / recorded.length) : undefined
  const shortest = recorded.length ? Math.min(...recorded.map((item) => item.length)) : undefined
  const longest = recorded.length ? Math.max(...recorded.map((item) => item.length)) : undefined
  const maxChart = Math.max(35, ...(recorded.map((item) => item.length)))
  const chartPoints = recorded.map((item, index) => {
    const x = recorded.length === 1 ? 50 : 8 + (index / (recorded.length - 1)) * 84
    const y = 88 - ((item.length - 15) / Math.max(1, maxChart - 15)) * 74
    return `${x},${Math.max(10, Math.min(88, y))}`
  }).join(' ')
  const symptomCounts = data.dailyLogs.reduce<Record<string, number>>((counts, log) => {
    log.symptoms.forEach((symptom) => { counts[symptom] = (counts[symptom] ?? 0) + 1 })
    return counts
  }, {})
  const moodCounts = data.dailyLogs.reduce<Record<string, number>>((counts, log) => {
    if (log.mood) counts[log.mood] = (counts[log.mood] ?? 0) + 1
    return counts
  }, {})
  const commonSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const commonMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]).slice(0, 4)

  return <>
    <div className="myflo-history-tabs" role="tablist" aria-label="Cycle history sections"><button className={active === 'cycle' ? 'is-selected' : ''} onClick={() => setActive('cycle')} role="tab" aria-selected={active === 'cycle'}>Cycle Length</button><button className={active === 'symptoms' ? 'is-selected' : ''} onClick={() => setActive('symptoms')} role="tab" aria-selected={active === 'symptoms'}>Symptoms</button><button className={active === 'mood' ? 'is-selected' : ''} onClick={() => setActive('mood')} role="tab" aria-selected={active === 'mood'}>Mood</button></div>
    {active === 'cycle' && <>
      <Card className="myflo-history-summary"><div><p>{recorded.length ? `Your recorded cycle length ranges from ${shortest}–${longest} days.` : 'Your cycle history will appear here as you record period starts.'}</p><small>{recorded.length ? `${recorded.length} recorded interval${recorded.length === 1 ? '' : 's'} · individual cycles can vary` : 'Myflo never assumes a fixed 28-day cycle.'}</small></div><Chibi mood={data.profile.cycleIsIrregular ? 'confused' : 'happy'} size="md" /></Card>
      <Card className="myflo-history-chart-card"><div className="myflo-history-chart-title"><div><h2>Cycle Length</h2><small>{average ? `Average ${average} days` : 'Need two recorded starts'}</small></div>{data.profile.cycleIsIrregular && <Pill tone="lavender">Variation noted</Pill>}</div>{recorded.length >= 2 ? <><svg className="myflo-cycle-line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Recorded cycle lengths line chart"><line x1="7" y1="88" x2="95" y2="88" /><line x1="7" y1="50" x2="95" y2="50" /><polyline points={chartPoints} /><g>{recorded.map((item, index) => { const [x, y] = chartPoints.split(' ')[index].split(','); return <circle key={item.entry.id} cx={x} cy={y} r="2.8" /> })}</g></svg><div className="myflo-cycle-line-labels">{recorded.map((item) => <span key={item.entry.id}>{humanDate(item.entry.startDate, { month: 'short' })}</span>)}</div></> : <div className="myflo-history-empty"><TrendingUp size={24} /><p>Log one more period start to see your personal cycle-length trend.</p><Button variant="secondary" onClick={onOpenTrack}>Log today</Button></div>}</Card>
      <section className="myflo-recent-cycles"><div className="myflo-section-title"><h2>Recent Cycles</h2><span>{recent.length ? `${recent.length} recorded` : 'No intervals yet'}</span></div>{recent.length ? recent.map((cycle) => <div className="myflo-recent-cycle-row" key={cycle.entry.id}><strong>{cycle.length} days</strong><span><i style={{ width: `${Math.min(100, (cycle.length / Math.max(35, maxChart)) * 100)}%` }} /></span><small>{humanDate(cycle.entry.startDate, { day: 'numeric', month: 'short' })}{cycle.entry.endDate ? ` · ${cycle.periodLength} day period` : ''}</small></div>) : <Card className="myflo-history-empty-card"><p>When you record consecutive period starts, Myflo will show actual cycle intervals here.</p></Card>}</section>
      <section className="myflo-cycle-insight"><Chibi mood="calm" size="md" /><div><h3>Cycle Insight</h3><p>{prediction.nextPeriodStart ? `Your next cycle estimate is ${humanDate(prediction.nextPeriodStart)}. It is ${prediction.confidence} confidence based on your own recorded history.` : 'More history gives you a more personal estimate. Predictions stay cautious when data is limited or cycles vary.'}</p></div></section>
    </>}
    {active === 'symptoms' && <Card className="myflo-history-list"><div className="myflo-history-chart-title"><div><h2>Symptoms you recorded</h2><small>Across {data.dailyLogs.length} saved check-in{data.dailyLogs.length === 1 ? '' : 's'}</small></div></div>{commonSymptoms.length ? commonSymptoms.map(([symptom, count]) => <div key={symptom} className="myflo-stat-list-row"><span><Chibi mood="anxious" size="xs" /></span><div><strong>{symptom.replace('_', ' ')}</strong><small>Recorded {count} time{count === 1 ? '' : 's'}</small></div><b>{count}</b></div>) : <EmptyState icon={<Sparkles size={24} />} title="No symptom pattern yet" description="Save symptom check-ins to see only the patterns you actually record." action={<Button onClick={onOpenTrack}>Log symptoms</Button>} />}</Card>}
    {active === 'mood' && <Card className="myflo-history-list"><div className="myflo-history-chart-title"><div><h2>Mood check-ins</h2><small>Only moods you chose to record are shown.</small></div></div>{commonMoods.length ? commonMoods.map(([mood, count]) => <div key={mood} className="myflo-stat-list-row"><span><Chibi mood={mood} size="xs" /></span><div><strong>{formatMood(mood)}</strong><small>Recorded {count} time{count === 1 ? '' : 's'}</small></div><b>{count}</b></div>) : <EmptyState icon={<HeartPulse size={24} />} title="No mood pattern yet" description="Mood entries are optional. Add one only when it helps you reflect." action={<Button onClick={onOpenTrack}>Open symptom log</Button>} />}</Card>}
    <Notice tone="info"><Info size={18} /><div><strong>Patterns are observations, not proof.</strong><span>These charts describe your own saved records. They cannot confirm a cause or a medical condition.</span></div></Notice>
  </>
}

function NutritionDashboard({ data, onAddMeal, onDeleteMeal, openMealRequest = 0 }: { data: AppData; onAddMeal: (meal: MealEntry) => void; onDeleteMeal: (id: string) => void; openMealRequest?: number }) {
  const today = todayKey()
  const todayMeals = data.meals.filter((entry) => entry.date === today)
  const total = totalNutrients(todayMeals)
  const weeklyDates = Array.from({ length: 7 }, (_, index) => { const date = new Date(`${today}T00:00:00Z`); date.setUTCDate(date.getUTCDate() - (6 - index)); return date.toISOString().slice(0, 10) })
  const weeklyCalories = weeklyDates.map((date) => ({ date, total: totalNutrients(data.meals.filter((entry) => entry.date === date)).calories }))
  const maxCalories = Math.max(500, ...weeklyCalories.map((entry) => entry.total))
  const [showComposer, setShowComposer] = useState(false)
  useEffect(() => { if (openMealRequest > 0) setShowComposer(true) }, [openMealRequest])

  return <>
    <section className="nutrition-summary-grid"><Card className="nutrition-total-card"><div><p className="eyebrow">Today’s estimated intake</p><h2>{total.calories} <small>kcal</small></h2><p>From {todayMeals.length} saved meal{todayMeals.length === 1 ? '' : 's'}. Values are editable estimates.</p></div><span className="metric-icon metric-icon--amber"><Salad size={22} /></span></Card><Card className="macro-card"><div><span>Protein</span><strong>{formatNutrient(total.proteinG, 'g', 1)}</strong><ProgressBar value={total.proteinG} max={50} tone="sage" /></div><div><span>Fiber</span><strong>{formatNutrient(total.fiberG, 'g', 1)}</strong><ProgressBar value={total.fiberG} max={25} tone="lavender" /></div><div><span>Iron</span><strong>{formatNutrient(total.ironMg, 'mg', 1)}</strong><ProgressBar value={total.ironMg ?? 0} max={18} tone="rose" /></div><div><span>Zinc</span><strong>{formatNutrient(total.zincMg, 'mg', 1)}</strong><ProgressBar value={total.zincMg ?? 0} max={8} tone="amber" /></div></Card></section>
    <Notice tone="info"><Info size={19} /><div><strong>Nutrition estimates are not lab results.</strong><span>Portion size, recipes, oil, ghee, sauces, and ingredients can meaningfully change results. This dashboard does not diagnose nutrient deficiencies.</span></div></Notice>

    <Card className="scanner-card"><div className="scanner-card__top"><div><p className="eyebrow">Food photo scanner</p><h2>Confirm before you save.</h2><p>Photos cannot reliably identify every ingredient, portion, or hidden oil. Myflo keeps you in control of every estimate.</p></div><span className="scanner-icon"><Camera size={28} /></span></div><div className="scanner-steps"><span><b>1</b> Add photo or meal name</span><span><b>2</b> Confirm portion & ingredients</span><span><b>3</b> Review nutrition estimate</span><span><b>4</b> Save it to your day</span></div><Button onClick={() => setShowComposer(true)}><Plus size={18} /> Add a meal manually</Button><p className="fine-print"><strong>Cloud photo analysis is not configured in this build.</strong> A production server-side vision provider and validated nutrition database are required before food-photo analysis can be enabled. No uploaded image is sent anywhere here.</p></Card>

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
      setReply('Because you mentioned a possible warning sign, Myflo cannot safely answer this as a routine wellness question. If you have severe or rapidly worsening pain, fainting, difficulty breathing, very heavy bleeding, or possible pregnancy with pain or bleeding, seek prompt in-person medical assessment. If you feel in immediate danger, contact local emergency services.'); return
    }
    if (!todayLog) {
      setReply('I do not have a check-in for today yet, so I cannot personalize this safely. You can log pain, flow, energy, stress, and symptoms first. In general, I can help you turn your own records into questions to discuss with a clinician, but I cannot diagnose a condition.'); return
    }
    const safety = evaluateSafety(todayLog)
    if (safety.some((alert) => alert.severity === 'urgent')) {
      setReply(`Your saved check-in includes a concern that should come before a general answer: ${safety.find((alert) => alert.severity === 'urgent')?.action} Myflo cannot determine the cause.`); return
    }
    const recurringBloating = recentLogs.filter((log) => log.bloatingScore >= 5).length
    const descriptors = [`today you recorded pain ${todayLog.painScore}/10`, `stress ${todayLog.stressScore}/10`, `energy ${todayLog.energyScore}/10`, `and mood ${formatMood(todayLog.mood).toLowerCase()}`]
    const pattern = recurringBloating >= 3 ? ` You recorded higher bloating on ${recurringBloating} of your last ${recentLogs.length} check-ins; that is an observation, not proof of a cause.` : ''
    setReply(`Based on the entries you chose to save, ${descriptors.join(', ')}.${pattern} I cannot diagnose why you feel this way. If symptoms are new, worsening, unusually severe, or affecting daily life, consider speaking with a qualified clinician. Gentle rest, hydration, a warm compress, or movement may be reasonable only if they feel safe and comfortable for you. What feels different from your usual pattern?`)
  }

  return <>
    <Card className="companion-hero"><div><span className="companion-orb"><Bot size={29} /></span><p className="eyebrow">Myflo Health Companion</p><h2>Private, safety-first reflection.</h2><p>This local prototype uses your saved entries and deterministic safety rules. It is not a clinician, diagnostic service, or cloud AI integration.</p></div><Pill tone="sage">No data sent</Pill></Card>
    <Notice tone="warning"><AlertTriangle size={19} /><div><strong>Always use urgent care when needed.</strong><span>The companion will not diagnose, prescribe medication, infer pregnancy, or reassure away severe warning signs.</span></div></Notice>
    <Card className="companion-chat"><div className="companion-chat__intro"><MessageCircleHeart size={22} /><div><h3>What would you like to understand?</h3><p>Try: “My period is due soon, I have cramps, and my stress is high.”</p></div></div>{reply && <div className="companion-reply"><span>Myflo</span><p>{reply}</p></div>}<label className="companion-input"><textarea value={question} onChange={(event) => setQuestion(event.target.value.slice(0, 500))} rows={4} maxLength={500} placeholder="Tell Myflo what is going on…" /><Button onClick={ask} disabled={!question.trim()} aria-label="Ask companion"><Send size={18} /> Ask</Button></label><p className="fine-print">Your question is processed in this browser only in the current build. A server-side health AI provider must be explicitly configured and consented to before any cloud processing is introduced.</p></Card>
    <Card className="companion-context"><p className="eyebrow">Available context</p><h3>The companion can only use what you save.</h3><div>{['Cycle history', 'Daily symptoms & scores', 'Sleep & water', 'Saved meal estimates', 'Medication records'].map((item) => <span key={item}><Sparkles size={15} /> {item}</span>)}</div><p>It does not infer missing health data, and it does not claim that one tracked factor caused another.</p></Card>
  </>
}
