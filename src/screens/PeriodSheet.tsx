import { useState } from 'react';
import styles from '../components/Sheet.module.css';
import { IconClose } from '../components/Icons';
import type { ISODate } from '../lib/cycle';
import { fmtLong, todayISO } from '../lib/cycle';
import type { AppApi } from '../lib/useAppData';

const FLOW = ['Light', 'Medium', 'Heavy'];
const COLORS = [
  { key: 'bright', label: 'Bright Red', swatch: '#fb5a86' },
  { key: 'dark', label: 'Dark Red', swatch: '#b0284f' },
  { key: 'brown', label: 'Brown', swatch: '#8b5b48' },
  { key: 'pink', label: 'Pink', swatch: '#ffb3c4' },
];

type Props = { api: AppApi; onClose: () => void };

export default function PeriodSheet({ api, onClose }: Props) {
  const [date, setDate] = useState<ISODate>(todayISO());
  const [flow, setFlow] = useState('Medium');
  const [color, setColor] = useState('bright');
  const [symptoms, setSymptoms] = useState<string[]>(['Cramps']);

  const save = () => {
    api.logPeriod(date);
    api.setLog(date, {
      bleeding: flow === 'Light' ? 'light' : flow === 'Heavy' ? 'heavy' : 'moderate',
      flowColor: color,
      symptoms: symptoms.map((s) => s.toLowerCase().replace(' ', '')) as never,
    });
    onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Log period">
      <button className={styles.backdrop} onClick={onClose} aria-label="Close" />
      <div className={styles.sheet}>
        <div className={styles.grabber} />
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>Log Period</h2>
            <p className={styles.sub}>{fmtLong(date)}</p>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </header>

        <label className={styles.field}>
          <span className={styles.label}>Start date</span>
          <input
            className={styles.input}
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>Flow intensity</span>
          <div className={styles.chips}>
            {FLOW.map((f) => (
              <button
                key={f}
                className={`${styles.chip} ${flow === f ? styles.chipActive : ''}`}
                onClick={() => setFlow(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Flow colour</span>
          <div className={styles.chips}>
            {COLORS.map((c) => (
              <button
                key={c.key}
                className={`${styles.chip} ${color === c.key ? styles.chipActive : ''}`}
                onClick={() => setColor(c.key)}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    background: c.swatch,
                    marginRight: 6,
                  }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Any symptoms?</span>
          <div className={styles.chips}>
            {['Cramps', 'Bloating', 'Headache'].map((s) => (
              <button
                key={s}
                className={`${styles.chip} ${symptoms.includes(s) ? styles.chipActive : ''}`}
                onClick={() =>
                  setSymptoms((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]))
                }
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.primary} onClick={save}>
            Save period
          </button>
        </div>
      </div>
    </div>
  );
}
