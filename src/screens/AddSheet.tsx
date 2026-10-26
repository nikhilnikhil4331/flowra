import styles from '../components/Sheet.module.css';
import { IconClose, IconDrop, IconLeaf, IconCalendar, IconPencil } from '../components/Icons';

type What = 'period' | 'symptoms' | 'history' | 'calendar';

export default function AddSheet({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (what: What) => void;
}) {
  const items: { key: What; label: string; hint: string; Icon: typeof IconDrop }[] = [
    { key: 'period', label: 'Log period', hint: 'Start date, flow & colour', Icon: IconDrop },
    { key: 'symptoms', label: 'Log symptoms', hint: 'Mood, pain, energy', Icon: IconPencil },
    { key: 'history', label: 'Cycle history', hint: 'Trends and insights', Icon: IconLeaf },
    { key: 'calendar', label: 'Open calendar', hint: 'Pick any date', Icon: IconCalendar },
  ];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Add">
      <button className={styles.backdrop} onClick={onClose} aria-label="Close" />
      <div className={styles.sheet}>
        <div className={styles.grabber} />
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>What would you like to log?</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </header>
        <ul className={styles.menuList}>
          {items.map(({ key, label, hint, Icon }) => (
            <li key={key}>
              <button className={styles.menuItem} onClick={() => onPick(key)}>
                <span className={styles.menuIcon}>
                  <Icon size={16} />
                </span>
                <span>
                  <strong style={{ display: 'block' }}>{label}</strong>
                  <em style={{ fontStyle: 'normal', fontSize: 11.5, color: '#8d8698' }}>{hint}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
