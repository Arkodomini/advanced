import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Card, CardType } from '../types'
import { CARD_DEFAULTS, CARD_INITIAL_CONTENT } from '../types'
import { v4 as uuid } from 'uuid'

interface CardState {
  cards: Card[]
  loading: boolean
  maxZIndex: number
  fetchCards: (boardId: string) => Promise<void>
  createCard: (boardId: string, type: CardType, x: number, y: number, extraContent?: Record<string, unknown>) => Promise<Card>
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>
  updateCardLocal: (id: string, updates: Partial<Card>) => void
  deleteCard: (id: string) => Promise<void>
  duplicateCard: (id: string) => Promise<Card | null>
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  setCards: (cards: Card[]) => void
  createCardFromTemplate: (boardId: string, tpl: Partial<Card>) => Promise<Card | null>
}

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {}

export const useCardStore = create<CardState>((set, get) => ({
  cards: [],
  loading: false,
  maxZIndex: 1,

  fetchCards: async (boardId) => {
    set({ loading: true, cards: [] })
    try {
      const { data } = await supabase.from('cards').select('*')
        .eq('board_id', boardId).eq('is_deleted', false).order('z_index')
      const cards = data ?? []
      set({ cards, maxZIndex: cards.reduce((m, c) => Math.max(m, c.z_index), 1) })
    } finally { set({ loading: false }) }
  },

  createCard: async (boardId, type, x, y, extraContent = {}) => {
    const z = get().maxZIndex + 1
    const def = CARD_DEFAULTS[type]
    // Allow callers to override dimensions via _w / _h in extraContent
    const cardW = typeof extraContent._w === 'number' ? extraContent._w : def.width
    const cardH = typeof extraContent._h === 'number' ? extraContent._h : def.height
    const { _w: _1, _h: _2, ...cleanContent } = extraContent as Record<string, unknown> & { _w?: number; _h?: number }
    const tempId = `temp-${uuid()}`
    const now = new Date().toISOString()
    const content = { ...CARD_INITIAL_CONTENT[type], ...cleanContent }
    const card: Card = {
      id: tempId, board_id: boardId, type, x, y,
      width: cardW, height: cardH, z_index: z,
      content, bg_color: '#FFFFFF', is_deleted: false,
      created_at: now, updated_at: now,
    }
    set({ cards: [...get().cards, card], maxZIndex: z })
    const { data, error } = await supabase.from('cards').insert({
      board_id: boardId, type, x, y,
      width: cardW, height: cardH, z_index: z,
      content, bg_color: '#FFFFFF',
    }).select().single()
    if (data && !error) {
      set({ cards: get().cards.map(c => c.id === tempId ? data : c) })
      return data
    }
    return card
  },

  updateCard: (id, updates) => {
    get().updateCardLocal(id, updates)
    clearTimeout(saveTimers[id])
    saveTimers[id] = setTimeout(async () => {
      await supabase.from('cards').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    }, 600)
    return Promise.resolve()
  },

  updateCardLocal: (id, updates) => {
    set({ cards: get().cards.map(c => c.id === id ? { ...c, ...updates } : c) })
  },

  deleteCard: async (id) => {
    set({ cards: get().cards.filter(c => c.id !== id) })
    await supabase.from('cards').update({ is_deleted: true }).eq('id', id)
  },

  duplicateCard: async (id) => {
    const orig = get().cards.find(c => c.id === id)
    if (!orig) return null
    return get().createCard(orig.board_id, orig.type, orig.x + 24, orig.y + 24, orig.content as Record<string, unknown>)
  },

  bringToFront: (id) => {
    const z = get().maxZIndex + 1
    get().updateCard(id, { z_index: z })
    set({ maxZIndex: z })
  },

  sendToBack: (id) => get().updateCard(id, { z_index: 0 }),

  setCards: (cards) => set({ cards }),

  createCardFromTemplate: async (boardId, tpl) => {
    const z = (tpl.z_index ?? 0) + get().maxZIndex
    const { data, error } = await supabase.from('cards').insert({
      ...tpl, board_id: boardId, id: uuid(), z_index: z
    }).select().single()
    if (error || !data) return null
    set({ cards: [...get().cards, data], maxZIndex: Math.max(get().maxZIndex, z) })
    return data
  },
}))
