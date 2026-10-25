import { useState, type MouseEvent, type ReactNode } from 'react'
import { ArrowLeft, Bell, BrainCircuit, CalendarDays, ChevronRight, CircleHelp, Clock3, Droplet, FileText, HeartPulse, HelpCircle, Info, LockKeyhole, LogOut, Moon, Pill, ShieldCheck, Sparkles, Star, Trash2, Utensils, Waves } from 'lucide-react'
import type { AppData, DailyLog, Reminder, ReminderType } from '../domain/types'
import { createId, nowIso } from '../lib/store'

const dateKey = () => new Date().toISOString().slice(0, 10)

function Header({ title, onBack, right }: { title: string; onBack: () => void; right?: ReactNode }) {
  return <header className="mirror-header"><button onClick={onBack} aria-label="Go back"><ArrowLeft size={16} /></button><h1>{title}</h1>{right ?? <span />}</header>
}

function MiniSwitch({ checked, onChange, label }: { checked: boolean; onChange: (event: MouseEvent<HTMLButtonElement>) => void; label: string }) {
  return <button className={`mirror-switch ${checked ? 'is-on' : ''}`} onClick={onChange} role="switch" aria-checked={checked} aria-label={label}><i /></button>
}

const reminderTemplates: { type: ReminderType; title: string; subtitle: string; icon: ReactNode; tone: string; time: string; defaultEnabled: boolean }[] = [
  { type: 'period', title: 'Period Reminder', subtitle: 'Notify 3 days before', icon: <Droplet size={16} />, tone: 'pink', time: '09:00', defaultEnabled: true },
  { type: 'appointment', title: 'Ovulation Reminder', subtitle: 'Notify 1 day before', icon: <Sparkles size={16} />, tone: 'lavender', time: '09:00', defaultEnabled: true },
  { type: 'daily_log', title: 'Symptom Check-in', subtitle: 'Daily at 8:00 PM', icon: <HeartPulse size={16} />, tone: 'blush', time: '20:00', defaultEnabled: true },
  { type: 'medication', title: 'Medicine Reminder', subtitle: 'Take it on time', icon: <Pill size={16} />, tone: 'peach', time: '09:00', defaultEnabled: true },
  { type: 'water', title: 'Water Reminder', subtitle: 'Stay hydrated', icon: <Droplet size={16} />, tone: 'blue', time: '13:00', defaultEnabled: false },
  { type: 'nutrition', title: 'Nutrition Reminder', subtitle: 'Log your meal', icon: <Utensils size={16} />, tone: 'orange', time: '13:00', defaultEnabled: true },
  { type: 'sleep', title: 'Sleep Reminder', subtitle: 'Go to bed at 10:00 PM', icon: <Moon size={16} />, tone: 'blue', time: '22:00', defaultEnabled: false },
]

export function RemindersScreen({ reminders, onBack, onUpsert, onOpen }: { reminders: Reminder[]; onBack: () => void; onUpsert: (value: Reminder) => void; onOpen: (type: ReminderType) => void }) {
  const getReminder = (type: ReminderType) => reminders.find((item) => item.type === type)
  const toggle = (template: typeof reminderTemplates[number]) => {
    const current = getReminder(template.type)
    const enabled = current?.enabled ?? template.defaultEnabled
    onUpsert(current ? { ...current, enabled: !enabled } : { id: createId('reminder'), type: template.type, title: template.title, enabled: !enabled, time: template.time, createdAt: nowIso() })
  }
  return <div className="screen mirror-screen mirror-reminders-screen">
    <Header title="Smart Reminders" onBack={onBack} />
    <div className="mirror-reminder-list">{reminderTemplates.map((template) => {
      const reminder = getReminder(template.type)
      const enabled = reminder?.enabled ?? template.defaultEnabled
      return <article className="mirror-reminder-row" key={template.type} onClick={() => onOpen(template.type)}><span className={`mirror-row-icon mirror-row-icon--${template.tone}`}>{template.icon}</span><div><strong>{template.title}</strong><small>{enabled ? reminder?.time === '20:00' ? 'Daily at 8:00 PM' : reminder?.time === '22:00' ? 'Go to bed at 10:00 PM' : template.subtitle : template.subtitle}</small></div><MiniSwitch checked={enabled} label={`Toggle ${template.title}`} onChange={(event) => { event.stopPropagation(); toggle(template) }} /></article>
    })}</div>
  </div>
}

