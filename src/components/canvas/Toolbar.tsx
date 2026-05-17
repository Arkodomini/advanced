import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Undo2, Redo2, ZoomIn, ZoomOut, Maximize2, ChevronRight, Home, Check, AlertCircle, Loader2, Layout, Download } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import { useHistoryStore } from '../../store/historyStore'
import { useCardStore } from '../../store/cardStore'
import { useArrowStore } from '../../store/arrowStore'
import { useUIStore } from '../../store/uiStore'

interface Props {
  boardId: string
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onToggleTemplates?: () => void
  showTemplates?: boolean
  unsortedCount?: number
  onToggleUnsorted?: () => void
  showUnsorted?: boolean
  onToggleExport?: () => void
  showExport?: boolean
}

export default function Toolbar({ boardId, zoom, onZoomIn, onZoomOut, onResetZoom, onToggleTemplates, showTemplates, unsortedCount = 0, onToggleUnsorted, showUnsorted, onToggleExport, showExport }: Props) {
  const navigate = useNavigate()
  const { boards, breadcrumb, updateBoard } = useBoardStore()
  const { canUndo, canRedo, undo, redo } = useHistoryStore()
  const { setCards } = useCardStore()
  const { setArrows } = useArrowStore()
  const { saveStatus } = useUIStore()
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')

  const board = boards.find(b => b.id === boardId)

  useEffect(() => {
    if (board) setTitleDraft(board.title)
  }, [board?.title])

  const handleUndo = () => {
    const snap = undo()
    if (snap) { setCards(snap.cards); setArrows(snap.arrows) }
  }

  const handleRedo = () => {
    const snap = redo()
    if (snap) { setCards(snap.cards); setArrows(snap.arrows) }
  }

  const saveTitle = () => {
    setEditingTitle(false)
    if (board && titleDraft.trim() && titleDraft !== board.title) {
      updateBoard(board.id, { title: titleDraft.trim() })
    }
  }

  return (
    <header className="h-11 shrink-0 flex items-center gap-2 px-3 z-20"
      style={{ background: 'var(--toolbar-bg)', borderBottom: '1px solid var(--toolbar-border)' }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm min-w-0" style={{ color: 'var(--toolbar-text)' }}>
        <button onClick={() => navigate('/')}
          className="flex items-center gap-1 hover:text-gray-800 transition-colors shrink-0">
          <Home size={14} />
          <span className="hidden sm:inline">Home</span>
        </button>
        {breadcrumb.map(crumb => (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight size={14} className="shrink-0" />
            <button onClick={() => navigate(`/board/${crumb.id}`)}
              className="hover:text-gray-800 transition-colors truncate max-w-[120px]">
              {crumb.title}
            </button>
          </span>
        ))}
        <ChevronRight size={14} className="shrink-0" />
        {/* Current board title — editable */}
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={e => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(board?.title ?? '') } }}
            className="text-gray-900 font-medium border-b border-blue-500 outline-none bg-transparent w-40 px-0.5"
          />
        ) : (
          <button onClick={() => setEditingTitle(true)}
            className="text-gray-900 font-medium hover:text-blue-600 transition-colors truncate max-w-[180px]">
            {board?.title ?? '…'}
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Templates button */}
      {onToggleTemplates && (
        <button onClick={onToggleTemplates}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors
            ${showTemplates ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
          <Layout size={14} />
          Templates
        </button>
      )}

      {/* Export button */}
      {onToggleExport && (
        <button onClick={onToggleExport}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors
            ${showExport ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
          <Download size={14} />
          Export
        </button>
      )}

      {/* Unsorted badge */}
      {onToggleUnsorted && (
        <button onClick={onToggleUnsorted}
          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors
            ${showUnsorted ? 'bg-amber-50 text-amber-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}>
          <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
            ${unsortedCount > 0 ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {unsortedCount}
          </span>
          Unsorted
        </button>
      )}

      <div className="w-px h-4 bg-gray-200 mx-1" />

      {/* Save status */}
      <SaveIndicator status={saveStatus} />

      <div className="w-px h-4 bg-gray-200 mx-1" />

      {/* Undo / Redo */}
      <TBtn title="Undo (⌘Z)" onClick={handleUndo} disabled={!canUndo()}>
        <Undo2 size={16} />
      </TBtn>
      <TBtn title="Redo (⌘⇧Z)" onClick={handleRedo} disabled={!canRedo()}>
        <Redo2 size={16} />
      </TBtn>

      <div className="w-px h-4 bg-gray-200 mx-1" />

      {/* Zoom */}
      <TBtn title="Zoom out (-)" onClick={onZoomOut}><ZoomOut size={16} /></TBtn>
      <span className="text-xs text-gray-500 w-10 text-center tabular-nums select-none font-medium">
        {Math.round(zoom * 100)}%
      </span>
      <TBtn title="Zoom in (+)" onClick={onZoomIn}><ZoomIn size={16} /></TBtn>
      <TBtn title="Fit view" onClick={onResetZoom}><Maximize2 size={16} /></TBtn>
    </header>
  )
}

function SaveIndicator({ status }: { status: string }) {
  if (status === 'idle') return null
  return (
    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
      ${status === 'saving' ? 'text-gray-500' : status === 'saved' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
      {status === 'saving' && <Loader2 size={12} className="animate-spin" />}
      {status === 'saved'  && <Check size={12} />}
      {status === 'error'  && <AlertCircle size={12} />}
      {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save failed'}
    </span>
  )
}

function TBtn({ children, title, onClick, disabled }: {
  children: React.ReactNode; title?: string; onClick: () => void; disabled?: boolean
}) {
  return (
    <button title={title} onClick={onClick} disabled={disabled}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
        text-gray-600 hover:bg-gray-100 hover:text-gray-900
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  )
}
