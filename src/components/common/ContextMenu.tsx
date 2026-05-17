import { useEffect, useRef } from 'react'

export interface MenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  danger?: boolean
  disabled?: boolean
  divider?: boolean
}

interface Props {
  x: number
  y: number
  items: MenuItem[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) onClose() }
    const keyHandler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', keyHandler) }
  }, [onClose])

  // Keep menu within viewport
  const style: React.CSSProperties = { position: 'fixed', zIndex: 1000 }
  const vw = window.innerWidth, vh = window.innerHeight
  style.left = x + 180 > vw ? vw - 188 : x
  style.top  = y + items.length * 36 + 16 > vh ? vh - (items.length * 36 + 16) : y

  return (
    <div ref={ref} style={style}
      className="bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[168px]">
      {items.map((item, i) => item.divider ? (
        <div key={i} className="my-1 border-t border-gray-100" />
      ) : (
        <button key={i} onClick={() => { if (!item.disabled) { item.onClick(); onClose() } }}
          disabled={item.disabled}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-left transition-colors
            ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
            ${item.danger ? 'text-red-500' : 'text-gray-700'}`}>
          {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  )
}
