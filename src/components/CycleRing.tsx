/**
 * Circular cycle dial.
 *
 * All radii measured from the reference screenshot and converted to css px
 * (page surface is 734 ref-px wide for a 390 css-px board, see design/SPEC.md):
 *
 *   outer track   r 163.7   stroke 1.6   #FBB7C6
 *   tick dots     r 148.5   Ø 3
 *   day numbers   r 125     13px / 500
 *   band          annulus r 97.6 → 163.7, −84° … +72°, rounded caps
 *   badges        Ø 41 white, pink ring, at −27° (r 130) and +60° (r 121)
 *   caption       white, r 130, written along the band
 *   inner circle  r 92.4    stroke 1.8   #FBC2CE
 */

import styles from './CycleRing.module.css';
import { IconDrop } from './Icons';

type Props = {
  dayNumber: number;
  phaseTitle: string;
  phaseNote: string;
};

const R = 163.7;
const SIZE = R * 2;
const CX = R;
const CY = R;

const R_TRACK = R;
const R_TICKS = 148.5;
const R_LABEL = 125;
const R_INNER = 92.4;

const BAND_START = -84;
const BAND_END = 72;

/**
 * Inner edge of the band, sampled from the reference every 10°: a thin arc at 12
 * o'clock that funnels outward through the "04" marker, then rides just outside
 * the inner circle — the crescent visible in the design.
 */
const INNER_PROFILE: [number, number][] = [
  [-84, 152.7],
  [-70, 151.1],
  [-60, 150.6],
  [-50, 148.5],
  [-40, 146.9],
  [-30, 142.1],
  [-25, 134.0],
  [-20, 118.0],
  [-15, 103.0],
  [-10, 97.6],
  [0, 97.6],
  [20, 97.6],
  [40, 98.5],
  [55, 99.0],
  [65, 100.0],
  [72, 104.0],
];

/**
 * Outer edge of the band, sampled from the reference: it rides just inside the
 * decorative outer circle (r 163.7) and tucks in around 20°–30°, which is the
 * white gap visible on the right of the design.
 */
const OUTER_PROFILE: [number, number][] = [
  [-84, 158.4],
  [-70, 157.4],
  [-58, 156.4],
  [-46, 155.0],
  [-34, 154.2],
  [-20, 153.8],
  [-4, 153.6],
  [10, 153.2],
  [26, 153.4],
  [40, 154.6],
  [54, 156.2],
  [64, 157.8],
  [72, 160.2],
];

function outerRadiusAt(deg: number): number {
  if (deg <= OUTER_PROFILE[0][0]) return OUTER_PROFILE[0][1];
  for (let i = 1; i < OUTER_PROFILE.length; i += 1) {
    const [a0, r0] = OUTER_PROFILE[i - 1];
    const [a1, r1] = OUTER_PROFILE[i];
    if (deg <= a1) {
      const t = (deg - a0) / (a1 - a0);
      const st = t * t * (3 - 2 * t);
      return r0 + (r1 - r0) * st;
    }
  }
  return OUTER_PROFILE[OUTER_PROFILE.length - 1][1];
}

function innerRadiusAt(deg: number): number {
  if (deg <= INNER_PROFILE[0][0]) return INNER_PROFILE[0][1];
  for (let i = 1; i < INNER_PROFILE.length; i += 1) {
    const [a0, r0] = INNER_PROFILE[i - 1];
    const [a1, r1] = INNER_PROFILE[i];
    if (deg <= a1) {
      const t = (deg - a0) / (a1 - a0);
      // smoothstep so the edge reads as a drawn curve, not a polyline
      const st = t * t * (3 - 2 * t);
      return r0 + (r1 - r0) * st;
    }
  }
  return INNER_PROFILE[INNER_PROFILE.length - 1][1];
}

const polar = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
};

/**
 * Single closed outline for the band: outer edge → rounded end cap → inner edge
 * → rounded start cap. Building the caps into the path keeps the gradient
 * continuous (flat-coloured cap circles showed as a visible seam).
 */
