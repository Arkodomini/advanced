import { useMemo, useCallback } from 'react'
import type { Arrow, Card, LineContent, LineMarker } from '../../types'
import { useUIStore } from '../../store/uiStore'
import { useArrowStore } from '../../store/arrowStore'
import { useCardStore } from '../../store/cardStore'

interface Props {
  arrows: Arrow[]
  cards: Card[]
  lineCards: Card[]
  scale: number
}

// ── Geometry helpers ───────────────────────────────────────────────────────────

function cardCenter(card: Card) {
  return { x: card.x + card.width / 2, y: card.y + card.height / 2 }
}

function edgePoint(card: Card, target: { x: number; y: number }) {
  const cx = card.x + card.width / 2
  const cy = card.y + card.height / 2
  const dx = target.x - cx
  const dy = target.y - cy
  const angle = Math.atan2(dy, dx)
  const hw = card.width / 2
  const hh = card.height / 2
  const scaleX = Math.abs(Math.cos(angle)) > 0 ? hw / Math.abs(Math.cos(angle)) : Infinity
  const scaleY = Math.abs(Math.sin(angle)) > 0 ? hh / Math.abs(Math.sin(angle)) : Infinity
  const r = Math.min(scaleX, scaleY)
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r }
}

// ── Line-content helpers ───────────────────────────────────────────────────────

function resolveMarkers(c: LineContent): { start: LineMarker; end: LineMarker } {
  // New fields take priority; fall back to legacy style
  const endDefault: LineMarker = c.style === 'arrow' ? 'arrow' : 'none'
  return {
    start: c.start_marker ?? 'none',
    end:   c.end_marker   ?? endDefault,
  }
}

function resolveDash(c: LineContent): boolean {
  return c.dash ?? (c.style === 'dashed')
}

function resolveWeight(c: LineContent): number {
  return c.weight ?? 1.5
}

// ── Marker id helpers ──────────────────────────────────────────────────────────

function markerId(cardId: string, kind: 'arrow' | 'dot', end: 'start' | 'end') {
  return `lm-${kind}-${end}-${cardId}`
}

// ── Card-to-card arrow colors ──────────────────────────────────────────────────

