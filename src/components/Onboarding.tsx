import { Check, ChevronRight, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Button, BrandMark, Notice, Toggle } from './ui'
import { todayKey } from '../domain/cycle'

export interface OnboardingValues {
  displayName: string
  cycleIsIrregular: boolean
  periodStart?: string
  consentAI: boolean
}

export function Onboarding({ onComplete }: { onComplete: (values: OnboardingValues) => void }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [irregular, setIrregular] = useState(false)
  const [periodStart, setPeriodStart] = useState('')
  const [consentAI, setConsentAI] = useState(false)

  const next = () => setStep((current) => Math.min(3, current + 1))
  const complete = () => onComplete({ displayName: name.trim(), cycleIsIrregular: irregular, periodStart: periodStart || undefined, consentAI })

  return (
    <main className="onboarding-page">
      <div className="onboarding-decoration onboarding-decoration--one" aria-hidden="true" />
      <div className="onboarding-decoration onboarding-decoration--two" aria-hidden="true" />
      <section className="onboarding-card">
        <BrandMark />
        <div className="onboarding-progress" aria-label={`Step ${step} of 3`}><span className={step >= 1 ? 'done' : ''} /><span className={step >= 2 ? 'done' : ''} /><span className={step >= 3 ? 'done' : ''} /></div>

        {step === 1 && <>
          <p className="eyebrow">A calmer way to check in</p>
          <h1>Your wellbeing, on your terms.</h1>
          <p className="lead">Myflo helps you keep a private record of your cycle, symptoms, sleep, food, and what helps you feel like yourself.</p>
          <div className="welcome-list">
            <span><HeartHandshake size={18} /> No diagnosis. Just clear, supportive guidance.</span>
            <span><ShieldCheck size={18} /> Safety guidance appears before general wellness tips.</span>
            <span><LockKeyhole size={18} /> Your data stays on this device until you choose to connect it.</span>
          </div>
          <Button onClick={next}>Set up Myflo <ChevronRight size={18} /></Button>
        </>}

        {step === 2 && <>
          <p className="eyebrow">Your cycle, your pace</p>
          <h1>Start with only what feels useful.</h1>
          <label className="field"><span>What should we call you? <em>Optional</em></span><input value={name} maxLength={40} onChange={(event) => setName(event.target.value)} placeholder="Your first name" autoComplete="given-name" /></label>
          <label className="field"><span>Most recent period start <em>Optional</em></span><input type="date" value={periodStart} max={todayKey()} onChange={(event) => setPeriodStart(event.target.value)} /></label>
          <Toggle checked={irregular} onChange={setIrregular} label="My cycle can be irregular" description="Myflo will avoid forcing a fixed 28-day cycle." />
          <Notice tone="info"><strong>Predictions are estimates.</strong> We only show a cycle estimate after there is enough recorded history.</Notice>
          <div className="form-actions"><Button variant="ghost" onClick={() => setStep(1)}>Back</Button><Button onClick={next}>Continue <ChevronRight size={18} /></Button></div>
        </>}

        {step === 3 && <>
          <p className="eyebrow">Privacy comes first</p>
          <h1>You decide what gets processed.</h1>
          <div className="privacy-choice"><LockKeyhole size={22} /><div><strong>Private local mode is on</strong><p>Logs are saved in this browser only. You can export or delete them at any time.</p></div><Check size={19} /></div>
          <Toggle checked={consentAI} onChange={setConsentAI} label="Allow optional AI processing later" description="Off by default. You will be asked again before a cloud feature sends any information." />
          <Notice tone="warning"><strong>Health note:</strong> Myflo is educational and does not replace a clinician or urgent care. It will flag concerning symptoms, but cannot diagnose them.</Notice>
          <div className="form-actions"><Button variant="ghost" onClick={() => setStep(2)}>Back</Button><Button onClick={complete}>Begin my check-in <ChevronRight size={18} /></Button></div>
        </>}
      </section>
    </main>
  )
}
