import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { CardType } from '../../types'

const TIPS: Partial<Record<CardType, { title: string; body: string }>> = {
  note:    { title: 'Note',    body: 'Click to start typing. Supports bold, italic, headings, and lists.' },
  link:    { title: 'Link',    body: 'Paste a URL to fetch a preview with title and thumbnail automatically.' },
  todo:    { title: 'To-do',   body: 'Add tasks and check them off as you go. Track progress in the footer.' },
  board:   { title: 'Board',   body: 'A nested board. Click the arrow to open it. Select to change colour and icon.' },
  image:   { title: 'Image',   body: 'Pick from Unsplash, upload a file, or paste an image URL.' },
  comment: { title: 'Comment', body: 'Leave a sticky note for yourself or a collaborator.' },
  column:  { title: 'Column',  body: 'A section header to group cards beneath it on the canvas.' },
}

const seen = new Set<CardType>()

interface Props {
  cardId: string
  cardType: CardType
  x: number
  y: number
  width: number
  zoom: number
}

export default function CardTooltip({ cardId, cardType, x, y, width, zoom }: Props) {
  const tip = TIPS[cardType]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!tip || seen.has(cardType)) return
    seen.add(cardType)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(t)
  }, [cardId])

  if (!visible || !tip) return null

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: x * zoom + width * zoom / 2,
        top:  y * zoom - 12,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="relative bg-gray-900 text-white rounded-xl px-3.5 py-2.5 shadow-xl max-w-[220px]"
        style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-1.5 right-1.5 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X size={10} />
        </button>
        <p className="text-[11px] font-semibold text-white mb-0.5 pr-3">{tip.title}</p>
        <p className="text-[11px] text-gray-300 leading-snug">{tip.body}</p>
        {/* Arrow pointing down */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[6px]
          border-l-[6px] border-r-[6px] border-t-[6px]
          border-l-transparent border-r-transparent border-t-gray-900" />
      </div>
    </div>
  )
}
