import { useState } from 'react';
import styles from './SetupScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { IconCheck, IconMoon, IconPetals, IconPulseHeart, IconSparkline, StatusBar } from '../components/Icons';
import Button from '../components/ui/Button';
import { asset } from '../lib/catalog';
import type { AppApi } from '../lib/useAppData';

const GOALS = [
  { key: 'Track my periods', tone: 'pink' as const, Icon: IconPetals },
  { key: 'Manage symptoms', tone: 'lav' as const, Icon: IconPulseHeart },
  { key: 'Improve nutrition', tone: 'peach' as const, Icon: IconSparkline },
  { key: 'Track mood & stress', tone: 'amber' as const, Icon: IconPulseHeart },
  { key: 'Better sleep', tone: 'lav' as const, Icon: IconMoon },
  { key: 'All of the above', tone: 'pink' as const, Icon: IconPetals },
];

/** Screen 08 — Your Goals. Multi-select; "All of the above" selects everything. */
export default function GoalsScreen({ api, onDone }: { api: AppApi; onDone: () => void }) {
  const [picked, setPicked] = useState<string[]>(api.data.profile.goals ?? []);

  const toggle = (goal: string) => {
    if (goal === 'All of the above') {
      setPicked((prev) => (prev.length === GOALS.length - 1 ? [] : GOALS.map((g) => g.key)));
      return;
    }
    setPicked((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev.filter((g) => g !== 'All of the above'), goal],
    );
  };

  const submit = () => {
    api.saveGoals(picked.length ? picked : ['Track my periods']);
    onDone();
  };

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />

      <img className={styles.girl} src={asset('auth-girl-goals.png')} alt="" aria-hidden="true" />

      <div className={styles.body}>
        <h2 className={styles.heading}>Your Goals</h2>
        <p className={styles.sub}>What would you like to focus on?</p>

        <div className={styles.goals}>
          {GOALS.map(({ key, tone, Icon }) => {
            const on = picked.includes(key);
            return (
              <button
                key={key}
                type="button"
                className={`${styles.goal} ${on ? styles.goalOn : ''}`}
                aria-pressed={on}
                onClick={() => toggle(key)}
              >
                <span className={`${styles.goalIcon} ${styles[tone]}`}>
                  <Icon size={17} strokeWidth={1.8} />
                </span>
                <span className={styles.goalLabel}>{key}</span>
                <span className={styles.goalTick} aria-hidden="true">
                  <IconCheck size={12} strokeWidth={2.6} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <Button onClick={submit}>Next</Button>
      </div>
    </div>
  );
}
