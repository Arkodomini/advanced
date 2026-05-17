import { X, StickyNote, Link2, CheckSquare, LayoutDashboard, Image, FileText } from 'lucide-react'
import type { Card } from '../../types'

interface Props {
  cards: Card[]
  onClose: () => void
  onPlaceCard: (card: Card) => void
}

function cardIcon(type: Card['type']) {
  switch (type) {
    case 'note':    return <StickyNote size={14} className="text-yellow-500" />
    case 'link':    return <Link2 size={14} className="text-blue-500" />
    case 'todo':    return <CheckSquare size={14} className="text-green-500" />
    case 'board':   return <LayoutDashboard size={14} className="text-indigo-500" />
    case 'image':   return <Image size={14} className="text-pink-500" />
    default:        return <FileText size={14} className="text-gray-400" />
  }
}

function cardLabel(card: Card): string {
  const c = card.content as Record<string, unknown>
  if (card.type === 'note')  return (c.html as string)?.replace(/<[^>]+>/g, '').slice(0, 40) || 'Empty note'
  if (card.type === 'link')  return (c.og_title as string) || (c.url as string) || 'Link'
  if (card.type === 'todo')  return (c.title as string) || 'To-do'
  if (card.type === 'board') return (c.title as string) || 'Board'
  if (card.type === 'image') return (c.original_name as string) || 'Image'
  if (card.type === 'file')  return (c.file_name as string) || 'File'
  return card.type
}

export default function UnsortedPanel({ cards, onClose, onPlaceCard }: Props) {
  return (
    <div className="absolute top-0 right-0 h-full w-64 bg-white border-l border-gray-100 shadow-xl z-30 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Unsorted</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {cards.length === 0 ? 'No unsorted items' : `${cards.length} item${cards.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <X size={15} />
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <StickyNote size={20} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400 font-medium">Nothing here yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Items dragged from outside the canvas appear here
            </p>
          </div>
        ) : (
          cards.map(card => (
            <button
              key={card.id}
              onClick={() => onPlaceCard(card)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100
                hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left w-full group"
            >
              <span className="shrink-0">{cardIcon(card.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 truncate group-hover:text-blue-700">
                  {cardLabel(card)}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">{card.type}</p>
              </div>
              <span className="shrink-0 text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                Place →
              </span>
            </button>
          ))
        )}
      </div>

      {/* Footer hint */}
      {cards.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400 text-center">
            Click an item to place it at the canvas center
          </p>
        </div>
      )}
    </div>
  )
}
