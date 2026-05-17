import { useRef, useState, useEffect } from 'react'
import {
  StickyNote, Link2, CheckSquare, Minus, LayoutDashboard, Columns, MessageSquare,
  Image, Upload, Pencil, Trash2, SmilePlus, Type, ChevronLeft, MoreHorizontal,
  Circle,
} from 'lucide-react'
import type { CanvasTool, BoardContent } from '../../types'
import { useUIStore } from '../../store/uiStore'
import { useCardStore } from '../../store/cardStore'

interface Props {
  boardId: string
  onCreateCard: (type: CanvasTool) => void
  onTrash: () => void
  onImageUpload?: (file: File) => void
  onFileUpload?: (file: File) => void
}

const MAIN_TOOLS: { tool: CanvasTool; icon: React.ReactNode; label: string }[] = [
  { tool: 'note',  icon: <StickyNote size={20} />,      label: 'Note' },
  { tool: 'link',  icon: <Link2 size={20} />,           label: 'Link' },
  { tool: 'todo',  icon: <CheckSquare size={20} />,     label: 'To-do' },
  { tool: 'board', icon: <LayoutDashboard size={20} />, label: 'Board' },
]

const MORE_TOOLS: { tool: CanvasTool; icon: React.ReactNode; label: string; color: string }[] = [
  { tool: 'column',       icon: <Columns size={18} />,       label: 'Column',  color: '#6B7280' },
  { tool: 'comment',      icon: <MessageSquare size={18} />, label: 'Comment', color: '#F59E0B' },
  { tool: 'color_swatch', icon: <Circle size={18} />,        label: 'Color',   color: '#8B5CF6' },
]

const BOARD_COLORS = [
  '#6366F1', '#3B82F6', '#0EA5E9', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6',
]
const BOARD_EMOJIS = ['📋', '🎯', '🚀', '💡', '📊', '📌', '🎨', '⚡', '🌟', '🔖', '🗂️', '🧩']

const sidebarStyle = {
  background: 'var(--sidebar-bg)',
  borderRight: '1px solid var(--sidebar-border)',
} as React.CSSProperties

