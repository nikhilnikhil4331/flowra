import { useState } from 'react';
import styles from './MoreScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { StatusBar, IconChevronRight } from '../components/Icons';
import type { AppApi } from '../lib/useAppData';
import { asset } from '../lib/catalog';
import MedicineSheet from './MedicineSheet';

export default function MoreScreen({ api }: { api: AppApi }) {
  const { data } = api;
  const [open, setOpen] = useState<'medicine' | 'profile' | null>(null);

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />
      <header className={styles.header}>
        <h1 className={styles.title}>More</h1>
      </header>

      <div className={styles.scroll}>
        <section className={styles.profile}>
          <img src={asset('girl-hug.png')} alt="" />
          <div>
            <h2>{data.profile.name}</h2>
            <p>{data.profile.email}</p>
          </div>
        </section>

        <ul className={styles.list}>
          {[
            { key: 'medicine', label: 'Medicine & Care', hint: `${data.medicines.length} saved` },
            { key: 'reminders', label: 'Reminders', hint: `${data.reminders.filter((r) => r.enabled).length} on` },
            { key: 'profile', label: 'My Profile', hint: 'Personal details' },
            { key: 'about', label: 'About Myflo', hint: 'v1.0' },
          ].map((row) => (
            <li key={row.key}>
              <button
                className={styles.row}
                onClick={() => {
                  if (row.key === 'medicine') setOpen('medicine');
                  if (row.key === 'reminders') setOpen('medicine');
                }}
              >
                <span>{row.label}</span>
                <span className={styles.hint}>
                  {row.hint}
                  <IconChevronRight size={16} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button className={styles.logout} onClick={() => api.logOut()}>
          Log Out
        </button>
      </div>

      {open === 'medicine' && <MedicineSheet api={api} onClose={() => setOpen(null)} />}
    </div>
  );
}
