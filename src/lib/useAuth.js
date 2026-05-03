import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) {
      queueMicrotask(() => setLoading(false))
      return
    }

    let cancelled = false

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return
      queueMicrotask(() => {
        setSession(s)
        setUser(s?.user ?? null)
        setLoading(false)
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      queueMicrotask(() => {
        setSession(s)
        setUser(s?.user ?? null)
      })
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  const signInWithPassword = useCallback(async (email, password) => {
    if (!supabaseConfigured) {
      return { error: new Error('Supabase is not configured') }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }, [])

  const signOut = useCallback(async () => {
    if (!supabaseConfigured) return { error: null }
    return supabase.auth.signOut()
  }, [])

  return {
    session,
    user,
    loading,
    isAuthenticated: Boolean(user),
    signInWithPassword,
    signOut,
  }
}
