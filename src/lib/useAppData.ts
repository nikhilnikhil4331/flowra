import { useCallback, useMemo, useState } from 'react';
import type { AppData, Note, SymptomLog } from './store';
import { loadData, newId, resetData, saveData } from './store';
import type { ISODate } from './cycle';
import { buildCycleModel, todayISO } from './cycle';

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());

  const update = useCallback((fn: (d: AppData) => AppData) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  const model = useMemo(
    () => buildCycleModel(data.periodStarts, 5, todayISO()),
    [data.periodStarts],
  );

  const setLog = useCallback(
    (date: ISODate, patch: Partial<SymptomLog>) => {
      update((d) => {
        const existing: SymptomLog =
          d.symptomLogs[date] ?? {
            date,
            moods: [],
            symptoms: [],
            pain: 0,
            bloating: 0,
            stress: 0,
            energy: 0,
            bleeding: null,
            flowColor: null,
            updatedAt: new Date().toISOString(),
          };
        return {
          ...d,
          symptomLogs: {
            ...d.symptomLogs,
            [date]: { ...existing, ...patch, updatedAt: new Date().toISOString() },
          },
        };
      });
    },
    [update],
  );

  const addNote = useCallback(
    (date: ISODate, body: string) => {
      const note: Note = { id: newId(), date, body, createdAt: new Date().toISOString() };
      update((d) => ({ ...d, notes: [note, ...d.notes] }));
      return note;
    },
    [update],
  );

  const editNote = useCallback(
    (id: string, body: string) => {
      update((d) => ({ ...d, notes: d.notes.map((n) => (n.id === id ? { ...n, body } : n)) }));
    },
    [update],
  );

  const deleteNote = useCallback(
    (id: string) => {
      update((d) => ({ ...d, notes: d.notes.filter((n) => n.id !== id) }));
    },
    [update],
  );

  const logPeriod = useCallback(
    (start: ISODate) => {
      update((d) => {
        if (d.periodStarts.includes(start)) {
          return { ...d, periodStarts: d.periodStarts.filter((s) => s !== start) };
        }
        return { ...d, periodStarts: [...d.periodStarts, start].sort() };
      });
    },
    [update],
  );

  const reset = useCallback(() => {
    resetData();
    setData(loadData());
  }, []);

  return {
    data,
    update,
    model,
    setLog,
    addNote,
    editNote,
    deleteNote,
    logPeriod,
    reset,
  };
}

export type AppApi = ReturnType<typeof useAppData>;
