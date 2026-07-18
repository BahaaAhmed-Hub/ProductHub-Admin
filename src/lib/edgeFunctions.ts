import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/** Calls a Supabase Edge Function (hosted in the same project as the main
 * ProductHub app) and unwraps its real error message — see ProductHub's
 * own src/lib/edgeFunctions.ts for why this unwrap is needed. */
export async function invoke<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) {
    if (error instanceof FunctionsHttpError) {
      const bodyMessage = await error.context
        .clone()
        .json()
        .then((b: { error?: string }) => b?.error)
        .catch(() => undefined);
      if (bodyMessage) throw new Error(bodyMessage);
    }
    throw error;
  }
  if (data?.error) throw new Error(data.error);
  return data as T;
}