const ARROW_COLORS = ['#94A3B8', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']

// ── Main component ─────────────────────────────────────────────────────────────

export default function ArrowLayer({ arrows, cards, lineCards, scale }: Props) {
  const { selectedArrowId, selectArrow, selectedCardIds, selectCard } = useUIStore()
  const { deleteArrow } = useArrowStore()
  const { deleteCard, updateCard, updateCardLocal } = useCardStore()
  const cardMap = useMemo(() => new Map(cards.map(c => [c.id, c])), [cards])

  // ── Endpoint drag logic ────────────────────────────────────────────────────

  const dragStart = useCallback((
    e: React.PointerEvent<SVGCircleElement>,
    card: Card,
    endpoint: 'start' | 'end',
  ) => {
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)

    const c = card.content as unknown as LineContent
    const origX  = card.x
    const origY  = card.y
    const origX2 = c.x2
    const origY2 = c.y2

    const startMx = e.clientX
    const startMy = e.clientY

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startMx) / scale
      const dy = (ev.clientY - startMy) / scale
      if (endpoint === 'start') {
        updateCardLocal(card.id, { x: origX + dx, y: origY + dy })
      } else {
        updateCardLocal(card.id, {
          content: { ...(card.content as object), x2: origX2 + dx, y2: origY2 + dy },
        })
      }
    }

    const onUp = (ev: PointerEvent) => {
      const dx = (ev.clientX - startMx) / scale
      const dy = (ev.clientY - startMy) / scale
      if (endpoint === 'start') {
        updateCard(card.id, { x: origX + dx, y: origY + dy })
      } else {
        updateCard(card.id, {
          content: { ...(card.content as object), x2: origX2 + dx, y2: origY2 + dy },
        })
      }
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
  }, [scale, updateCard, updateCardLocal])

  // ── Label update ────────────────────────────────────────────────────────────

  const updateLabel = useCallback((card: Card, value: string) => {
    updateCard(card.id, {
      content: { ...(card.content as object), label: value },
    })
  }, [updateCard])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      style={{ zIndex: 5 }}
    >
      <defs>
        {/* ── Card-to-card arrow markers ── */}
        {ARROW_COLORS.map(color => (
          <marker key={color} id={`arrow-${color.slice(1)}`}
            markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={color} />
          </marker>
        ))}

        {/* ── Per-line-card markers ── */}
        {lineCards.map(card => {
          const c    = card.content as unknown as LineContent
          const col  = c.color ?? '#374151'
          const w    = resolveWeight(c)
          const dotR = Math.max(3, w * 2.5)

          return [
            /* Arrow end */
            <marker key={markerId(card.id, 'arrow', 'end')}
              id={markerId(card.id, 'arrow', 'end')}
              markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto"
              markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L8,3 z" fill={col} />
            </marker>,

            /* Arrow start (reversed) */
            <marker key={markerId(card.id, 'arrow', 'start')}
              id={markerId(card.id, 'arrow', 'start')}
              markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto-start-reverse"
              markerUnits="strokeWidth">
              <path d="M0,0 L0,6 L8,3 z" fill={col} />
            </marker>,

            /* Dot end */
            <marker key={markerId(card.id, 'dot', 'end')}
              id={markerId(card.id, 'dot', 'end')}
              markerWidth={dotR * 2} markerHeight={dotR * 2}
              refX={dotR} refY={dotR} orient="auto"
              markerUnits="userSpaceOnUse">
              <circle cx={dotR} cy={dotR} r={dotR - 1} fill={col} />
            </marker>,

            /* Dot start */
            <marker key={markerId(card.id, 'dot', 'start')}
              id={markerId(card.id, 'dot', 'start')}
              markerWidth={dotR * 2} markerHeight={dotR * 2}
              refX={dotR} refY={dotR} orient="auto"
              markerUnits="userSpaceOnUse">
              <circle cx={dotR} cy={dotR} r={dotR - 1} fill={col} />
            </marker>,
          ]
        })}
      </defs>

      {/* ══ Card-to-card arrows ══════════════════════════════════════════════ */}
      {arrows.map(arrow => {
        const from = cardMap.get(arrow.from_card_id)
        const to   = cardMap.get(arrow.to_card_id)
        if (!from || !to) return null

        const toCenter  = cardCenter(to)
        const fromCenter = cardCenter(from)
        const fromPt = edgePoint(from, toCenter)
        const toPt   = edgePoint(to, fromCenter)
        const dx = toPt.x - fromPt.x
        const dy = toPt.y - fromPt.y

        const d = arrow.style === 'straight'
          ? `M ${fromPt.x} ${fromPt.y} L ${toPt.x} ${toPt.y}`
          : `M ${fromPt.x} ${fromPt.y} C ${fromPt.x + dx * 0.4} ${fromPt.y}, ${toPt.x - dx * 0.4} ${toPt.y}, ${toPt.x} ${toPt.y}`

        const color    = arrow.color ?? '#94A3B8'
        const markerId = `arrow-${ARROW_COLORS.includes(color) ? color.slice(1) : '94A3B8'}`
        const isSelected = selectedArrowId === arrow.id

        return (
          <g key={arrow.id}>
            <path d={d} fill="none" stroke="transparent" strokeWidth={12 / scale}
              className="pointer-events-auto cursor-pointer"
              onClick={() => selectArrow(isSelected ? null : arrow.id)}
              onDoubleClick={() => deleteArrow(arrow.id)} />
            <path d={d} fill="none" stroke={color}
              strokeWidth={(isSelected ? 2.5 : 1.5) / scale}
              markerEnd={`url(#${markerId})`}
              strokeDasharray={isSelected ? `${6 / scale} ${3 / scale}` : undefined}
              className="pointer-events-none" />
          </g>
        )
      })}

      {/* ══ Standalone line cards ════════════════════════════════════════════ */}
      {lineCards.map(card => {
        const c = card.content as unknown as LineContent

        const x1 = card.x
        const y1 = card.y
        const x2 = c.x2 ?? x1 + 200
        const y2 = c.y2 ?? y1

        const color   = c.color  ?? '#374151'
        const weight  = resolveWeight(c)
        const isDash  = resolveDash(c)
        const markers = resolveMarkers(c)
        const label   = c.label ?? ''

        const isSelected = selectedCardIds.includes(card.id)

        // Visual stroke width (scale-compensated)
        const strokeW = weight / scale

        // Dashed pattern
        const dashArray = isDash ? `${(8 * weight) / scale} ${(4 * weight) / scale}` : undefined

        // Marker urls
        const mEnd   = markers.end   === 'arrow' ? `url(#${markerId(card.id, 'arrow', 'end')})`
                     : markers.end   === 'dot'   ? `url(#${markerId(card.id, 'dot',   'end')})`
                     : undefined
        const mStart = markers.start === 'arrow' ? `url(#${markerId(card.id, 'arrow', 'start')})`
                     : markers.start === 'dot'   ? `url(#${markerId(card.id, 'dot',   'start')})`
                     : undefined

        // Midpoint
        const mx = (x1 + x2) / 2
        const my = (y1 + y2) / 2

        // Handle geometry
        const handleR  = 5 / scale
        const hitW     = Math.max(12, 12 * weight) / scale

        // Selection ring color
        const ringColor = isSelected ? '#3B82F6' : color

        return (
          <g key={card.id}>
            {/* ── Wide transparent hit area ── */}
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="transparent" strokeWidth={hitW}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => { e.stopPropagation(); selectCard(card.id, e.shiftKey) }} />

            {/* ── Visible line ── */}
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isSelected ? '#3B82F6' : color}
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={dashArray}
              markerStart={mStart}
              markerEnd={mEnd}
              className="pointer-events-none" />

            {/* ── Midpoint label ── */}
            {(isSelected || label) && (
              <foreignObject
                x={mx - 60 / scale}
                y={my - 14 / scale}
                width={120 / scale}
                height={28 / scale}
                className="pointer-events-auto overflow-visible"
                onMouseDown={e => e.stopPropagation()}
              >
                <div
                  style={{
                    transform: `scale(${1 / scale})`,
                    transformOrigin: '0 0',
                    width: 120,
                    height: 28,
                  }}
                >
                  <input
                    value={label}
                    onChange={e => updateLabel(card, e.target.value)}
                    placeholder="Label"
                    style={{ borderColor: color }}
                    className="w-full h-full text-center text-xs font-medium text-gray-700
                      bg-white border rounded-lg px-2 outline-none shadow-sm
                      focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
                  />
                </div>
              </foreignObject>
            )}

            {/* ── Selection handles ── */}
            {isSelected && (
              <>
                {/* Start handle */}
                <circle cx={x1} cy={y1} r={handleR}
                  fill="white" stroke={ringColor} strokeWidth={1.5 / scale}
                  className="pointer-events-auto cursor-move"
                  style={{ cursor: 'move' }}
                  onPointerDown={(e) => dragStart(e, card, 'start')} />

                {/* End handle */}
                <circle cx={x2} cy={y2} r={handleR}
                  fill="white" stroke={ringColor} strokeWidth={1.5 / scale}
                  className="pointer-events-auto cursor-move"
                  style={{ cursor: 'move' }}
                  onPointerDown={(e) => dragStart(e, card, 'end')} />

                {/* Midpoint delete button */}
                <g className="pointer-events-auto cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); deleteCard(card.id) }}>
                  <circle cx={mx} cy={my - 18 / scale} r={9 / scale} fill="#EF4444" />
                  <text x={mx} y={my - 18 / scale}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white" fontSize={10 / scale}
                    className="pointer-events-none select-none">
                    ✕
                  </text>
                </g>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}
