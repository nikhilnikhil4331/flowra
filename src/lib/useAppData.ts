import { useCallback, useMemo, useState } from 'react';
import type { AppData, Note, SymptomLog } from './store';
import { loadData, newId, resetData, saveData } from './store';
import type { Account } from './store';
import {
  hashPassword,
  nameProblem,
  newSalt,
  normaliseEmail,
  emailProblem,
  passwordProblem,
} from './auth';
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

  /* ---------------------------------------------------------------- auth */

  const finishOnboarding = useCallback(() => {
    update((d) => ({ ...d, onboardingSeen: true }));
  }, [update]);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const problem = nameProblem(name) ?? emailProblem(email) ?? passwordProblem(password);
      if (problem) throw new Error(problem);
      const normalised = normaliseEmail(email);
      if (data.account && data.account.email === normalised)
        throw new Error('An account with that email already exists on this device.');
      const salt = newSalt();
      const hash = await hashPassword(password, salt);
      const account: Account = {
        name: name.trim(),
        email: normalised,
        salt,
        hash,
        createdAt: new Date().toISOString(),
      };
      update((d) => ({
        ...d,
        account,
        session: { email: normalised, since: new Date().toISOString() },
        profile: { ...d.profile, name: account.name, email: normalised },
      }));
      return account;
    },
    [data.account, update],
  );

  const logIn = useCallback(
    async (email: string, password: string) => {
      const problem = emailProblem(email);
      if (problem) throw new Error(problem);
      if (!password) throw new Error('Enter your password.');
      const normalised = normaliseEmail(email);
      const account = data.account;
      if (!account || account.email !== normalised)
        throw new Error('No account found for that email on this device.');
      const hash = await hashPassword(password, account.salt);
      if (hash !== account.hash) throw new Error('That password doesn’t match.');
      update((d) => ({ ...d, session: { email: normalised, since: new Date().toISOString() } }));
      return account;
    },
    [data.account, update],
  );

  const logOut = useCallback(() => {
    update((d) => ({ ...d, session: null }));
  }, [update]);

  const saveProfileDetails = useCallback(
    (patch: { dateOfBirth?: ISODate | null; heightCm?: number | null; weightKg?: number | null }) => {
      update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
    },
    [update],
  );

  const saveGoals = useCallback(
    (goals: string[]) => {
      update((d) => ({
        ...d,
        profile: { ...d.profile, goals },
        onboardingSeen: true,
      }));
    },
    [update],
  );

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
    finishOnboarding,
    signUp,
    logIn,
    logOut,
    saveProfileDetails,
    saveGoals,
  };
}

export type AppApi = ReturnType<typeof useAppData>;
