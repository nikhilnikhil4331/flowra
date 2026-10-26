import styles from './BottomNav.module.css';
import { IconCalendar, IconHome, IconLeaf, IconMenu, IconPlus } from './Icons';

export type Tab = 'home' | 'calendar' | 'insights' | 'more';

type Props = {
  active: Tab;
  onNavigate: (tab: Tab) => void;
  onAdd: () => void;
};

/** centres measured off the reference: 50.1 / 122.3 / 270.7 / 340.7 */
const ITEMS: { key: Tab; label: string; Icon: typeof IconHome; x: number }[] = [
  { key: 'home', label: 'Home', Icon: IconHome, x: 50.1 },
  { key: 'calendar', label: 'Calendar', Icon: IconCalendar, x: 122.3 },
  { key: 'insights', label: 'Insights', Icon: IconLeaf, x: 270.7 },
  { key: 'more', label: 'More', Icon: IconMenu, x: 340.7 },
];

export default function BottomNav({ active, onNavigate, onAdd }: Props) {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.bar}>
        {ITEMS.map(({ key, label, Icon, x }) => (
          <button
            key={key}
            style={{ left: `${x - 9}px` }}
            className={`${styles.item} ${active === key ? styles.active : ''}`}
            onClick={() => onNavigate(key)}
            aria-current={active === key ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={active === key ? 2 : 1.8} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <button className={styles.add} onClick={onAdd} aria-label="Log something new">
        <IconPlus size={22} strokeWidth={2.1} />
      </button>
    </nav>
  );
}
