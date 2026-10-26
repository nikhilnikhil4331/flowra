import { useState } from 'react';
import styles from '../components/Sheet.module.css';
import { IconClose, IconTrash } from '../components/Icons';
import type { AppApi } from '../lib/useAppData';
import { newId } from '../lib/store';
import { todayISO } from '../lib/cycle';

export default function MedicineSheet({ api, onClose }: { api: AppApi; onClose: () => void }) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [schedule, setSchedule] = useState('Once daily');

  const add = () => {
    if (!name.trim()) return;
    api.update((d) => ({
      ...d,
      medicines: [
        {
          id: newId(),
          name: name.trim(),
          dose: dose.trim() || '—',
          reason: '',
          schedule,
          startDate: todayISO(),
          reminder: true,
        },
        ...d.medicines,
      ],
    }));
    setName('');
    setDose('');
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Medicine">
      <button className={styles.backdrop} onClick={onClose} aria-label="Close" />
      <div className={styles.sheet}>
        <div className={styles.grabber} />
        <header className={styles.head}>
          <div>
            <h2 className={styles.title}>Medicine &amp; Care</h2>
            <p className={styles.sub}>Track what you take and when</p>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </header>

        <ul className={styles.menuList}>
          {api.data.medicines.map((m) => (
            <li key={m.id} className={styles.medicineRow}>
              <span>
                <strong>{m.name}</strong>
                <em>
                  {m.dose} · {m.schedule}
                </em>
              </span>
              <button
                aria-label={`Delete ${m.name}`}
                onClick={() =>
                  api.update((d) => ({
                    ...d,
                    medicines: d.medicines.filter((x) => x.id !== m.id),
                  }))
                }
              >
                <IconTrash size={15} />
              </button>
            </li>
          ))}
          {api.data.medicines.length === 0 && <li className={styles.empty}>No medicines saved</li>}
        </ul>

        <div className={styles.grid2} style={{ marginTop: 12 }}>
          <label className={styles.field}>
            <span className={styles.label}>Name</span>
            <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ibuprofen" />
          </label>
          <label className={styles.field}>
            <span className={styles.label}>Dose</span>
            <input className={styles.input} value={dose} onChange={(e) => setDose(e.target.value)} placeholder="400 mg" />
          </label>
        </div>

        <div className={styles.chips} style={{ marginBottom: 12 }}>
          {['Once daily', 'Twice daily', 'As needed'].map((s) => (
            <button
              key={s}
              className={`${styles.chip} ${schedule === s ? styles.chipActive : ''}`}
              onClick={() => setSchedule(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <button className={styles.primary} onClick={add} disabled={!name.trim()}>
          Add medicine
        </button>
      </div>
    </div>
  );
}
