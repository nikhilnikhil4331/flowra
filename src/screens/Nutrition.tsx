import React, { useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, Search, Trash2 } from 'lucide-react';
import { useStore, useNav } from '../store';
import { FOODS, FoodItem } from '../data/content';
import { toKey, fromKey, add, fmt, todayKey } from '../lib/cycle';
import { Ring } from '../components/charts';
import {
  Header, ScreenScroll, Segmented, PrimaryButton, SoftButton, AiTipCard,
  SectionTitle, DateStepper, BottomNav, inputCls, EmptyState, Mascot,
} from '../components/ui';

/* ------------------------------- Food Scanner ------------------------------ */

export function FoodScanner() {
  const go = useStore((s) => s.go);
  const meals = useStore((s) => s.meals);
  const addMeal = useStore((s) => s.addMeal);
  const showToast = useStore((s) => s.showToast);
  const [tab, setTab] = useState<'photo' | 'manual' | 'recent'>('photo');
  const [preview, setPreview] = useState<string>('/images/food-bowl.jpg');
  const [custom, setCustom] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [query, setQuery] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(String(reader.result));
      setCustom(true);
    };
    reader.readAsDataURL(f);
  };

  const analyze = () => {
    setScanning(true);
    const food = custom ? FOODS[Math.floor(Math.random() * 4)] : FOODS[0];
    setTimeout(() => {
      setScanning(false);
      go('nutrition-result', { foodId: food.id, image: custom ? preview : undefined });
    }, 1400);
  };

  const filtered = FOODS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
  const recent = [...meals].slice(-6).reverse();

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Food Scanner" />
      <ScreenScroll>
        <div className="px-5 pt-1">
          {/* photo frame */}
          <div className="relative rounded-[26px] overflow-hidden shadow-card border border-blush-line bg-white aspect-[4/3.4]">
            <img src={preview} alt="Food to scan" className="w-full h-full object-cover" />
            {/* corner brackets */}
            {['top-3 left-3 border-t-[3px] border-l-[3px] rounded-tl-xl', 'top-3 right-3 border-t-[3px] border-r-[3px] rounded-tr-xl', 'bottom-3 left-3 border-b-[3px] border-l-[3px] rounded-bl-xl', 'bottom-3 right-3 border-b-[3px] border-r-[3px] rounded-br-xl'].map((c) => (
              <span key={c} className={`absolute w-7 h-7 border-white/90 ${c}`} aria-hidden />
            ))}
            {scanning && (
              <>
                <div className="absolute inset-0 bg-primary/10" />
                <div className="absolute inset-x-4 h-[3px] rounded bg-grad-pink shadow-btn animate-scan-line" />
                <div className="absolute inset-x-0 bottom-3 text-center">
                  <span className="text-[11px] font-extrabold text-white bg-ink/45 rounded-full px-3 py-1">Analyzing your food… ✨</span>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-[12px] font-bold text-ink-mute mt-3">Click a photo or upload</p>

          {/* shutter row */}
          <div className="flex items-center justify-center gap-8 mt-2">
            <button onClick={() => fileRef.current?.click()} aria-label="Upload from gallery" className="tap w-11 h-11 rounded-full bg-white shadow-card border border-blush-line flex items-center justify-center text-ink-soft">
              <ImagePlus size={19} />
            </button>
            <button
              onClick={analyze}
              disabled={scanning}
              aria-label="Analyze food photo"
              className="tap w-[62px] h-[62px] rounded-full bg-grad-pink shadow-fab border-[5px] border-white text-white flex items-center justify-center disabled:opacity-60"
            >
              <Camera size={26} strokeWidth={2.2} />
            </button>
            <span className="w-11" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />

          <div className="mt-3">
            <Segmented
              options={[
                { id: 'photo', label: 'Photo' },
                { id: 'manual', label: 'Manual' },
                { id: 'recent', label: 'Recent' },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'photo' && (
            <p className="text-center text-[11.5px] font-semibold text-ink-mute mt-4 pb-4">
              Tip: Keep food clearly visible<br />for better results.
            </p>
          )}

          {tab === 'manual' && (
            <div className="mt-3 pb-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search food…" className={`${inputCls} pl-10 h-[44px]`} />
              </div>
              <div className="space-y-2">
                {filtered.map((f) => (
                  <button key={f.id} onClick={() => go('nutrition-result', { foodId: f.id })} className="tap w-full flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 p-2.5 text-left">
                    <FoodThumb food={f} size={44} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[13px] font-extrabold truncate">{f.name}</span>
                      <span className="block text-[11px] font-semibold text-ink-mute truncate">{f.desc}</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-primary">{f.nutrition.calories} kcal</span>
                  </button>
                ))}
                {filtered.length === 0 && <EmptyState emoji="🔍" title="No matches" desc="Try 'oats', 'salad' or 'dal'." />}
              </div>
            </div>
          )}

          {tab === 'recent' && (
            <div className="mt-3 pb-4 space-y-2">
              {recent.length === 0 && <EmptyState emoji="🍽️" title="Nothing here yet" desc="Foods you save will appear here for quick re-adding." />}
              {recent.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    addMeal({ date: todayKey(), name: m.name, desc: m.desc, emoji: m.emoji, image: m.image, time: fmt(new Date(), 'hh:mm a'), calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, fiber: m.fiber, iron: m.iron });
                    showToast(`${m.name} added to today 🥗`);
                    go('daily-nutrition');
                  }}
                  className="tap w-full flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 p-2.5 text-left"
                >
                  <span className="w-11 h-11 rounded-full overflow-hidden bg-primary-pale flex items-center justify-center text-xl shrink-0">
                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : m.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-extrabold truncate">{m.name}</span>
                    <span className="block text-[11px] font-semibold text-ink-mute">{m.desc}</span>
                  </span>
                  <span className="text-[10.5px] font-bold text-ink-faint">{m.time}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScreenScroll>
    </div>
  );
}

export function FoodThumb({ food, size = 44 }: { food: FoodItem; size?: number }) {
  return (
    <span className="rounded-full overflow-hidden bg-primary-pale flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {food.image ? <img src={food.image} alt="" className="w-full h-full object-cover" /> : <span style={{ fontSize: size * 0.48 }}>{food.emoji}</span>}
    </span>
  );
}

/* ----------------------------- Nutrition Result ---------------------------- */

const PORTIONS = [
  { id: 'half', label: '½ portion', mult: 0.5 },
  { id: 'full', label: '', mult: 1 },
  { id: 'large', label: '1.5× portion', mult: 1.5 },
] as const;

export function NutritionResult() {
  const nav = useNav();
  const addMeal = useStore((s) => s.addMeal);
  const showToast = useStore((s) => s.showToast);
  const replace = useStore((s) => s.replace);
  const back = useStore((s) => s.back);

  const food = FOODS.find((f) => f.id === nav.params?.foodId) ?? FOODS[0];
  const customImage = nav.params?.image as string | undefined;
  const [portion, setPortion] = useState<(typeof PORTIONS)[number]['id']>('full');
  const mult = PORTIONS.find((p) => p.id === portion)!.mult;
  const n = food.nutrition;
  const scaled = (v: number, dec = 0) => Number((v * mult).toFixed(dec));

  const stats: { label: string; value: string }[] = [
    { label: 'Calories', value: `${scaled(n.calories)}` },
    { label: 'Protein', value: `${scaled(n.protein, n.protein % 1 ? 1 : 0)}g` },
    { label: 'Carbs', value: `${scaled(n.carbs)}g` },
    { label: 'Fat', value: `${scaled(n.fat, n.fat % 1 ? 1 : 0)}g` },
    { label: 'Fiber', value: `${scaled(n.fiber)}g` },
    { label: 'Iron', value: `${scaled(n.iron, 1)}mg` },
    { label: 'Zinc', value: `${scaled(n.zinc, 1)}mg` },
    { label: 'Calcium', value: `${scaled(n.calcium)}mg` },
    { label: 'B12', value: `${scaled(n.b12, 1)}µg` },
  ];

  const save = () => {
    addMeal({
      date: todayKey(),
      name: food.name,
      desc: `${scaled(n.calories)} kcal · ${scaled(n.protein)}g protein`,
      emoji: food.emoji,
      image: customImage ?? food.image,
      time: fmt(new Date(), 'hh:mm a'),
      calories: scaled(n.calories),
      protein: scaled(n.protein, 1),
      carbs: scaled(n.carbs),
      fat: scaled(n.fat, 1),
      fiber: scaled(n.fiber),
      iron: scaled(n.iron, 1),
    });
    showToast('Saved to your diary 🥗');
    replace('daily-nutrition');
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Nutrition Result" />
      <ScreenScroll>
        <div className="px-5 pt-1">
          <div className="flex items-center gap-3 animate-fade-up">
            <span className="w-[54px] h-[54px] rounded-2xl overflow-hidden bg-primary-pale flex items-center justify-center text-[26px] shrink-0 shadow-card">
              {customImage || food.image ? <img src={customImage ?? food.image} alt="" className="w-full h-full object-cover" /> : food.emoji}
            </span>
            <div className="min-w-0">
              <h2 className="text-[15.5px] font-black leading-tight">{food.name}</h2>
              <p className="text-[11.5px] font-semibold text-ink-mute">{food.desc}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 mb-2">
            <span className="text-[12px] font-extrabold text-ink-soft">Portion Size</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-primary-pale rounded-full p-1" role="radiogroup" aria-label="Portion size">
            {PORTIONS.map((p) => {
              const on = portion === p.id;
              return (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => setPortion(p.id)}
                  className={`tap h-8 rounded-full text-[11px] font-extrabold ${on ? 'bg-white text-primary shadow-card' : 'text-ink-mute'}`}
                >
                  {p.id === 'full' ? food.portion : p.label}
                </button>
              );
            })}
          </div>

          <SectionTitle className="mt-5 mb-2.5">Nutrition (Estimated)</SectionTitle>
          <div className="grid grid-cols-3 gap-2.5">
            {stats.map((s, i) => (
              <div key={s.label} className="bg-white rounded-2xl shadow-card border border-blush-line/60 py-2.5 text-center animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <p className="text-[14.5px] font-black leading-tight">{s.value}</p>
                <p className="text-[10px] font-bold text-ink-mute">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-[10.5px] font-semibold text-ink-faint mt-3">
            * Estimates may vary based on portion size and ingredients.
          </p>

          <AiTipCard text={food.tip} className="mt-3" />

          <div className="grid grid-cols-2 gap-3 mt-5 pb-5">
            <PrimaryButton onClick={save}>Save to Diary</PrimaryButton>
            <SoftButton onClick={back}>Add Another</SoftButton>
          </div>
        </div>
      </ScreenScroll>
    </div>
  );
}

/* ------------------------------ Daily Nutrition ---------------------------- */

const GOALS_NUTRI = { kcal: 1400, protein: 60, iron: 12 };

export function DailyNutrition() {
  const meals = useStore((s) => s.meals);
  const deleteMeal = useStore((s) => s.deleteMeal);
  const go = useStore((s) => s.go);
  const [key, setKey] = useState(todayKey());
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const dayMeals = useMemo(() => {
    const toMins = (t: string) => {
      const [hm, ap] = t.split(' ');
      const [h, m] = hm.split(':').map(Number);
      return ((h % 12) + (ap === 'PM' ? 12 : 0)) * 60 + m;
    };
    return meals.filter((m) => m.date === key).sort((a, b) => toMins(a.time) - toMins(b.time));
  }, [meals, key]);
  const totals = dayMeals.reduce(
    (a, m) => ({ kcal: a.kcal + m.calories, protein: a.protein + m.protein, iron: a.iron + m.iron }),
    { kcal: 0, protein: 0, iron: 0 },
  );

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      <Header title="Daily Nutrition" />
      <DateStepper
        label={fmt(fromKey(key), 'd MMM yyyy')}
        onPrev={() => setKey(toKey(add(fromKey(key), -1)))}
        onNext={() => setKey(toKey(add(fromKey(key), 1)))}
        className="-mt-0.5"
      />

      <ScreenScroll withNav>
        <div className="px-5 pt-2">
          <div className="flex justify-around items-start animate-fade-up">
            <Ring value={Math.round(totals.kcal)} goal={GOALS_NUTRI.kcal} color="#F25B8A" label="kcal" unit="" />
            <Ring value={Math.round(totals.protein)} goal={GOALS_NUTRI.protein} color="#6FA8E8" label="Protein" unit="g" />
            <Ring value={Number(totals.iron.toFixed(1))} goal={GOALS_NUTRI.iron} color="#4ECDC4" label="Iron" unit="mg" />
          </div>

          <SectionTitle className="mt-5 mb-2.5">Meals</SectionTitle>
          {dayMeals.length === 0 ? (
            <EmptyState emoji="🍽️" title="No meals logged" desc="Scan or add a meal to start your diary for this day." />
          ) : (
            <div className="space-y-2">
              {dayMeals.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-white rounded-2xl shadow-card border border-blush-line/60 p-2.5 animate-fade-up">
                  <span className="w-11 h-11 rounded-full overflow-hidden bg-primary-pale flex items-center justify-center text-xl shrink-0">
                    {m.image ? <img src={m.image} alt="" className="w-full h-full object-cover" /> : m.emoji}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-extrabold truncate">{m.name}</span>
                    <span className="block text-[11px] font-semibold text-ink-mute">{m.desc}</span>
                  </span>
                  <span className="flex flex-col items-end gap-0.5">
                    <span className="text-[10.5px] font-bold text-ink-faint">{m.time}</span>
                    <button
                      onClick={() => (confirmId === m.id ? (deleteMeal(m.id), setConfirmId(null)) : setConfirmId(m.id))}
                      aria-label={confirmId === m.id ? 'Confirm delete meal' : 'Delete meal'}
                      className={`tap text-[10px] font-extrabold flex items-center gap-0.5 ${confirmId === m.id ? 'text-red-500' : 'text-ink-faint'}`}
                    >
                      <Trash2 size={12} /> {confirmId === m.id ? 'Sure?' : ''}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}

          <button onClick={() => go('food-scanner')} className="tap block mx-auto mt-5 text-[13px] font-extrabold text-primary pb-2">
            + Add Meal
          </button>
        </div>
      </ScreenScroll>

      <BottomNav active="home" />
    </div>
  );
}
