import React, { useMemo } from 'react';
import {
  CalendarCheck2, Hourglass, FlaskConical, Moon, Salad, Footprints, GlassWater,
  Pencil, Ban, Backpack, BellRing, Pill, Activity, TriangleAlert, ChevronRight,
} from 'lucide-react';
import { useStore } from '../store';
import { computeCycle, fmt } from '../lib/cycle';
import { MEDICAL_DISCLAIMER } from '../data/content';
import {
  Header, ScreenScroll, Card, SectionTitle, MascotAvatar, PrimaryButton, SoftButton,
} from '../components/ui';

const FIRST_STEPS = [
  { Icon: CalendarCheck2, tint: '#F25B8A', title: 'Recheck your dates', desc: 'Compare your expected date on the Calendar. A shift of 2–5 days from your usual cycle is very common.' },
  { Icon: Hourglass, tint: '#FFB657', title: 'Wait & watch a few days', desc: 'Most delayed periods arrive on their own within a week. Try not to stress-watch the calendar daily.' },
  { Icon: FlaskConical, tint: '#6FA8E8', title: 'Take a pregnancy test, if relevant', desc: 'If there is any chance of pregnancy, test about a week after your missed date using first-morning urine. If negative and still no period, repeat in 3–4 days.' },
  { Icon: Moon, tint: '#B9A7F2', title: 'Sleep well & de-stress', desc: 'Stress is the most common reason for a delay. Aim for 7–9 hours of sleep, slow breathing and a lighter schedule.' },
  { Icon: Salad, tint: '#4ECDC4', title: 'Eat regular, balanced meals', desc: 'Do not skip meals or crash-diet right now. Add iron and protein — dal, eggs, leafy greens, nuts and seeds.' },
  { Icon: Footprints, tint: '#F78FB0', title: 'Keep movement gentle', desc: 'Walks, stretching and light yoga are perfect. Avoid suddenly starting very intense workouts.' },
  { Icon: GlassWater, tint: '#6FA8E8', title: 'Hydrate; ease Caffeine & Alcohol', desc: 'Plenty of water helps, while too much Caffeine or Alcohol can disturb your sleep and cycle rhythm.' },
  { Icon: Pencil, tint: '#EE4D7B', title: 'Log everything in Myflo', desc: 'Note discharge, cramps, mood and any spotting each day — it helps you, and any doctor, see the pattern clearly.' },
];

const AVOID = [
  { title: 'Period-inducing or hormonal pills without a doctor', desc: 'They can hide the real cause and are unsafe without medical supervision.' },
  { title: "Home remedies to 'force' a period", desc: "Papaya, pineapple or herbal kadha aren't proven to start a period, and some can be unsafe if you are pregnant." },
  { title: 'Over-exercising or crash dieting', desc: 'Sudden extremes strain the body and can delay your next period even more.' },
];

const REASONS = [
  'Stress', 'Poor sleep', 'Travel / routine change', 'Illness or fever',
  'Sudden weight gain or loss', 'Very intense exercise', 'PCOS', 'Thyroid imbalance',
  'Certain medicines', 'Pregnancy', 'Perimenopause (40s)',
];

const BE_READY = [
  { Icon: Backpack, tint: '#F25B8A', title: 'Keep a period kit handy', desc: 'Pads, cup or tampons in your bag around the expected date — no last-minute panic.' },
  { Icon: BellRing, tint: '#B9A7F2', title: 'Turn on the Period Reminder', desc: 'Get notified 3 days before your expected date, every cycle.' },
  { Icon: Pill, tint: '#4ECDC4', title: 'Keep pain-care ready', desc: 'A heat patch or warm bottle and your usual pain relief within easy reach.' },
  { Icon: Activity, tint: '#FFB657', title: 'Track 2–3 cycles regularly', desc: 'The more you log, the more accurate Myflo\u2019s predictions become.' },
];

const SEE_DOCTOR = [
  'Period is late by more than 7 days, again and again',
  'No period for 3 cycles in a row',
  'A positive pregnancy test',
  'Severe pelvic pain, fever, or unusual discharge',
  'Very heavy bleeding when it does arrive',
  'Sudden acne, excess hair growth, hair-fall or weight change (possible PCOS / thyroid signs)',
];

