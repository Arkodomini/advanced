import { create } from 'zustand'
import type { CanvasTool, SaveStatus, ToastItem } from '../types'
import { v4 as uuid } from 'uuid'

interface UIState {
  activeTool: CanvasTool
  selectedCardIds: string[]
  selectedArrowId: string | null
  isSearchOpen: boolean
  isSidebarOpen: boolean
  saveStatus: SaveStatus
  toasts: ToastItem[]
  zoom: number
  isDrawing: boolean
  // actions
  setTool: (t: CanvasTool) => void
  selectCard: (id: string, multi?: boolean) => void
  selectCards: (ids: string[]) => void
  clearSelection: () => void
  selectArrow: (id: string | null) => void
  setSearchOpen: (v: boolean) => void
  setSidebarOpen: (v: boolean) => void
  setSaveStatus: (s: SaveStatus) => void
  addToast: (msg: string, type?: ToastItem['type']) => void
  removeToast: (id: string) => void
  setZoom: (z: number) => void
  setDrawing: (v: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  activeTool: 'select',
  selectedCardIds: [],
  selectedArrowId: null,
  isSearchOpen: false,
  isSidebarOpen: false,
  saveStatus: 'idle',
  toasts: [],
  zoom: 1,
  isDrawing: false,

  setTool: (t) => set({ activeTool: t, selectedCardIds: [], selectedArrowId: null }),
  selectCard: (id, multi = false) => {
    const cur = get().selectedCardIds
    if (multi) set({ selectedCardIds: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] })
    else set({ selectedCardIds: [id], selectedArrowId: null })
  },
  selectCards: (ids) => set({ selectedCardIds: ids, selectedArrowId: null }),
  clearSelection: () => set({ selectedCardIds: [], selectedArrowId: null }),
  selectArrow: (id) => set({ selectedArrowId: id, selectedCardIds: [] }),
  setSearchOpen: (v) => set({ isSearchOpen: v }),
  setSidebarOpen: (v) => set({ isSidebarOpen: v }),
  setSaveStatus: (s) => set({ saveStatus: s }),
  addToast: (msg, type = 'info') => {
    const id = uuid()
    set({ toasts: [...get().toasts, { id, message: msg, type }] })
    setTimeout(() => get().removeToast(id), 4000)
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
  setZoom: (zoom) => set({ zoom }),
  setDrawing: (v) => set({ isDrawing: v }),
}))
