import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Layout } from 'lucide-react'
import { useBoardStore } from '../store/boardStore'
import { useCardStore } from '../store/cardStore'
import { TEMPLATES } from '../lib/templates/templateData'
import type { Template } from '../types'

const CATEGORIES = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category))).sort()]

export default function TemplatesPage() {
  const navigate = useNavigate()
  const { createBoard } = useBoardStore()
  const { createCardFromTemplate } = useCardStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [creating, setCreating] = useState<string | null>(null)

  const filtered = TEMPLATES.filter(t =>
    (category === 'All' || t.category === category) &&
    (!query || t.name.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase()))
  )

  const handleUse = async (template: Template) => {
    setCreating(template.id)
    try {
      const board = await createBoard(template.name, template.id, template.color)
      if (!board) return
      await Promise.all(template.cards.map(card => createCardFromTemplate(board.id, card)))
      navigate(`/board/${board.id}`)
    } finally {
      setCreating(null)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Templates</h1>
        <span className="text-sm text-gray-400">{TEMPLATES.length} templates</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search templatesâ€¦"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${category === cat ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Layout size={32} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No templates match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(template => (
              <TemplateCard key={template.id} template={template}
                loading={creating === template.id}
                onUse={() => handleUse(template)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateCard({ template, loading, onUse }: { template: Template; loading: boolean; onUse: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-all group overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-[16/9] flex items-center justify-center relative overflow-hidden"
        style={{ background: template.color }}>
        <span className="text-white/20 text-5xl font-bold select-none">
          {template.name[0]}
        </span>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <button onClick={onUse} disabled={loading}
            className="bg-white text-gray-900 text-sm font-medium px-5 py-2 rounded-lg shadow hover:bg-gray-50 transition-colors disabled:opacity-50">
            {loading ? 'Creatingâ€¦' : 'Use template'}
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="px-3 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug">{template.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{template.description}</p>
          </div>
        </div>
        <span className="inline-block mt-2 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
          {template.category}
        </span>
      </div>
    </div>
  )
}
