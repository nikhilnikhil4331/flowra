/**
 * Single slider component used by Pain / Bloating / Stress / Energy.
 * All four share identical geometry (reference: track 9px rounded, pink fill,
 * 21px white thumb, 0–10 ticks).
 */
import styles from './LevelSlider.module.css';

type Props = {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  name: string;
};

export default function LevelSlider({ label, hint, value, onChange, max = 10, name }: Props) {
  const pct = (value / max) * 100;
  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <span className={styles.label}>
          {label}
          {hint && <span className={styles.hint}>{hint}</span>}
        </span>
        <span className={styles.value}>
          {value}/{max}
        </span>
      </div>

      <div className={styles.trackWrap}>
        <div className={styles.track} aria-hidden="true">
          <div className={styles.fill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.thumb} style={{ left: `${pct}%` }} aria-hidden="true" />
        <input
          className={styles.input}
          type="range"
          min={0}
          max={max}
          step={1}
          value={value}
          aria-label={name}
          aria-valuetext={`${value} of ${max}`}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>

      <div className={styles.ticks} aria-hidden="true">
        {Array.from({ length: max / 2 + 1 }, (_, i) => (
          <span key={i}>{i * 2}</span>
        ))}
      </div>
    </div>
  );
}
