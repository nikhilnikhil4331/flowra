import { Activity, ArrowRight, CalendarDays, ChevronRight, Droplets, GlassWater, HeartPulse, MoonStar, Plus, Sparkles, Utensils, Waves } from 'lucide-react'
import type { AppData, CyclePrediction, DailyLog, SafetyAlert } from '../domain/types'
import { getCurrentCycleDay, getCyclePhase, humanDate, todayKey } from '../domain/cycle'
import { buildDailySummary, evaluateSafety, formatBleeding } from '../domain/safety'
import { Card, Button, EmptyState, Notice, Pill, ProgressBar } from '../components/ui'

interface HomeScreenProps {
  data: AppData
  prediction: CyclePrediction
  onNavigate: (view: 'calendar' | 'track' | 'insights' | 'more') => void
}

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomeScreen({ data, prediction, onNavigate }: HomeScreenProps) {
  const today = todayKey()
  const log = data.dailyLogs.find((entry) => entry.date === today)
  const cycleDay = getCurrentCycleDay(data.cycles, today)
  const phase = getCyclePhase(cycleDay, prediction)
  const alerts = log ? evaluateSafety(log) : []
  const mealsToday = data.meals.filter((entry) => entry.date === today)
  const water = log?.waterMl ?? 0
  const name = data.profile.displayName ? `, ${data.profile.displayName}` : ''
  const daysUntil = prediction.nextPeriodStart ? Math.max(0, Math.ceil((new Date(`${prediction.nextPeriodStart}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000)) : undefined
  const alert = alerts.find((entry) => entry.severity === 'urgent') ?? alerts.find((entry) => entry.severity === 'soon')

  return (
    <div className="screen screen--home">
      <header className="screen-header home-header">
        <div><p className="eyebrow">{greeting()}{name} <span aria-hidden="true">✦</span></p><h1>A gentle check-in for today.</h1></div>
        <button className="avatar" aria-label="Open profile" onClick={() => onNavigate('more')}>{data.profile.displayName ? data.profile.displayName.slice(0, 1).toUpperCase() : 'F'}</button>
      </header>

      {alert && <Notice tone={alert.severity === 'urgent' ? 'urgent' : 'warning'}><strong>{alert.title}</strong><span>{alert.message}</span><button onClick={() => onNavigate('track')}>{alert.action} <ChevronRight size={16} /></button></Notice>}

      <section className="hero-cycle" aria-label="Cycle overview">
        <div className="botanical botanical--hero" aria-hidden="true"><span /><span /><span /></div>
        <div className="cycle-ring" style={{ '--progress': prediction.averageCycleLength && cycleDay ? `${Math.min(100, (cycleDay / prediction.averageCycleLength) * 100)}%` : '14%' } as React.CSSProperties}>
          <div className="cycle-ring__inside">
            {cycleDay ? <><span>Cycle day</span><strong>{cycleDay}</strong><small>{phase}</small></> : <><span>Your cycle</span><strong>—</strong><small>Start tracking when ready</small></>}
          </div>
        </div>
        <div className="hero-cycle__copy">
          <Pill tone={prediction.confidence === 'higher' ? 'sage' : prediction.confidence === 'moderate' ? 'lavender' : 'ivory'}>{prediction.confidence === 'low' ? 'Building your history' : `${prediction.confidence} confidence estimate`}</Pill>
          <h2>{daysUntil === undefined ? 'Log a period to begin' : daysUntil === 0 ? 'Period may start today' : `Period estimate in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`}</h2>
          <p>{prediction.nextPeriodStart ? <><strong>{humanDate(prediction.nextPeriodStart)}</strong>{prediction.nextPeriodEnd && ` – ${humanDate(prediction.nextPeriodEnd)}`}</> : 'Flowra will use your recorded period starts—not a default cycle—to make future estimates.'}</p>
          {prediction.nextPeriodStart && <small className="estimate-note">Estimated, not guaranteed · based on {prediction.basis} recorded interval{prediction.basis === 1 ? '' : 's'}{prediction.variabilityDays !== undefined ? ` · variability ${prediction.variabilityDays} days` : ''}</small>}
          <Button variant="secondary" onClick={() => onNavigate('calendar')}>View cycle calendar <ArrowRight size={17} /></Button>
        </div>
      </section>

      <section className="metric-strip" aria-label="Today at a glance">
        <button onClick={() => onNavigate('track')}><span className="metric-icon metric-icon--rose"><HeartPulse size={19} /></span><span><small>Today’s check-in</small><strong>{log ? 'Saved' : 'Not logged'}</strong></span><ChevronRight size={17} /></button>
        <button onClick={() => onNavigate('track')}><span className="metric-icon metric-icon--blue"><Droplets size={19} /></span><span><small>Water</small><strong>{water ? `${(water / 1000).toFixed(water % 1000 ? 1 : 0)} L` : 'Add water'}</strong></span><ChevronRight size={17} /></button>
        <button onClick={() => onNavigate('insights')}><span className="metric-icon metric-icon--lavender"><Activity size={19} /></span><span><small>Today’s pain</small><strong>{log ? `${log.painScore}/10` : 'Not logged'}</strong></span><ChevronRight size={17} /></button>
      </section>

      <div className="section-heading"><div><p className="eyebrow">Today’s care</p><h2>Small things that add up.</h2></div><button className="text-button" onClick={() => onNavigate('track')}>Open scorecard <ArrowRight size={16} /></button></div>
      {log ? (
        <Card className="today-summary-card">
          <div className="summary-card__top"><span className="summary-heart"><HeartPulse size={21} /></span><div><strong>Your recorded summary</strong><small>{formatBleeding(log.bleeding)} bleeding · {log.mood ? log.mood.replace('_', ' ') : 'mood not logged'}</small></div><Pill tone={log.painScore >= 7 ? 'warning' : 'rose'}>Pain {log.painScore}/10</Pill></div>
          <p>{buildDailySummary(log, data.dailyLogs.filter((entry) => entry.date !== today))}</p>
          <div className="summary-stat-row"><span><Waves size={16} /> Bloating <b>{log.bloatingScore}/10</b></span><span><Sparkles size={16} /> Stress <b>{log.stressScore}/10</b></span><span><MoonStar size={16} /> Energy <b>{log.energyScore}/10</b></span></div>
          <Button variant="ghost" onClick={() => onNavigate('track')}>Edit today’s log <ArrowRight size={16} /></Button>
        </Card>
      ) : (
        <Card><EmptyState icon={<HeartPulse size={26} />} title="No check-in yet" description="A few honest details can help you notice patterns over time. You can skip anything you don’t want to record." action={<Button onClick={() => onNavigate('track')}><Plus size={18} /> Start today’s check-in</Button>} /></Card>
      )}

      <section className="home-two-columns">
        <Card className="care-card care-card--water">
          <div className="card-title-row"><span className="metric-icon metric-icon--blue"><GlassWater size={19} /></span><div><h3>Hydration</h3><small>{water ? `${water} ml recorded today` : 'A simple check-in can be enough.'}</small></div></div>
          <ProgressBar value={water} max={2500} label={water ? `${water} / 2500 ml` : '0 / 2500 ml'} tone="sage" />
          <button className="inline-action" onClick={() => onNavigate('track')}>Update water <ChevronRight size={16} /></button>
        </Card>
        <Card className="care-card care-card--food">
          <div className="card-title-row"><span className="metric-icon metric-icon--amber"><Utensils size={19} /></span><div><h3>Nutrition log</h3><small>{mealsToday.length ? `${mealsToday.length} meal${mealsToday.length === 1 ? '' : 's'} logged today` : 'No meal logged today'}</small></div></div>
          <p>Keep rough, editable meal estimates—not perfect numbers.</p>
          <button className="inline-action" onClick={() => onNavigate('insights')}>Add or review meals <ChevronRight size={16} /></button>
        </Card>
      </section>

      <Card className="phase-tip-card">
        <div className="phase-tip-card__art" aria-hidden="true"><span>✦</span></div><div><p className="eyebrow">A gentle note</p><h3>{phase === 'Not estimable' ? 'Start with what you know.' : `Your ${phase.toLowerCase()} check-in`}</h3><p>{phase === 'Luteal' ? 'Some people notice changes in energy or mood before a period. Your own logs are more useful than assumptions—notice what feels true for you.' : phase === 'Menstrual' ? 'Rest, hydration, and comfort measures that feel safe for you can be supportive. If pain or bleeding feels different from usual, take it seriously.' : 'There is no “perfect” daily log. Record only what helps you understand your body a little better.'}</p></div><Button variant="icon" onClick={() => onNavigate('insights')} aria-label="Open insights"><ArrowRight size={20} /></Button>
      </Card>
    </div>
  )
}
