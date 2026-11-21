import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/*
 * Supabase backend for the experiment funnel.
 *
 * The app itself stores its own data in the browser (Myflo is local-first by
 * design). Supabase is used for exactly one thing: durability for the A/B
 * funnel events, so a fresh install of the app can't invent a control.
 * Events are anonymous (a client-generated UUID is all we send) and the
 * table only allows inserts — read the funnel from the dashboard instead.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key && !url.includes('YOUR-PROJECT') ? createClient(url, key) : null;

export async function logExperimentEvent(
  event: string,
  opts: { clientId?: string | null; variant?: string | null } = {},
): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from('myflo_experiment_events').insert({
      event,
      client_id: opts.clientId ?? null,
      variant: opts.variant ?? null,
      metadata: { app: 'myflo', source: 'web' },
    });
  } catch {
    // Best-effort only; never block the UI on telemetry.
  }
}
