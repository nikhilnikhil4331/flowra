import { useMemo, useState } from 'react';
import styles from './HistoryScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import CycleChart from '../components/CycleChart';
import { StatusBar, IconArrowLeft } from '../components/Icons';
import type { AppApi } from '../lib/useAppData';
import { MONTHS_SHORT, addDays, fromISO, type ISODate } from '../lib/cycle';
import { asset } from '../lib/catalog';

type Props = { api: AppApi; onBack: () => void };
type Tab = 'length' | 'symptoms' | 'mood';

const TABS: { key: Tab; label: string }[] = [
  { key: 'length', label: 'Cycle Length' },
  { key: 'symptoms', label: 'Symptoms' },
  { key: 'mood', label: 'Mood' },
];

/** month-grouped cycle history derived from the logged period starts */
function useCycleSeries(starts: ISODate[]) {
  return useMemo(() => {
    const sorted = [...new Set(starts)].sort();
    const rows = sorted
      .slice(1)
      .map((s, i) => {
        const start = sorted[i];
        return {
          start,
          end: addDays(s, -1),
          length: Math.round(
            (fromISO(s).getTime() - fromISO(start).getTime()) / 86_400_000,
          ),
        };
      })
      .reverse();

    const byMonth = new Map<string, number[]>();
    rows.forEach((r) => {
      const d = fromISO(r.start);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth.set(key, [...(byMonth.get(key) ?? []), r.length]);
    });

    const chart = [...byMonth.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([key, values]) => {
        const [, m] = key.split('-').map(Number);
        return {
          label: MONTHS_SHORT[m],
          month: MONTHS_SHORT[m],
          value: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        };
      });

    return { rows, chart };
  }, [starts]);
}

export default function HistoryScreen({ api, onBack }: Props) {
  const { model, data } = api;
  const [tab, setTab] = useState<Tab>('length');
  const { rows, chart } = useCycleSeries(data.periodStarts);
  const [selected, setSelected] = useState(Math.max(0, chart.length - 2));

  const maxLen = Math.max(35, ...rows.map((r) => r.length));
  const irregular = model.longest - model.shortest > 7;

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />

      <header className={styles.header}>
        <button className={styles.back} onClick={onBack} aria-label="Go back">
          <IconArrowLeft size={17} />
        </button>
        <h1 className={styles.title}>Cycle History</h1>
      </header>

      <div className={styles.scroll}>
        <div className={styles.tabs} role="tablist" aria-label="History view">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              className={`${styles.tab} ${tab === t.key ? styles.tabOn : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'length' && (
          <>
            <section className={styles.banner}>
              <p>
                Your cycle length is usually <br />
                between {model.shortest}–{model.longest} days.
              </p>
              <img src={asset('girl-banner.png')} alt="" />
            </section>

            <section className={styles.chartCard} aria-label="Cycle length chart">
              <CycleChart
                data={chart.length ? chart : [{ label: '—', month: '—', value: model.averageLength }]}
                selected={Math.min(selected, Math.max(0, chart.length - 1))}
                onSelect={setSelected}
                bandIndex={Math.min(selected, Math.max(0, chart.length - 1))}
                bandLabel={irregular ? 'Irregular' : 'Regular'}
              />
            </section>

            <section className={styles.recent}>
              <header className={styles.recentHead}>
                <h2>Recent Cycles</h2>
                <button className={styles.viewAll}>View All</button>
              </header>
              <ul>
                {rows.slice(0, 5).map((r) => {
                  const d = fromISO(r.start);
                  const end = fromISO(r.end);
                  const hot = r.start === rows[Math.min(selected, rows.length - 1)]?.start;
                  return (
                    <li key={r.start} className={hot ? styles.rowHot : undefined}>
                      <span className={styles.rowLen}>{r.length} days</span>
                      <span className={styles.bar}>
                        <i
                          style={{ width: `${Math.min(100, (r.length / maxLen) * 100)}%` }}
                          className={hot ? styles.barHot : undefined}
                        />
                      </span>
                      <span className={styles.rowDates}>
                        {d.getDate()} {MONTHS_SHORT[d.getMonth()]} – {end.getDate()}{' '}
                        {MONTHS_SHORT[end.getMonth()]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </>
        )}

        {tab === 'symptoms' && (
          <section className={styles.recent}>
            <header className={styles.recentHead}>
              <h2>Symptom Frequency</h2>
            </header>
            <ul>
              {[
                ['Cramps', 70],
                ['Bloating', 60],
                ['Headache', 50],
                ['Acne', 40],
                ['Mood swings', 35],
              ].map(([label, pct]) => (
                <li key={String(label)}>
                  <span className={styles.rowLen}>{label}</span>
                  <span className={styles.bar}>
                    <i style={{ width: `${pct}%` }} />
                  </span>
                  <span className={styles.rowDates}>{pct}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'mood' && (
          <section className={styles.recent}>
            <header className={styles.recentHead}>
              <h2>Mood Pattern</h2>
            </header>
            <p className={styles.moodNote}>
              Your mood logs are private to this device. Log a few more days to see how mood
              changes across your cycle.
            </p>
          </section>
        )}

        <section className={styles.insight}>
          <img src={asset('girl-insight.png')} alt="" />
          <div>
            <h2>Cycle Insight</h2>
            <p>
              Your cycle length has been slightly irregular this year. This can be normal. Keep
              tracking to get better predictions.
            </p>
            <p className={styles.disclaimer}>
              Predictions are estimates and are not medical advice.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
