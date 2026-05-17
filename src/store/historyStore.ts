import { create } from 'zustand'
import type { HistorySnapshot } from '../types'

const MAX = 50

interface HistoryState {
  past: HistorySnapshot[]
  future: HistorySnapshot[]
  push: (snap: HistorySnapshot) => void
  undo: () => HistorySnapshot | null
  redo: () => HistorySnapshot | null
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  push: (snap) => {
    const past = [...get().past, snap].slice(-MAX)
    set({ past, future: [] })
  },

  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return null
    const prev = past[past.length - 1]
    set({ past: past.slice(0, -1), future: [prev, ...future].slice(0, MAX) })
    return prev
  },

  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return null
    const next = future[0]
    set({ past: [...past, next].slice(-MAX), future: future.slice(1) })
    return next
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  clear: () => set({ past: [], future: [] }),
}))
