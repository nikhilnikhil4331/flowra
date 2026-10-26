import React from 'react';
import { CycleInfo } from '../lib/cycle';

/* ------------------------------ Cycle wheel -------------------------------- */

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

function ArcSeg({
  size, r, fromDeg, spanDeg, color, width, opacity = 1, keyId,
}: {
  size: number; r: number; fromDeg: number; spanDeg: number; color: string; width: number; opacity?: number; keyId?: string;
}) {
  const s = polar(size / 2, size / 2, r, fromDeg);
  const e = polar(size / 2, size / 2, r, fromDeg + spanDeg);
  const large = spanDeg > 180 ? 1 : 0;
  return (
    <path
      key={keyId}
      d={`M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      fill="none"
      opacity={opacity}
    />
  );
}

export function CycleWheel({ cycle, size = 312 }: { cycle: CycleInfo; size?: number }) {
  const total = Math.max(cycle.avgCycle, cycle.cycleDay, 21);
  const c = size / 2;
  const R_OUT = size / 2 - 8;   // thin outer ring with tick dots
  const R_NUM = size / 2 - 31;  // day numbers (01, 04, 07 …)
  const R_ARC = size / 2 - 47;  // thick "Menstrual" arc
  const R_IN = size / 2 - 79;   // inner thin circle
  const ARC_W = 27;

  // Day 1 sits at the top; days advance clockwise — exactly like the reference dial.
  const dayAngle = (day: number) => ((day - 1) / total) * 360;
  const periodSpan = Math.max(10, (cycle.avgPeriodLen / total) * 360);
  const arcStart = -4;

  const labels: number[] = [];
  for (let d = 1; d <= total; d += 3) labels.push(d);

  const a0 = polar(c, c, R_ARC, arcStart);
  const a1 = polar(c, c, R_ARC, arcStart + periodSpan);
  const arcPath = `M ${a0.x} ${a0.y} A ${R_ARC} ${R_ARC} 0 ${periodSpan > 180 ? 1 : 0} 1 ${a1.x} ${a1.y}`;

  const markerDays = Array.from(new Set([Math.min(4, cycle.avgPeriodLen), cycle.avgPeriodLen])).filter(
    (d, i, arr) => i === 0 || dayAngle(d) - dayAngle(arr[0]) > 16,
  );

  const todayAngle = dayAngle(Math.min(cycle.cycleDay, total));
  const todayInArc = todayAngle >= arcStart && todayAngle <= arcStart + periodSpan;

  const Drop = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
    <g transform={`translate(${x - 5.5 * s} ${y - 6.6 * s}) scale(${s})`}>
      <path d="M5.5 0C5.5 0 0 6.4 0 8.9a5.5 5.5 0 0 0 11 0C11 6.4 5.5 0 5.5 0Z" fill="#EE4D7B" />
    </g>
  );

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`Cycle wheel. Day ${cycle.cycleDay}, ${cycle.phaseLabel}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="wheelPink" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#F78FB0" />
            <stop offset="55%" stopColor="#F25B8A" />
            <stop offset="100%" stopColor="#EE4D7B" />
          </linearGradient>
          <path id="menstrualArcPath" d={arcPath} fill="none" />
        </defs>

        {/* thin outer ring */}
        <circle cx={c} cy={c} r={R_OUT} stroke="#F0A9C0" strokeWidth={1.4} fill="none" />
        {/* tick dots for every day */}
        {Array.from({ length: total }, (_, i) => {
          const p = polar(c, c, R_OUT, dayAngle(i + 1));
          return <circle key={i} cx={p.x} cy={p.y} r={1.7} fill="#E58AA6" />;
        })}

        {/* day numbers every 3 days */}
        {labels.map((day) => {
          const p = polar(c, c, R_NUM, dayAngle(day));
          const current = day === cycle.cycleDay;
          return (
            <text
              key={day}
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={current ? 900 : 700}
              fill={current ? '#EE4D7B' : '#8A6D76'}
              fontFamily="Nunito, sans-serif"
            >
              {String(day).padStart(2, '0')}
            </text>
          );
        })}

        {/* thick menstrual arc */}
        <path d={arcPath} stroke="url(#wheelPink)" strokeWidth={ARC_W} strokeLinecap="round" fill="none" />
        {periodSpan > 24 && (
          <text fontSize={10.5} fontWeight={800} fill="#FFFFFF" fontFamily="Nunito, sans-serif" letterSpacing={2.5}>
            <textPath href="#menstrualArcPath" startOffset="52%" textAnchor="middle">
              Menstrual
            </textPath>
          </text>
        )}

        {/* droplet badges on the arc */}
        {markerDays.map((d) => {
          const p = polar(c, c, R_ARC, dayAngle(d));
          return (
            <g key={d}>
              <circle cx={p.x} cy={p.y} r={11.5} fill="#FFFFFF" />
              <Drop x={p.x} y={p.y} />
            </g>
          );
        })}

        {/* today marker when outside the menstrual arc */}
        {!todayInArc && (
          <g>
            {(() => {
              const p = polar(c, c, R_OUT, todayAngle);
              return (
                <>
                  <circle cx={p.x} cy={p.y} r={9.5} fill="#FFFFFF" stroke="#EE4D7B" strokeWidth={2} />
                  <Drop x={p.x} y={p.y} s={0.8} />
                </>
              );
            })()}
          </g>
        )}

        {/* inner thin circle */}
        <circle cx={c} cy={c} r={R_IN} stroke="#F0A9C0" strokeWidth={1.4} fill="#FFFBF9" />
      </svg>
    </div>
  );
}

/* ------------------------------- progress ring ------------------------------ */

export function Ring({
  value, goal, color, label, unit, size = 88,
}: {
  value: number; goal: number; color: string; label: string; unit: string; size?: number;
}) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  return (
    <div className="flex flex-col items-center" role="img" aria-label={`${label}: ${value} of ${goal} ${unit}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#F6E3E9" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
            style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,.9,.35,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[15px] font-black leading-none" style={{ color }}>{value}</span>
          <span className="text-[8.5px] font-bold text-ink-mute leading-tight">{goal}{unit}</span>
        </div>
      </div>
      <span className="text-[11px] font-extrabold text-ink-soft mt-1">{label}</span>
    </div>
  );
}

/* -------------------------------- bar chart --------------------------------- */

export function BarChart({
  data, max, height = 96, unit = '',
}: {
  data: { label: string; value: number }[]; max: number; height?: number; unit?: string;
}) {
  const avg = data.length ? data.reduce((a, d) => a + d.value, 0) / data.length : 0;
  return (
    <div>
      <div className="relative" style={{ height }}>
        <div className="avg-dash absolute inset-x-0" style={{ bottom: `${(avg / max) * 100}%` }} aria-hidden />
        <div className="flex items-end justify-between h-full px-1 gap-2">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.label}: ${d.value}${unit}`}>
              <div
                className={`w-full max-w-[22px] rounded-t-lg rounded-b-md ${i === data.length - 1 ? 'bg-grad-pink' : 'bg-[#F9C4D7]'}`}
                style={{ height: `${Math.max(6, (d.value / max) * 100)}%`, transition: 'height .6s ease' }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between px-1 gap-2 mt-1.5">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[9.5px] font-bold text-ink-mute">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------- line chart -------------------------------- */

export function LineChart({
  data, max = 10, height = 104, color = '#F25B8A',
}: {
  data: { label: string; value: number }[]; max?: number; height?: number; color?: string;
}) {
  const W = 320;
  const H = height;
  const padX = 12;
  const padY = 10;
  const pts = data.map((d, i) => ({
    x: padX + (i / Math.max(1, data.length - 1)) * (W - padX * 2),
    y: padY + (1 - d.value / max) * (H - padY * 2),
    ...d,
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L ${pts[pts.length - 1]?.x ?? W} ${H - 2} L ${pts[0]?.x ?? 0} ${H - 2} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="trend chart">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={4} x2={W - 4} y1={H * f} y2={H * f} stroke="#F7E3E6" strokeWidth={1} />
        ))}
        <path d={area} fill="url(#lineFill)" />
        <path d={path} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.6} fill="#fff" stroke={color} strokeWidth={2.2} />
          </g>
        ))}
      </svg>
      <div className="flex justify-between px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9.5px] font-bold text-ink-mute">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ horizontal bar ------------------------------ */

export function HBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[86px] text-[12px] font-bold text-ink-soft shrink-0">{label}</span>
      <div className="flex-1 h-[10px] rounded-full bg-primary-pale overflow-hidden">
        <div
          className="h-full rounded-full bg-grad-pink"
          style={{ width: `${Math.min(100, pct)}%`, transition: 'width .7s cubic-bezier(.22,.9,.35,1)' }}
        />
      </div>
      <span className="w-[34px] text-right text-[11.5px] font-extrabold text-ink-soft">{pct}%</span>
    </div>
  );
}
