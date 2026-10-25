import { Bell, CalendarDays, ChevronRight, Droplet, GlassWater, Pill, Sparkles, Utensils } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { AppData, CyclePrediction } from '../domain/types'
import { getCurrentCycleDay, getCyclePhase, humanDate, todayKey } from '../domain/cycle'
import { evaluateSafety, formatBleeding } from '../domain/safety'
import { Blossom, Chibi } from '../components/MyfloArt'
import { Notice } from '../components/ui'

interface HomeScreenProps {
  data: AppData
  prediction: CyclePrediction
  onNavigate: (view: 'calendar' | 'track' | 'insights' | 'more' | 'medicineCare') => void
}

function daysUntilDate(target: string | undefined, today: string): number | undefined {
  if (!target) return undefined
  return Math.max(0, Math.round((new Date(`${target}T00:00:00Z`).getTime() - new Date(`${today}T00:00:00Z`).getTime()) / 86_400_000))
}

function CycleWidget({ cycleDay, phase, prediction, onOpen }: { cycleDay?: number; phase: string; prediction: CyclePrediction; onOpen: () => void }) {
  const total = prediction.averageCycleLength || 28
  const progress = cycleDay ? Math.min(100, Math.max(4, (cycleDay / total) * 100)) : 4
  const labels = Array.from({ length: 8 }, (_, index) => Math.min(total, 1 + index * Math.max(1, Math.round((total - 1) / 7))))
  const period = phase === 'Menstrual'

  return <button className="myflo-cycle-widget" onClick={onOpen} aria-label="Open detailed cycle calendar">
    <span className="myflo-cycle-widget__guide"><i /></span>
    <span className="myflo-cycle-orbit" style={{ '--cycle-progress': `${progress}%` } as CSSProperties}>
      {labels.map((label, index) => <span key={label} className="myflo-cycle-orbit__label" style={{ '--i': index, '--n': labels.length } as CSSProperties}>{String(label).padStart(2, '0')}</span>)}
      <span className="myflo-cycle-orbit__marker myflo-cycle-orbit__marker--top"><Droplet size={18} fill="currentColor" /></span>
      <span className="myflo-cycle-orbit__marker myflo-cycle-orbit__marker--right"><Droplet size={15} fill="currentColor" /></span>
      <span className="myflo-cycle-center"><Droplet size={30} fill="currentColor" /><strong>{cycleDay ? `Day ${cycleDay}` : 'Your cycle'}</strong><b>{period ? 'Period day' : phase === 'Not estimable' ? 'Start tracking gently' : phase}</b><small>{prediction.averageCycleLength ? 'Cycle estimate only' : 'Log periods to personalise'}</small></span>
    </span>
    {phase !== 'Not estimable' && <span className="myflo-cycle-widget__phase">{phase}</span>}
  </button>
}

