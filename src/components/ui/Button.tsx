import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'soft' | 'ghost' | 'link';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export default function Button({
  variant = 'primary',
  full = true,
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[styles.btn, styles[variant], full ? styles.full : '', className ?? ''].join(' ')}
    >
      <span className={styles.label}>{children}</span>
      {icon && <span className={styles.icon}>{icon}</span>}
      {loading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
}