function bandShape(startDeg: number, endDeg: number) {
  const steps = 180;
  const f = (p: { x: number; y: number }) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const deg = startDeg + ((endDeg - startDeg) * i) / steps;
    outer.push(`L ${f(polar(deg, outerRadiusAt(deg)))}`);
    inner.unshift(`L ${f(polar(deg, innerRadiusAt(deg)))}`);
  }
  const cap = (deg: number, dir: 1 | -1) => {
    const rIn = innerRadiusAt(deg);
    const rOut = outerRadiusAt(deg);
    const mid = polar(deg, (rIn + rOut) / 2);
    const rad = (rOut - rIn) / 2;
    const ux = Math.cos((deg * Math.PI) / 180);
    const uy = Math.sin((deg * Math.PI) / 180);
    const tx = -uy * dir;
    const ty = ux * dir;
    const pts: string[] = [];
    for (let k = 1; k < 12; k += 1) {
      const phi = (Math.PI * k) / 12;
      const px = mid.x + rad * (Math.cos(phi) * ux + Math.sin(phi) * tx);
      const py = mid.y + rad * (Math.cos(phi) * uy + Math.sin(phi) * ty);
      pts.push(`L ${f({ x: px, y: py })}`);
    }
    return pts;
  };
  return [
    `M ${f(polar(startDeg, outerRadiusAt(startDeg)))}`,
    ...outer,
    ...cap(endDeg, 1),
    ...inner,
    ...cap(startDeg, -1),
    'Z',
  ].join(' ');
}

const DIAL_LABELS = [
  { deg: -90, text: '01' },
  { deg: -54, text: '04' },
  { deg: -126, text: '28' },
  { deg: -162, text: '25' },
  { deg: 162, text: '22' },
  { deg: 126, text: '19' },
  { deg: 90, text: '16' },
];

/** helper copy wraps like the reference ("Low chance of getting" / "pregnant") */
function splitNote(note: string): string[] {
  const maxChars = 22;
  const lines: string[] = [];
  let line = '';
  note.split(' ').forEach((w) => {
    if (line && (line + ' ' + w).length > maxChars) {
      lines.push(line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  });
  if (line) lines.push(line);
  return lines;
}

export default function CycleRing({ dayNumber, phaseTitle, phaseNote }: Props) {
  const badgeA = polar(-27, 123.4);
  const badgeB = polar(59, 129.9);
  const midDeg = (BAND_START + BAND_END) / 2;
  const caption = polar(midDeg + 31, 129);
  const lines = splitNote(phaseNote);

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.svg}
        role="img"
        aria-label={`Cycle day ${dayNumber}, ${phaseTitle}. ${phaseNote}`}
      >
        <defs>
          <linearGradient id="bandFill" x1="0.05" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="#ff5f92" />
            <stop offset="0.5" stopColor="#fe5a8c" />
            <stop offset="1" stopColor="#fd5183" />
          </linearGradient>
        </defs>

        {/* 1 — outer track */}
        <circle cx={CX} cy={CY} r={R_TRACK} fill="none" stroke="#fbb7c6" strokeWidth={1.6} />

        {/* 2 — decorative ticks */}
        <g fill="#8f8899">
          {Array.from({ length: 24 }, (_, i) => {
            const p = polar(-84 + i * 15, R_TICKS);
            return <circle key={i} cx={p.x} cy={p.y} r={1.4} />;
          })}
        </g>

        {/* 3 — day numbers */}
        <g fill="#5a5464" fontSize={13} fontWeight={500} textAnchor="middle" dominantBaseline="middle">
          {DIAL_LABELS.map((l) => {
            const p = polar(l.deg, R_LABEL);
            return (
              <text key={l.text} x={p.x} y={p.y + 0.5}>
                {l.text}
              </text>
            );
          })}
        </g>

        {/* 4 — menstrual band + rounded caps */}
        <g className={styles.band}>
          <path d={bandShape(BAND_START, BAND_END)} fill="url(#bandFill)" />
        </g>

        {/* 5 — badges */}
        {[badgeA, badgeB].map((p, i) => (
          <g key={i} className={styles.badge}>
            <circle cx={p.x} cy={p.y} r={20.5} fill="#ffffff" stroke="#fe6291" strokeWidth={1.3} />
            <image
              href={`${import.meta.env.BASE_URL}assets/drop-small.png`}
              x={p.x - 7.5}
              y={p.y - 10}
              width={15}
              height={20}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        ))}

        {/* caption along the band */}
        <text
          className={styles.caption}
          x={caption.x}
          y={caption.y}
          transform={`rotate(${midDeg + 31 + 90} ${caption.x} ${caption.y})`}
        >
          Menstrual
        </text>

        {/* 6 — inner circle */}
        <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#fbc2ce" strokeWidth={1.8} />

        {/* centre stack */}
        <g className={styles.centre}>
          <g transform={`translate(${CX - 15} ${CY - 60})`}>
            <IconDrop size={30} />
          </g>
          <text x={CX} y={CY - 2} className={styles.day} textAnchor="middle">
            Day {dayNumber}
          </text>
          <text x={CX} y={CY + 20} className={styles.phase} textAnchor="middle">
            {phaseTitle}
          </text>
          {lines.map((line, i) => (
            <text key={line + i} x={CX} y={CY + 41 + i * 17} className={styles.note} textAnchor="middle">
              {line}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}
