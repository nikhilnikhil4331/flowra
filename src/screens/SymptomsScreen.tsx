import { useEffect, useState } from 'react';
import styles from './SymptomsScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import LevelSlider from '../components/LevelSlider';
import { StatusBar, IconArrowLeft, IconCheck } from '../components/Icons';
import { BLEEDING, MOODS, SYMPTOMS, bleedArt, moodArt, symptomArt } from '../lib/catalog';
import type { BleedingKey, MoodKey, SymptomKey } from '../lib/catalog';
import type { AppApi } from '../lib/useAppData';
import { todayISO, type ISODate } from '../lib/cycle';

type Props = {
  api: AppApi;
  onBack: () => void;
  date?: ISODate;
  focus?: 'mood' | 'cramps';
};

const toggled = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

export default function SymptomsScreen({ api, onBack, date = todayISO(), focus }: Props) {
  const existing = api.data.symptomLogs[date];
  const [moods, setMoods] = useState<MoodKey[]>(existing?.moods ?? []);
  const [symptoms, setSymptoms] = useState<SymptomKey[]>(
    existing?.symptoms ?? (focus === 'cramps' ? ['cramps'] : []),
  );
  const [pain, setPain] = useState(existing?.pain ?? (focus === 'cramps' ? 6 : 0));
  const [bloating, setBloating] = useState(existing?.bloating ?? 4);
  const [stress, setStress] = useState(existing?.stress ?? 7);
  const [energy, setEnergy] = useState(existing?.energy ?? 3);
  const [bleeding, setBleeding] = useState<BleedingKey | null>(existing?.bleeding ?? 'moderate');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(id);
  }, [saved]);

  const save = () => {
    api.setLog(date, {
      moods,
      symptoms,
      pain,
      bloating,
      stress,
      energy,
      bleeding,
    });
    setSaved(true);
    setTimeout(onBack, 420);
  };

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="detail" />
      <StatusBar />

      <header className={styles.header}>
        <button className={styles.back} onClick={onBack} aria-label="Go back">
          <IconArrowLeft size={17} />
        </button>
        <h1 className={styles.title}>Log Symptoms</h1>
        <button className={styles.confirm} onClick={save} aria-label="Save symptoms">
          <IconCheck size={18} />
        </button>
      </header>

      <div className={styles.scroll}>
        <p className={styles.prompt}>How are you feeling today?</p>
        <h2 className={styles.sectionTitle}>Mood</h2>
        <div className={styles.tileGrid}>
          {MOODS.map((m) => {
            const on = moods.includes(m.key);
            return (
              <button
                key={m.key}
                className={`${styles.tile} ${on ? styles.tileOn : ''}`}
                aria-pressed={on}
                onClick={() => setMoods((v) => toggled(v, m.key))}
              >
                <img src={moodArt(m.key)} alt="" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <h2 className={styles.sectionTitle}>Physical Symptoms</h2>
        <div className={styles.tileGrid}>
          {SYMPTOMS.map((s) => {
            const on = symptoms.includes(s.key);
            return (
              <button
                key={s.key}
                className={`${styles.tile} ${on ? styles.tileOn : ''}`}
                aria-pressed={on}
                onClick={() => setSymptoms((v) => toggled(v, s.key))}
              >
                <img src={symptomArt(s.key)} alt="" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <LevelSlider
          name="Pain level"
          label="Pain Level"
          hint="(Lower Abdomen)"
          value={pain}
          onChange={setPain}
        />

        <h2 className={styles.bleedTitle}>Bleeding Amount</h2>
        <div className={styles.bleedGrid}>
          {BLEEDING.map((b) => (
            <button
              key={b.key}
              className={`${styles.bleed} ${bleeding === b.key ? styles.bleedOn : ''}`}
              aria-pressed={bleeding === b.key}
              onClick={() => setBleeding(b.key)}
            >
              <img src={bleedArt(b.key)} alt="" />
              <span>{b.label}</span>
            </button>
          ))}
        </div>

        <LevelSlider name="Bloating level" label="Bloating Level" value={bloating} onChange={setBloating} />
        <LevelSlider name="Stress level" label="Stress Level" value={stress} onChange={setStress} />
        <LevelSlider name="Energy level" label="Energy Level" value={energy} onChange={setEnergy} />
      </div>

      <div className={`${styles.toast} ${saved ? styles.toastOn : ''}`} role="status">
        Symptoms saved
      </div>
    </div>
  );
}