export function ReminderDetailScreen({ reminderType, reminders, onBack, onUpsert }: { reminderType: ReminderType; reminders: Reminder[]; onBack: () => void; onUpsert: (value: Reminder) => void }) {
  const template = reminderTemplates.find((item) => item.type === reminderType) ?? reminderTemplates[0]
  const current = reminders.find((item) => item.type === reminderType)
  const [enabled, setEnabled] = useState(current?.enabled ?? template.defaultEnabled)
  const [daysBefore, setDaysBefore] = useState(current?.daysBefore ?? 3)
  const [time, setTime] = useState(current?.time ?? template.time)
  const [repeat, setRepeat] = useState(current?.repeat === 'once' ? 'Only once' : current?.repeat === 'daily' ? 'Daily' : 'Every cycle')
  const save = () => { onUpsert({ id: current?.id ?? createId('reminder'), type: reminderType, title: template.title, enabled, time, daysBefore, repeat: repeat === 'Only once' ? 'once' : repeat === 'Daily' ? 'daily' : 'every_cycle', createdAt: current?.createdAt ?? nowIso() }); onBack() }
  return <div className="screen mirror-screen mirror-reminder-detail">
    <Header title="Reminder Settings" onBack={onBack} />
    <section className="mirror-reminder-detail-card"><span className={`mirror-row-icon mirror-row-icon--${template.tone}`}>{template.icon}</span><div><h2>{template.title}</h2><p>{template.subtitle}</p></div></section>
    <section className="mirror-option-section"><strong>When to remind</strong>{[3, 1].map((days) => <button key={days} className={daysBefore === days ? 'is-selected' : ''} onClick={() => setDaysBefore(days)}><span><Clock3 size={16} /></span>{days} day{days === 1 ? '' : 's'} before</button>)}<button className={daysBefore === 0 ? 'is-selected' : ''} onClick={() => setDaysBefore(0)}><span><CalendarDays size={16} /></span>On expected date</button></section>
    <section className="mirror-reminder-settings"><label>Time<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label><label>Repeat<select value={repeat} onChange={(event) => setRepeat(event.target.value)}><option>Every cycle</option><option>Only once</option><option>Daily</option></select></label><label className="mirror-detail-toggle"><span>Reminder enabled<small>Open-tab alerts only, if notifications are allowed.</small></span><MiniSwitch checked={enabled} onChange={() => setEnabled((value) => !value)} label="Toggle reminder" /></label></section>
    <button className="mirror-save-button" onClick={save}>Save</button>
  </div>
}

function safeAiReply(question: string, data: AppData): string {
  const message = question.toLowerCase()
  if (/(faint|breath|severe|pregnan|heavy bleeding|soaking)/.test(message)) return 'I cannot safely treat that as a routine check-in. Severe or sudden pain, fainting, difficulty breathing, or possible pregnancy with pain or bleeding needs prompt in-person medical assessment.'
  const logs = data.dailyLogs.slice(0, 5)
  if (!logs.length) return 'I do not have any saved check-ins yet. Log your flow, symptoms, mood, or meals first and I can summarize the patterns you recorded. I cannot diagnose a cause.'
  const recent = logs[0]
  return `Your latest saved check-in includes pain ${recent.painScore}/10, stress ${recent.stressScore}/10, and energy ${recent.energyScore}/10. That is a record of what you entered, not a diagnosis. Gentle rest, warmth, hydration, or movement may be reasonable only if they feel safe and comfortable for you.`
}

export function MyfloAiScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  const [question, setQuestion] = useState('')
  const [reply, setReply] = useState<string | undefined>()
  const ask = () => { if (question.trim()) setReply(safeAiReply(question, data)) }
  return <div className="screen mirror-screen mirror-ai-screen">
    <Header title="Myflo AI" onBack={onBack} />
    <p className="mirror-ai-kicker">Your personal health companion</p>
    <section className="mirror-ai-intro"><img src="/assets/auth-chibi.png" alt="" /><p>Hi! I’m here to understand your cycle, symptoms, nutrition and lifestyle. How can I help you today?</p></section>
    {question && <div className="mirror-ai-user">{question}</div>}
    {reply ? <div className="mirror-ai-reply"><img src="/assets/auth-chibi.png" alt="" /><p>{reply}</p></div> : <div className="mirror-ai-reply mirror-ai-reply--empty"><img src="/assets/auth-chibi.png" alt="" /><div><strong>Private, local reflection</strong><p>Ask about records you chose to save. Myflo AI is not a doctor and does not use a cloud AI service in this build.</p></div></div>}
    <div className="mirror-ai-suggestions"><button onClick={() => setQuestion('How can I use my cycle records?')}>• Use a warm compress</button><button onClick={() => setQuestion('What can I track today?')}>• Stay hydrated</button><button onClick={() => setQuestion('What should I ask a clinician?')}>• Track pain and timing</button></div>
    <div className="mirror-ai-input"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything..." onKeyDown={(event) => { if (event.key === 'Enter') ask() }} /><button onClick={ask} disabled={!question.trim()}>➜</button></div>
  </div>
}

