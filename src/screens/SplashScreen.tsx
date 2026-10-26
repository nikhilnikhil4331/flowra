import { useEffect } from 'react';
import styles from './SplashScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { StatusBar, IconArrowRight } from '../components/Icons';
import Button from '../components/ui/Button';
import { asset } from '../lib/catalog';

/**
 * Screen 01 — Splash. Auto-advances: returning users go straight on, first-run
 * users see the onboarding slides. The button lets people skip the wait.
 */
export default function SplashScreen({ onContinue }: { onContinue: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onContinue, 2400);
    return () => window.clearTimeout(t);
  }, [onContinue]);

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="home" />
      <StatusBar />

      <img className={styles.flower} src={asset('splash-flower.png')} alt="" aria-hidden="true" />

      <div className={styles.brand}>
        <h1 className={styles.logo}>Myflo</h1>
        <p className={styles.tagline}>
          Your Cycle. Your Health. Your
          <br />
          Story.
        </p>
      </div>

      <img className={styles.hero} src={asset('splash-hero.png')} alt="" aria-hidden="true" />

      <div className={styles.footer}>
        <Button onClick={onContinue} icon={<IconArrowRight size={17} strokeWidth={2.1} />}>
          Get Started
        </Button>
      </div>
    </div>
  );
}