export function HomeScreen({ data, prediction, onNavigate }: HomeScreenProps) {
  const today = todayKey()
  const todayLog = data.dailyLogs.find((entry) => entry.date === today)
  const cycleDay = getCurrentCycleDay(data.cycles, today)
  const phase = getCyclePhase(cycleDay, prediction)
  const nextPeriodDays = daysUntilDate(prediction.nextPeriodStart, today)
  const nextPeriodCopy = nextPeriodDays === undefined ? 'Log more cycles for an estimate' : nextPeriodDays === 0 ? 'Estimated to start today' : `Estimated in ${nextPeriodDays} day${nextPeriodDays === 1 ? '' : 's'}`
  const meals = data.meals.filter((entry) => entry.date === today)
  const alert = todayLog ? evaluateSafety(todayLog).find((item) => item.severity === 'urgent') ?? evaluateSafety(todayLog).find((item) => item.severity === 'soon') : undefined
  const name = data.profile.displayName.trim()

  return <div className="screen myflo-home-screen">
    <header className="myflo-home-header">
      <div><h1>Hi{name ? `, ${name}` : ''} <Blossom /></h1><p>Take care of yourself today</p></div>
      <div className="myflo-home-header__actions"><button className="myflo-header-icon myflo-header-icon--bell" onClick={() => onNavigate('more')} aria-label="Open notifications"><Bell size={19} /></button><button className="myflo-home-avatar" onClick={() => onNavigate('more')} aria-label="Open profile"><img src="/assets/home-chibi.png" alt="" /></button></div>
    </header>

    {alert && <Notice tone={alert.severity === 'urgent' ? 'urgent' : 'warning'}><strong>{alert.title}</strong><span>{alert.action}</span><button onClick={() => onNavigate('track')}>Open today’s log <ChevronRight size={15} /></button></Notice>}

    <CycleWidget cycleDay={cycleDay} phase={phase} prediction={prediction} onOpen={() => onNavigate('calendar')} />

    <button className="myflo-next-period-card" onClick={() => onNavigate('calendar')}>
      <span className="myflo-next-period-card__drop"><Droplet size={24} fill="currentColor" /></span>
      <span className="myflo-next-period-card__copy"><small>Next Period</small><strong>{prediction.nextPeriodStart ? humanDate(prediction.nextPeriodStart, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not estimated yet'}</strong><em>{nextPeriodCopy}</em></span>
      <img className="myflo-next-period-card__chibi myflo-next-period-card__chibi-image" src="/assets/home-chibi.png" alt="" aria-hidden="true" />
    </button>

    <section className="myflo-quick-cards" aria-label="Quick checks">
      <button className="myflo-quick-card myflo-quick-card--peach" onClick={() => onNavigate('track')}><Chibi mood={todayLog?.mood ?? 'happy'} size="sm" /><strong>Mood</strong><small>{todayLog?.mood ? `Feeling ${todayLog.mood.replace('_', ' ')}` : 'How are you feeling?'}</small></button>
      <button className="myflo-quick-card myflo-quick-card--blush" onClick={() => onNavigate('track')}><Chibi mood="anxious" size="sm" /><strong>Cramps</strong><small>{todayLog ? `${todayLog.painScore}/10 pain today` : 'Any symptoms?'}</small></button>
      <button className="myflo-quick-card myflo-quick-card--blue" onClick={() => onNavigate('medicineCare')}><Pill size={30} /><strong>Medicine</strong><small>Record what you use</small></button>
    </section>

    <section className="myflo-home-overview">
      <div className="myflo-section-title"><h2>Today</h2><button onClick={() => onNavigate('track')}>View log <ChevronRight size={15} /></button></div>
      <div className="myflo-home-overview__row">
        <button onClick={() => onNavigate('track')}><span><Droplet size={17} fill="currentColor" /></span><div><small>Flow & symptoms</small><strong>{todayLog ? `${formatBleeding(todayLog.bleeding)} · pain ${todayLog.painScore}/10` : 'Not logged yet'}</strong></div></button>
        <button onClick={() => onNavigate('insights')}><span className="is-food"><Utensils size={17} /></span><div><small>Nutrition</small><strong>{meals.length ? `${meals.length} meal${meals.length === 1 ? '' : 's'} saved` : 'Add a meal'}</strong></div></button>
      </div>
      <div className="myflo-home-overview__row myflo-home-overview__row--small">
        <button onClick={() => onNavigate('track')}><GlassWater size={17} /><span>{todayLog?.waterMl ? `${todayLog.waterMl} ml water` : 'Water check-in'}</span></button>
        <button onClick={() => onNavigate('more')}><Sparkles size={17} /><span>{data.reminders.filter((reminder) => reminder.enabled).length} gentle reminder{data.reminders.filter((reminder) => reminder.enabled).length === 1 ? '' : 's'}</span></button>
      </div>
    </section>

    <p className="myflo-home-disclaimer">Cycle and fertile-window dates are estimates, not contraception or a way to determine pregnancy risk.</p>
  </div>
}
