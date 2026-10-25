import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { AppNavigation, Button, Notice } from './components/ui'
import { Onboarding, type OnboardingValues } from './components/Onboarding'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { TrackScreen } from './screens/TrackScreen'
import { InsightsScreen } from './screens/InsightsScreen'
import { MoreScreen } from './screens/MoreScreen'
import { FlowGuideScreen } from './screens/FlowGuideScreen'
import type { AppView, } from './components/ui'
import { predictCycle } from './domain/cycle'
import { createId, nowIso, useFlowraStore } from './lib/store'
import { scheduleLocalReminders } from './lib/reminders'

export default function App() {
  const store = useFlowraStore()
  const [view, setView] = useState<AppView>('home')
  const [showFlowGuide, setShowFlowGuide] = useState(false)
  const [showStorageNotice, setShowStorageNotice] = useState(true)
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
    if (values.periodStart) {
      store.upsertCycle({ id: createId('cycle'), startDate: values.periodStart, createdAt: timestamp, updatedAt: timestamp })
    }
  }

  const navigate = (next: AppView) => { setShowFlowGuide(false); setView(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const openFlowGuide = () => { setShowFlowGuide(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  if (!store.data.profile.setupComplete) return <Onboarding onComplete={completeOnboarding} />

  return <div className="app-shell">
    <AppNavigation current={view} onNavigate={navigate} />
    <main className="app-main">
      {store.storageError && showStorageNotice && <Notice tone="warning"><AlertCircle size={19} /><div><strong>Your latest change may not have been saved.</strong><span>Browser storage is unavailable or full. Export any visible information and check browser privacy settings.</span></div><Button variant="icon" aria-label="Dismiss storage warning" onClick={() => setShowStorageNotice(false)}><X size={17} /></Button></Notice>}
      {showFlowGuide ? <FlowGuideScreen onBack={() => setShowFlowGuide(false)} onLogFlow={() => { setShowFlowGuide(false); navigate('track') }} /> : <>
        {view === 'home' && <HomeScreen data={store.data} prediction={prediction} onNavigate={navigate} />}
        {view === 'calendar' && <CalendarScreen data={store.data} prediction={prediction} onSaveCycle={store.upsertCycle} onDeleteCycle={store.deleteCycle} onNavigate={navigate} />}
        {view === 'track' && <TrackScreen logs={store.data.dailyLogs} onSave={store.upsertLog} onOpenFlowGuide={openFlowGuide} />}
        {view === 'insights' && <InsightsScreen data={store.data} prediction={prediction} onAddMeal={store.addMeal} onDeleteMeal={store.deleteMeal} onOpenTrack={() => navigate('track')} />}
        {view === 'more' && <MoreScreen data={store.data} onUpdateProfile={store.updateProfile} onUpdateConsent={store.updateConsent} onUpsertReminder={store.upsertReminder} onDeleteReminder={store.deleteReminder} onAddMedication={store.addMedication} onResetData={() => { store.resetData(); setView('home') }} onOpenFlowGuide={openFlowGuide} />}
      </>}
    </main>
  </div>
}
