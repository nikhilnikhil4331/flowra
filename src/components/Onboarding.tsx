import { ArrowLeft, Check, ChevronRight, CircleCheck, HeartPulse, Moon, Sparkles, Utensils, Waves } from 'lucide-react'
import { useState } from 'react'
import { MobileStatusBar } from './MyfloArt'
import { todayKey } from '../domain/cycle'

export interface OnboardingValues {
  displayName: string
  cycleIsIrregular: boolean
  periodStart?: string
  consentAI: boolean
  birthDate?: string
  heightCm?: number
  weightKg?: number
  goals: string[]
}

type WelcomeStep = 'splash' | 'cycle' | 'more' | 'companion' | 'signup' | 'login' | 'profile' | 'goals'

const goalRows = [
  { id: 'periods', label: 'Track my periods', icon: HeartPulse },
  { id: 'symptoms', label: 'Manage symptoms', icon: Waves },
  { id: 'nutrition', label: 'Improve nutrition', icon: Utensils },
  { id: 'mood', label: 'Track mood & stress', icon: Sparkles },
  { id: 'sleep', label: 'Better sleep', icon: Moon },
]

function WelcomeHeader({ onBack, showBack = true }: { onBack?: () => void; showBack?: boolean }) {
  return <>{showBack ? <button className="welcome-back" onClick={onBack} aria-label="Go back"><ArrowLeft size={16} /></button> : <span className="welcome-back welcome-back--empty" />}</>
}

function ProgressDots({ active }: { active: number }) {
  return <div className="welcome-dots" aria-label={`Onboarding page ${active} of 3`}><i className={active >= 1 ? 'is-active' : ''} /><i className={active >= 2 ? 'is-active' : ''} /><i className={active >= 3 ? 'is-active' : ''} /></div>
}

