import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

// Singleton instance holder. This will be null until the client is first accessed.
let supabaseInstance: SupabaseClient | null = null;

/**
 * Creates and returns a singleton instance of the Supabase client.
 * This function defers client creation until the first time it's needed,
 * allowing the app to render an error screen if env vars are missing
 * instead of crashing at startup.
 * @returns {SupabaseClient} The initialized Supabase client.
 */
const getSupabaseClient = (): SupabaseClient => {
  // If the client has already been created, return the existing instance.
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Read credentials from the config file.
  const supabaseUrl = SUPABASE_URL;
  const supabaseAnonKey = SUPABASE_ANON_KEY;

  // This check serves as a safeguard. The `EnvVarsChecker` component in App.tsx
  // is designed to prevent this code from being reached if the variables are missing.
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided in config.ts.');
  }

  // Create the client instance and store it for subsequent calls.
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

/**
 * A proxy object for the Supabase client.
 * Using a proxy allows us to intercept property access (e.g., `supabase.auth`).
 * The first time any property is accessed, the `get` handler will trigger,
 * calling `getSupabaseClient()` to initialize the real client. All subsequent
 * accesses will be forwarded to the now-initialized client.
 * This pattern enables lazy initialization without changing how `supabase` is
 * imported or used throughout the application.
 */
export const supabase = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(target, prop, receiver) {
    // Ensure the client is initialized, then forward the property access.
    const instance = getSupabaseClient();
    return Reflect.get(instance, prop, receiver);
  },
});
