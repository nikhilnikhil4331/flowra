import React from 'react';
import { useStore, useNav, ScreenId } from './store';
import { StatusBar, QuickAddSheet, ToastView } from './components/ui';
import { Splash, Onboard1, Onboard2, Onboard3 } from './screens/Onboarding';
import { SignUp, Login, ProfileSetup, GoalsSetup } from './screens/Auth';
import { Home } from './screens/Home';
import { CalendarScreen } from './screens/CalendarScreen';
import { LogPeriod, LogSymptoms, BodyTracker } from './screens/Logs';
import { FoodScanner, NutritionResult, DailyNutrition } from './screens/Nutrition';
import { FlowColor, FlowGuide } from './screens/FlowGuide';
import { PeriodDelayGuide } from './screens/DelayGuide';
import { Medicine, AddMedicine, Reminders, ReminderDetail } from './screens/Care';
import { AiScreen } from './screens/AiScreen';
import { Insights, Reports } from './screens/Insights';
import { Settings, More } from './screens/Settings';

const SCREENS: Record<ScreenId, React.ComponentType> = {
  splash: Splash,
  onboard1: Onboard1,
  onboard2: Onboard2,
  onboard3: Onboard3,
  signup: SignUp,
  login: Login,
  profile: ProfileSetup,
  goals: GoalsSetup,
  home: Home,
  calendar: CalendarScreen,
  insights: Insights,
  more: More,
  'log-period': LogPeriod,
  'log-symptoms': LogSymptoms,
  'body-tracker': BodyTracker,
  'food-scanner': FoodScanner,
  'nutrition-result': NutritionResult,
  'daily-nutrition': DailyNutrition,
  'flow-color': FlowColor,
  'flow-guide': FlowGuide,
  'delay-guide': PeriodDelayGuide,
  medicine: Medicine,
  'add-medicine': AddMedicine,
  reminders: Reminders,
  'reminder-detail': ReminderDetail,
  ai: AiScreen,
  reports: Reports,
  settings: Settings,
};

const AUTH_SCREENS: ScreenId[] = ['splash', 'onboard1', 'onboard2', 'onboard3', 'signup', 'login', 'profile', 'goals'];

export default function App() {
  const entry = useNav();
  const navDepth = useStore((s) => s.nav.length);
  const onboarded = useStore((s) => s.onboarded);

  let screen = entry.screen;
  if (onboarded && AUTH_SCREENS.includes(screen)) screen = 'home';
  if (!onboarded && !AUTH_SCREENS.includes(screen)) screen = 'splash';

  const Screen = SCREENS[screen];

  return (
    <div className="min-h-dvh bg-grad-desktop flex items-center justify-center relative overflow-hidden">
      {/* desktop ambience */}
      <div className="hidden md:block absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full bg-primary-light/25 blur-3xl" aria-hidden />
      <div className="hidden md:block absolute -bottom-32 -right-16 w-[420px] h-[420px] rounded-full bg-lavender/25 blur-3xl" aria-hidden />

      {/* desktop brand panel */}
      <div className="hidden xl:block absolute left-[7%] max-w-[300px] z-0 select-none">
        <p className="font-script text-[74px] leading-none text-primary-dark drop-shadow-sm">Myflo</p>
        <p className="text-[15px] font-bold text-ink-soft mt-2">Your Cycle. Your Health. Your Story.</p>
        <ul className="mt-5 space-y-2.5 text-[13.5px] font-bold text-ink-soft">
          <li>🌸 Predict periods, fertile days &amp; ovulation</li>
          <li>💗 Log symptoms, moods &amp; body signals</li>
          <li>🥗 Scan food &amp; track daily nutrition</li>
          <li>✨ Gentle guidance from Myflo AI</li>
        </ul>
        <p className="mt-6 text-[11px] font-semibold text-ink-mute leading-relaxed">
          Try the live app in the phone — every button works, and your data is saved in this browser.
        </p>
      </div>

      {/* phone */}
      <div
        className="
          relative z-10 w-full h-dvh bg-blush-bg overflow-hidden flex flex-col
          sm:w-[402px] sm:h-[min(856px,calc(100dvh-44px))] sm:rounded-[50px]
          sm:border-[10px] sm:border-[#26202A] sm:shadow-phone
        "
      >
        {/* dynamic island (desktop frame only) */}
        <div className="hidden sm:flex absolute top-[10px] left-1/2 -translate-x-1/2 z-40 w-[96px] h-[22px] rounded-full bg-[#26202A] items-center justify-end pr-2.5" aria-hidden>
          <span className="w-2 h-2 rounded-full bg-[#3E4657]" />
        </div>

        <div className="blush-pattern absolute inset-0 flex flex-col">
          <StatusBar />
          <main key={`${screen}-${navDepth}`} className="flex-1 flex flex-col min-h-0 animate-fade-in relative z-10">
            <Screen />
          </main>
        </div>

        <QuickAddSheet />
        <ToastView />
      </div>
    </div>
  );
}
