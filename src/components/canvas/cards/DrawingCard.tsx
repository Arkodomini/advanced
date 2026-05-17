import type { Card, DrawingContent, DrawingPath } from '../../../types'

interface Props { card: Card }

export default function DrawingCard({ card }: Props) {
  const raw = card.content as unknown as DrawingContent

  // Support both new (paths[]) and legacy (svg_paths + stroke_color) formats
  const paths: DrawingPath[] = raw.paths?.length
    ? raw.paths
    : (raw.svg_paths ?? []).map(d => ({
        d,
        color: raw.stroke_color ?? '#111827',
        width: raw.stroke_width ?? 2,
      }))

  const viewBox = raw.view_box ?? '0 0 400 300'

  if (paths.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-xl bg-white border border-gray-100 border-dashed">
        <span className="text-xs text-gray-300 select-none">Empty drawing</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden bg-white border border-gray-100">
      <svg viewBox={viewBox} className="w-full h-full" style={{ display: 'block' }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill="none"
            stroke={p.color} strokeWidth={p.width}
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
    </div>
  )
}
