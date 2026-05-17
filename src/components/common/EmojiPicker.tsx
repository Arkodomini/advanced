import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

const CATEGORIES: { label: string; icon: string; emojis: string[] }[] = [
  {
    label: 'Smileys', icon: '😀',
    emojis: ['😀','😄','😁','😆','😅','🤣','😂','🙂','😊','😇','🥰','😍','🤩','😘','😚','🥲','😋','😛','😜','🤪','🤗','🤔','🤐','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','😵','🤯','🥳','😎','🤓','🧐','😕','🙁','☹️','😮','😲','😳','🥺','😦','😨','😰','😥','😢','😭','😱','😤','😡','😠','🤬','😈','👿','💀','☠️'],
  },
  {
    label: 'Gestures', icon: '👍',
    emojis: ['👍','👎','👌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👋','🤚','🖐️','✋','🖖','👏','🙌','🤜','🤛','🙏','💪','💅','🤳'],
  },
  {
    label: 'Animals', icon: '🐶',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🦖','🐠','🐟','🐡','🐬','🦈','🐳','🦁','🐘','🦏','🦛','🐪','🦒','🦘','🦬','🐃','🐂','🦙','🐑','🐐'],
  },
  {
    label: 'Food', icon: '🍕',
    emojis: ['🍎','🍊','🍋','🍇','🍓','🫐','🍑','🍒','🍍','🥭','🥥','🥝','🍆','🥑','🥦','🌽','🥕','🧄','🧅','🍳','🥚','🧀','🍕','🍔','🍟','🌮','🌯','🍜','🍣','🍱','🎂','🍰','🧁','🍩','🍪','🍫','🍿','☕','🧋','🍺','🥂','🍷'],
  },
  {
    label: 'Travel', icon: '✈️',
    emojis: ['✈️','🚀','🛸','🚁','🛩️','🚂','🚃','🚄','🚅','🚇','🚊','🚝','🚞','🚋','🚌','🏎️','🚕','🚙','🚗','🏍️','🛵','🚲','🛴','🚤','⛵','🛥️','🚢','🛳️','🏔️','⛰️','🌋','🏕️','🏖️','🏜️','🏝️','🏠','🏢','🗼','🗽','🗺️'],
  },
  {
    label: 'Activities', icon: '⚽',
    emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🎯','🎮','🕹️','🎲','♟️','🧩','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🎸','🎷','🎺','🎻','🥁','🎊','🎉','🎃','🎄','🎆','🎇','✨','🌟','🏆','🥇','🥈','🥉','🎖️','🏅'],
  },
  {
    label: 'Objects', icon: '💡',
    emojis: ['💡','🔦','📱','💻','🖥️','⌨️','🖱️','📷','📸','📹','📞','☎️','📺','📻','⏰','⌚','🔋','🔌','📝','📚','📖','📌','📍','📎','✂️','🔍','🔐','🔒','🔓','💰','💳','💎','🏮','🧸','🪆','🎁','🎈','🪄','🔮','💊','🩺','🔬','🔭'],
  },
  {
    label: 'Symbols', icon: '❤️',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','✅','❌','⭕','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','⭐','🌟','💫','✨','🌈','☀️','❄️','💧','🔥','💯','♾️','🔱','🔰','💤','🆕','🆒','🆓','🆙','🆚'],
  },
]

const ALL_EMOJIS = CATEGORIES.flatMap(c => c.emojis)

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const [query, setQuery]     = useState('')
  const [activeTab, setTab]   = useState(0)
  const containerRef          = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const results = query.trim()
    ? ALL_EMOJIS.filter(e => {
        const q = query.toLowerCase()
        return e.includes(q) || CATEGORIES.some(c => c.emojis.includes(e) && c.label.toLowerCase().includes(q))
      })
    : CATEGORIES[activeTab].emojis

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50"
      style={{ width: 300, maxHeight: 360 }}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Search */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search emoji…"
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Category tabs */}
      {!query && (
        <div className="flex gap-0.5 px-2 pb-1 overflow-x-auto shrink-0">
          {CATEGORIES.map((cat, i) => (
            <button key={cat.label} onClick={() => setTab(i)}
              title={cat.label}
              className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-base transition-colors
                ${activeTab === i ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-gray-100'}`}>
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {query && <p className="text-[10px] text-gray-400 px-1 py-1">Results for "{query}"</p>}
        {!query && <p className="text-[10px] text-gray-400 px-1 py-1 font-medium">{CATEGORIES[activeTab].label}</p>}
        {results.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">No emoji found</p>
        ) : (
          <div className="grid grid-cols-8 gap-0.5">
            {results.map((emoji, i) => (
              <button key={i} onClick={() => { onSelect(emoji); onClose() }}
                className="w-8 h-8 flex items-center justify-center text-lg rounded-lg hover:bg-gray-100 transition-colors"
                title={emoji}>
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
