import { useEffect, useRef, useState } from 'react'
import type { Card } from '../../types'
import { useUIStore } from '../../store/uiStore'

interface Props {
  cards: Card[]
  scale: number
  translateX: number
  translateY: number
  containerRef: React.RefObject<HTMLDivElement>
  enabled: boolean
}

interface Rect { x: number; y: number; w: number; h: number }

export default function SelectionBox({ cards, scale, translateX, translateY, containerRef, enabled }: Props) {
  const { selectCards } = useUIStore()
  const [rect, setRect] = useState<Rect | null>(null)
  const start = useRef({ x: 0, y: 0 })
  const active = useRef(false)

  useEffect(() => {
    if (!enabled) return
    const el = containerRef.current
    if (!el) return

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0 || (e.target as HTMLElement).closest('[data-card]')) return
      const bounds = el.getBoundingClientRect()
      start.current = { x: e.clientX - bounds.left, y: e.clientY - bounds.top }
      active.current = true
    }

    const onMove = (e: MouseEvent) => {
      if (!active.current) return
      const bounds = el.getBoundingClientRect()
      const mx = e.clientX - bounds.left
      const my = e.clientY - bounds.top
      setRect({
        x: Math.min(start.current.x, mx),
        y: Math.min(start.current.y, my),
        w: Math.abs(mx - start.current.x),
        h: Math.abs(my - start.current.y),
      })
    }

    const onUp = () => {
      if (!active.current) return
      active.current = false
      setRect(r => {
        if (r && r.w > 4 && r.h > 4) {
          // Convert screen rect to canvas coords
          const canvasX = (r.x - translateX) / scale
          const canvasY = (r.y - translateY) / scale
          const canvasW = r.w / scale
          const canvasH = r.h / scale
          const hit = cards.filter(c =>
            c.x < canvasX + canvasW && c.x + c.width > canvasX &&
            c.y < canvasY + canvasH && c.y + c.height > canvasY
          )
          selectCards(hit.map(c => c.id))
        }
        return null
      })
    }

    el.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      el.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [enabled, cards, scale, translateX, translateY, selectCards, containerRef])

  if (!rect || rect.w < 2 || rect.h < 2) return null

  return (
    <div className="absolute pointer-events-none z-[9]" style={{
      left: rect.x, top: rect.y, width: rect.w, height: rect.h,
      border: '1.5px solid #3B82F6', background: 'rgba(59,130,246,0.08)',
    }} />
  )
}
