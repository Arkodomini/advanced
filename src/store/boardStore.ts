import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Board } from '../types'

interface BoardState {
  boards: Board[]
  loading: boolean
  breadcrumb: { id: string; title: string }[]
  fetchBoards: () => Promise<void>
  fetchBoard: (id: string) => Promise<Board | null>
  createBoard: (title: string, parentBoardId?: string, iconColor?: string) => Promise<Board | null>
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>
  deleteBoard: (id: string) => Promise<void>
  trashBoard: (id: string) => Promise<void>
  restoreBoard: (id: string) => Promise<void>
  toggleStar: (id: string) => Promise<void>
  setBreadcrumb: (crumbs: { id: string; title: string }[]) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  loading: false,
  breadcrumb: [],

  fetchBoards: async () => {
    set({ loading: true })
    try {
      const { data } = await supabase.from('boards').select('*')
        .eq('is_deleted', false).order('updated_at', { ascending: false })
      set({ boards: data ?? [] })
    } finally { set({ loading: false }) }
  },

  fetchBoard: async (id) => {
    const cached = get().boards.find(b => b.id === id)
    if (cached) return cached
    const { data } = await supabase.from('boards').select('*').eq('id', id).single()
    if (data) set({ boards: [...get().boards.filter(b => b.id !== id), data] })
    return data ?? null
  },

  createBoard: async (title, parentBoardId, iconColor = '#6366F1') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase.from('boards').insert({
      title, owner_id: user.id,
      parent_board_id: parentBoardId ?? null,
      icon_color: iconColor,
    }).select().single()
    if (error || !data) return null
    set({ boards: [data, ...get().boards] })
    return data
  },

  updateBoard: async (id, updates) => {
    set({ boards: get().boards.map(b => b.id === id ? { ...b, ...updates } : b) })
    await supabase.from('boards').update(updates).eq('id', id)
  },

  deleteBoard: async (id) => {
    set({ boards: get().boards.filter(b => b.id !== id) })
    await supabase.from('boards').delete().eq('id', id)
  },

  trashBoard: async (id) => {
    await get().updateBoard(id, { is_deleted: true })
  },

  restoreBoard: async (id) => {
    await get().updateBoard(id, { is_deleted: false })
  },

  toggleStar: async (id) => {
    const b = get().boards.find(b => b.id === id)
    if (b) await get().updateBoard(id, { is_starred: !b.is_starred })
  },

  setBreadcrumb: (breadcrumb) => set({ breadcrumb }),
}))
