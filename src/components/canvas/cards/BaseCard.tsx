import { useRef, useState, useEffect } from 'react'
import { Copy, Trash2, ArrowUp, ArrowDown, SmilePlus } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { useUIStore } from '../../../store/uiStore'
import { useHistoryStore } from '../../../store/historyStore'
import { useArrowStore } from '../../../store/arrowStore'
import { useDrag } from '../../../hooks/useDrag'
import type { Card } from '../../../types'
import EmojiPicker from '../../common/EmojiPicker'
import NoteCard from './NoteCard'
import ImageCard from './ImageCard'
import LinkCard from './LinkCard'
import TodoCard from './TodoCard'
import ColorSwatchCard from './ColorSwatchCard'
import FileCard from './FileCard'
import BoardCard from './BoardCard'
import CommentCard from './CommentCard'
import DrawingCard from './DrawingCard'
import ColumnCard from './ColumnCard'
import ContextMenu, { type MenuItem } from '../../common/ContextMenu'

interface Props {
  card: Card
  boardId: string
  onCardClick?: () => void
  isArrowSource?: boolean
}

const ICON_COLORS = [
  '#6366F1', '#3B82F6', '#0EA5E9', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6',
  '#F97316', '#14B8A6', '#64748B', '#1C1C1E',
]

// Pastel background colors for card backgrounds
const CARD_BG_COLORS = [
  { name: 'None',   value: ''         },
  { name: 'Yellow', value: '#FEF9C3'  },
  { name: 'Amber',  value: '#FEF3C7'  },
  { name: 'Green',  value: '#DCFCE7'  },
  { name: 'Blue',   value: '#DBEAFE'  },
  { name: 'Purple', value: '#F3E8FF'  },
  { name: 'Pink',   value: '#FCE7F3'  },
  { name: 'Gray',   value: '#F3F4F6'  },
]

// Cards that should NOT show the icon badge
const NO_ICON_TYPES  = new Set(['line', 'column', 'color_swatch', 'drawing'])
// Cards that should NOT show the background color picker
const NO_COLOR_TYPES = new Set(['line', 'drawing', 'color_swatch', 'image'])

