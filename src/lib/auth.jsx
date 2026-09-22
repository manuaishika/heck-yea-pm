import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authEnabled, getClient } from './supabase'
import { startSync, stopSync, flush, setSyncStatusListener, deleteAccount as deleteAccountRow } from './sync'

const notSetUp = async () => ({ error: new Error('Login is not set up') })

const AuthContext = createContext({
  enabled: false,
  loading: false,
  user: null,
  syncStatus: 'idle',
  signInWithEmail: notSetUp,
  signInWithGoogle: notSetUp,
  signOut: async () => {},
  deleteAccount: notSetUp,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(authEnabled)
  const [syncStatus, setSyncStatus] = useState('idle')

  useEffect(() => {
    if (!authEnabled) return undefined
    let cancelled = false
    let subscription = null
    setSyncStatusListener(setSyncStatus)

    getClient().then(async (client) => {
      if (cancelled || !client) return
      const { data } = await client.auth.getSession()
      if (cancelled) return
      const session = data.session
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) startSync(client, session.user.id)

      const { data: sub } = client.auth.onAuthStateChange((event, next) => {
        const nextUser = next?.user ?? null
        setUser(nextUser)
        if (event === 'SIGNED_IN' && nextUser) startSync(client, nextUser.id)
      })
      subscription = sub.subscription
    })

    return () => {
      cancelled = true
      subscription?.unsubscribe()
      setSyncStatusListener(null)
    }
  }, [])

  const signInWithEmail = useCallback(async (email) => {
    const client = await getClient()
    if (!client) return { error: new Error('Login is not set up') }
    return client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/login' },
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const client = await getClient()
    if (!client) return { error: new Error('Login is not set up') }
    return client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/login' },
    })
  }, [])

  const signOut = useCallback(async () => {
    const client = await getClient()
    if (!client) return
    // send anything still waiting, then take this person's data off the device
    await flush()
    stopSync({ clearLocal: true })
    await client.auth.signOut()
    setUser(null)
    setSyncStatus('idle')
  }, [])

  const deleteAccount = useCallback(async () => {
    const client = await getClient()
    if (!client) return { error: new Error('Login is not set up') }
    const { error } = await deleteAccountRow()
    if (!error) {
      await client.auth.signOut()
      setUser(null)
      setSyncStatus('idle')
    }
    return { error }
  }, [])

  const value = useMemo(
    () => ({
      enabled: authEnabled,
      loading,
      user,
      syncStatus,
      signInWithEmail,
      signInWithGoogle,
      signOut,
      deleteAccount,
    }),
    [loading, user, syncStatus, signInWithEmail, signInWithGoogle, signOut, deleteAccount]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