function StepRow({ Icon, tint, title, desc, last }: { Icon: typeof Moon; tint: string; title: string; desc: string; last?: boolean }) {
  return (
    <div className={`flex gap-3 px-4 py-3 ${last ? '' : 'border-b border-blush-line/60'}`}>
      <span className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${tint}1F`, color: tint }}>
        <Icon size={17} strokeWidth={2.3} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-extrabold leading-tight">{title}</span>
        <span className="block text-[11.5px] font-semibold text-ink-mute leading-snug mt-0.5">{desc}</span>
      </span>
    </div>
  );
}

export function PeriodDelayGuide() {
  const periods = useStore((s) => s.periods);
  const user = useStore((s) => s.user);
  const go = useStore((s) => s.go);
  const tabTo = useStore((s) => s.tabTo);

  const cycle = useMemo(
    () => computeCycle(periods, user.cycleLen ?? 28, user.periodLen ?? 5),
    [periods, user.cycleLen, user.periodLen],
  );
  const lateBy = -cycle.daysUntilNext;

  const status =
    lateBy > 0
      ? `⏳ Your period looks ${lateBy} day${lateBy === 1 ? '' : 's'} late (expected ${fmt(cycle.nextPeriod)}). Don't worry yet — most small delays settle on their own. Follow the first precautions below.`
      : cycle.daysUntilNext <= 3
        ? `🌸 Your period is expected ${cycle.daysUntilNext === 0 ? 'today' : `in ${cycle.daysUntilNext} day${cycle.daysUntilNext === 1 ? '' : 's'}`} (${fmt(cycle.nextPeriod)}). Here's how to stay prepared — and what to do first if it's a little late.`
        : `🌸 Your next period is expected on ${fmt(cycle.nextPeriod)} (in ${cycle.daysUntilNext} days). Save this guide so a future delay never stresses you.`;

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Period Delay Care" />
      <ScreenScroll>
        <div className="px-5 pt-1 space-y-4 pb-5">
          {/* personalised status */}
          <div className="flex items-start gap-2.5 bg-primary-pale border border-primary-soft rounded-3xl p-3.5 animate-fade-up">
            <MascotAvatar size={38} ring={false} />
            <p className="flex-1 text-[12.5px] font-semibold text-ink-soft leading-snug pt-0.5">{status}</p>
          </div>

          <p className="text-[12px] font-semibold text-ink-mute leading-relaxed px-1">
            First of all — breathe. 💗 A healthy cycle can range from 21 to 35 days, and life events like
            stress, travel or illness often shift it by a few days. Here is what to do, step by step.
          </p>

          {/* first precautions */}
          <section>
            <SectionTitle className="mb-2">First precautions & steps</SectionTitle>
            <Card className="overflow-hidden">
              {FIRST_STEPS.map((s, i) => (
                <StepRow key={s.title} {...s} last={i === FIRST_STEPS.length - 1} />
              ))}
            </Card>
          </section>

          {/* avoid */}
          <section>
            <SectionTitle className="mb-2">Please avoid</SectionTitle>
            <div className="bg-[#FFF3F3] border border-[#F8D7D7] rounded-[22px] overflow-hidden">
              {AVOID.map((a, i) => (
                <div key={a.title} className={`flex gap-3 px-4 py-3 ${i < AVOID.length - 1 ? 'border-b border-[#F8D7D7]/70' : ''}`}>
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5 text-red-400">
                    <Ban size={15} strokeWidth={2.4} />
                  </span>
                  <span>
                    <span className="block text-[12.5px] font-extrabold text-[#A94A4A] leading-tight">{a.title}</span>
                    <span className="block text-[11.5px] font-semibold text-[#B97A7A] leading-snug mt-0.5">{a.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* reasons */}
          <section>
            <SectionTitle className="mb-1.5">Why periods get delayed</SectionTitle>
            <p className="text-[11.5px] font-semibold text-ink-mute mb-2">A delayed period doesn&apos;t always mean pregnancy. Frequent causes:</p>
            <div className="flex flex-wrap gap-1.5">
              {REASONS.map((r) => (
                <span key={r} className="text-[11px] font-bold text-ink-soft bg-white border border-blush-line rounded-full px-2.5 py-1.5 shadow-card">
                  {r}
                </span>
              ))}
            </div>
          </section>

          {/* be ready beforehand */}
          <section>
            <SectionTitle className="mb-2">Be ready beforehand</SectionTitle>
            <Card className="overflow-hidden">
              {BE_READY.map((s, i) => (
                <StepRow key={s.title} {...s} last={i === BE_READY.length - 1} />
              ))}
            </Card>
            <button onClick={() => go('reminders')} className="tap mt-2 flex items-center gap-1 text-[12px] font-extrabold text-primary">
              Set my period reminder <ChevronRight size={14} strokeWidth={3} />
            </button>
          </section>

          {/* see a doctor */}
          <div className="bg-[#FFF6EC] border border-[#FBE3C2] rounded-[22px] p-3.5">
            <p className="flex items-center gap-1.5 text-[12.5px] font-extrabold text-[#B9791F]">
              <TriangleAlert size={15} strokeWidth={2.6} /> See a doctor if…
            </p>
            <ul className="mt-2 space-y-1.5">
              {SEE_DOCTOR.map((d) => (
                <li key={d} className="text-[11.5px] font-semibold text-[#97722F] flex gap-2 leading-snug">
                  <span>•</span> {d}
                </li>
              ))}
            </ul>
          </div>

          {/* actions */}
          <div className="grid grid-cols-2 gap-3">
            <PrimaryButton onClick={() => go('ai')}>Ask Myflo AI</PrimaryButton>
            <SoftButton onClick={() => tabTo('calendar')}>Open Calendar</SoftButton>
          </div>

          <p className="text-[10.5px] font-semibold text-ink-faint text-center leading-relaxed px-3">
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </ScreenScroll>
    </div>
  );
}