export default function BaseCard({ card, boardId, onCardClick, isArrowSource }: Props) {
  const { updateCard, updateCardLocal, deleteCard, duplicateCard, bringToFront, sendToBack } = useCardStore()
  const { selectedCardIds, selectCard, activeTool, zoom } = useUIStore()
  const { push } = useHistoryStore()
  const { arrows } = useArrowStore()
  const { onDragStart } = useDrag(zoom)
  const [menu,            setMenu]            = useState<{ x: number; y: number } | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showIconPicker,  setShowIconPicker]  = useState(false)
  const [isHovered,       setIsHovered]       = useState(false)
  const isResizing = useRef(false)
  const resizeStart = useRef({ mouseX: 0, mouseY: 0, w: 0, h: 0 })

  const isSelected = selectedCardIds.includes(card.id)
  const reactions  = ((card.content as Record<string, unknown>)._reactions ?? {}) as Record<string, number>
  const cardIconEmoji = ((card.content as Record<string, unknown>)._icon    ?? '') as string
  const cardIconBg    = ((card.content as Record<string, unknown>)._icon_bg ?? '#6366F1') as string
  const hasIcon = !!cardIconEmoji
  const showIconZone  = !NO_ICON_TYPES.has(card.type)
  const showColorZone = !NO_COLOR_TYPES.has(card.type)

  // ── Icon handlers ──────────────────────────────────────────────────────────
  const handleSetIcon = (emoji: string, bg: string) => {
    updateCard(card.id, { content: { ...(card.content as Record<string, unknown>), _icon: emoji, _icon_bg: bg } })
    setShowIconPicker(false)
  }
  const handleRemoveIcon = () => {
    const c = { ...(card.content as Record<string, unknown>) }
    delete c._icon; delete c._icon_bg
    updateCard(card.id, { content: c })
    setShowIconPicker(false)
  }

  // ── Reaction handlers ──────────────────────────────────────────────────────
  const handleAddReaction = (emoji: string) => {
    const updated = { ...reactions, [emoji]: (reactions[emoji] ?? 0) + 1 }
    updateCard(card.id, { content: { ...(card.content as Record<string, unknown>), _reactions: updated } })
  }
  const handleRemoveReaction = (emoji: string) => {
    const count = (reactions[emoji] ?? 1) - 1
    const updated = { ...reactions }
    if (count <= 0) delete updated[emoji]
    else updated[emoji] = count
    updateCard(card.id, { content: { ...(card.content as Record<string, unknown>), _reactions: updated } })
  }

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool === 'line') {
      if ('button' in e) e.stopPropagation()
      onCardClick?.()
      return
    }
    if (activeTool !== 'select') return
    if ('button' in e) e.stopPropagation()
    const shiftKey = 'shiftKey' in e ? e.shiftKey : false
    if (!isSelected || shiftKey) selectCard(card.id, shiftKey)
    bringToFront(card.id)
    onDragStart(e as React.MouseEvent, card)
  }

  const handleResizeDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    isResizing.current = true
    resizeStart.current = { mouseX: e.clientX, mouseY: e.clientY, w: card.width, h: card.height }

    const onMove = (ev: MouseEvent) => {
      if (!isResizing.current) return
      updateCardLocal(card.id, {
        width:  Math.max(120, resizeStart.current.w + (ev.clientX - resizeStart.current.mouseX) / zoom),
        height: Math.max(60,  resizeStart.current.h + (ev.clientY - resizeStart.current.mouseY) / zoom),
      })
    }
    const onUp = (ev: MouseEvent) => {
      isResizing.current = false
      const newW = Math.max(120, resizeStart.current.w + (ev.clientX - resizeStart.current.mouseX) / zoom)
      const newH = Math.max(60,  resizeStart.current.h + (ev.clientY - resizeStart.current.mouseY) / zoom)
      updateCard(card.id, { width: newW, height: newH })
      push({ cards: useCardStore.getState().cards, arrows: useArrowStore.getState().arrows })
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const contextItems: MenuItem[] = [
    { label: 'Duplicate',      icon: <Copy size={14} />,      onClick: () => duplicateCard(card.id) },
    { label: 'Bring to front', icon: <ArrowUp size={14} />,   onClick: () => bringToFront(card.id) },
    { label: 'Send to back',   icon: <ArrowDown size={14} />, onClick: () => sendToBack(card.id) },
    { label: '', divider: true } as MenuItem,
    { label: 'Add icon',       icon: <SmilePlus size={14} />, onClick: () => setShowIconPicker(true), disabled: !showIconZone },
    { label: '', divider: true } as MenuItem,
    { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteCard(card.id), danger: true },
  ]

  return (
    <>
      <div
        data-card="true"
        data-card-id={card.id}
        style={{
          position: 'absolute',
          left: card.x,
          top:  card.y,
          width: card.width,
          height: card.type === 'column' ? 'auto' : card.height,
          zIndex: card.z_index,
          touchAction: 'none',
        }}
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handlePointerDown}
        onTouchStart={e => handlePointerDown(e)}
        onContextMenu={e => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }) }}
      >
        {/* ── Card icon badge ────────────────────────────────────────────── */}
        {showIconZone && (
          <div
            className="absolute z-20"
            style={{ top: -20, left: 8 }}
            onMouseDown={e => e.stopPropagation()}
          >
            {hasIcon ? (
              <button
                onClick={() => setShowIconPicker(v => !v)}
                title="Change icon"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow-md hover:scale-105 transition-transform select-none"
                style={{ background: cardIconBg }}
              >
                {cardIconEmoji}
              </button>
            ) : (isHovered || isSelected) ? (
              <button
                onClick={() => setShowIconPicker(v => !v)}
                title="Add icon"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs
                  bg-white/90 backdrop-blur border border-gray-200 shadow-sm
                  hover:border-blue-400 hover:text-blue-500 text-gray-400 transition-all"
              >
                +😊
              </button>
            ) : null}

            {/* Icon picker panel */}
            {showIconPicker && (
              <IconPickerPanel
                emoji={cardIconEmoji}
                bg={cardIconBg}
                hasIcon={hasIcon}
                onSelect={handleSetIcon}
                onRemove={handleRemoveIcon}
                onClose={() => setShowIconPicker(false)}
              />
            )}
          </div>
        )}

        {/* ── Card content ───────────────────────────────────────────────── */}
        <div className={`w-full h-full themed-card
          ${isSelected    ? 'is-selected' : ''}
          ${isArrowSource ? 'ring-2 ring-amber-400' : ''}`}>
          {card.type === 'note'         && <NoteCard card={card} />}
          {card.type === 'image'        && <ImageCard card={card} boardId={boardId} />}
          {card.type === 'link'         && <LinkCard card={card} />}
          {card.type === 'todo'         && <TodoCard card={card} />}
          {card.type === 'column'       && <ColumnCard card={card} />}
          {card.type === 'color_swatch' && <ColorSwatchCard card={card} />}
          {card.type === 'file'         && <FileCard card={card} boardId={boardId} />}
          {card.type === 'board'        && <BoardCard card={card} boardId={boardId} />}
          {card.type === 'comment'      && <CommentCard card={card} />}
          {card.type === 'drawing'      && <DrawingCard card={card} />}
        </div>

        {/* ── Selection corner handles ───────────────────────────────────── */}
        {isSelected && (
          <>
            <div className="absolute inset-0 rounded-xl ring-1 ring-blue-500 pointer-events-none z-10" />
            <div className="absolute -top-[3px] -left-[3px] w-2 h-2 rounded-[2px] bg-white border-[2px] border-blue-500 pointer-events-none z-20" />
            <div className="absolute -top-[3px] -right-[3px] w-2 h-2 rounded-[2px] bg-white border-[2px] border-blue-500 pointer-events-none z-20" />
            <div className="absolute -bottom-[3px] -left-[3px] w-2 h-2 rounded-[2px] bg-white border-[2px] border-blue-500 pointer-events-none z-20" />
            <div className="absolute -bottom-[3px] -right-[3px] w-2 h-2 rounded-[2px] bg-white border-[2px] border-blue-500 pointer-events-none z-20" />
          </>
        )}

        {/* ── Resize handle ──────────────────────────────────────────────── */}
        {card.type !== 'column' && (
          <div onMouseDown={handleResizeDown}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize opacity-0 group-hover:opacity-60 z-10 flex items-end justify-end pb-1 pr-1">
            <svg viewBox="0 0 6 6" className="w-2.5 h-2.5 text-gray-400">
              <path d="M0 6 L6 0 L6 6 Z" fill="currentColor" />
            </svg>
          </div>
        )}

        {/* ── Background color picker (shows below card when selected) ───── */}
        {isSelected && showColorZone && (
          <div
            className="absolute flex items-center gap-1.5 bg-white rounded-xl shadow-lg border border-gray-100 px-2.5 py-1.5 z-30"
            style={{ bottom: -40, left: 0 }}
            onMouseDown={e => e.stopPropagation()}
          >
            <span className="text-[9px] font-semibold tracking-wider uppercase text-gray-400 mr-0.5 select-none">Color</span>
            {CARD_BG_COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => updateCard(card.id, { bg_color: c.value })}
                title={c.name}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 shrink-0"
                style={{
                  background: c.value || '#FFFFFF',
                  borderColor: card.bg_color === c.value ? '#3B82F6' : c.value ? 'transparent' : '#D1D5DB',
                  boxShadow: !c.value ? '0 0 0 1px #E5E7EB inset' : 'none',
                }}
              />
            ))}
          </div>
        )}

        {/* ── Emoji reactions row ────────────────────────────────────────── */}
        <div className="absolute -bottom-7 left-0 flex items-center gap-1 z-20"
          onMouseDown={e => e.stopPropagation()}>
          {Object.entries(reactions).map(([emoji, count]) => (
            <button key={emoji} onClick={() => handleRemoveReaction(emoji)}
              title={`${count} reaction — click to remove`}
              className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-full px-1.5 py-0.5 text-xs shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-colors select-none">
              <span className="leading-none">{emoji}</span>
              {count > 1 && <span className="text-[10px] text-gray-500 font-medium">{count}</span>}
            </button>
          ))}

          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              title="Add reaction"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50 transition-colors text-gray-400 hover:text-blue-500">
              <SmilePlus size={13} />
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-8 left-0 z-50">
                <EmojiPicker onSelect={handleAddReaction} onClose={() => setShowEmojiPicker(false)} />
              </div>
            )}
          </div>
        </div>
      </div>

      {menu && <ContextMenu x={menu.x} y={menu.y} items={contextItems} onClose={() => setMenu(null)} />}
    </>
  )
}

