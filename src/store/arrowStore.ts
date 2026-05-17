import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Arrow, ArrowStyle } from '../types'
import { v4 as uuid } from 'uuid'

interface ArrowState {
  arrows: Arrow[]
  fetchArrows: (boardId: string) => Promise<void>
  createArrow: (boardId: string, fromCardId: string, toCardId: string) => Promise<Arrow | null>
  updateArrow: (id: string, updates: Partial<Pick<Arrow, 'color' | 'style' | 'label'>>) => Promise<void>
  deleteArrow: (id: string) => Promise<void>
  setArrows: (arrows: Arrow[]) => void
}

export const useArrowStore = create<ArrowState>((set, get) => ({
  arrows: [],

  fetchArrows: async (boardId) => {
    const { data } = await supabase.from('arrows').select('*').eq('board_id', boardId)
    set({ arrows: data ?? [] })
  },

  createArrow: async (boardId, fromCardId, toCardId) => {
    const arrow = { id: uuid(), board_id: boardId, from_card_id: fromCardId, to_card_id: toCardId, color: '#94A3B8', style: 'curved' as ArrowStyle, label: null }
    const { data, error } = await supabase.from('arrows').insert(arrow).select().single()
    if (error || !data) return null
    set({ arrows: [...get().arrows, data] })
    return data
  },

  updateArrow: async (id, updates) => {
    set({ arrows: get().arrows.map(a => a.id === id ? { ...a, ...updates } : a) })
    await supabase.from('arrows').update(updates).eq('id', id)
  },

  deleteArrow: async (id) => {
    set({ arrows: get().arrows.filter(a => a.id !== id) })
    await supabase.from('arrows').delete().eq('id', id)
  },

  setArrows: (arrows) => set({ arrows }),
}))
