import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, MoreHorizontal, Trash2, RotateCcw, Pencil, X, AlertTriangle } from 'lucide-react'
import { useBoardStore } from '../../store/boardStore'
import type { Board } from '../../types'
import ContextMenu, { type MenuItem } from '../common/ContextMenu'

export default function BoardCard({ board }: { board: Board }) {
  const navigate = useNavigate()
  const { toggleStar, trashBoard, restoreBoard, deleteBoard, updateBoard } = useBoardStore()
  const [menu,        setMenu]        = useState<{ x: number; y: number } | null>(null)
  const [renaming,    setRenaming]    = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)
  const [title,       setTitle]       = useState(board.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  const handleRename = async () => {
    const t = title.trim() || 'Untitled board'
    await updateBoard(board.id, { title: t })
    setRenaming(false)
  }

  const trashItems: MenuItem[] = [
    { label: 'Restore',        icon: <RotateCcw size={14} />, onClick: () => restoreBoard(board.id) },
    { label: 'Delete forever', icon: <X size={14} />,         onClick: () => setConfirmDel(true), danger: true },
  ]

  const normalItems: MenuItem[] = [
    { label: 'Open',                        icon: <Pencil size={14} />,    onClick: () => navigate(`/board/${board.id}`) },
    { label: 'Rename',                      icon: <Pencil size={14} />,    onClick: () => { setRenaming(true); setTimeout(() => inputRef.current?.focus(), 50) } },
    { label: board.is_starred ? 'Unstar' : 'Star', icon: <Star size={14} />, onClick: () => toggleStar(board.id) },
    { label: '', divider: true } as MenuItem,
    { label: 'Move to trash',  icon: <Trash2 size={14} />,   onClick: () => trashBoard(board.id), danger: true },
    { label: 'Delete forever', icon: <X size={14} />,         onClick: () => setConfirmDel(true),  danger: true },
  ]

  return (
    <>
      <div onClick={() => !board.is_deleted && navigate(`/board/${board.id}`)}
        className={`group relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-card hover:shadow-card-hover transition-all duration-150 ${!board.is_deleted ? 'cursor-pointer' : ''}`}>
        {/* Thumbnail */}
        <div className="aspect-[4/3] flex items-center justify-center"
          style={{ background: board.icon_color ?? '#E5E7EB' }}>
          <span className="text-white/30 text-4xl font-bold select-none">
            {board.title[0]?.toUpperCase()}
          </span>
        </div>

        {/* Footer */}
        <div className="px-3 py-2.5 flex items-center gap-2">
          {renaming ? (
            <input ref={inputRef} value={title} onChange={e => setTitle(e.target.value)}
              onBlur={handleRename} onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false) }}
              onClick={e => e.stopPropagation()}
              className="flex-1 text-sm font-medium text-gray-900 border-b border-blue-500 outline-none bg-transparent" />
          ) : (
            <span className="flex-1 text-sm font-medium text-gray-900 truncate">{board.title}</span>
          )}

          {board.is_starred && !board.is_deleted && (
            <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />
          )}

          <button onClick={handleMoreClick}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 shrink-0 transition-opacity"
            onMouseDown={e => e.stopPropagation()}>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {menu && (
        <ContextMenu x={menu.x} y={menu.y}
          items={board.is_deleted ? trashItems : normalItems}
          onClose={() => setMenu(null)} />
      )}

      {/* Permanent delete confirmation */}
      {confirmDel && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
          onClick={() => setConfirmDel(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[360px] p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Delete board permanently?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-semibold">"{board.title}"</span> and all its cards will be
                  permanently removed. This cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDel(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { deleteBoard(board.id); setConfirmDel(false) }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 rounded-lg transition-colors"
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
