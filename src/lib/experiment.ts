import {
  FALLBACK_VARIANT,
  getClientIdentity,
  initFlagsmith,
  resolveVariant,
  trackMetric,
  type ExperimentVariant,
} from './flagsmith';
import { logExperimentEvent } from './supabase';

/*
 * Experiment orchestration — the single place the app reports the funnel.
 *
 * HYPOTHESIS (Track 01):
 *   A warm, personalized onboarding CTA converts more new users into the
 *   funnel than the generic "Get Started" CTA.
 *
 * Funnel (real users only — never synthetic events):
 *   1. Splash CTA clicked     → experiment_conversion_started (Supabase audit)
 *   2. Goals setup completed  → experiment_conversion_metric   (Flagsmith metric)
 *
 * Identities: anonymous client UUID (no PII). Variant is resolved ONLY from
 * the Flagsmith SDK — or from the dev-only forced override below.
 */

const CTA_CLICKED_EVENT = 'experiment_conversion_started';
const CONVERSION_EVENT = 'experiment_conversion_metric';

export async function initExperiment(): Promise<boolean> {
  return initFlagsmith();
}

/**
 * Dev-only convenience for recording the demo video: force a variant with
 * `?variant=variant_a` or `?variant=variant_b`. It never sends fake telemetry
 * — the funnel events live in Flagsmith/Supabase from real user actions — so
 * nothing in the dashboard can be fabricated by this line. The UI shows a
 * visible badge whenever this override is in effect.
 */
export function forceVariantOverride(): ExperimentVariant | null {
  if (!import.meta.env.DEV) return null;
  const forced = new URLSearchParams(window.location.search).get('variant');
  if (forced === 'variant_a' || forced === 'variant_b') return forced;
  return null;
}

export async function resolveExperimentVariant(): Promise<ExperimentVariant> {
  const ok = await initFlagsmith();
  return ok ? resolveVariant() : FALLBACK_VARIANT;
}

export function trackConversionStarted(variant: ExperimentVariant): void {
  void logExperimentEvent(CTA_CLICKED_EVENT, {
    clientId: getClientIdentity(),
    variant,
  });
}

export function trackConversionMetric(): void {
  const variant = resolveVariant();
  trackMetric(1, { step: 'goals_setup_completed', variant });
  void logExperimentEvent(CONVERSION_EVENT, {
    clientId: getClientIdentity(),
    variant,
  });
}
