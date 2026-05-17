import { useEffect, useState } from 'react'
import { Menu, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBoardStore } from '../store/boardStore'
import { useUIStore } from '../store/uiStore'
import Sidebar from '../components/common/Sidebar'
import SearchOverlay from '../components/common/SearchOverlay'
import BoardGrid from '../components/home/BoardGrid'

type View = 'all' | 'starred' | 'trash'

export default function HomePage() {
  const { fetchBoards, boards, loading, createBoard } = useBoardStore()
  const { setSidebarOpen } = useUIStore()
  const navigate = useNavigate()
  const [view, setView] = useState<View>('all')

  useEffect(() => { fetchBoards() }, [fetchBoards])

  const handleNewBoard = async () => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const b = await createBoard('Untitled board', undefined, color)
    if (b) navigate(`/board/${b.id}`)
  }

  const visibleBoards = view === 'all'
    ? boards.filter(b => !b.is_deleted)
    : view === 'starred'
    ? boards.filter(b => !b.is_deleted && b.is_starred)
    : boards.filter(b => b.is_deleted)

  const headings: Record<View, string> = { all: 'All boards', starred: 'Starred', trash: 'Trash' }

  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar activeView={view} setView={setView} />
      <SearchOverlay />

      {/* Main */}
      <main className="flex-1 lg:ml-56 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-canvas/80 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{headings[view]}</h1>
          </div>
          {view !== 'trash' && (
            <button onClick={handleNewBoard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} />
              New board
            </button>
          )}
        </div>

        <div className="px-6 py-6">
          <BoardGrid boards={visibleBoards} loading={loading} view={view} onNewBoard={handleNewBoard} />
        </div>
      </main>
    </div>
  )
}
