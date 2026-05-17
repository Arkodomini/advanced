import { useCardStore } from '../../../store/cardStore'
import type { Card, ColorSwatchContent } from '../../../types'

export default function ColorSwatchCard({ card }: { card: Card }) {
  const { updateCard } = useCardStore()
  const content = card.content as unknown as ColorSwatchContent
  const color = content.hex ?? '#E5E7EB'

  return (
    <div className="w-full h-full flex flex-col" style={{ background: color }}>
      <div className="flex-1" />
      {/* Label bar at bottom */}
      <div className="px-3 py-2" style={{ background: 'rgba(0,0,0,0.18)' }}>
        <input
          value={content.label ?? ''}
          onChange={e => updateCard(card.id, { content: { ...content, label: e.target.value } })}
          onPointerDown={e => e.stopPropagation()}
          placeholder={color.toUpperCase()}
          className="w-full text-[11px] font-mono bg-transparent focus:outline-none"
          style={{ color: 'rgba(255,255,255,0.9)', cursor: 'text' }}
        />
      </div>
    </div>
  )
}
