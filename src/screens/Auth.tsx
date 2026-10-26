import React, { useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Check } from 'lucide-react';
import { useStore } from '../store';
import { GOALS } from '../data/content';
import { PrimaryButton, Field, inputCls, Mascot, ScreenScroll } from '../components/ui';

function BackDot() {
  const back = useStore((s) => s.back);
  return (
    <button onClick={back} aria-label="Go back" className="tap absolute left-4 top-1 z-10 w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center">
      <ChevronLeft size={19} strokeWidth={2.6} />
    </button>
  );
}

function AuthMascot() {
  return (
    <div className="flex justify-center -mb-1">
      <Mascot src="/images/mascot-hello.png" alt="Myflo mascot" className="h-[104px] w-auto object-cover animate-floaty" />
    </div>
  );
}

function GoogleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Continue with Google" className="tap w-12 h-12 rounded-full bg-white shadow-card border border-blush-line flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.2-2.1 3.7-5.1 3.7-8.8z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.8-5L1.3 17.3C3.3 21.3 7.3 24 12 24z" />
        <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4L1.3 6.7C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.3l3.9-2.9z" />
        <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.7l3.9 2.9c.9-2.8 3.6-4.9 6.8-4.9z" />
      </svg>
    </button>
  );
}

function AppleBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label="Continue with Apple" className="tap w-12 h-12 rounded-full bg-white shadow-card border border-blush-line flex items-center justify-center">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="#3D2C33" aria-hidden>
        <path d="M17.05 12.54c0-2.4 1.96-3.55 2.05-3.6-1.12-1.64-2.86-1.86-3.48-1.89-1.48-.15-2.89.87-3.64.87-.75 0-1.9-.85-3.13-.83-1.61.02-3.1.94-3.93 2.38-1.68 2.9-.43 7.21 1.2 9.57.8 1.16 1.75 2.46 3 2.41 1.2-.05 1.66-.78 3.11-.78s1.86.78 3.13.76c1.3-.02 2.12-1.18 2.91-2.34.92-1.34 1.3-2.64 1.32-2.71-.03-.01-2.53-.97-2.54-3.84ZM14.65 5.4c.66-.8 1.1-1.91.98-3.02-.95.04-2.1.63-2.78 1.43-.61.7-1.14 1.83-1 2.91 1.06.08 2.14-.54 2.8-1.32Z" />
      </svg>
    </button>
  );
}

function SocialRow({ onSocial }: { onSocial: () => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 my-5">
        <span className="flex-1 h-px bg-blush-line" />
        <span className="text-[11px] font-bold text-ink-mute">or continue with</span>
        <span className="flex-1 h-px bg-blush-line" />
      </div>
      <div className="flex justify-center gap-4">
        <GoogleBtn onClick={onSocial} />
        <AppleBtn onClick={onSocial} />
      </div>
    </div>
  );
}

function PasswordField({ value, onChange, label = 'Password' }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          className={`${inputCls} pr-11`}
        />
        <button
          type="button"
          aria-label={show ? 'Hide password' : 'Show password'}
          onClick={() => setShow(!show)}
          className="tap absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </Field>
  );
}

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export function SignUp() {
  const go = useStore((s) => s.go);
  const setUser = useStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const submit = () => {
    if (name.trim().length < 2) return setErr('Please enter your name.');
    if (!emailOk(email)) return setErr('Please enter a valid email address.');
    if (pw.length < 6) return setErr('Password should be at least 6 characters.');
    setUser({ name: name.trim(), email: email.trim().toLowerCase() });
    go('profile');
  };
  const social = () => {
    setUser({ name: name.trim() || 'Gargi', email: emailOk(email) ? email.trim().toLowerCase() : 'gargi@email.com' });
    go('profile');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <BackDot />
      <ScreenScroll>
        <div className="px-6 pt-8">
          <AuthMascot />
          <h2 className="text-center text-[21px] font-black">Create Account</h2>
          <p className="text-center text-[12.5px] font-semibold text-ink-mute mt-1">Start your journey with Myflo</p>

          <div className="space-y-3.5 mt-6">
            <Field label="Name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Gargi" className={inputCls} autoComplete="name" />
            </Field>
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} autoComplete="email" />
            </Field>
            <PasswordField value={pw} onChange={setPw} />
          </div>

          {err && <p className="text-[12px] font-bold text-red-500 mt-3 text-center" role="alert">{err}</p>}

          <div className="mt-6">
            <PrimaryButton onClick={submit}>Sign Up</PrimaryButton>
          </div>

          <SocialRow onSocial={social} />

          <p className="text-center text-[12.5px] font-semibold text-ink-mute mt-6 pb-6">
            Already have an account?{' '}
            <button onClick={() => go('login')} className="tap text-primary font-extrabold">Login</button>
          </p>
        </div>
      </ScreenScroll>
    </div>
  );
}

