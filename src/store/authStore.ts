import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  initialized: boolean
  loading: boolean
  initialize: () => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, profile: null, initialized: false, loading: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) { set({ user: session.user }); await get().fetchProfile(session.user.id) }
    set({ initialized: true })
    supabase.auth.onAuthStateChange(async (_e, session) => {
      const user = session?.user ?? null
      set({ user })
      if (user) await get().fetchProfile(user.id)
      else set({ profile: null })
    })
  },

  fetchProfile: async (id) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (data) set({ profile: data })
  },

  signUp: async (email, password, displayName) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: displayName } } })
      if (error) throw error
      if (data.user) await supabase.from('profiles').upsert({ id: data.user.id, display_name: displayName })
    } finally { set({ loading: false }) }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } finally { set({ loading: false }) }
  },

  signInWithMagicLink: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) throw error
  },

  signOut: async () => { await supabase.auth.signOut(); set({ user: null, profile: null }) },
}))
