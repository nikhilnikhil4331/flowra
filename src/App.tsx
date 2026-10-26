import { useEffect, useState } from 'react';
import styles from './App.module.css';
import BottomNav, { type Tab } from './components/BottomNav';
import HomeScreen from './screens/HomeScreen';
import CalendarScreen from './screens/CalendarScreen';
import SymptomsScreen from './screens/SymptomsScreen';
import HistoryScreen from './screens/HistoryScreen';
import InsightsScreen from './screens/InsightsScreen';
import MoreScreen from './screens/MoreScreen';
import PeriodSheet from './screens/PeriodSheet';
import AddSheet from './screens/AddSheet';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import GoalsScreen from './screens/GoalsScreen';
import { useAppData } from './lib/useAppData';
import type { ISODate } from './lib/cycle';

type Screen =
  | { name: 'home' }
  | { name: 'calendar'; date?: ISODate }
  | { name: 'symptoms'; date?: ISODate; focus?: 'mood' | 'cramps' }
  | { name: 'history' }
  | { name: 'insights' }
  | { name: 'more' };

/** screens that live before the app shell (no bottom navigation) */
type Gate = 'splash' | 'onboarding' | 'signup' | 'login' | 'profile' | 'goals' | 'app';

const TAB_SCREEN: Record<Tab, Screen> = {
  home: { name: 'home' },
  calendar: { name: 'calendar' },
  insights: { name: 'insights' },
  more: { name: 'more' },
};

export default function App() {
  const api = useAppData();
  const { data } = api;

  const [gate, setGate] = useState<Gate>('splash');
  const [stack, setStack] = useState<Screen[]>([{ name: 'home' }]);
  const [sheet, setSheet] = useState<null | 'period' | 'add'>(null);

  /* decide where to land once, on first paint */
  useEffect(() => {
    if (data.session) setGate('app');
    else if (data.onboardingSeen) setGate('login');
    else setGate('splash');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* logging out (session cleared anywhere) returns to the auth gate */
  useEffect(() => {
    if (gate === 'app' && !data.session) setGate('login');
  }, [data.session, gate]);

  const screen = stack[stack.length - 1];
  const push = (s: Screen) => setStack((st) => [...st, s]);
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));
  const goTab = (tab: Tab) => setStack([TAB_SCREEN[tab]]);

  const activeTab: Tab =
    screen.name === 'home'
      ? 'home'
      : screen.name === 'calendar' || screen.name === 'symptoms'
        ? 'calendar'
        : screen.name === 'insights' || screen.name === 'history'
          ? 'insights'
          : 'more';

  const showNav = gate === 'app' && screen.name !== 'symptoms';

  const enterApp = () => {
    setStack([{ name: 'home' }]);
    setGate('app');
  };

  return (
    <div className="app-root">
      <div className="phone">
        {gate === 'splash' && (
          <div className={styles.stage} key="splash">
            <SplashScreen
              onContinue={() => (data.onboardingSeen ? setGate('login') : setGate('onboarding'))}
            />
          </div>
        )}

        {gate === 'onboarding' && (
          <div className={styles.stage} key="onboarding">
            <OnboardingScreen index={0} onDone={() => setGate('signup')} />
          </div>
        )}

        {gate === 'signup' && (
          <div className={styles.stage} key="signup">
            <SignUpScreen
              api={api}
              onBack={() => setGate('onboarding')}
              onDone={() => setGate('profile')}
              onLogin={() => setGate('login')}
            />
          </div>
        )}

        {gate === 'login' && (
          <div className={styles.stage} key="login">
            <LoginScreen
              api={api}
              onBack={() => setGate('signup')}
              onDone={enterApp}
              onSignUp={() => setGate('signup')}
            />
          </div>
        )}

        {gate === 'profile' && (
          <div className={styles.stage} key="profile">
            <ProfileSetupScreen api={api} onBack={() => setGate('signup')} onNext={() => setGate('goals')} />
          </div>
        )}

        {gate === 'goals' && (
          <div className={styles.stage} key="goals">
            <GoalsScreen api={api} onDone={enterApp} />
          </div>
        )}

        {gate === 'app' && (
          <>
            <div className={styles.stage} key={`${screen.name}-${stack.length}`}>
              {screen.name === 'home' && (
                <HomeScreen
                  api={api}
                  onQuick={(target) =>
                    push({ name: 'symptoms', focus: target === 'mood' ? 'mood' : 'cramps' })
                  }
                  onBell={() => push({ name: 'history' })}
                  onOpen={() => push({ name: 'history' })}
                  onMenu={() => goTab('more')}
                />
              )}
              {screen.name === 'calendar' && (
                <CalendarScreen api={api} onBack={back} initialDate={screen.date} />
              )}
              {screen.name === 'symptoms' && (
                <SymptomsScreen api={api} onBack={back} date={screen.date} focus={screen.focus} />
              )}
              {screen.name === 'history' && <HistoryScreen api={api} onBack={back} />}
              {screen.name === 'insights' && <InsightsScreen api={api} />}
              {screen.name === 'more' && <MoreScreen api={api} />}
            </div>

            {showNav && (
              <BottomNav active={activeTab} onNavigate={goTab} onAdd={() => setSheet('add')} />
            )}

            {sheet === 'period' && <PeriodSheet api={api} onClose={() => setSheet(null)} />}
            {sheet === 'add' && (
              <AddSheet
                onClose={() => setSheet(null)}
                onPick={(what) => {
                  setSheet(null);
                  if (what === 'period') setSheet('period');
                  if (what === 'symptoms') push({ name: 'symptoms' });
                  if (what === 'history') push({ name: 'history' });
                  if (what === 'calendar') goTab('calendar');
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