function TimelineBars({ values, labels, tone = 'pink' }: { values: number[]; labels: string[]; tone?: string }) {
  const max = Math.max(1, ...values)
  return <div className={`mirror-bar-chart mirror-bar-chart--${tone}`}>{values.map((value, index) => <div key={`${labels[index]}-${index}`}><i style={{ height: `${Math.max(value ? 22 : 6, (value / max) * 48)}px` }} /><small>{labels[index]}</small></div>)}</div>
}

function cycleIntervals(data: AppData) {
  const cycles = [...data.cycles].sort((a, b) => a.startDate.localeCompare(b.startDate))
  return cycles.slice(1).map((entry, index) => Math.round((new Date(`${entry.startDate}T00:00:00`).getTime() - new Date(`${cycles[index].startDate}T00:00:00`).getTime()) / 86_400_000)).filter((value) => value > 14 && value < 90)
}

export function InsightsReferenceScreen({ data, onBack, onOpenAi }: { data: AppData; onBack: () => void; onOpenAi: () => void }) {
  const [tab, setTab] = useState<'cycle' | 'symptoms' | 'nutrition' | 'mood'>('cycle')
  const intervals = cycleIntervals(data)
  const labels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr']
  const shown = intervals.length ? intervals.slice(-5) : [0, 0, 0, 0, 0]
  const average = intervals.length ? Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length) : undefined
  const symptomCounts = data.dailyLogs.reduce<Record<string, number>>((all, log) => { log.symptoms.forEach((symptom) => { all[symptom] = (all[symptom] ?? 0) + 1 }); return all }, {})
  const nutritionTotal = data.meals.filter((meal) => meal.date === dateKey()).reduce((sum, meal) => sum + meal.nutrients.calories, 0)
  return <div className="screen mirror-screen mirror-insights-screen">
    <Header title="Insights" onBack={onBack} right={<button className="mirror-header-more" onClick={onOpenAi} aria-label="Open Myflo AI"><BrainCircuit size={16} /></button>} />
    <div className="mirror-tabs mirror-tabs--four"><button className={tab === 'cycle' ? 'is-selected' : ''} onClick={() => setTab('cycle')}>Cycle</button><button className={tab === 'symptoms' ? 'is-selected' : ''} onClick={() => setTab('symptoms')}>Symptoms</button><button className={tab === 'nutrition' ? 'is-selected' : ''} onClick={() => setTab('nutrition')}>Nutrition</button><button className={tab === 'mood' ? 'is-selected' : ''} onClick={() => setTab('mood')}>Mood</button></div>
    {tab === 'cycle' && <><section className="mirror-insight-section"><h2>Cycle Length</h2><p>{average ? `Your cycle length is usually around ${average} days.` : 'Log two period starts to personalize this trend.'}</p><div className="mirror-insight-chart"><TimelineBars values={shown} labels={labels} /><span><small>Avg</small><strong>{average ? `${average} days` : '—'}</strong></span></div></section><section className="mirror-insight-section"><h2>Period Duration</h2><p>{data.cycles.some((cycle) => cycle.endDate) ? 'Your recorded periods are shown below.' : 'Add a period end date to show duration.'}</p><div className="mirror-insight-chart"><TimelineBars values={data.cycles.slice(-5).map((cycle) => cycle.endDate ? Math.max(1, Math.round((new Date(`${cycle.endDate}T00:00:00`).getTime() - new Date(`${cycle.startDate}T00:00:00`).getTime()) / 86_400_000) + 1) : 0).concat(Array(Math.max(0, 5 - data.cycles.length)).fill(0)).slice(-5)} labels={labels} tone="peach" /><span><small>Avg</small><strong>{data.cycles.some((cycle) => cycle.endDate) ? 'saved' : '—'}</strong></span></div></section><div className="mirror-insight-note"><img src="/assets/home-chibi.png" alt="" /><p>{average ? 'Your cycles look regular from the recorded starts. Keep tracking!' : 'Your insights will become personal as you add saved records.'}</p></div></>}
    {tab === 'symptoms' && <section className="mirror-insight-section"><h2>Symptoms</h2><p>Only symptoms you actually saved are shown.</p>{Object.keys(symptomCounts).length ? <TimelineBars values={Object.values(symptomCounts).slice(0, 5)} labels={Object.keys(symptomCounts).slice(0, 5).map((entry) => entry.replace('_', ' '))} /> : <div className="mirror-empty-plot">No saved symptom pattern yet</div>}</section>}
    {tab === 'nutrition' && <section className="mirror-insight-section"><h2>Nutrition</h2><p>Today’s saved meal estimates.</p><div className="mirror-nutrition-total"><Utensils size={20} /><strong>{nutritionTotal} kcal</strong><span>{data.meals.filter((meal) => meal.date === dateKey()).length} meal(s)</span></div></section>}
    {tab === 'mood' && <section className="mirror-insight-section"><h2>Mood</h2><p>Patterns are observations, not proof of a cause.</p><div className="mirror-empty-plot">Add mood check-ins to see this view</div></section>}
  </div>
}

