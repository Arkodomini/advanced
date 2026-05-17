import { useRef, useState, useEffect } from 'react'
import { X, Search, ChevronLeft, Layout } from 'lucide-react'
import { TEMPLATES } from '../../lib/templates/templateData'
import type { Template } from '../../types'

interface Props {
  onClose: () => void
  onDragStart: (template: Template, startX: number, startY: number) => void
  onUseTemplate: (template: Template) => void
}

// Category list with counts derived from data
const CATEGORY_COUNTS = (() => {
  const map: Record<string, number> = {}
  TEMPLATES.forEach(t => { map[t.category] = (map[t.category] ?? 0) + 1 })
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
})()

export default function TemplatePanel({ onClose, onDragStart, onUseTemplate }: Props) {
  const [query,       setQuery]    = useState('')
  const [category,   setCategory] = useState<string | null>(null)
  const [hovered,    setHovered]  = useState<Template | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const filtered = TEMPLATES.filter(t =>
    (!category || t.category === category) &&
    (!query || t.name.toLowerCase().includes(query.toLowerCase()) ||
               t.description.toLowerCase().includes(query.toLowerCase()) ||
               t.category.toLowerCase().includes(query.toLowerCase()))
  )

  const inSearch = query.trim().length > 0

  return (
    <div ref={panelRef}
      className="fixed top-11 right-0 bottom-0 bg-white border-l border-gray-100 shadow-xl z-40 flex"
      style={{ width: 520 }}>

      {/* ── Left: category list ─────────────────────────────────────────── */}
      <div className="w-48 shrink-0 border-r border-gray-100 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-900">Templates</span>
          <button onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-gray-100">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setCategory(null) }}
              placeholder="Search…"
              className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto py-1.5">
          <button
            onClick={() => { setCategory(null); setQuery('') }}
            className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors
              ${!category && !inSearch ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
            <span>All templates</span>
            <span className={`text-xs ${!category && !inSearch ? 'text-blue-400' : 'text-gray-400'}`}>
              {TEMPLATES.length}
            </span>
          </button>
          {CATEGORY_COUNTS.map(([cat, count]) => (
            <button key={cat}
              onClick={() => { setCategory(cat); setQuery('') }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-sm transition-colors
                ${category === cat ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}>
              <span className="truncate">{cat}</span>
              <span className={`text-xs shrink-0 ml-1 ${category === cat ? 'text-blue-400' : 'text-gray-400'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: template grid ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3.5 border-b border-gray-100 shrink-0">
          {(category || inSearch) && (
            <button onClick={() => { setCategory(null); setQuery('') }}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <ChevronLeft size={15} />
            </button>
          )}
          <span className="text-sm font-semibold text-gray-900">
            {inSearch ? `Results for "${query}"` : (category ?? 'All templates')}
          </span>
          <span className="text-xs text-gray-400 ml-0.5">({filtered.length})</span>
        </div>

        <p className="px-4 pt-2 pb-1 text-[11px] text-gray-400 shrink-0">
          Drag onto canvas or click to use
        </p>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Layout size={28} className="text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No templates match</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {filtered.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isHovered={hovered?.id === template.id}
                  onMouseEnter={() => setHovered(template)}
                  onMouseLeave={() => setHovered(null)}
                  onDragStart={onDragStart}
                  onUse={() => { onUseTemplate(template) }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-3 shrink-0 bg-gray-50/60">
          <p className="text-[11px] text-gray-400 text-center">
            Drag a template directly onto the canvas to place it
          </p>
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, isHovered, onMouseEnter, onMouseLeave, onDragStart, onUse }: {
  template: Template
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onDragStart: (t: Template, x: number, y: number) => void
  onUse: () => void
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    onDragStart(template, e.clientX, e.clientY)
  }

  return (
    <div
      className="rounded-xl border border-gray-100 overflow-hidden cursor-grab active:cursor-grabbing hover:border-blue-200 hover:shadow-md transition-all select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={handleMouseDown}
    >
      {/* Thumbnail */}
      <div className="h-20 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: template.color }}>
        <span className="text-white/20 text-5xl font-black select-none">{template.name[0]}</span>
        <div className="absolute bottom-1.5 left-2">
          <span className="text-[9px] font-semibold text-white/70 uppercase tracking-wider">{template.category}</span>
        </div>
        {isHovered && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <button
              onMouseDown={e => { e.stopPropagation(); onUse() }}
              className="bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition-colors hover:bg-gray-50">
              Use template
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-2.5 py-2 bg-white">
        <p className="text-xs font-semibold text-gray-900 truncate">{template.name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-snug">{template.description}</p>
      </div>
    </div>
  )
}
