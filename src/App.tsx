import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { AppNavigation, Button, Notice, QuickActionSheet, type AppView, type QuickAction } from './components/ui'
import { FloralLineArt, MobileStatusBar } from './components/MyfloArt'
import { Onboarding, type OnboardingValues } from './components/Onboarding'
import { HomeScreen } from './screens/HomeScreen'
import { CalendarScreen } from './screens/CalendarScreen'
import { TrackScreen } from './screens/TrackScreen'
import { FlowGuideScreen } from './screens/FlowGuideScreen'
import { DataScreen, InsightsReferenceScreen, MoreReferenceScreen, MyfloAiScreen, ReminderDetailScreen, RemindersScreen, ReportsScreen, SettingsScreen } from './screens/ReferenceExtraScreens'
import { AddMedicineScreen, BodyTrackerScreen, DailyNutritionScreen, FlowColorScreen, FoodScannerScreen, MedicineCareScreen, NutritionResultScreen, PeriodLogScreen } from './screens/MyfloReferenceScreens'
import { predictCycle } from './domain/cycle'
import { createId, exportData, nowIso, useMyfloStore } from './lib/store'
import { scheduleLocalReminders } from './lib/reminders'
import type { ReminderType } from './domain/types'

export default function App() {
  const store = useMyfloStore()
  const [view, setView] = useState<AppView>('home')
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showStorageNotice, setShowStorageNotice] = useState(true)
  const [scanPreview, setScanPreview] = useState<string | undefined>()
  const [activeReminderType, setActiveReminderType] = useState<ReminderType>('period')
  const prediction = predictCycle(store.data.cycles)

  useEffect(() => {
    if (!store.data.consent.localNotifications) return
    return scheduleLocalReminders(store.data.reminders, (id, at) => {
      const current = store.data.reminders.find((reminder) => reminder.id === id)
      if (current) store.upsertReminder({ ...current, lastNotifiedAt: at })
    }, { nextPeriodStart: prediction.nextPeriodStart, ovulationDate: prediction.ovulationDate })
  }, [store.data.consent.localNotifications, store.data.reminders, store.upsertReminder, prediction.nextPeriodStart, prediction.ovulationDate])

  const completeOnboarding = (values: OnboardingValues) => {
    const timestamp = nowIso()
    store.updateProfile({ displayName: values.displayName, cycleIsIrregular: values.cycleIsIrregular, birthDate: values.birthDate, heightCm: values.heightCm, weightKg: values.weightKg, goals: values.goals, setupComplete: true })
    store.updateConsent({ aiProcessing: values.consentAI, acceptedAt: timestamp })
    if (values.periodStart) store.upsertCycle({ id: createId('cycle'), startDate: values.periodStart, createdAt: timestamp, updatedAt: timestamp })
  }

  const navigate = (next: AppView) => {
    setShowQuickActions(false)
    setView(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    document.querySelector<HTMLElement>('.app-main')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuickAction = (action: QuickAction) => {
    if (action === 'period') { navigate('periodLog'); return }
    if (action === 'symptoms' || action === 'note') { navigate('track'); return }
    if (action === 'food') { navigate('foodScanner'); return }
    if (action === 'medicine') navigate('addMedicine')
  }

  if (!store.data.profile.setupComplete) return <Onboarding onComplete={completeOnboarding} />

  return <div className="app-shell myflo-phone-shell">
    <MobileStatusBar />
    <FloralLineArt position="top-right" />
    <FloralLineArt position="bottom-left" />
    <main className="app-main">
      {store.storageError && showStorageNotice && <Notice tone="warning"><AlertCircle size={19} /><div><strong>Your latest change may not have been saved.</strong><span>Browser storage is unavailable or full. Export any visible information and check browser privacy settings.</span></div><Button variant="icon" aria-label="Dismiss storage warning" onClick={() => setShowStorageNotice(false)}><X size={17} /></Button></Notice>}
      {view === 'home' && <HomeScreen data={store.data} prediction={prediction} onNavigate={navigate} />}
      {view === 'calendar' && <CalendarScreen data={store.data} prediction={prediction} onSaveCycle={store.upsertCycle} onDeleteCycle={store.deleteCycle} onNavigate={navigate} />}
      {view === 'periodLog' && <PeriodLogScreen logs={store.data.dailyLogs} onSaveCycle={store.upsertCycle} onSaveLog={store.upsertLog} onBack={() => navigate('calendar')} />}
      {view === 'track' && <TrackScreen logs={store.data.dailyLogs} onSave={store.upsertLog} onDelete={store.deleteLog} onOpenFlowGuide={() => navigate('flowColor')} onBack={() => navigate('home')} onOpenBodyTracker={() => navigate('bodyTracker')} />}
      {view === 'bodyTracker' && <BodyTrackerScreen logs={store.data.dailyLogs} onSave={store.upsertLog} onBack={() => navigate('track')} />}
      {view === 'insights' && <InsightsReferenceScreen data={store.data} onBack={() => navigate('home')} onOpenAi={() => navigate('myfloAi')} />}
      {view === 'foodScanner' && <FoodScannerScreen meals={store.data.meals} onBack={() => navigate('insights')} onContinue={(preview) => { setScanPreview(preview); navigate('nutritionResult') }} />}
      {view === 'nutritionResult' && <NutritionResultScreen preview={scanPreview} onBack={() => navigate('foodScanner')} onSave={store.addMeal} onSaved={() => navigate('dailyNutrition')} onAddAnother={() => navigate('foodScanner')} />}
      {view === 'dailyNutrition' && <DailyNutritionScreen data={store.data} onBack={() => navigate('insights')} onAdd={() => navigate('foodScanner')} />}
      {view === 'flowColor' && <FlowColorScreen logs={store.data.dailyLogs} onSave={store.upsertLog} onBack={() => navigate('track')} onOpenGuide={() => navigate('flowGuide')} />}
      {view === 'flowGuide' && <FlowGuideScreen onBack={() => navigate('flowColor')} onLogFlow={() => navigate('track')} />}
      {view === 'medicineCare' && <MedicineCareScreen medications={store.data.medications} onBack={() => navigate('more')} onAdd={() => navigate('addMedicine')} onDelete={store.deleteMedication} />}
      {view === 'addMedicine' && <AddMedicineScreen onBack={() => navigate('medicineCare')} onSave={store.addMedication} onAddReminder={store.upsertReminder} />}
      {view === 'reminders' && <RemindersScreen reminders={store.data.reminders} onBack={() => navigate('more')} onUpsert={store.upsertReminder} onOpen={(type) => { setActiveReminderType(type); navigate('reminderDetail') }} />}
      {view === 'reminderDetail' && <ReminderDetailScreen reminderType={activeReminderType} reminders={store.data.reminders} onBack={() => navigate('reminders')} onUpsert={store.upsertReminder} />}
      {view === 'myfloAi' && <MyfloAiScreen data={store.data} onBack={() => navigate('insights')} />}
      {view === 'reports' && <ReportsScreen logs={store.data.dailyLogs} onBack={() => navigate('more')} />}
      {view === 'settings' && <SettingsScreen data={store.data} onBack={() => navigate('more')} onOpenReminders={() => navigate('reminders')} />}
      {view === 'data' && <DataScreen data={store.data} onBack={() => navigate('more')} onExport={() => exportData(store.data)} onReset={() => { store.resetData(); setView('home') }} />}
      {view === 'more' && <MoreReferenceScreen data={store.data} onBack={() => navigate('home')} onOpenData={() => navigate('data')} onOpenSettings={() => navigate('settings')} onOpenReminders={() => navigate('reminders')} onOpenReports={() => navigate('reports')} onOpenAi={() => navigate('myfloAi')} onLogout={() => { if (window.confirm('Log out and erase this private local profile?')) { store.resetData(); setView('home') } }} />}
    </main>
    <AppNavigation current={view} onNavigate={navigate} onQuickAction={() => setShowQuickActions(true)} />
    {showQuickActions && <QuickActionSheet onClose={() => setShowQuickActions(false)} onSelect={handleQuickAction} />}
  </div>
}
