import styles from './InsightsScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { StatusBar, IconSparkle } from '../components/Icons';
import type { AppApi } from '../lib/useAppData';
import { MONTHS_SHORT, fromISO } from '../lib/cycle';
import CycleChart from '../components/CycleChart';
import { useMemo, useState } from 'react';

export default function InsightsScreen({ api }: { api: AppApi }) {
  const { model, data } = api;
  const [selected, setSelected] = useState(0);

  const chart = useMemo(() => {
    const logs = Object.values(data.symptomLogs).sort((a, b) => (a.date < b.date ? -1 : 1));
    const byMonth = new Map<string, { pain: number[]; stress: number[] }>();
    logs.forEach((l) => {
      const d = fromISO(l.date);
      const key = MONTHS_SHORT[d.getMonth()];
      const cur = byMonth.get(key) ?? { pain: [], stress: [] };
      cur.pain.push(l.pain);
      cur.stress.push(l.stress);
      byMonth.set(key, cur);
    });
    const arr = [...byMonth.entries()].slice(-6).map(([label, v]) => ({
      label,
      month: label,
      value: Math.round(v.stress.reduce((a, b) => a + b, 0) / Math.max(1, v.stress.length)) * 4,
    }));
    return arr.length
      ? arr
      : [
          { label: 'Mar', month: 'Mar', value: 16 },
          { label: 'Apr', month: 'Apr', value: 24 },
          { label: 'May', month: 'May', value: 20 },
        ];
  }, [data.symptomLogs]);

  const logged = Object.keys(data.symptomLogs).length;

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />
      <header className={styles.header}>
        <h1 className={styles.title}>Insights</h1>
        <IconSparkle size={18} />
      </header>

      <div className={styles.scroll}>
        <section className={styles.hero}>
          <h2>Your cycle is {model.isRegular ? 'regular' : 'slightly irregular'}</h2>
          <p>
            Average {model.averageLength} days · range {model.shortest}–{model.longest} days
          </p>
        </section>

        <section className={styles.card}>
          <h3>Stress trend</h3>
          <CycleChart data={chart} selected={selected} onSelect={setSelected} domain={[0, 40]} />
        </section>

        <section className={styles.card}>
          <h3>Tracking</h3>
          <ul className={styles.stats}>
            <li>
              <strong>{logged}</strong>
              <span>days logged</span>
            </li>
            <li>
              <strong>{data.periodStarts.length}</strong>
              <span>periods recorded</span>
            </li>
            <li>
              <strong>{model.daysUntilNext}</strong>
              <span>days to next period (est.)</span>
            </li>
          </ul>
        </section>

        <p className={styles.disclaimer}>
          Estimates only — Myflo never diagnoses. Speak to a clinician about anything that
          concerns you.
        </p>
      </div>
    </div>
  );
}
