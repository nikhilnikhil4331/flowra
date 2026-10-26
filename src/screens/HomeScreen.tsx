import styles from './HomeScreen.module.css';
import CycleRing from '../components/CycleRing';
import FloralDecor from '../components/FloralDecor';
import { FlowerGlyph, IconBell, IconMenu, StatusBar } from '../components/Icons';
import type { AppApi } from '../lib/useAppData';
import { fmtLong, phaseCopy, phaseFor, todayISO } from '../lib/cycle';
import { asset } from '../lib/catalog';

type Props = {
  api: AppApi;
  onOpen?: () => void;
  onQuick: (target: 'mood' | 'cramps' | 'medicine') => void;
  onBell: () => void;
  onMenu: () => void;
};

export default function HomeScreen({ api, onOpen, onQuick, onBell, onMenu }: Props) {
  const { data, model } = api;
  const today = todayISO();
  const phase = phaseFor(model, today);
  const copy = phaseCopy(phase);
  const dayNumber = Math.min(Math.max(model.cycleDay, 1), model.averageLength);

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="home" />
      <StatusBar />

      <header className={styles.header}>
        <button className={styles.iconBtn} onClick={onMenu} aria-label="Open menu">
          <IconMenu size={28} strokeWidth={2} />
        </button>
        <div className={styles.greetingBlock}>
          <h1 className={styles.greeting}>
            Hi, {data.profile.name}
            <span className={styles.flower}>
              <FlowerGlyph size={17} />
            </span>
          </h1>
          <p className={styles.subtitle}>Take care of yourself today</p>
        </div>
        <button className={styles.bell} onClick={onBell} aria-label="Notifications">
          <IconBell size={16} />
        </button>
      </header>

      <div className={styles.scroll}>
        <section className={styles.ringWrap} aria-label="Current cycle">
          <CycleRing
            dayNumber={dayNumber}
            phaseTitle={copy.title}
            phaseNote={copy.note}
          />
        </section>

        <button className={styles.nextCard} onClick={onOpen}>
          <span className={styles.nextDrop} aria-hidden="true">
            <svg viewBox="0 0 24 34" width="22" height="32" fill="none" preserveAspectRatio="none">
              <defs>
                <linearGradient id="noteDrop" x1="12" y1="2" x2="12" y2="32">
                  <stop stopColor="#fff0f3" />
                  <stop offset=".38" stopColor="#ff85a6" />
                  <stop offset="1" stopColor="#fb5479" />
                </linearGradient>
              </defs>
              <path
                d="M12 1.8c.9 1 4.4 5.6 6.6 9.4 1.6 2.7 3.4 6.1 3.4 9.5 0 5.6-4.5 10.1-10 10.1S2 26.3 2 20.7c0-3.4 1.8-6.8 3.4-9.5C7.6 7.4 11.1 2.8 12 1.8Z"
                fill="url(#noteDrop)"
                stroke="#95102a"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className={styles.nextText}>
            <span className={styles.nextLabel}>Next Period</span>
            <span className={styles.nextDate}>{fmtLong(model.nextPeriod)}</span>
            <span className={styles.nextIn}>
              in {model.daysUntilNext} {model.daysUntilNext === 1 ? 'day' : 'days'}
            </span>
          </span>
          <img className={styles.nextArt} src={asset('girl-hug.png')} alt="" />
          <span className={styles.sparkles} aria-hidden="true">
            <i /> <i /> <i />
          </span>
        </button>

        <div className={styles.quickRow}>
          <button
            className={`${styles.quick} ${styles.quickMood}`}
            onClick={() => onQuick('mood')}
          >
            <span className={styles.quickArt}>
              <img src={asset('quick-mood.png')} alt="" />
            </span>
            <span className={styles.quickTitle}>Mood</span>
            <span className={styles.quickSub}>How are you feeling?</span>
          </button>
          <button
            className={`${styles.quick} ${styles.quickCramps}`}
            onClick={() => onQuick('cramps')}
          >
            <span className={styles.quickArt}>
              <img src={asset('quick-cramps.png')} alt="" />
            </span>
            <span className={styles.quickTitle}>Cramps</span>
            <span className={styles.quickSub}>Any symptoms?</span>
          </button>
          <button
            className={`${styles.quick} ${styles.quickMed}`}
            onClick={() => onQuick('medicine')}
          >
            <span className={styles.quickArt}>
              <img src={asset('quick-medicine.png')} alt="" />
            </span>
            <span className={styles.quickTitle}>Medicine</span>
            <span className={styles.quickSub}>Taken any supplements?</span>
          </button>
        </div>
      </div>
    </div>
  );
}
