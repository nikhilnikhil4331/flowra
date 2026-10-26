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

export function CycleWheel({ cycle, size = 300 }: { cycle: CycleInfo; size?: number }) {
  const total = Math.max(cycle.avgCycle, cycle.cycleDay, 21);
  const R = size / 2 - 34;
  const c = size / 2;
  const angleFor = (day: number) => ((day - cycle.cycleDay) / total) * 360;
  const daySpan = 360 / total;

  // period arc (days 1..avgPeriodLen), fertile arc, ovulation marker
  const ovDay = Math.round(total - 14);
  const fertileFrom = ovDay - 5;

  const labels: { day: number; pos: { x: number; y: number }; current: boolean }[] = [];
  for (let off = -Math.floor(total / 2); off <= Math.floor(total / 2); off++) {
    const day = (((cycle.cycleDay - 1 + off) % total) + total) % total + 1;
    if (Math.abs(off) <= 2 || off % 7 === 0) {
      labels.push({ day, pos: polar(c, c, R + 20, off * daySpan), current: off === 0 });
    }
  }

  const dots = Array.from({ length: total }, (_, i) => i + 1).map((day) => {
    const p = polar(c, c, R, angleFor(day));
    const isPeriod = day <= cycle.avgPeriodLen;
    const isOv = day === ovDay;
    return { day, p, isPeriod, isOv };
  });

  const curPos = polar(c, c, R, 0);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`Cycle wheel. Day ${cycle.cycleDay}, ${cycle.phaseLabel}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="wheelPink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F78FB0" />
            <stop offset="100%" stopColor="#EE4D7B" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle cx={c} cy={c} r={R} stroke="#FBE3EB" strokeWidth={15} fill="none" />
        <circle cx={c} cy={c} r={R - 16} stroke="#FDFAF7" strokeWidth={1.5} fill="#FFFBF9" />
        {/* fertile arc */}
        <ArcSeg size={size} r={R} fromDeg={angleFor(fertileFrom) - daySpan / 2} spanDeg={daySpan * 7} color="#C9B8F7" width={15} opacity={0.85} />
        {/* period arc */}
        <ArcSeg size={size} r={R} fromDeg={angleFor(1) - daySpan / 2} spanDeg={daySpan * cycle.avgPeriodLen} color="url(#wheelPink)" width={15} />
        {/* traveled arc up to today */}
        <ArcSeg size={size} r={R} fromDeg={angleFor(1)} spanDeg={(cycle.cycleDay - 1) * daySpan} color="#F25B8A" width={15} opacity={0.25} />
        {/* day dots */}
        {dots.map(({ day, p, isPeriod, isOv }) => (
          <circle
            key={day}
            cx={p.x}
            cy={p.y}
            r={isOv ? 3.4 : 1.8}
            fill={isOv ? '#FFB657' : isPeriod ? '#FFFFFF' : '#EFBBCC'}
            opacity={isPeriod ? 0.95 : 1}
          />
        ))}
        {/* tiny droplets on predicted period days */}
        {dots
          .filter((d) => d.isPeriod && d.day !== cycle.cycleDay)
          .map(({ day, p }) => (
            <g key={`drop-${day}`} transform={`translate(${p.x - 4.5} ${p.y - 5.5})`}>
              <path d="M4.5 0C4.5 0 0 5.2 0 7.4a4.5 4.5 0 0 0 9 0C9 5.2 4.5 0 4.5 0Z" fill="#EE4D7B" />
            </g>
          ))}
        {/* day number labels */}
        {labels.map(({ day, pos, current }, i) => (
          <text
            key={`${day}-${i}`}
            x={pos.x}
            y={pos.y + 3}
            textAnchor="middle"
            fontSize={current ? 11 : 9}
            fontWeight={800}
            fill={current ? '#EE4D7B' : '#C79CA9'}
            fontFamily="Nunito, sans-serif"
          >
            {String(day).padStart(2, '0')}
          </text>
        ))}
      </svg>

      {/* current day droplet marker */}
      <div
        className="absolute z-10 w-[30px] h-[30px] rounded-full bg-white shadow-btn border-2 border-primary flex items-center justify-center"
        style={{ left: curPos.x - 15, top: curPos.y - 15 }}
      >
        <svg width="13" height="16" viewBox="0 0 24 28" aria-hidden>
          <path d="M12 1.5C12 1.5 3.5 12 3.5 17.5a8.5 8.5 0 0 0 17 0C20.5 12 12 1.5 12 1.5Z" fill="#EE4D7B" />
        </svg>
      </div>
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
