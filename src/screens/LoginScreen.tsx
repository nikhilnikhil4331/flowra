import { useState } from 'react';
import styles from './AuthScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { IconApple, IconGoogle, StatusBar } from '../components/Icons';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { BackButton, AuthMessage } from '../components/ui/Chrome';
import { asset } from '../lib/catalog';
import type { AppApi } from '../lib/useAppData';

export default function LoginScreen({
  api,
  onBack,
  onDone,
  onSignUp,
}: {
  api: AppApi;
  onBack: () => void;
  onDone: () => void;
  onSignUp: () => void;
}) {
  const [email, setEmail] = useState(api.data.account?.email ?? '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      await api.logIn(email, password);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />

      <div className={styles.back}>
        <BackButton onClick={onBack} />
      </div>

      <img className={styles.girl} src={asset('auth-girl-login.png')} alt="" aria-hidden="true" />

      <form id="login-form" className={styles.form} onSubmit={submit}>
        <h2 className={styles.heading}>Welcome Back</h2>
        <p className={styles.sub}>Login to your account</p>

        <div className={styles.fields}>
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            password
            placeholder="Your password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            hint={
              <button
                type="button"
                className={styles.forgot}
                onClick={() =>
                  setNote(
                    'Password recovery needs an email service. This build keeps the account on this device, so reset it from More → Reset data.',
                  )
                }
              >
                Forgot?
              </button>
            }
          />
        </div>

        {error && <AuthMessage>{error}</AuthMessage>}
        {note && <AuthMessage tone="info">{note}</AuthMessage>}
      </form>

      <div className={styles.bottom}>
        <Button type="submit" form="login-form" loading={busy}>
          Login
        </Button>

        <p className={styles.or}>or continue with</p>
        <div className={styles.social}>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => setNote('Google sign-in isn’t configured in this build.')}
          >
            <IconGoogle size={20} />
            <span className="sr-only">Google</span>
          </button>
          <button
            type="button"
            className={styles.socialBtn}
            onClick={() => setNote('Apple sign-in isn’t configured in this build.')}
          >
            <IconApple size={21} />
            <span className="sr-only">Apple</span>
          </button>
        </div>

        <p className={styles.switch}>
          Don’t have an account?{' '}
          <button type="button" className={styles.switchLink} onClick={onSignUp}>
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
