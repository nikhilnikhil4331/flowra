import { useId, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import styles from './Field.module.css';
import { IconEye } from '../Icons';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  hint?: ReactNode;
  trailing?: ReactNode;
  password?: boolean;
  /** shown as the field's placeholder-like value when empty */
  placeholder?: string;
};

export default function Field({
  label,
  error,
  hint,
  trailing,
  password = false,
  className,
  ...rest
}: Props) {
  const id = useId();
  const [reveal, setReveal] = useState(false);

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <div className={`${styles.box} ${error ? styles.boxError : ''}`}>
        <input
          {...rest}
          id={id}
          className={styles.input}
          type={password ? (reveal ? 'text' : 'password') : rest.type ?? 'text'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        {password && (
          <button
            type="button"
            className={styles.eye}
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
          >
            <IconEye size={17} off={reveal} />
          </button>
        )}
        {!password && trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
      {error && (
        <p className={styles.error} id={`${id}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
