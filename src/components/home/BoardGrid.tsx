import type { Board } from '../../types'
import BoardCard from './BoardCard'
import { LayoutGrid } from 'lucide-react'

interface Props {
  boards: Board[]
  loading: boolean
  view: 'all' | 'starred' | 'trash'
  onNewBoard: () => void
}

export default function BoardGrid({ boards, loading, view, onNewBoard }: Props) {
  if (loading) return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-[4/3] rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  )

  if (boards.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <LayoutGrid size={24} className="text-gray-300" />
      </div>
      <p className="text-sm font-medium text-gray-500 mb-1">
        {view === 'trash' ? 'Trash is empty' : view === 'starred' ? 'No starred boards yet' : 'No boards yet'}
      </p>
      {view === 'all' && (
        <button onClick={onNewBoard} className="mt-3 text-sm text-blue-500 hover:underline">
          Create your first board
        </button>
      )}
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
      {boards.map(b => <BoardCard key={b.id} board={b} />)}
    </div>
  )
}
