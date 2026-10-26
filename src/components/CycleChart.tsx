/**
 * Cycle-length line chart (custom SVG so the curve, band and tooltip match the
 * reference geometry). Points are keyboard-focusable buttons; selecting one
 * reveals its value and month and drives the "recent cycles" highlight.
 */
import { useId } from 'react';
import styles from './CycleChart.module.css';

export type ChartPoint = {
  label: string;
  value: number;
  /** full month name for the tooltip / a11y */
  month: string;
};

type Props = {
  data: ChartPoint[];
  selected: number;
  onSelect: (i: number) => void;
  /** index whose column is tinted (the "irregular" month) */
  bandIndex?: number;
  bandLabel?: string;
  domain?: [number, number];
};

const W = 320;
const H = 172;
const PAD = { left: 34, right: 8, top: 14, bottom: 26 };

export default function CycleChart({
  data,
  selected,
  onSelect,
  bandIndex,
  bandLabel = 'Irregular',
  domain = [0, 40],
}: Props) {
  const uid = useId().replace(/:/g, '');
  const [minY, maxY] = domain;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (i: number) =>
    PAD.left + (data.length === 1 ? plotW / 2 : (i * plotW) / (data.length - 1));
  const y = (v: number) =>
    PAD.top + plotH - ((Math.min(Math.max(v, minY), maxY) - minY) / (maxY - minY)) * plotH;

  const pts = data.map((d, i) => ({ x: x(i), y: y(d.value), ...d, i }));

  // Catmull-Rom → bezier for the gentle curve in the reference
  const path = pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[i - 1];
      const c1x = prev.x + (p.x - prev.x) / 2;
      return `C ${c1x} ${prev.y}, ${c1x} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(' ');

  const areaPath = `${path} L ${x(data.length - 1)} ${PAD.top + plotH} L ${x(0)} ${PAD.top + plotH} Z`;
  const ticks = [40, 30, 20, 0].filter((t) => t >= minY && t <= maxY);
  const band = bandIndex ?? data.length - 2;
  const bandX = x(band) - plotW / (data.length - 1) / 2.1;
  const bandW = plotW / (data.length - 1) / 1.05;

  return (
    <div className={styles.wrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.svg} role="group" aria-label="Cycle length by month">
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde3ee" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fde3ee" stopOpacity="0.16" />
          </linearGradient>
        </defs>

        {/* highlighted month column */}
        {bandIndex !== undefined && (
          <>
            <rect
              x={bandX}
              y={PAD.top - 6}
              width={bandW}
              height={plotH + 12}
              rx={7}
              fill="#efeafc"
              opacity={0.92}
            />
            <g className={styles.bandTag}>
              <rect x={bandX + bandW / 2 - 30} y={PAD.top - 6} width={60} height={18} rx={9} fill="#dcd3fb" />
              <text x={bandX + bandW / 2} y={PAD.top + 6.5} textAnchor="middle">
                {bandLabel}
              </text>
            </g>
          </>
        )}

        {/* grid + y labels */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="#efe6e6"
              strokeDasharray={t === 0 ? undefined : '3 4'}
              strokeWidth={1}
            />
            <text x={PAD.left - 9} y={y(t) + 3.5} textAnchor="end" className={styles.axis}>
              {t}
            </text>
          </g>
        ))}

        {/* axis lines */}
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top - 6} y2={PAD.top + plotH} stroke="#e7dcdc" strokeWidth={1} />
        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} stroke="#e7dcdc" strokeWidth={1} />

        <path d={areaPath} fill={`url(#fill-${uid})`} />
        <path d={path} fill="none" stroke="#fb6d95" strokeWidth={1.6} strokeLinecap="round" />

        {/* month labels */}
        {pts.map((p) => (
          <text key={p.label} x={p.x} y={H - 6} textAnchor="middle" className={styles.axis}>
            {p.label}
          </text>
        ))}

        {/* points */}
        {pts.map((p) => {
          const on = p.i === selected;
          return (
            <g key={p.label} className={styles.point} onClick={() => onSelect(p.i)}>
              <circle cx={p.x} cy={p.y} r={on ? 9 : 4.6} fill="#fb5a8b" opacity={on ? 0.92 : 1} />
              {on && <circle cx={p.x} cy={p.y} r={9} fill="none" stroke="#ffffff" strokeWidth={1.6} />}
              <circle cx={p.x} cy={p.y} r={13} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* tooltip rendered in HTML so it never clips and can animate */}
      <div
        className={styles.tooltip}
        style={{
          left: `${(x(selected) / W) * 100}%`,
          top: `${(y(data[selected]?.value ?? 0) / H) * 100}%`,
        }}
        role="status"
      >
        {data[selected]?.value} days
      </div>
    </div>
  );
}