export function ReportsScreen({ logs, onBack }: { logs: DailyLog[]; onBack: () => void }) {
  const [tab, setTab] = useState<'cycle' | 'symptoms' | 'nutrition'>('cycle')
  const symptomLabels = ['Cramps', 'Bloating', 'Headache', 'Acne', 'Mood swings']
  const counts = symptomLabels.map((label) => logs.filter((log) => log.symptoms.includes(label.toLowerCase().replace(' ', '_') as DailyLog['symptoms'][number])).length)
  const max = Math.max(1, ...counts)
  const points = logs.slice(0, 5).reverse().map((log, index) => `${10 + index * 20},${76 - log.painScore * 5}`).join(' ')
  return <div className="screen mirror-screen mirror-reports-screen">
    <Header title="Reports" onBack={onBack} />
    <div className="mirror-tabs"><button className={tab === 'cycle' ? 'is-selected' : ''} onClick={() => setTab('cycle')}>Cycle</button><button className={tab === 'symptoms' ? 'is-selected' : ''} onClick={() => setTab('symptoms')}>Symptoms</button><button className={tab === 'nutrition' ? 'is-selected' : ''} onClick={() => setTab('nutrition')}>Nutrition</button></div>
    {tab !== 'nutrition' && <><section className="mirror-report-section"><h2>Symptom Frequency</h2>{symptomLabels.map((label, index) => <div className="mirror-frequency-row" key={label}><span>{label === 'Cramps' ? <HeartPulse size={13} /> : label === 'Bloating' ? <Waves size={13} /> : <Sparkles size={13} />}{label}</span><i><b style={{ width: `${counts[index] ? Math.max(18, counts[index] / max * 100) : 0}%` }} /></i><small>{counts[index] ? `${Math.round(counts[index] / Math.max(1, logs.length) * 100)}%` : '—'}</small></div>)}</section><section className="mirror-report-section"><h2>Pain Trend</h2><svg className="mirror-pain-chart" viewBox="0 0 100 90" preserveAspectRatio="none"><line x1="5" x2="95" y1="76" y2="76" /><line x1="5" x2="95" y1="48" y2="48" /><polyline points={points || '10,76 30,76 50,76 70,76 90,76'} />{(points || '10,76 30,76 50,76 70,76 90,76').split(' ').map((point) => { const [cx, cy] = point.split(','); return <circle key={point} cx={cx} cy={cy} r="2.3" /> })}</svg><div className="mirror-plot-labels"><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span></div></section></>}
    {tab === 'nutrition' && <section className="mirror-report-section"><h2>Nutrition Summary</h2><div className="mirror-empty-plot">Meal charts show once meals are saved.</div></section>}
  </div>
}

const settingItems = [
  { label: 'My Profile', icon: <CircleHelp size={15} /> }, { label: 'Cycle Preferences', icon: <Droplet size={15} /> }, { label: 'Reminder Settings', icon: <Bell size={15} /> }, { label: 'Notification Settings', icon: <Bell size={15} /> }, { label: 'Privacy & Security', icon: <LockKeyhole size={15} /> }, { label: 'Language', icon: <Waves size={15} />, value: 'English' }, { label: 'Help & Support', icon: <HelpCircle size={15} /> }, { label: 'Rate Myflo', icon: <Star size={15} /> }, { label: 'About', icon: <Info size={15} /> },
]

