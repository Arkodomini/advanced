import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, Plus, ChevronRight, Check } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import type { Card, BoardContent, TodoItem } from '../../../types'
import { v4 as uuid } from 'uuid'

interface Props { card: Card; boardId: string }

export default function BoardCard({ card, boardId }: Props) {
  const navigate = useNavigate()
  const { updateCard } = useCardStore()
  const content = card.content as unknown as BoardContent
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(content.title)
  const [newTodo, setNewTodo] = useState('')

  const saveTitle = () => {
    setEditingTitle(false)
    if (titleDraft !== content.title) {
      updateCard(card.id, { content: { ...content, title: titleDraft } })
    }
  }

  const toggleTodo = (itemId: string) => {
    const updated = content.todos.map(t => t.id === itemId ? { ...t, checked: !t.checked } : t)
    updateCard(card.id, { content: { ...content, todos: updated } })
  }

  const addTodo = () => {
    const text = newTodo.trim()
    if (!text) return
    const item: TodoItem = { id: uuid(), text, checked: false }
    updateCard(card.id, { content: { ...content, todos: [...content.todos, item] } })
    setNewTodo('')
  }

  const openLinkedBoard = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (content.linked_board_id) navigate(`/board/${content.linked_board_id}`)
  }

  const iconColor = content.icon_color ?? '#6366F1'
  const iconEmoji = content.icon_emoji ?? null
  const completedCount = content.todos.filter(t => t.checked).length
  const pct = content.todos.length > 0 ? (completedCount / content.todos.length) * 100 : 0

  return (
    <div className="w-full h-full flex flex-col">
      {/* Cover image */}
      {content.cover_image && (
        <div className="h-24 shrink-0 overflow-hidden">
          <img src={content.cover_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        {/* Icon */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
          style={{ backgroundColor: iconEmoji ? iconColor + '22' : iconColor }}>
          {iconEmoji
            ? <span className="leading-none">{iconEmoji}</span>
            : <LayoutDashboard size={14} className="text-white" />}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => e.key === 'Enter' && saveTitle()}
              onMouseDown={e => e.stopPropagation()}
              className="w-full text-[13px] font-bold focus:outline-none bg-transparent border-b border-blue-400"
              style={{ color: 'var(--card-text, #111827)' }}
            />
          ) : (
            <button
              onMouseDown={e => { e.stopPropagation(); setEditingTitle(true) }}
              className="board-title-btn text-left text-[13px] font-bold truncate w-full transition-colors"
              style={{ color: 'var(--card-text, #111827)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--card-text, #111827)')}
            >
              {content.title || 'Board'}
            </button>
          )}
        </div>

        {content.linked_board_id && (
          <button
            onClick={openLinkedBoard}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--card-text-muted, #9CA3AF)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#2563EB'; e.currentTarget.style.background = 'rgba(37,99,235,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--card-text-muted, #9CA3AF)'; e.currentTarget.style.background = 'transparent' }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Nested boards */}
      {content.nested_items.length > 0 && (
        <div className="px-3 py-2 border-b flex flex-col gap-0.5" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          {content.nested_items.slice(0, 4).map(item => (
            <button
              key={item.id}
              onClick={e => { e.stopPropagation(); navigate(`/board/${item.id}`) }}
              className="flex items-center gap-2 text-[12px] py-1 px-1.5 rounded-lg text-left transition-colors hover:bg-black/[0.03]"
              style={{ color: 'var(--card-text-muted, #6B7280)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#2563EB')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--card-text-muted, #6B7280)')}
            >
              <div className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.icon_color + '28' }}>
                <LayoutDashboard size={9} style={{ color: item.icon_color }} />
              </div>
              <span className="truncate flex-1">{item.title}</span>
              {item.card_count > 0 && (
                <span className="shrink-0 text-[10px]" style={{ color: 'var(--card-text-muted, #D1D5DB)' }}>
                  {item.card_count}
                </span>
              )}
            </button>
          ))}
          {content.nested_items.length > 4 && (
            <button onClick={openLinkedBoard}
              className="text-[11px] text-blue-500 hover:text-blue-700 text-left px-1.5 mt-0.5 transition-colors">
              +{content.nested_items.length - 4} more
            </button>
          )}
        </div>
      )}

      {/* To-do list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-0.5 min-h-0">
        {content.todos.map(todo => (
          <div key={todo.id}
            className="flex items-start gap-2.5 py-1.5 px-1.5 rounded-lg transition-colors hover:bg-black/[0.025] cursor-default">
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => toggleTodo(todo.id)}
              className={`shrink-0 w-4 h-4 mt-px flex items-center justify-center transition-all border-2
                ${todo.checked ? 'bg-blue-500 border-blue-500' : 'border-gray-300 hover:border-blue-400'}`}
              style={{ borderRadius: 3 }}
            >
              {todo.checked && <Check size={9} className="text-white" strokeWidth={3} />}
            </button>
            <span className={`text-[12px] leading-relaxed flex-1 ${todo.checked ? 'line-through' : ''}`}
              style={{ color: todo.checked ? 'var(--card-text-muted, #9CA3AF)' : 'var(--card-text, #374151)' }}>
              {todo.text}
            </span>
          </div>
        ))}

        {/* Add task */}
        <div className="flex items-center gap-2.5 py-1.5 px-1.5">
          <div className="w-4 h-4 shrink-0 border-2 border-dashed border-gray-200" style={{ borderRadius: 3 }} />
          <input
            value={newTodo}
            onChange={e => setNewTodo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            onMouseDown={e => e.stopPropagation()}
            placeholder="Add a task…"
            className="flex-1 text-[12px] bg-transparent outline-none placeholder-gray-300 italic"
            style={{ color: 'var(--card-text, #374151)', cursor: 'text' }}
          />
          {newTodo && (
            <button onMouseDown={e => e.stopPropagation()} onClick={addTodo}
              className="text-blue-500 hover:text-blue-700 transition-colors shrink-0">
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Progress footer */}
      {content.todos.length > 0 && (
        <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-t"
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
            {completedCount}/{content.todos.length}
          </span>
        </div>
      )}
    </div>
  )
}
