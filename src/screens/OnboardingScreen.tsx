import { useState } from 'react';
import styles from './OnboardingScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { StatusBar } from '../components/Icons';
import {
  IconAlarm,
  IconArrowRight,
  IconFoodScan,
  IconPulseHeart,
  IconSparkline,
} from '../components/Icons';
import Button from '../components/ui/Button';
import { BackButton, Dots } from '../components/ui/Chrome';
import { asset } from '../lib/catalog';

type Slide = {
  kind: 'hero' | 'grid';
  hero?: string;
  heading: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    kind: 'hero',
    hero: 'onboard-1-hero.png',
    heading: 'Understand Your Cycle',
    body: 'Track periods, symptoms, mood\nand more — all in one place.',
  },
  {
    kind: 'grid',
    heading: 'More Than a Period Tracker',
    body: 'Nutrition, mood, sleep, reminders\nand personalized insights.',
  },
  {
    kind: 'hero',
    hero: 'onboard-3-hero.png',
    heading: 'Your Personal Health\nCompanion',
    body: 'Get gentle guidance, tips and\nsupport with Myflo AI.',
  },
];

const FEATURES = [
  { label: 'Track Symptoms', Icon: IconPulseHeart, tone: 'pink' as const },
  { label: 'Nutrition &\nFood Scan', Icon: IconFoodScan, tone: 'peach' as const },
  { label: 'Smart Reminders', Icon: IconAlarm, tone: 'pink' as const },
  { label: 'Daily Insights', Icon: IconSparkline, tone: 'lav' as const },
];

export default function OnboardingScreen({
  index,
  onDone,
}: {
  /** slide to open on (returning users resume where they left) */
  index: number;
  onDone: () => void;
}) {
  const [i, setI] = useState(index);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;

  const advance = () => {
    if (last) onDone();
    else setI((v) => v + 1);
  };

  return (
    <div className={styles.root} key={i}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />

      {i > 0 && (
        <div className={styles.back}>
          <BackButton onClick={() => setI((v) => Math.max(0, v - 1))} />
        </div>
      )}

      {slide.kind === 'hero' ? (
        <img className={styles.hero} src={asset(slide.hero!)} alt="" aria-hidden="true" />
      ) : (
        <div className={styles.grid}>
          {FEATURES.map(({ label, Icon, tone }) => (
            <div key={label} className={styles.feature}>
              <span className={`${styles.featureIcon} ${styles[tone]}`}>
                <Icon size={26} strokeWidth={1.7} />
              </span>
              <span className={styles.featureLabel}>
                {label.split('\n').map((line, k) => (
                  <span key={k}>
                    {line}
                    <br />
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.copy}>
        <h2 className={styles.heading}>
          {slide.heading.split('\n').map((line, k) => (
            <span key={k}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <p className={styles.body}>
          {slide.body.split('\n').map((line, k) => (
            <span key={k}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </div>

      <div className={styles.dotsWrap}>
        <Dots count={SLIDES.length} active={i} />
      </div>

      <div className={styles.footer}>
        <Button
          onClick={advance}
          icon={last ? undefined : <IconArrowRight size={17} strokeWidth={2.1} />}
        >
          {last ? 'Get Started' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
