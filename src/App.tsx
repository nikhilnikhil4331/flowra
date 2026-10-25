import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { AppNavigation, Button, Notice, QuickActionSheet, type AppView, type QuickAction } from './components/ui'
import { FloralLineArt, MobileStatusBar } from './components/MyfloArt'
import { Onboarding, type OnboardingValues } from './components/Onboarding'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { TrackScreen } from './screens/TrackScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { MoreScreen } from './screens/MoreScreen'
import { FlowGuideScreen } from './screens/FlowGuideScreen'
import { predictCycle } from './domain/cycle'
import { createId, nowIso, useMyfloStore } from './lib/store'
import { scheduleLocalReminders } from './lib/reminders'

type InsightsLaunch = 'history' | 'nutrition' | 'companion'

export default function App() {
  const store = useMyfloStore()
  const [view, setView] = useState<AppView>('home')
  const [showFlowGuide, setShowFlowGuide] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showStorageNotice, setShowStorageNotice] = useState(true)
  const [insightsLaunch, setInsightsLaunch] = useState<InsightsLaunch>('history')
  const [openPeriodRequest, setOpenPeriodRequest] = useState(0)
  const [openMealRequest, setOpenMealRequest] = useState(0)
  const prediction = predictCycle(store.data.cycles)

  useEffect(() => {
    if (!store.data.consent.localNotifications) return
    return scheduleLocalReminders(store.data.reminders, (id, at) => {
      const current = store.data.reminders.find((reminder) => reminder.id === id)
      if (current) store.upsertReminder({ ...current, lastNotifiedAt: at })
    })
  }, [store.data.consent.localNotifications, store.data.reminders, store.upsertReminder])

  const completeOnboarding = (values: OnboardingValues) => {
    const timestamp = nowIso()
    store.updateProfile({ displayName: values.displayName, cycleIsIrregular: values.cycleIsIrregular, setupComplete: true })
    store.updateConsent({ aiProcessing: values.consentAI, acceptedAt: timestamp })
    if (values.periodStart) store.upsertCycle({ id: createId('cycle'), startDate: values.periodStart, createdAt: timestamp, updatedAt: timestamp })
  }

  const navigate = (next: AppView) => {
    setShowFlowGuide(false)
    setShowQuickActions(false)
    if (next === 'insights') setInsightsLaunch('history')
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.querySelector<HTMLElement>('.app-main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openFlowGuide = () => { setShowQuickActions(false); setShowFlowGuide(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleQuickAction = (action: QuickAction) => {
    setShowQuickActions(false)
    if (action === 'period') { setOpenPeriodRequest((value) => value + 1); setView('calendar'); return }
    if (action === 'symptoms' || action === 'note') { navigate('track'); return }
    if (action === 'food') { setOpenMealRequest((value) => value + 1); setInsightsLaunch('nutrition'); setView('insights'); return }
    if (action === 'medicine') { setView('more'); return }
  }

  if (!store.data.profile.setupComplete) return <Onboarding onComplete={completeOnboarding} />

  return <div className="app-shell myflo-phone-shell">
    <MobileStatusBar />
    <FloralLineArt position="top-right" />
    <main className="app-main">
      {store.storageError && showStorageNotice && <Notice tone="warning"><AlertCircle size={19} /><div><strong>Your latest change may not have been saved.</strong><span>Browser storage is unavailable or full. Export any visible information and check browser privacy settings.</span></div><Button variant="icon" aria-label="Dismiss storage warning" onClick={() => setShowStorageNotice(false)}><X size={17} /></Button></Notice>}
      {showFlowGuide ? <FlowGuideScreen onBack={() => setShowFlowGuide(false)} onLogFlow={() => { setShowFlowGuide(false); navigate('track') }} /> : <>
        {view === 'home' && <HomeScreen data={store.data} prediction={prediction} onNavigate={navigate} />}
        {view === 'calendar' && <CalendarScreen data={store.data} prediction={prediction} onSaveCycle={store.upsertCycle} onDeleteCycle={store.deleteCycle} onNavigate={navigate} openPeriodRequest={openPeriodRequest} />}
        {view === 'track' && <TrackScreen logs={store.data.dailyLogs} onSave={store.upsertLog} onDelete={store.deleteLog} onOpenFlowGuide={openFlowGuide} onBack={() => navigate('home')} />}
        {view === 'insights' && <InsightsScreen data={store.data} prediction={prediction} onAddMeal={store.addMeal} onDeleteMeal={store.deleteMeal} onOpenTrack={() => navigate('track')} initialScreen={insightsLaunch} openMealRequest={openMealRequest} />}
        {view === 'more' && <MoreScreen data={store.data} onUpdateProfile={store.updateProfile} onUpdateConsent={store.updateConsent} onUpsertReminder={store.upsertReminder} onDeleteReminder={store.deleteReminder} onAddMedication={store.addMedication} onResetData={() => { store.resetData(); setView('home') }} onOpenFlowGuide={openFlowGuide} />}
      </>}
    </main>
    <AppNavigation current={view} onNavigate={navigate} onQuickAction={() => setShowQuickActions(true)} />
    {showQuickActions && <QuickActionSheet onClose={() => setShowQuickActions(false)} onSelect={handleQuickAction} />}
  </div>
}
