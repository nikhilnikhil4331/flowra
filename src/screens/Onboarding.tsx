import React from 'react';
import { ArrowRight, HeartPulse, Camera, BellRing, BarChart3 } from 'lucide-react';
import { useStore } from '../store';
import { StatusBar, PrimaryButton, Mascot, Petals, Dots, PetalShape } from '../components/ui';

function SkipCorner({ page }: { page: number }) {
  const go = useStore((s) => s.go);
  return (
    <div className="flex items-center justify-between px-5 pt-1 relative z-10">
      <span className="w-8 h-8 rounded-full bg-white/80 shadow-card flex items-center justify-center text-primary text-lg font-light select-none" aria-hidden>+</span>
      <button onClick={() => go('signup')} className="tap text-[12px] font-extrabold text-ink-mute">Skip</button>
      <span className="hidden">{page}</span>
    </div>
  );
}

function Footer({ page, label, onNext }: { page: number; label: string; onNext: () => void }) {
  return (
    <div className="px-6 pb-8 pt-2 relative z-10">
      <Dots total={3} active={page} />
      <div className="h-5" />
      <PrimaryButton onClick={onNext}>{label}</PrimaryButton>
    </div>
  );
}

export function Splash() {
  const go = useStore((s) => s.go);
  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      <Petals count={8} />
      {/* big flower accent */}
      <div className="absolute -top-6 -right-8 opacity-70 rotate-12" aria-hidden>
        <svg width="130" height="130" viewBox="0 0 100 100">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="50" cy="28" rx="13" ry="24" fill="#F9C4D7" transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="9" fill="#FFD98A" />
        </svg>
      </div>
      <div className="pt-10 text-center relative z-10 animate-fade-up">
        <div className="flex justify-center mb-1"><PetalShape size={30} color="#F78FB0" /></div>
        <h1 className="font-script text-[64px] leading-none text-[#33406B]">Myflo</h1>
        <p className="text-[12.5px] font-bold text-ink-soft mt-2 tracking-wide px-10">
          Your Cycle. Your Health. Your<br />Story.
        </p>
      </div>

      <div className="flex-1 relative">
        <Mascot
          src="/images/mascot-hero.png"
          alt="Myflo mascot among pink peonies"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[118%] max-w-none animate-floaty"
        />
      </div>

      <div className="px-6 pb-8 relative z-10">
        <PrimaryButton onClick={() => go('onboard1')}>
          Get Started <ArrowRight size={18} strokeWidth={2.8} />
        </PrimaryButton>
      </div>
    </div>
  );
}

export function Onboard1() {
  const go = useStore((s) => s.go);
  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      <SkipCorner page={0} />
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <Mascot src="/images/mascot-hello.png" alt="Myflo mascot waving" className="w-[220px] mx-auto animate-floaty" />
        <h2 className="text-center text-[21px] font-black mt-4 animate-fade-up">Understand Your Cycle</h2>
        <p className="text-center text-[13px] font-semibold text-ink-mute mt-2 leading-relaxed animate-fade-up">
          Track periods, symptoms, mood<br />and more – all in one place.
        </p>
      </div>
      <Footer page={0} label="Next" onNext={() => go('onboard2')} />
    </div>
  );
}

const FEATURES = [
  { label: 'Track Symptoms', Icon: HeartPulse, tint: '#F25B8A' },
  { label: 'Nutrition &\nFood Scan', Icon: Camera, tint: '#FFB657' },
  { label: 'Smart Reminders', Icon: BellRing, tint: '#B9A7F2' },
  { label: 'Daily Insights', Icon: BarChart3, tint: '#4ECDC4' },
];

export function Onboard2() {
  const go = useStore((s) => s.go);
  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      <SkipCorner page={1} />
      <div className="px-8 pt-4 flex-1">
        <div className="grid grid-cols-2 gap-x-6 gap-y-7 max-w-[260px] mx-auto">
          {FEATURES.map(({ label, Icon, tint }, i) => (
            <div key={label} className="flex flex-col items-center text-center animate-fade-up" style={{ animationDelay: `${i * 90}ms` }}>
              <span className="w-[54px] h-[54px] rounded-full flex items-center justify-center shadow-soft" style={{ background: `${tint}22` }}>
                <Icon size={24} strokeWidth={2.2} style={{ color: tint }} />
              </span>
              <span className="text-[11.5px] font-extrabold text-ink-soft mt-2 leading-tight whitespace-pre-line">{label}</span>
            </div>
          ))}
        </div>
        <h2 className="text-center text-[21px] font-black mt-10 animate-fade-up">More Than a Period Tracker</h2>
        <p className="text-center text-[13px] font-semibold text-ink-mute mt-2 leading-relaxed animate-fade-up">
          Nutrition, mood, sleep, reminders<br />and personalized insights.
        </p>
      </div>
      <Footer page={1} label="Next" onNext={() => go('onboard3')} />
    </div>
  );
}

export function Onboard3() {
  const go = useStore((s) => s.go);
  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      <SkipCorner page={2} />
      <div className="px-8 pt-2 flex-1 flex flex-col">
        <Mascot src="/images/mascot-heart.png" alt="Myflo mascot hugging a heart" className="w-[230px] mx-auto animate-floaty" />
        <h2 className="text-center text-[21px] font-black mt-4 leading-snug animate-fade-up">
          Your Personal Health<br />Companion
        </h2>
        <p className="text-center text-[13px] font-semibold text-ink-mute mt-2 leading-relaxed animate-fade-up">
          Get gentle guidance, tips and<br />support with Myflo AI.
        </p>
      </div>
      <Footer page={2} label="Get Started" onNext={() => go('signup')} />
    </div>
  );
}
