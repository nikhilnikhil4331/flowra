import {
  EVENT_ONBOARDING_COMPLETED,
  EVENT_ONBOARDING_STARTED,
  getClientIdentity,
  initFlagsmith,
  resolveCtaVariant,
  trackEvent,
  type OnboardingCtaVariant,
} from './flagsmith';
import { logExperimentEvent } from './supabase';

/*
 * Experiment orchestration — the single place the app reports the funnel.
 *
 * Hypothesis: "A personal, warm onboarding CTA leads more people into the
 * funnel than the generic 'Get Started' CTA."
 *
 * Funnel:
 *   1. Splash CTA clicked      → onboarding_started
 *   2. Goals setup completed   → onboarding_completed  (the experiment metric)
 *
 * Identities: anonymous client UUID (no PII is sent to Flagsmith or Supabase).
 */

export async function initExperiment(): Promise<boolean> {
  return initFlagsmith();
}

export async function resolveOnboardingCta(): Promise<OnboardingCtaVariant> {
  const ok = await initFlagsmith();
  if (!ok) return 'control';
  return resolveCtaVariant();
}

export function trackCtaStarted(variant: OnboardingCtaVariant): void {
  trackEvent(EVENT_ONBOARDING_STARTED, {
    value: 1,
    metadata: { step: 'splash_cta_click', variant },
  });
  void logExperimentEvent(EVENT_ONBOARDING_STARTED, {
    clientId: getClientIdentity(),
    variant,
  });
}

export function trackOnboardingCompleted(): void {
  const variant = resolveCtaVariant();
  trackEvent(EVENT_ONBOARDING_COMPLETED, {
    value: 1,
    metadata: { step: 'goals_setup_completed', variant },
  });
  void logExperimentEvent(EVENT_ONBOARDING_COMPLETED, {
    clientId: getClientIdentity(),
    variant,
  });
}
