import { useEffect, useState } from 'react';
import styles from './Sheet.module.css';
import { IconClose, IconTrash } from './Icons';
import type { ISODate } from '../lib/cycle';
import { fmtLong } from '../lib/cycle';

type Props = {
  date: ISODate;
  note?: { id: string; body: string };
  onClose: () => void;
  onSave: (body: string) => void;
  onDelete?: () => void;
};

export default function NoteSheet({ date, note, onClose, onSave, onDelete }: Props) {
  const [body, setBody] = useState(note?.body ?? '');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Note">
      <button className={styles.backdrop} onClick={onClose} aria-label="Close" />
      <div className={styles.sheet}>
        <div className={styles.grabber} />
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>Note</h2>
            <p className={styles.sub}>{fmtLong(date)}</p>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </header>

        <textarea
          className={styles.textarea}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How are you feeling today?"
          rows={4}
          autoFocus
        />

        <div className={styles.actions}>
          {onDelete && (
            <button className={styles.danger} onClick={onDelete}>
              <IconTrash size={15} /> Delete
            </button>
          )}
          <button
            className={styles.primary}
            onClick={() => onSave(body.trim())}
            disabled={!body.trim()}
          >
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
