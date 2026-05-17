import { Home, Star, Trash2, Layout, Plus, Search, LogOut, ChevronLeft } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useBoardStore } from '../../store/boardStore'
import { useUIStore } from '../../store/uiStore'

type View = 'all' | 'starred' | 'trash'

interface Props {
  activeView: View
  setView: (v: View) => void
}

export default function Sidebar({ activeView, setView }: Props) {
  const { isSidebarOpen, setSidebarOpen, setSearchOpen } = useUIStore()
  const { signOut, profile } = useAuthStore()
  const { createBoard } = useBoardStore()
  const navigate = useNavigate()

  const handleNewBoard = async () => {
    const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
    const color = colors[Math.floor(Math.random() * colors.length)]
    const b = await createBoard('Untitled board', undefined, color)
    if (b) navigate(`/board/${b.id}`)
  }

  return (
    <>
      {/* Overlay on mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900 text-sm">Advanced Notes</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-gray-600">
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* New board */}
        <div className="px-3 pt-3">
          <button onClick={handleNewBoard}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors">
            <Plus size={16} />
            New board
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pt-2">
          <button onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 text-sm transition-colors">
            <Search size={16} />
            Search
            <kbd className="ml-auto text-xs bg-gray-100 px-1 py-0.5 rounded text-gray-400">⌘K</kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-2 space-y-0.5">
          <SidebarItem icon={<Home size={16} />} label="All boards" active={activeView === 'all'} onClick={() => setView('all')} />
          <SidebarItem icon={<Star size={16} />} label="Starred" active={activeView === 'starred'} onClick={() => setView('starred')} />
          <SidebarItem icon={<Trash2 size={16} />} label="Trash" active={activeView === 'trash'} onClick={() => setView('trash')} />
          <NavLink to="/templates"
            className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Layout size={16} />
            Templates
          </NavLink>
        </nav>

        {/* User */}
        <div className="px-3 pb-4 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2.5 px-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-600">
              {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <span className="text-sm text-gray-700 truncate flex-1">{profile?.display_name ?? 'User'}</span>
          </div>
          <button onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
        ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
      {icon}
      {label}
    </button>
  )
}
