import { useMemo, useState } from 'react';
import styles from './CalendarScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { StatusBar, IconArrowLeft, IconChevronLeft, IconChevronRight, IconPencil } from '../components/Icons';
import type { AppApi } from '../lib/useAppData';
import { monthGrid, monthLabel, todayISO, WEEKDAYS_MIN, type ISODate } from '../lib/cycle';
import { asset } from '../lib/catalog';
import NoteSheet from '../components/NoteSheet';

type Props = {
  api: AppApi;
  onBack: () => void;
  initialDate?: ISODate;
};

const EVENTS = [
  { key: 'periods', label: 'Periods', tone: 'lav', art: 'ev-periods.png' },
  { key: 'mucus', label: 'Mucus', tone: 'peach', art: 'ev-mucus.png' },
  { key: 'ovulation', label: 'Ovulation', tone: 'blush', art: 'ev-ovulation.png' },
  { key: 'looming', label: 'Looming', tone: 'blue', art: 'ev-looming.png' },
] as const;

const LEGEND = [
  { label: 'Period', color: '#fe6291', shape: 'square' },
  { label: 'Fertile Window', color: '#a99bfb', shape: 'square' },
  { label: 'Ovulation', color: '#d48cfb', shape: 'circle' },
  { label: 'Today', color: '#7c6afb', shape: 'circle' },
] as const;

export default function CalendarScreen({ api, onBack, initialDate }: Props) {
  const { data, model, addNote, editNote, deleteNote } = api;
  const today = todayISO();
  const start = initialDate ?? today;
  const [cursor, setCursor] = useState(() => {
    const d = new Date(start);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [selected, setSelected] = useState<ISODate>(start);
  const [noteOpen, setNoteOpen] = useState(false);

  const cells = useMemo(() => monthGrid(cursor.y, cursor.m, today), [cursor, today]);
  const todaysNote = data.notes.find((n) => n.date === selected) ?? data.notes[0];

  const shift = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />

      <header className={styles.header}>
        <button className={styles.back} onClick={onBack} aria-label="Go back">
          <IconArrowLeft size={17} />
        </button>
        <h1 className={styles.title}>Calendar</h1>
      </header>

      <div className={styles.scroll}>
        <section className={styles.monthCard} aria-label="Month view">
          <div className={styles.monthHead}>
            <button className={styles.chev} onClick={() => shift(-1)} aria-label="Previous month">
              <IconChevronLeft size={19} />
            </button>
            <h2 className={styles.monthTitle}>{monthLabel(cursor.y, cursor.m)}</h2>
            <button className={styles.chev} onClick={() => shift(1)} aria-label="Next month">
              <IconChevronRight size={19} />
            </button>
          </div>

          <div className={styles.weekRow} aria-hidden="true">
            {WEEKDAYS_MIN.map((d) => (
              <span key={d} className={d === 'Wed' ? styles.weekActive : undefined}>
                {d}
              </span>
            ))}
          </div>

          <div className={styles.grid} role="grid">
            {cells.map((cell) => {
              const isPeriod = model.periodDays.has(cell.date);
              const isFertile = model.fertileDays.has(cell.date);
              const isOvulation = model.ovulationDays.has(cell.date);
              const isSelected = cell.date === selected;
              const inFertileRow = isFertile && !isPeriod && cell.inMonth;
              return (
                <button
                  key={cell.date}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={cell.date}
                  className={[
                    styles.cell,
                    !cell.inMonth ? styles.cellMuted : '',
                    isSelected ? styles.cellSelected : '',
                    cell.isToday ? styles.cellToday : '',
                    inFertileRow ? styles.cellFertileRow : '',
                  ].join(' ')}
                  onClick={() => setSelected(cell.date)}
                >
                  <span className={styles.dayNum}>{String(cell.day).padStart(2, '0')}</span>
                  <span className={styles.marks}>
                    {isPeriod && <i className={styles.dotPeriod} />}
                    {isOvulation && <i className={styles.dotOvulation} />}
                    {isFertile && !isOvulation && <i className={styles.dotFertile} />}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <ul className={styles.legend}>
          {LEGEND.map((l) => (
            <li key={l.label}>
              <span
                className={l.shape === 'circle' ? styles.legendDot : styles.legendSquare}
                style={{ background: l.color }}
              />
              {l.label}
            </li>
          ))}
        </ul>

        <h2 className={styles.sectionTitle}>Cycle Events</h2>
        <div className={styles.events}>
          {EVENTS.map((e) => (
            <button key={e.key} className={`${styles.event} ${styles[e.tone]}`}>
              <img src={asset(e.art)} alt="" />
              <span>{e.label}</span>
            </button>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>Notes</h2>
        {todaysNote ? (
          <button className={styles.noteCard} onClick={() => setNoteOpen(true)}>
            <span className={styles.noteIcon}>
              <IconPencil size={15} />
            </span>
            <span className={styles.noteBody}>
              <span className={styles.noteText}>{todaysNote.body}</span>
              <span className={styles.noteTime}>
                {new Date(todaysNote.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </span>
          </button>
        ) : (
          <button className={styles.noteEmpty} onClick={() => setNoteOpen(true)}>
            <span className={styles.noteIcon}>
              <IconPencil size={15} />
            </span>
            Add a note for today
          </button>
        )}
      </div>

      {noteOpen && (
        <NoteSheet
          date={selected}
          note={todaysNote}
          onClose={() => setNoteOpen(false)}
          onSave={(body) => {
            if (todaysNote) editNote(todaysNote.id, body);
            else addNote(selected, body);
            setNoteOpen(false);
          }}
          onDelete={
            todaysNote
              ? () => {
                  deleteNote(todaysNote.id);
                  setNoteOpen(false);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
