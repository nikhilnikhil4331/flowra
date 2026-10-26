import styles from './Chrome.module.css';
import { IconArrowLeft } from '../Icons';

export function BackButton({ onClick, label = 'Go back' }: { onClick: () => void; label?: string }) {
  return (
    <button className={styles.back} onClick={onClick} aria-label={label}>
      <IconArrowLeft size={17} strokeWidth={1.9} />
    </button>
  );
}

export function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className={styles.dots} role="tablist" aria-label="Onboarding steps">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={`Step ${i + 1}`}
          className={`${styles.dot} ${i === active ? styles.dotOn : ''}`}
        />
      ))}
    </div>
  );
}

export function AuthMessage({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'info' }) {
  return (
    <p className={`${styles.message} ${tone === 'info' ? styles.messageInfo : ''}`} role="status">
      {children}
    </p>
  );
}