export function Onboarding({ onComplete }: { onComplete: (values: OnboardingValues) => void }) {
  const [step, setStep] = useState<WelcomeStep>('splash')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('2000-04-06')
  const [height, setHeight] = useState('160 cm')
  const [weight, setWeight] = useState('50 kg')
  const [goals, setGoals] = useState<string[]>(['periods', 'symptoms', 'nutrition', 'mood', 'sleep'])

  const complete = () => onComplete({ displayName: name.trim(), cycleIsIrregular: false, periodStart: undefined, consentAI: false, birthDate, heightCm: Number.parseFloat(height) || undefined, weightKg: Number.parseFloat(weight) || undefined, goals })
  const toggleGoal = (goal: string) => setGoals((current) => current.includes(goal) ? current.filter((entry) => entry !== goal) : [...current, goal])

  return <main className="welcome-page">
    <section className="welcome-phone" aria-label="Myflo introduction">
      <MobileStatusBar />
      <span className="welcome-flower welcome-flower--top" aria-hidden="true" />
      <span className="welcome-flower welcome-flower--bottom" aria-hidden="true" />

      {step === 'splash' && <div className="welcome-screen welcome-screen--splash">
        <div className="welcome-splash-brand"><span className="welcome-petal">✦</span><strong>Myflo</strong></div>
        <p>Your Cycle. Your Health. Your<br />Your Story.</p>
        <img className="welcome-splash-art" src="/assets/splash-hero.png" alt="" aria-hidden="true" />
        <button className="welcome-primary" onClick={() => setStep('cycle')}>Get Started <ChevronRight size={15} /></button>
      </div>}

      {step === 'cycle' && <div className="welcome-screen welcome-screen--intro">
        <img className="welcome-intro-art" src="/assets/onboard-cycle.png" alt="" aria-hidden="true" />
        <h1>Understand Your Cycle</h1>
        <p>Track periods, symptoms, mood<br />and more — all in one place.</p>
        <ProgressDots active={1} />
        <button className="welcome-primary" onClick={() => setStep('more')}>Next</button>
      </div>}

      {step === 'more' && <div className="welcome-screen welcome-screen--intro">
        <div className="welcome-feature-grid"><span><HeartPulse size={20} /><b>Track Symptoms</b></span><span><Utensils size={20} /><b>Nutrition &<br />Food Scan</b></span><span><Sparkles size={20} /><b>Smart Reminders</b></span><span><Moon size={20} /><b>Daily Insights</b></span></div>
        <h1>More Than a Period Tracker</h1>
        <p>Nutrition, mood, sleep, reminders<br />and personalized insights.</p>
        <ProgressDots active={2} />
        <button className="welcome-primary" onClick={() => setStep('companion')}>Next</button>
      </div>}

      {step === 'companion' && <div className="welcome-screen welcome-screen--intro welcome-screen--companion">
        <img className="welcome-companion-art" src="/assets/onboard-companion.png" alt="" aria-hidden="true" />
        <h1>Your Personal Health<br />Companion</h1>
        <p>Get gentle guidance, tips and<br />support with Myflo AI.</p>
        <ProgressDots active={3} />
        <button className="welcome-primary" onClick={() => setStep('signup')}>Get Started</button>
      </div>}

      {step === 'signup' && <div className="welcome-screen welcome-screen--form">
        <WelcomeHeader onBack={() => setStep('companion')} />
        <img className="welcome-form-art" src="/assets/auth-chibi.png" alt="" aria-hidden="true" />
        <h1>Create Account</h1><p>Start your journey with Myflo</p>
        <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Garqi" autoComplete="name" /></label>
        <label><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" autoComplete="email" /></label>
        <label><span>Password</span><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" type="password" autoComplete="new-password" /></label>
        <button className="welcome-primary" onClick={() => setStep('profile')}>Sign Up</button>
        <span className="welcome-or">or continue with</span>
        <div className="welcome-socials"><button aria-label="Continue with Google">G</button><button aria-label="Continue with Apple">●</button></div>
        <p className="welcome-switch">Already have an account? <button onClick={() => setStep('login')}>Login</button></p><p className="welcome-auth-disclosure">Local profile only — cloud account sign-up is not configured.</p>
      </div>}

      {step === 'login' && <div className="welcome-screen welcome-screen--form">
        <WelcomeHeader onBack={() => setStep('signup')} />
        <img className="welcome-form-art" src="/assets/login-chibi.png" alt="" aria-hidden="true" />
        <h1>Welcome Back</h1><p>Log in to your account</p>
        <label><span>Email</span><input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="e.g. Garqi" type="email" autoComplete="email" /></label>
        <label><span>Password <button className="welcome-forgot" type="button">Forgot?</button></span><input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" type="password" autoComplete="current-password" /></label>
        <button className="welcome-primary" onClick={() => setStep('profile')}>Login</button>
        <span className="welcome-or">or continue with</span>
        <div className="welcome-socials"><button aria-label="Continue with Google">G</button><button aria-label="Continue with Apple">●</button></div>
        <p className="welcome-switch">Don’t have an account? <button onClick={() => setStep('signup')}>Sign Up</button></p><p className="welcome-auth-disclosure">Local profile only — remote login is not configured.</p>
      </div>}

      {step === 'profile' && <div className="welcome-screen welcome-screen--profile">
        <WelcomeHeader onBack={() => setStep('signup')} />
        <img className="welcome-form-art" src="/assets/auth-chibi.png" alt="" aria-hidden="true" />
        <h1>Tell Us About You</h1><p>This helps us personalize your<br />experience.</p>
        <label><span>Date of Birth</span><input value={birthDate} onChange={(event) => setBirthDate(event.target.value)} type="date" max={todayKey()} /></label>
        <label><span>Height (optional)</span><input value={height} onChange={(event) => setHeight(event.target.value)} placeholder="160 cm" /></label>
        <label><span>Weight (optional)</span><input value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="50 kg" /></label>
        <button className="welcome-primary" onClick={() => setStep('goals')}>Next</button>
      </div>}

      {step === 'goals' && <div className="welcome-screen welcome-screen--goals">
        <WelcomeHeader onBack={() => setStep('profile')} />
        <img className="welcome-goals-art" src="/assets/goals-chibi.png" alt="" aria-hidden="true" />
        <h1>Your Goals</h1><p>What would you like to focus on?</p>
        <div className="welcome-goal-list">{goalRows.map(({ id, label, icon: Icon }) => <button key={id} className={goals.includes(id) ? 'is-selected' : ''} onClick={() => toggleGoal(id)}><span><Icon size={15} /></span><b>{label}</b>{goals.includes(id) && <Check size={15} />}</button>)}<button className={goals.length === goalRows.length ? 'is-selected' : ''} onClick={() => setGoals(goals.length === goalRows.length ? [] : goalRows.map((goal) => goal.id))}><span><CircleCheck size={15} /></span><b>All of the above</b>{goals.length === goalRows.length && <Check size={15} />}</button></div>
        <button className="welcome-primary" onClick={complete}>Next</button>
      </div>}
    </section>
  </main>
}