// ── Icon Picker Panel ──────────────────────────────────────────────────────────

function IconPickerPanel({ emoji, bg, hasIcon, onSelect, onRemove, onClose }: {
  emoji: string
  bg: string
  hasIcon: boolean
  onSelect: (emoji: string, bg: string) => void
  onRemove: () => void
  onClose: () => void
}) {
  const [selectedBg,    setSelectedBg]    = useState(bg || ICON_COLORS[0])
  const [showEmojiGrid, setShowEmojiGrid] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = document.getElementById('icon-picker-panel')
      if (el && !el.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      id="icon-picker-panel"
      className="absolute top-full left-0 mt-1 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-64"
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Preview */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0"
          style={{ background: selectedBg }}>
          {emoji || '✨'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-700">Card icon</p>
          <p className="text-[10px] text-gray-400">Pick an emoji + color</p>
        </div>
      </div>

      {/* Color row */}
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Background</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {ICON_COLORS.map(c => (
          <button
            key={c}
            onClick={() => setSelectedBg(c)}
            className="w-6 h-6 rounded-lg transition-transform hover:scale-110 shrink-0"
            style={{
              background: c,
              outline: selectedBg === c ? `2px solid ${c}` : '2px solid transparent',
              outlineOffset: 2,
            }}
          />
        ))}
      </div>

      {/* Emoji quick picks */}
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Icon</p>
      <div className="flex flex-wrap gap-1 mb-2">
        {QUICK_ICONS.map(em => (
          <button
            key={em}
            onClick={() => onSelect(em, selectedBg)}
            className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors
              ${emoji === em ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}
          >
            {em}
          </button>
        ))}
        <button
          onClick={() => setShowEmojiGrid(v => !v)}
          className="w-8 h-8 rounded-lg text-xs text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors"
          title="More emojis"
        >
          ···
        </button>
      </div>

      {showEmojiGrid && (
        <div className="mb-2">
          <EmojiPicker
            onSelect={em => { onSelect(em, selectedBg); setShowEmojiGrid(false) }}
            onClose={() => setShowEmojiGrid(false)}
          />
        </div>
      )}

      {/* Remove */}
      {hasIcon && (
        <button
          onClick={onRemove}
          className="w-full mt-1 py-1.5 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          Remove icon
        </button>
      )}
    </div>
  )
}

const QUICK_ICONS = [
  '📝', '💡', '🎯', '🚀', '⭐', '🔥',
  '✅', '📋', '🗂️', '🎨', '📊', '💬',
  '🧠', '🔑', '📌', '⚡', '🌟', '🎭',
  '📈', '🖼️', '🎵', '📚', '🛠️', '🌈',
]