export function SettingsScreen({ onBack, onOpenReminders }: { data: AppData; onBack: () => void; onOpenReminders: () => void }) {
  const [notice, setNotice] = useState('')
  return <div className="screen mirror-screen mirror-settings-screen">
    <Header title="Settings" onBack={onBack} />
    <div className="mirror-setting-list">{settingItems.map((item) => <button key={item.label} onClick={() => item.label === 'Reminder Settings' ? onOpenReminders() : setNotice(`${item.label} stays private on this device in this build.`)}><span>{item.icon}</span><b>{item.label}</b>{item.value && <small>{item.value}</small>}<ChevronRight size={15} /></button>)}</div>
    {notice && <div className="mirror-settings-notice"><ShieldCheck size={15} />{notice}</div>}
    <p className="mirror-settings-fine">Private local mode is active. Manage or export your saved data from My Data.</p>
  </div>
}

export function DataScreen({ data, onBack, onExport, onReset }: { data: AppData; onBack: () => void; onExport: () => void; onReset: () => void }) {
  const [message, setMessage] = useState('')
  return <div className="screen mirror-screen mirror-data-screen">
    <Header title="My Data" onBack={onBack} />
    <section className="mirror-data-summary"><ShieldCheck size={20} /><div><strong>Private local data</strong><p>{data.cycles.length} period record(s), {data.dailyLogs.length} daily check-in(s), and {data.meals.length} meal(s) are stored in this browser.</p></div></section>
    <button className="mirror-data-action" onClick={() => { onExport(); setMessage('Your private JSON export was downloaded.') }}><FileText size={17} /><span><strong>Export My Data</strong><small>Download a copy of your records.</small></span><ChevronRight size={16} /></button>
    <button className="mirror-data-action mirror-data-action--danger" onClick={() => { if (window.confirm('Delete all private Myflo data from this browser? This cannot be undone.')) { onReset(); onBack() } }}><Trash2 size={17} /><span><strong>Delete My Data</strong><small>Remove this local profile and records.</small></span><ChevronRight size={16} /></button>
    {message && <div className="mirror-settings-notice"><Info size={14} />{message}</div>}
  </div>
}

const moreItems = [
  { id: 'data', label: 'My Data', icon: <FileText size={16} /> }, { id: 'reminders', label: 'Reminders', icon: <Bell size={16} /> }, { id: 'notifications', label: 'Notification Settings', icon: <Bell size={16} /> }, { id: 'privacy', label: 'Privacy & Security', icon: <LockKeyhole size={16} /> }, { id: 'help', label: 'Help & Support', icon: <HelpCircle size={16} /> }, { id: 'rate', label: 'Rate Myflo', icon: <Star size={16} /> }, { id: 'about', label: 'About', icon: <Info size={16} /> },
]

export function MoreReferenceScreen({ data, onBack, onOpenData, onOpenSettings, onOpenReminders, onOpenReports, onOpenAi, onLogout }: { data: AppData; onBack: () => void; onOpenData: () => void; onOpenSettings: () => void; onOpenReminders: () => void; onOpenReports: () => void; onOpenAi: () => void; onLogout: () => void }) {
  const [notice, setNotice] = useState('')
  const name = data.profile.displayName || 'Garqi'
  return <div className="screen mirror-screen mirror-more-screen">
    <Header title="More" onBack={onBack} />
    <section className="mirror-profile-card"><img src="/assets/home-chibi.png" alt="" /><div><strong>{name}</strong><small>{data.profile.displayName ? 'Private local profile' : 'garqi@email.com'}</small></div></section>
    <div className="mirror-more-list">{moreItems.map((item) => <button key={item.id} onClick={() => item.id === 'data' ? onOpenData() : item.id === 'reminders' ? onOpenReminders() : item.id === 'rate' ? onOpenReports() : item.id === 'about' ? onOpenAi() : item.id === 'privacy' || item.id === 'notifications' ? onOpenSettings() : setNotice(`${item.label} is available locally in this build.`)}><span>{item.icon}</span><b>{item.label}</b><ChevronRight size={15} /></button>)}</div>
    {notice && <div className="mirror-settings-notice"><Info size={14} />{notice}</div>}
    <button className="mirror-logout" onClick={onLogout}><LogOut size={14} />Log Out</button>
  </div>
}
