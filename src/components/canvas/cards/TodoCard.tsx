import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import type { Card, TodoContent, TodoItem } from '../../../types'
import { v4 as uuidv4 } from 'uuid'

export default function TodoCard({ card }: { card: Card }) {
  const { updateCard } = useCardStore()
  const content = card.content as unknown as TodoContent
  const [newItem, setNewItem] = useState('')

  const save = (updates: Partial<TodoContent>) => {
    updateCard(card.id, { content: { ...content, ...updates } })
  }

  const toggleItem = (id: string) => {
    save({ items: content.items.map(i => i.id === id ? { ...i, checked: !i.checked } : i) })
  }

  const addItem = () => {
    const text = newItem.trim()
    if (!text) return
    save({ items: [...(content.items ?? []), { id: uuidv4(), text, checked: false }] })
    setNewItem('')
  }

  const deleteItem = (id: string) => {
    save({ items: content.items.filter(i => i.id !== id) })
  }

  const items: TodoItem[] = content.items ?? []
  const done = items.filter(i => i.checked).length
  const pct = items.length > 0 ? (done / items.length) * 100 : 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b"
        style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <input
          value={content.title ?? 'To do'}
          onChange={e => save({ title: e.target.value })}
          onMouseDown={e => e.stopPropagation()}
          className="font-bold text-sm focus:outline-none bg-transparent flex-1 min-w-0"
          style={{ color: 'var(--card-text, #111827)', cursor: 'text' }}
        />
        {items.length > 0 && (
          <span className="text-[11px] ml-3 shrink-0 tabular-nums font-medium"
            style={{ color: 'var(--card-text-muted, #9CA3AF)' }}>
            {done}/{items.length}
          </span>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5 min-h-0">
        {items.map((item: TodoItem) => (
          <div key={item.id}
            className="flex items-start gap-2.5 py-1.5 px-1.5 rounded-lg group/item transition-colors hover:bg-black/[0.025]">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => toggleItem(item.id)}
              className={`w-4 h-4 flex-shrink-0 mt-px flex items-center justify-center transition-all border-2
                ${item.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'}`}
              style={{ borderRadius: 3 }}
            >
              {item.checked && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`text-[13px] flex-1 leading-relaxed ${item.checked ? 'line-through' : ''}`}
              style={{ color: item.checked ? 'var(--card-text-muted, #9CA3AF)' : 'var(--card-text, #374151)' }}>
              {item.text}
            </span>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => deleteItem(item.id)}
              className="opacity-0 group-hover/item:opacity-100 transition-all text-gray-300 hover:text-red-400 text-xs shrink-0 mt-px"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Add new item */}
        <div className="flex items-center gap-2.5 py-1.5 px-1.5">
          <div className="w-4 h-4 shrink-0 border-2 border-dashed border-gray-200" style={{ borderRadius: 3 }} />
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            onMouseDown={e => e.stopPropagation()}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add an item…"
            className="flex-1 text-[13px] bg-transparent focus:outline-none placeholder-gray-300 italic"
            style={{ color: 'var(--card-text, #374151)', cursor: 'text' }}
          />
          {newItem && (
            <button onMouseDown={e => e.stopPropagation()} onClick={addItem}
              className="text-blue-500 hover:text-blue-700 shrink-0 transition-colors">
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar footer */}
      {items.length > 0 && (
        <div className="shrink-0 px-4 py-2.5 border-t flex items-center gap-3"
          style={{ borderColor: 'rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.018)' }}>
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                background: pct === 100 ? '#22c55e' : '#3b82f6',
              }} />
          </div>
          <span className="text-[10px] font-semibold tabular-nums shrink-0"
            style={{ color: pct === 100 ? '#22c55e' : 'var(--card-text-muted, #9CA3AF)' }}>
            {Math.round(pct)}%
          </span>
        </div>
      )}
    </div>
  )
}
