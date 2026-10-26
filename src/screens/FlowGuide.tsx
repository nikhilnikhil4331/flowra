import React, { useState } from 'react';
import { ChevronRight, TriangleAlert } from 'lucide-react';
import { useStore, useNav } from '../store';
import { FLOW_COLORS, DISCHARGE_INFO } from '../data/content';
import { Header, ScreenScroll, Segmented, DropletIcon, SectionTitle, Card } from '../components/ui';

/* -------------------------------- Flow Color -------------------------------- */

export function FlowColor() {
  const nav = useNav();
  const [selId, setSelId] = useState<string>((nav.params?.color as string) || 'bright-red');
  const info = FLOW_COLORS.find((c) => c.id === selId) ?? FLOW_COLORS[0];

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Flow Color" />
      <ScreenScroll>
        <div className="px-5 pt-1">
          <div className="grid grid-cols-4 gap-y-4" role="radiogroup" aria-label="Flow colour">
            {FLOW_COLORS.map((c) => {
              const on = selId === c.id;
              return (
                <button key={c.id} onClick={() => setSelId(c.id)} role="radio" aria-checked={on} className="tap flex flex-col items-center gap-1">
                  <span className={`w-[52px] h-[52px] rounded-full bg-white flex items-center justify-center border-2 transition-all ${on ? 'border-primary shadow-soft scale-105' : 'border-blush-line'}`}>
                    <DropletIcon size={19} color={c.hex} />
                  </span>
                  <span className={`text-[9.5px] font-extrabold text-center leading-tight ${on ? 'text-primary' : 'text-ink-mute'}`}>{c.name}</span>
                </button>
              );
            })}
          </div>

          <Card key={info.id} className="mt-5 p-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <DropletIcon size={30} color={info.hex} />
              <div>
                <h2 className="text-[16px] font-black leading-tight">{info.name}</h2>
                <p className="text-[11.5px] font-bold text-ink-mute">{info.short}</p>
              </div>
            </div>

            <p className="text-[12.5px] font-semibold text-ink-soft leading-relaxed mt-3">{info.description}</p>

            <SectionTitle className="mt-4 mb-1.5 text-[12.5px]">Possible reasons</SectionTitle>
            <ul className="space-y-1">
              {info.reasons.map((r) => (
                <li key={r} className="text-[12px] font-semibold text-ink-soft flex gap-2">
                  <span className="text-primary">•</span> {r}
                </li>
              ))}
            </ul>

            <div className="mt-4 bg-[#FFF6EC] border border-[#FBE3C2] rounded-2xl p-3">
              <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-[#B9791F]">
                <TriangleAlert size={14} strokeWidth={2.6} /> When to consult a doctor?
              </p>
              <ul className="mt-1.5 space-y-1">
                {info.consult.map((c) => (
                  <li key={c} className="text-[11.5px] font-semibold text-[#97722F] flex gap-2">
                    <span>•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          <p className="text-[10.5px] font-semibold text-ink-faint text-center mt-4 pb-4 px-4">
            This guide is for general awareness and is not medical advice.
          </p>
        </div>
      </ScreenScroll>
    </div>
  );
}

/* -------------------------------- Flow Guide -------------------------------- */

export function FlowGuide() {
  const go = useStore((s) => s.go);
  const [tab, setTab] = useState<'color' | 'discharge'>('color');

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Flow Guide" />
      <div className="px-5 pb-2.5 shrink-0">
        <button onClick={() => go('delay-guide')} className="tap w-full flex items-center gap-3 bg-primary-pale border border-primary-soft rounded-[20px] px-4 py-3 text-left">
          <span className="text-[19px]">⏳</span>
          <span className="flex-1 min-w-0">
            <span className="block text-[12.5px] font-extrabold leading-tight">Period delayed?</span>
            <span className="block text-[10.5px] font-semibold text-ink-mute">First precautions & care guide</span>
          </span>
          <ChevronRight size={15} className="text-primary shrink-0" strokeWidth={2.8} />
        </button>
      </div>
      <div className="px-5 pb-2 shrink-0">
        <Segmented
          options={[
            { id: 'color', label: 'Color Guide' },
            { id: 'discharge', label: 'Discharge Info' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      <ScreenScroll>
        <div className="px-5 pt-1 space-y-2 pb-4">
          {tab === 'color' &&
            FLOW_COLORS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => go('flow-color', { color: c.id })}
                className="tap w-full flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 px-3.5 py-3 text-left animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <DropletIcon size={18} color={c.hex} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-extrabold">{c.name}</span>
                  <span className="block text-[11px] font-semibold text-ink-mute truncate">{c.short}</span>
                </span>
                <ChevronRight size={15} className="text-ink-faint" strokeWidth={2.6} />
              </button>
            ))}

          {tab === 'discharge' &&
            DISCHARGE_INFO.map((d, i) => (
              <div
                key={d.name}
                className="flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 px-3.5 py-3 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <DropletIcon size={18} color={d.hex} />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-extrabold">{d.name}</span>
                  <span className="block text-[11px] font-semibold text-ink-mute">{d.desc}</span>
                </span>
              </div>
            ))}

          {tab === 'discharge' && (
            <p className="text-[10.5px] font-semibold text-ink-faint text-center pt-2 px-4">
              Discharge changes through your cycle. Unusual colour with itching, odour or discomfort should be checked by a doctor.
            </p>
          )}
        </div>
      </ScreenScroll>
    </div>
  );
}
