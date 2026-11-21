import flagsmith from '@flagsmith/flagsmith';

/*
 * Flagsmith wiring for the onboarding A/B test.
 *
 * The experiment runs behind a multivariate flag `onboarding_cta` with two
 * versions: `control` (the current CTA copy) and `personalized` (a warm,
 * personalized CTA). Flagsmith owns the traffic split and the Bayesian win
 * probability — the app only renders the variant the SDK resolves for this
 * visitor and reports the real events.
 */

export type OnboardingCtaVariant = 'control' | 'personalized';

export const CTA_FLAG_KEY = 'onboarding_cta';
export const EVENT_ONBOARDING_STARTED = 'onboarding_started';
export const EVENT_ONBOARDING_COMPLETED = 'onboarding_completed';

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

let initPromise: Promise<boolean> | null = null;

async function doInit(): Promise<boolean> {
  const key = import.meta.env.VITE_FLAGSMITH_SDK_KEY as string | undefined;
  if (!key || key.trim() === '' || key.startsWith('PLACEHOLDER')) {
    return false;
  }
  try {
    await flagsmith.init({
      environmentID: key,
      identity: getClientIdentity(),
      enableEvents: true,
      defaultFlags: {
        [CTA_FLAG_KEY]: { enabled: true, value: 'control' },
      },
    });
    return true;
  } catch {
    // Flagsmith unavailable (no network, bad key): the app must keep working.
    return false;
  }
}

export function initFlagsmith(): Promise<boolean> {
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

// Flagsmith fires the `$flag_exposure` event at most once per process per
// exposure (the SDK dedupes), so resolving the flag on first paint is safe.
export function resolveCtaVariant(): OnboardingCtaVariant {
  try {
    flagsmith.getExperimentFlag(CTA_FLAG_KEY);
  } catch {
    /* degrade to a plain flag read below */
  }
  try {
    const value = flagsmith.getValue(CTA_FLAG_KEY, { fallback: 'control' }) as string;
    return value === 'personalized' ? 'personalized' : 'control';
  } catch {
    return 'control';
  }
}

export function trackEvent(
  event: string,
  opts: { value?: string | number; metadata?: Record<string, unknown> } = {},
): void {
  try {
    flagsmith.trackEvent(event, {
      identifier: getClientIdentity(),
      value: opts.value,
      metadata: opts.metadata,
    });
  } catch {
    /* never let telemetry break the UI */
  }
}
