import { useRef, useState, useCallback, useEffect } from 'react'
import { Pencil, MousePointer2, Eraser, RotateCcw } from 'lucide-react'
import type { CanvasTransform } from '../../hooks/useCanvas'
import type { DrawingPath } from '../../types'

interface Props {
  transform: CanvasTransform
  onSave: (paths: DrawingPath[], viewBox: string, x: number, y: number, w: number, h: number) => void
  onDiscard: () => void
}

type DrawTool = 'pen' | 'cursor' | 'eraser'

const COLORS = [
  '#111827', '#374151', '#3B82F6', '#06B6D4',
  '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#FFFFFF',
]
const SIZES = [
  { label: 'S', px: 2  },
  { label: 'M', px: 4  },
  { label: 'L', px: 8  },
]
const ERASER_RADIUS = 22  // screen-pixels

interface ScreenPath {
  points: { x: number; y: number }[]
  color: string
  width: number
}

function pathToD(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  // Smooth path with quadratic bezier midpoints
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`
  }
  const last = pts[pts.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

export default function DrawingOverlay({ transform, onSave, onDiscard }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const [paths,      setPaths]      = useState<ScreenPath[]>([])
  const [currentPts, setCurrentPts] = useState<{ x: number; y: number }[]>([])
  const [tool,       setTool]       = useState<DrawTool>('pen')
  const [color,      setColor]      = useState('#111827')
  const [size,       setSize]       = useState(2)
  const [showColors, setShowColors] = useState(false)

  const drawing = useRef(false)

  // ── Get SVG-space point from any pointer event ────────────────────────────
  const svgPt = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return null
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  // ── Pen drawing ───────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (tool !== 'pen') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = svgPt(e.clientX, e.clientY)
    if (!pt) return
    drawing.current = true
    setCurrentPts([pt])
    setShowColors(false)
  }, [tool])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drawing.current) {
      // Eraser hover feedback
      if (tool === 'eraser' && e.buttons === 1) {
        const pt = svgPt(e.clientX, e.clientY)
        if (!pt) return
        setPaths(prev => prev.filter(path =>
          !path.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < ERASER_RADIUS)
        ))
      }
      return
    }
    e.preventDefault()
    const pt = svgPt(e.clientX, e.clientY)
    if (!pt) return
    setCurrentPts(prev => {
      // Throttle: only add if moved > 2px
      const last = prev[prev.length - 1]
      if (last && Math.hypot(pt.x - last.x, pt.y - last.y) < 2) return prev
      return [...prev, pt]
    })
  }, [tool])

  const onPointerUp = useCallback(() => {
    if (!drawing.current) return
    drawing.current = false
    setCurrentPts(prev => {
      if (prev.length > 1) {
        setPaths(p => [...p, { points: prev, color, width: size }])
      }
      return []
    })
  }, [color, size])

  const onEraseDown = useCallback((e: React.PointerEvent) => {
    if (tool !== 'eraser') return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    const pt = svgPt(e.clientX, e.clientY)
    if (!pt) return
    setPaths(prev => prev.filter(path =>
      !path.points.some(p => Math.hypot(p.x - pt.x, p.y - pt.y) < ERASER_RADIUS)
    ))
  }, [tool])

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = () => setPaths(prev => prev.slice(0, -1))

  // ── Save → convert to canvas space, create card ───────────────────────────
  const handleSave = () => {
    if (paths.length === 0) { onDiscard(); return }

    const { x: tx, y: ty, scale } = transform

    // Convert every screen-space point to canvas space
    const canvasPaths = paths.map(sp => ({
      ...sp,
      points: sp.points.map(p => ({
        x: (p.x - tx) / scale,
        y: (p.y - ty) / scale,
      })),
    }))

    // Bounding box in canvas space
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const cp of canvasPaths) {
      for (const p of cp.points) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
    }
    const PAD = 16
    minX -= PAD; minY -= PAD; maxX += PAD; maxY += PAD
    const w = Math.max(80, maxX - minX)
    const h = Math.max(80, maxY - minY)

    // Normalise paths to card-local space (viewBox = "0 0 w h")
    const drawingPaths: DrawingPath[] = canvasPaths.map(cp => ({
      d: pathToD(cp.points.map(p => ({ x: p.x - minX, y: p.y - minY }))),
      color: cp.color,
      width: cp.width,
    }))

    onSave(drawingPaths, `0 0 ${w} ${h}`, minX, minY, w, h)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const toolCursor =
    tool === 'pen'    ? 'crosshair' :
    tool === 'eraser' ? 'none' :
    'default'

  return (
    <div className="absolute inset-0 z-60" style={{ zIndex: 60 }}>
      {/* Full-canvas SVG drawing surface */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: toolCursor, touchAction: 'none' }}
        onPointerDown={tool === 'pen' ? onPointerDown : tool === 'eraser' ? onEraseDown : undefined}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Saved paths */}
        {paths.map((sp, i) => (
          <path key={i} d={pathToD(sp.points)} fill="none"
            stroke={sp.color} strokeWidth={sp.width}
            strokeLinecap="round" strokeLinejoin="round" />
        ))}

        {/* Current in-progress path */}
        {currentPts.length > 1 && (
          <path d={pathToD(currentPts)} fill="none"
            stroke={color} strokeWidth={size}
            strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Eraser circle cursor */}
        {tool === 'eraser' && <EraserCursor svgRef={svgRef} radius={ERASER_RADIUS} />}
      </svg>

      {/* ── Bottom floating toolbar ─────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10
        flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl
        bg-white/95 backdrop-blur border border-gray-200/80"
        style={{ minWidth: 380 }}
      >
        {/* Drawing tools */}
        <ToolBtn active={tool === 'pen'}    onClick={() => setTool('pen')}    title="Pen (draw)">
          <Pencil size={16} />
        </ToolBtn>
        <ToolBtn active={tool === 'cursor'} onClick={() => setTool('cursor')} title="Cursor (no draw)">
          <MousePointer2 size={16} />
        </ToolBtn>
        <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Eraser">
          <Eraser size={16} />
        </ToolBtn>

        <Divider />

        {/* Color swatch */}
        <div className="relative">
          <button
            onClick={() => setShowColors(v => !v)}
            title="Color"
            className="w-7 h-7 rounded-md border-2 border-white shadow ring-1 ring-gray-200 transition-transform hover:scale-110"
            style={{ background: color }}
          />
          {showColors && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2
              flex flex-wrap gap-1.5 p-2 bg-white rounded-xl shadow-xl border border-gray-100"
              style={{ width: 132 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => { setColor(c); setShowColors(false) }}
                  className="w-7 h-7 rounded-md transition-transform hover:scale-110"
                  style={{
                    background: c,
                    border: c === color ? '2px solid #3B82F6' : '2px solid transparent',
                    boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #d1d5db' : undefined,
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Stroke sizes */}
        {SIZES.map(s => (
          <button key={s.px} onClick={() => setSize(s.px)} title={`Size ${s.label}`}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
              ${size === s.px ? 'bg-blue-50 ring-2 ring-blue-400' : 'hover:bg-gray-100'}`}>
            <div className="rounded-full bg-gray-800"
              style={{ width: s.px * 2 + 4, height: s.px * 2 + 4 }} />
          </button>
        ))}

        <div className="flex-1" />

        {/* Undo */}
        <button onClick={undo} disabled={paths.length === 0}
          title="Undo"
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors
            text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <RotateCcw size={15} />
        </button>

        <Divider />

        {/* Discard */}
        <button onClick={onDiscard}
          className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-800
            rounded-lg hover:bg-gray-100 transition-colors">
          Discard
        </button>

        {/* Save */}
        <button onClick={handleSave}
          className="px-4 py-1.5 text-sm font-semibold text-white rounded-lg
            bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors shadow-sm">
          Save
        </button>
      </div>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────

function ToolBtn({ active, onClick, title, children }: {
  active: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors
        ${active ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-400' : 'text-gray-600 hover:bg-gray-100'}`}>
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1" />
}

// SVG eraser circle that follows the cursor
function EraserCursor({ svgRef, radius }: { svgRef: React.RefObject<SVGSVGElement>; radius: number }) {
  const [pos, setPos] = useState({ x: -999, y: -999 })

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const move = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect()
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    svg.addEventListener('mousemove', move)
    return () => svg.removeEventListener('mousemove', move)
  }, [svgRef])

  return (
    <circle cx={pos.x} cy={pos.y} r={radius}
      fill="none" stroke="#374151" strokeWidth="1.5"
      strokeDasharray="4 2" opacity={0.6} className="pointer-events-none" />
  )
}
