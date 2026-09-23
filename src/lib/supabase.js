// Supabase is optional. With no keys configured, `authEnabled` is false, the
// client is never loaded, and the site behaves exactly as it did without login.

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const authEnabled = Boolean(url && key)

let clientPromise = null

/** Lazily loads the Supabase client. Resolves to null when login isn't configured. */
export function getClient() {
  if (!authEnabled) return Promise.resolve(null)
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  )
  return clientPromise
}
