import { useEffect, useRef, useState } from 'react'
import { Search, X, Layout } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useBoardStore } from '../../store/boardStore'
import { useNavigate } from 'react-router-dom'

export default function SearchOverlay() {
  const { isSearchOpen, setSearchOpen } = useUIStore()
  const { boards } = useBoardStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isSearchOpen) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [isSearchOpen])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true) }
      if (e.key === 'Escape') setSearchOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [setSearchOpen])

  if (!isSearchOpen) return null

  const results = query.trim()
    ? boards.filter(b => !b.is_deleted && b.title.toLowerCase().includes(query.toLowerCase()))
    : boards.filter(b => !b.is_deleted).slice(0, 6)

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-24 bg-black/20 backdrop-blur-sm"
      onClick={() => setSearchOpen(false)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search boards…"
            className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none" />
          <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="py-1.5 max-h-72 overflow-y-auto">
          {results.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No boards found</p>
          ) : results.map(b => (
            <button key={b.id} onClick={() => { navigate(`/board/${b.id}`); setSearchOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
              <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: b.icon_color ?? '#E5E7EB' }}>
                <Layout size={14} className="text-white/80" />
              </div>
              <span className="text-sm text-gray-800 truncate">{b.title}</span>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 flex gap-3">
          <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">↵</kbd>
          <span className="text-xs text-gray-400">to open</span>
          <kbd className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded ml-2">Esc</kbd>
          <span className="text-xs text-gray-400">to close</span>
        </div>
      </div>
    </div>
  )
}
