import { useRef, useState } from 'react';
import styles from './SetupScreen.module.css';
import FloralDecor from '../components/FloralDecor';
import { IconCalendar, StatusBar } from '../components/Icons';
import Button from '../components/ui/Button';
import { BackButton } from '../components/ui/Chrome';
import { asset } from '../lib/catalog';
import type { ISODate } from '../lib/cycle';
import type { AppApi } from '../lib/useAppData';

/** Screen 07 — Tell Us About You. Height and weight are optional. */
export default function ProfileSetupScreen({
  api,
  onBack,
  onNext,
}: {
  api: AppApi;
  onBack: () => void;
  onNext: () => void;
}) {
  const [dob, setDob] = useState(api.data.profile.dateOfBirth ?? '');
  const [height, setHeight] = useState(
    api.data.profile.heightCm ? String(api.data.profile.heightCm) : '',
  );
  const [weight, setWeight] = useState(
    api.data.profile.weightKg ? String(api.data.profile.weightKg) : '',
  );
  const [error, setError] = useState<string | null>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const prettyDate = (iso: string) => {
    if (!iso) return 'Select your birthday';
    const [y, m, d] = iso.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[m - 1]} ${y}`;
  };

  const submit = () => {
    const h = height ? Number(height) : null;
    const w = weight ? Number(weight) : null;
    if (h !== null && (Number.isNaN(h) || h < 90 || h > 250)) {
      setError('Height should be between 90 and 250 cm.');
      return;
    }
    if (w !== null && (Number.isNaN(w) || w < 25 || w > 300)) {
      setError('Weight should be between 25 and 300 kg.');
      return;
    }
    if (dob && dob > new Date().toISOString().slice(0, 10)) {
      setError('Date of birth can’t be in the future.');
      return;
    }
    api.saveProfileDetails({
      dateOfBirth: (dob || null) as ISODate | null,
      heightCm: h,
      weightKg: w,
    });
    onNext();
  };

  return (
    <div className={styles.root}>
      <div className="page-bg" />
      <FloralDecor variant="plain" />
      <StatusBar />

      <div className={styles.back}>
        <BackButton onClick={onBack} />
      </div>

      <img className={styles.girl} src={asset('auth-girl-profile.png')} alt="" aria-hidden="true" />

      <div className={styles.body}>
        <h2 className={styles.heading}>Tell Us About You</h2>
        <p className={styles.sub}>This helps us personalize your experience.</p>

        <div className={styles.rows}>
          <label className={styles.row}>
            <span className={styles.rowLabel}>Date of Birth</span>
            <span className={styles.box} onClick={() => dateRef.current?.showPicker?.()}>
              <span className={`${styles.input} ${dob ? '' : styles.placeholder}`}>
                {prettyDate(dob)}
              </span>
              <input
                ref={dateRef}
                type="date"
                className={styles.dateInput}
                value={dob}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setDob(e.target.value)}
                aria-label="Date of birth"
              />
              <IconCalendar size={17} className={styles.rowIcon} />
            </span>
          </label>

          <label className={styles.row}>
            <span className={styles.rowLabel}>
              Height <em>(optional)</em>
            </span>
            <span className={styles.box}>
              <input
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="160 cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
              <span className={styles.unit}>cm</span>
            </span>
          </label>

          <label className={styles.row}>
            <span className={styles.rowLabel}>
              Weight <em>(optional)</em>
            </span>
            <span className={styles.box}>
              <input
                type="number"
                inputMode="numeric"
                className={styles.input}
                placeholder="50 kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className={styles.unit}>kg</span>
            </span>
          </label>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      <div className={styles.footer}>
        <Button onClick={submit}>Next</Button>
      </div>
    </div>
  );
}
