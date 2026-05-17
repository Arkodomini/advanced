import { useState } from 'react'
import { Upload } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import type { Card, ColumnContent } from '../../../types'

interface Props { card: Card }

export default function ColumnCard({ card }: Props) {
  const { updateCard } = useCardStore()
  const content = card.content as unknown as ColumnContent
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(content.text)

  const save = () => {
    setEditing(false)
    if (draft !== content.text) updateCard(card.id, { content: { ...content, text: draft } })
  }

  const accentColor = content.text_color || '#6B7280'

  return (
    <div className="w-full h-full flex flex-col bg-gray-50/80">
      {/* Column header — double-click or click label to edit */}
      <div className="flex items-center gap-2 px-4 py-3 shrink-0 border-b border-gray-200/70">
        <div className="w-1 h-4 rounded-full shrink-0" style={{ background: accentColor }} />
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { setDraft(content.text); setEditing(false) } }}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-sm font-bold bg-transparent focus:outline-none border-b border-blue-400"
            style={{ color: accentColor, cursor: 'text' }}
          />
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setEditing(true) }}
            className="flex-1 text-left text-sm font-bold tracking-tight"
            style={{ color: accentColor }}
          >
            {content.text || 'Section'}
          </button>
        )}
      </div>

      {/* Drop zone — cloud-upload empty state */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8 px-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.05)' }}>
          <Upload size={24} className="text-gray-400" strokeWidth={1.5} />
        </div>
        <p className="text-[11px] text-gray-400 text-center select-none">
          Drop cards here
        </p>
      </div>
    </div>
  )
}
