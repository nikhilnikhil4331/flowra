import flagsmith from '@flagsmith/flagsmith';

/*
 * Flagsmith SDK wiring — Toggle Wars Hackathon (Track 01).
 *
 * Experiment: a multivariate flag `experiment_ab_test` with two variants.
 *   - variant_a  — the existing CTA ("Get Started")
 *   - variant_b  — the optimized, personalized CTA ("Start my cycle 🌸")
 *
 * Flagsmith owns the traffic split (50/50, round 03) and the Bayesian win
 * probability (round 04). The app only:
 *   - renders the variant the SDK resolves for this visitor, and
 *   - reports the real events ($flag_exposure + experiment_conversion_metric).
 *
 * Privacy: no email/name/health data is ever sent. The identity is an
 * anonymous, browser-generated UUID (myflo-client-id-v1).
 */

export type ExperimentVariant = 'variant_a' | 'variant_b';

export const EXPERIMENT_FLAG_KEY = 'experiment_ab_test';
export const METRIC_NAME = 'experiment_conversion_metric';
export const FALLBACK_VARIANT: ExperimentVariant = 'variant_a';

const CLIENT_ID_KEY = 'myflo-client-id-v1';

export function getClientIdentity(): string {
  try {
    const existing = localStorage.getItem(CLIENT_ID_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_ID_KEY, id);
    return id;
  } catch {
    // Storage unavailable (private mode): fall back to a session-only id.
    return 'anonymous-session';
  }
}

async function doInit(): Promise<boolean> {
  const key = import.meta.env.VITE_FLAGSMITH_SDK_KEY as string | undefined;
  if (!key || key.trim() === '' || key.startsWith('PLACEHOLDER')) {
    return false; // key not configured yet — app renders variant_a safely
  }
  try {
    await flagsmith.init({
      environmentID: key,
      identity: getClientIdentity(),
      enableEvents: true,
      defaultFlags: {
        [EXPERIMENT_FLAG_KEY]: { enabled: true, value: FALLBACK_VARIANT },
      },
    });
    return true;
  } catch {
    // Flagsmith unavailable (no network, bad key): the app must keep working.
    return false;
  }
}

let initPromise: Promise<boolean> | null = null;

export function initFlagsmith(): Promise<boolean> {
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

// Kick off the init at the top level so flags are resolving before the first
// screen paints. The init promise is idempotent and never throws.
void initFlagsmith();

// The SDK fires the $flag_exposure event at most once per process per
// exposure, so calling this on first paint is safe and cheap.
export function resolveVariant(): ExperimentVariant {
  try {
    const flag = flagsmith.getExperimentFlag(EXPERIMENT_FLAG_KEY);
    const raw = (flag as { variant?: string } | null)?.variant ?? (flag as { value?: string } | null)?.value ?? null;
    if (raw === 'variant_b') return 'variant_b';
    if (raw === 'variant_a') return 'variant_a';
  } catch {
    /* degrade to a plain flag read below */
  }
  try {
    const value = flagsmith.getValue(EXPERIMENT_FLAG_KEY, { fallback: FALLBACK_VARIANT }) as string;
    return value === 'variant_b' ? 'variant_b' : 'variant_a';
  } catch {
    return FALLBACK_VARIANT;
  }
}

export function trackMetric(value?: string | number, metadata?: Record<string, unknown>): void {
  try {
    flagsmith.trackEvent(METRIC_NAME, {
      identifier: getClientIdentity(),
      value,
      metadata: metadata ?? {},
    });
  } catch {
    /* never let telemetry break the UI */
  }
}
