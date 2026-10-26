import React, { useState } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store';
import { useAnalytics } from './Insights';
import { fromKey, add } from '../lib/cycle';
import { HBar } from '../components/charts';
import { Header, ScreenScroll, Segmented, Card, SectionTitle, Mascot, EmptyState } from '../components/ui';

const BAR_COLORS = ['#F25B8A', '#F9B8CE', '#B9A7F2', '#FBD3DF'];

export function CycleHistory() {
  const a = useAnalytics();
  const go = useStore((s) => s.go);
  const [tab, setTab] = useState<'Cycle Length' | 'Symptoms' | 'Mood'>('Cycle Length');
  const [showAll, setShowAll] = useState(false);

  const irregular = a.hi - a.lo > 7;
  const completed = [...a.cycle.cyclesHistory].filter((h) => h.length).reverse();
  const shown = showAll ? completed : completed.slice(0, 5);

  /* ----- cycle length line chart (reference style, with y-axis) ----- */
  const data = a.lenData;
  const W = 322;
  const H = 176;
  const padL = 28;
  const padR = 10;
  const padT = 26;
  const padB = 22;
  const yMax = 40;
  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(1, data.length - 1)) * (W - padL - padR),
    y: padT + (1 - d.value / yMax) * (H - padT - padB),
    ...d,
  }));
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Cycle History" />
      <div className="px-5 pb-3 shrink-0">
        <Segmented
          options={[
            { id: 'Cycle Length', label: 'Cycle Length' },
            { id: 'Symptoms', label: 'Symptoms' },
            { id: 'Mood', label: 'Mood' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <ScreenScroll>
        <div className="px-5 space-y-4 pb-5">
          {tab === 'Cycle Length' && (
            <>
              {/* summary card */}
              <div className="relative bg-[#FDE9F2] rounded-[22px] px-4 pt-4 pb-3 flex items-end overflow-hidden animate-fade-up">
                <p className="flex-1 text-[14.5px] font-bold text-ink leading-snug pb-2 pr-2">
                  Your cycle length is usually between {a.lo}–{a.hi} days.
                </p>
                <Mascot src="/images/mascot-hello.png" alt="" className="h-[92px] w-auto -mb-3 -mr-1 shrink-0" />
              </div>

              {/* chart */}
              <Card className="p-3.5 animate-fade-up">
                {data.length >= 2 ? (
                  <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Cycle length over recent months">
                    <defs>
                      <linearGradient id="chFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F25B8A" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#B9A7F2" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    {[0, 20, 30, 40].map((v) => {
                      const y = padT + (1 - v / yMax) * (H - padT - padB);
                      return (
                        <g key={v}>
                          <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="#F3E2E9" strokeWidth={1} />
                          <text x={padL - 6} y={y + 3} textAnchor="end" fontSize={9} fontWeight={700} fill="#C79CA9" fontFamily="Nunito, sans-serif">
                            {v}
                          </text>
                        </g>
                      );
                    })}
                    {/* regular / irregular tag */}
                    <g>
                      <rect x={W - 92} y={2} width={84} height={20} rx={10} fill={irregular ? '#DED9F7' : '#D9F2E9'} />
                      <text x={W - 50} y={15} textAnchor="middle" fontSize={9.5} fontWeight={800} fill={irregular ? '#6C5CA8' : '#2F8C76'} fontFamily="Nunito, sans-serif">
                        {irregular ? 'Irregular' : 'Regular'}
                      </text>
                    </g>
                    <path d={`${linePath} L ${last.x} ${H - padB} L ${pts[0].x} ${H - padB} Z`} fill="url(#chFill)" />
                    <path d={linePath} fill="none" stroke="#F25B8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.6 : 3.4} fill="#EE4D7B" stroke="#fff" strokeWidth={1.6} />
                    ))}
                    {/* callout on latest point */}
                    <g>
                      <rect x={Math.min(Math.max(last.x - 30, padL), W - 66)} y={Math.max(2, last.y - 34)} width={58} height={20} rx={10} fill="#FFFFFF" stroke="#F8BBD0" />
                      <text x={Math.min(Math.max(last.x - 30, padL), W - 66) + 29} y={Math.max(2, last.y - 34) + 13.5} textAnchor="middle" fontSize={9.5} fontWeight={800} fill="#3D2C33" fontFamily="Nunito, sans-serif">
                        {last.value} days
                      </text>
                    </g>
                    {pts.map((p, i) => (
                      <text key={`x-${i}`} x={p.x} y={H - 6} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#C79CA9" fontFamily="Nunito, sans-serif">
                        {p.label}
                      </text>
                    ))}
                  </svg>
                ) : (
                  <EmptyState emoji="🌱" title="Not enough data yet" desc="Log two periods to unlock your cycle chart." />
                )}
              </Card>

              {/* recent cycles */}
              <Card className="p-4 animate-fade-up">
                <div className="flex items-center justify-between mb-1">
                  <SectionTitle>Recent Cycles</SectionTitle>
                  {completed.length > 5 && (
                    <button onClick={() => setShowAll(!showAll)} className="tap text-[11.5px] font-extrabold text-primary">
                      {showAll ? 'Show less' : 'View All'}
                    </button>
                  )}
                </div>
                {shown.length === 0 && <EmptyState emoji="🌱" title="No completed cycles yet" desc="Your history will appear here." />}
                {shown.map((h, i) => {
                  const len = h.length ?? 0;
                  const start = fromKey(h.start);
                  const end = add(start, len - 1);
                  return (
                    <div key={h.start} className={`flex items-center gap-3 py-2.5 ${i < shown.length - 1 ? 'border-b border-blush-line/50' : ''}`}>
                      <span className="w-[62px] text-[13px] font-extrabold shrink-0">{len} days</span>
                      <span className="flex-1 h-[10px] rounded-full bg-[#F7EDF1] overflow-hidden">
                        <span
                          className="block h-full rounded-full"
                          style={{ width: `${Math.min(100, (len / 40) * 100)}%`, background: BAR_COLORS[i % BAR_COLORS.length], transition: 'width .6s ease' }}
                        />
                      </span>
                      <span className="w-[108px] text-right text-[11px] font-bold text-ink-mute shrink-0">
                        {format(start, 'd MMM')} - {format(end, 'd MMM')}
                      </span>
                    </div>
                  );
                })}
              </Card>

              {/* insight */}
              <div className="bg-[#FDE9F2] rounded-[22px] p-3.5 flex gap-3 items-start animate-fade-up">
                <span className="relative shrink-0">
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[13px]">💡</span>
                  <Mascot src="/images/mascot-avatar.png" className="w-[58px] h-[58px] rounded-full object-cover mt-2" blend={false} alt="" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-extrabold">Cycle Insight</span>
                  <span className="block text-[12px] font-semibold text-ink-soft leading-relaxed mt-0.5">
                    {irregular
                      ? `Your cycle length has been slightly irregular (${a.lo}–${a.hi} days). This can be normal. Keep tracking to get better predictions.`
                      : `Your cycles look regular this year — usually ${a.lo}–${a.hi} days. Keep tracking to get even better predictions.`}
                  </span>
                </span>
              </div>

              <button onClick={() => go('reports')} className="tap w-full text-center text-[12px] font-extrabold text-ink-mute pb-1">
                View detailed reports →
              </button>
            </>
          )}

          {tab === 'Symptoms' && (
            <Card className="p-4 animate-fade-up">
              <SectionTitle className="mb-1">Symptom frequency</SectionTitle>
              <p className="text-[11px] font-semibold text-ink-mute mb-3">Across all your logged days</p>
              {a.symFreq.length ? (
                <div className="space-y-3">
                  {a.symFreq.map((s) => <HBar key={s.label} label={s.label} pct={s.pct} />)}
                </div>
              ) : (
                <EmptyState emoji="📝" title="No symptoms logged" desc="Patterns will appear as you log your days." />
              )}
            </Card>
          )}

          {tab === 'Mood' && (
            <Card className="p-4 animate-fade-up">
              <SectionTitle className="mb-1">Your mood rhythm</SectionTitle>
              <p className="text-[11px] font-semibold text-ink-mute mb-3">Share of days you felt each mood</p>
              {a.moodFreq.length ? (
                <div className="space-y-3">
                  {a.moodFreq.map((m) => <HBar key={m.label} label={m.label} pct={m.pct} />)}
                </div>
              ) : (
                <EmptyState emoji="💗" title="No moods logged yet" desc="Log your mood daily to reveal your emotional rhythm." />
              )}
            </Card>
          )}
        </div>
      </ScreenScroll>
    </div>
  );
}