export default function LeftSidebar({ boardId, onCreateCard, onTrash, onImageUpload, onFileUpload }: Props) {
  const { activeTool, setTool, selectedCardIds, selectedArrowId, clearSelection } = useUIStore()
  const { cards, updateCard } = useCardStore()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef  = useRef<HTMLInputElement>(null)
  const [trashOver,  setTrashOver]  = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [showMore,   setShowMore]   = useState(false)

  const hasSelection = selectedCardIds.length > 0 || selectedArrowId !== null
  const selectedCard = selectedCardIds.length === 1 ? cards.find(c => c.id === selectedCardIds[0]) : null
  const isBoardCard  = selectedCard?.type === 'board'
  const boardContent = isBoardCard ? (selectedCard!.content as unknown as BoardContent) : null

  useEffect(() => {
    if (!showMore) return
    const close = () => setShowMore(false)
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [showMore])

  const handleDragStart = (e: React.DragEvent, tool: CanvasTool) => {
    e.dataTransfer.setData('card-type', tool)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onImageUpload?.(file)
    e.target.value = ''
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileUpload?.(file)
    e.target.value = ''
  }

  const setBoardColor = (color: string) => {
    if (!selectedCard || !boardContent) return
    updateCard(selectedCard.id, { content: { ...boardContent, icon_color: color } })
  }
  const setBoardEmoji = (emoji: string) => {
    if (!selectedCard || !boardContent) return
    updateCard(selectedCard.id, { content: { ...boardContent, icon_emoji: emoji } })
    setShowEmojis(false)
  }
  const clearBoardEmoji = () => {
    if (!selectedCard || !boardContent) return
    updateCard(selectedCard.id, { content: { ...boardContent, icon_emoji: undefined } })
    setShowEmojis(false)
  }

  // ── Board context panel ──────────────────────────────────────────────────
  if (isBoardCard && boardContent) {
    return (
      <aside className="fixed left-0 top-0 h-full w-14 flex flex-col items-center py-3 gap-1 z-30 shadow-sm"
        style={sidebarStyle}>
        <button onClick={clearSelection} title="Back"
          className="w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all"
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <ChevronLeft size={18} />
          <span className="text-[9px] font-medium mt-0.5 leading-none">Back</span>
        </button>

        <div className="w-8 h-px my-0.5" style={{ background: 'var(--sidebar-border)' }} />

        {/* Color */}
        <div className="group relative w-full flex flex-col items-center">
          <button title="Color" className="w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all"
            style={{ color: 'var(--sidebar-text)' }}>
            <div className="w-5 h-5 rounded-md border shadow-sm"
              style={{ backgroundColor: boardContent.icon_color ?? '#6366F1', borderColor: 'var(--sidebar-border)' }} />
            <span className="text-[9px] font-medium mt-0.5 leading-none">Color</span>
          </button>
          <div className="absolute left-full ml-1.5 top-0 hidden group-hover:flex flex-wrap gap-1 p-2
            bg-white rounded-xl shadow-xl border border-gray-100 z-50" style={{ width: 108 }}>
            {BOARD_COLORS.map(c => (
              <button key={c} onClick={() => setBoardColor(c)}
                className="w-9 h-9 rounded-lg transition-transform hover:scale-110 border-2"
                style={{
                  background: c,
                  borderColor: (boardContent.icon_color ?? '#6366F1') === c ? 'white' : 'transparent',
                  outline: (boardContent.icon_color ?? '#6366F1') === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 1,
                }} />
            ))}
          </div>
        </div>

        {/* Icon / Emoji */}
        <div className="relative w-full flex flex-col items-center">
          <button onClick={() => setShowEmojis(v => !v)} title="Icon"
            className="w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all"
            style={{ color: showEmojis ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
                     background: showEmojis ? 'var(--sidebar-active-bg)' : 'transparent' }}>
            {boardContent.icon_emoji
              ? <span className="text-lg leading-none">{boardContent.icon_emoji}</span>
              : <SmilePlus size={18} />}
            <span className="text-[9px] font-medium mt-0.5 leading-none">Icon</span>
          </button>
          {showEmojis && (
            <div className="absolute left-full ml-1.5 top-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2" style={{ width: 148 }}>
              <div className="flex flex-wrap gap-1">
                {BOARD_EMOJIS.map(em => (
                  <button key={em} onClick={() => setBoardEmoji(em)}
                    className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-colors
                      ${boardContent.icon_emoji === em ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
                    {em}
                  </button>
                ))}
              </div>
              {boardContent.icon_emoji && (
                <button onClick={clearBoardEmoji}
                  className="w-full mt-1.5 text-[10px] text-gray-400 hover:text-gray-600 py-1 hover:bg-gray-50 rounded-lg transition-colors">
                  Remove icon
                </button>
              )}
            </div>
          )}
        </div>

        {/* Rename */}
        <button title="Rename" onClick={() => {
          const el = document.querySelector(`[data-card-id="${selectedCard!.id}"] .board-title-btn`) as HTMLButtonElement
          el?.click()
        }}
          className="w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all"
          style={{ color: 'var(--sidebar-text)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <Type size={18} />
          <span className="text-[9px] font-medium mt-0.5 leading-none">Rename</span>
        </button>

        <div className="flex-1" />

        <button data-trash="true" title="Trash"
          onDragEnter={() => setTrashOver(true)} onDragLeave={() => setTrashOver(false)}
          onDragOver={e => e.preventDefault()} onDrop={() => setTrashOver(false)}
          onClick={onTrash}
          className={`group relative w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all
            ${trashOver ? 'bg-red-100 text-red-600 scale-110' : 'hover:bg-red-50 hover:text-red-500'}`}
          style={{ color: trashOver ? undefined : 'var(--sidebar-muted)' }}>
          <Trash2 size={20} />
          <span className="text-[9px] font-medium mt-0.5 leading-none">Trash</span>
        </button>
      </aside>
    )
  }

  // ── Default tools sidebar ────────────────────────────────────────────────
  return (
    <aside className="fixed left-0 top-0 h-full w-14 flex flex-col items-center py-3 gap-0.5 z-30 shadow-sm"
      style={sidebarStyle}>
      <div className={`flex flex-col items-center gap-0.5 w-full transition-opacity duration-150 ${hasSelection ? 'opacity-30 pointer-events-none' : ''}`}>

        {MAIN_TOOLS.map(({ tool, icon, label }) => (
          <SidebarBtn key={tool} icon={icon} label={label} active={activeTool === tool}
            draggable onDragStart={(e) => handleDragStart(e, tool)}
            onClick={() => { setTool(tool); onCreateCard(tool) }} />
        ))}

        {/* "..." more tools */}
        <div className="relative w-full flex flex-col items-center">
          <SidebarBtn
            icon={<MoreHorizontal size={20} />}
            label="More"
            active={showMore}
            onClick={(e) => { e?.stopPropagation(); setShowMore(v => !v) }}
          />
          {showMore && (
            <div
              className="absolute left-full ml-1.5 top-0 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-2"
              onMouseDown={e => e.stopPropagation()}
            >
              <p className="text-[10px] text-gray-400 font-medium px-1 pb-1.5">More tools</p>
              <div className="flex flex-col gap-0.5" style={{ minWidth: 140 }}>
                {MORE_TOOLS.map(({ tool, icon, label, color }) => (
                  <button
                    key={tool}
                    draggable
                    onDragStart={(e) => { handleDragStart(e, tool); setShowMore(false) }}
                    onClick={() => { setTool(tool); onCreateCard(tool); setShowMore(false) }}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                  >
                    <span style={{ color }} className="flex items-center shrink-0">{icon}</span>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Line */}
        <SidebarBtn icon={<Minus size={20} />} label="Line" active={activeTool === 'line'}
          onClick={() => setTool('line')} />

        <div className="w-8 h-px my-1" style={{ background: 'var(--sidebar-border)' }} />

        {/* Image / File / Draw */}
        <SidebarBtn icon={<Image size={20} />} label="Image" active={false}
          onClick={() => imageInputRef.current?.click()} />
        <SidebarBtn icon={<Upload size={20} />} label="File" active={false}
          onClick={() => fileInputRef.current?.click()} />
        <SidebarBtn icon={<Pencil size={20} />} label="Draw" active={activeTool === 'draw'}
          onClick={() => setTool('draw')} />
      </div>

      <div className="flex-1" />

      <button data-trash="true" title="Trash — drag cards here to delete"
        onDragEnter={() => setTrashOver(true)} onDragLeave={() => setTrashOver(false)}
        onDragOver={e => e.preventDefault()} onDrop={() => setTrashOver(false)}
        onClick={onTrash}
        className={`group relative w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all
          ${trashOver ? 'bg-red-100 text-red-600 scale-110' : 'hover:bg-red-50 hover:text-red-500'}`}
        style={{ color: trashOver ? undefined : 'var(--sidebar-muted)' }}>
        <Trash2 size={20} />
        <span className="text-[9px] font-medium mt-0.5 leading-none">Trash</span>
        <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap
          opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          Drag here to delete
        </span>
      </button>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      <input ref={fileInputRef}  type="file" accept="*/*"     className="hidden" onChange={handleFileChange} />
    </aside>
  )
}

function SidebarBtn({ icon, label, active, onClick, draggable, onDragStart }: {
  icon: React.ReactNode; label: string; active?: boolean
  onClick: (e?: React.MouseEvent) => void; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void
}) {
  return (
    <button draggable={draggable} onDragStart={onDragStart} onClick={onClick} title={label}
      className="group relative w-11 flex flex-col items-center justify-center py-2 rounded-xl transition-all cursor-grab active:cursor-grabbing"
      style={{
        color:      active ? 'var(--sidebar-active)'    : 'var(--sidebar-text)',
        background: active ? 'var(--sidebar-active-bg)' : 'transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      {icon}
      <span className="text-[9px] font-medium mt-0.5 leading-none">{label}</span>
      <span className="absolute left-full ml-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap
        opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
        {label}
      </span>
    </button>
  )
}