export function Login() {
  const go = useStore((s) => s.go);
  const user = useStore((s) => s.user);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const showToast = useStore((s) => s.showToast);
  const [email, setEmail] = useState(user.email || '');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const finish = (em: string) => {
    const fallbackName = em.split('@')[0]?.replace(/[._-]/g, ' ').trim();
    const name = user.name || (fallbackName ? fallbackName[0].toUpperCase() + fallbackName.slice(1) : 'Gargi');
    completeOnboarding({ ...user, name, email: em });
    showToast(`Welcome back, ${name.split(' ')[0]}! 🌸`);
  };
  const submit = () => {
    if (!emailOk(email)) return setErr('Please enter a valid email address.');
    if (pw.length < 4) return setErr('Please enter your password.');
    finish(email.trim().toLowerCase());
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <BackDot />
      <ScreenScroll>
        <div className="px-6 pt-8">
          <AuthMascot />
          <h2 className="text-center text-[21px] font-black">Welcome Back</h2>
          <p className="text-center text-[12.5px] font-semibold text-ink-mute mt-1">Login to your account</p>

          <div className="space-y-3.5 mt-6">
            <Field label="Email">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="gargi@email.com" className={inputCls} autoComplete="email" />
            </Field>
            <div>
              <PasswordField value={pw} onChange={setPw} />
              <div className="text-right mt-1.5">
                <button onClick={() => showToast('Password reset link sent to your email 💌')} className="tap text-[11.5px] font-extrabold text-primary">
                  Forgot?
                </button>
              </div>
            </div>
          </div>

          {err && <p className="text-[12px] font-bold text-red-500 mt-2 text-center" role="alert">{err}</p>}

          <div className="mt-4">
            <PrimaryButton onClick={submit}>Login</PrimaryButton>
          </div>

          <SocialRow onSocial={() => finish(emailOk(email) ? email.trim().toLowerCase() : 'gargi@email.com')} />

          <p className="text-center text-[12.5px] font-semibold text-ink-mute mt-6 pb-6">
            Don&apos;t have an account?{' '}
            <button onClick={() => go('signup')} className="tap text-primary font-extrabold">Sign Up</button>
          </p>
        </div>
      </ScreenScroll>
    </div>
  );
}

export function ProfileSetup() {
  const go = useStore((s) => s.go);
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const [dob, setDob] = useState(user.dob || '2000-04-06');
  const [height, setHeight] = useState(String(user.height || 160));
  const [weight, setWeight] = useState(String(user.weight || 50));
  const [err, setErr] = useState('');

  const next = () => {
    const h = Number(height);
    const w = Number(weight);
    if (!dob) return setErr('Please add your date of birth.');
    if (height && (Number.isNaN(h) || h < 100 || h > 220)) return setErr('Height looks off — please check (cm).');
    if (weight && (Number.isNaN(w) || w < 25 || w > 250)) return setErr('Weight looks off — please check (kg).');
    setUser({ dob, height: h || 160, weight: w || 50 });
    go('goals');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <BackDot />
      <ScreenScroll>
        <div className="px-6 pt-8 flex flex-col min-h-full">
          <AuthMascot />
          <h2 className="text-center text-[21px] font-black">Tell Us About You</h2>
          <p className="text-center text-[12.5px] font-semibold text-ink-mute mt-1">This helps us personalize your experience.</p>

          <div className="space-y-4 mt-7">
            <Field label="Date of Birth">
              <input type="date" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Height (optional)">
              <div className="relative">
                <input inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value.replace(/[^\d.]/g, ''))} placeholder="160" className={`${inputCls} pr-12`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-extrabold text-ink-mute">cm</span>
              </div>
            </Field>
            <Field label="Weight (optional)">
              <div className="relative">
                <input inputMode="numeric" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^\d.]/g, ''))} placeholder="50" className={`${inputCls} pr-12`} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-extrabold text-ink-mute">kg</span>
              </div>
            </Field>
          </div>

          {err && <p className="text-[12px] font-bold text-red-500 mt-3 text-center" role="alert">{err}</p>}

          <div className="mt-auto pt-8 pb-6">
            <PrimaryButton onClick={next}>Next</PrimaryButton>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}

export function GoalsSetup() {
  const user = useStore((s) => s.user);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const showToast = useStore((s) => s.showToast);
  const [sel, setSel] = useState<string[]>(user.goals.length ? user.goals : ['track']);

  const toggle = (id: string) => {
    if (id === 'all') {
      setSel(sel.includes('all') ? [] : GOALS.map((g) => g.id));
      return;
    }
    setSel((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.filter((x) => x !== 'all');
    });
  };

  const done = () => {
    completeOnboarding({ ...user, goals: sel.length ? sel : ['track'] });
    showToast('Welcome to Myflo! 🌸');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <BackDot />
      <ScreenScroll>
        <div className="px-6 pt-8 flex flex-col min-h-full">
          <AuthMascot />
          <h2 className="text-center text-[21px] font-black">Your Goals</h2>
          <p className="text-center text-[12.5px] font-semibold text-ink-mute mt-1">What would you like to focus on?</p>

          <div className="space-y-2.5 mt-6">
            {GOALS.map((g) => {
              const on = sel.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggle(g.id)}
                  aria-pressed={on}
                  className={`tap w-full flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 text-left transition-colors ${
                    on ? 'bg-primary-pale border-primary-light' : 'bg-white/80 border-blush-line'
                  }`}
                >
                  <span className="text-lg">{g.emoji}</span>
                  <span className="flex-1 text-[13.5px] font-extrabold text-ink">{g.label}</span>
                  <span className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 ${on ? 'bg-grad-pink border-transparent text-white' : 'border-blush-line text-transparent'}`}>
                    <Check size={13} strokeWidth={3.4} />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8 pb-6">
            <PrimaryButton onClick={done}>Next</PrimaryButton>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}
