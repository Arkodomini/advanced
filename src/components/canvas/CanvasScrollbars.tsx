import { useRef } from 'react'
import type { CanvasTransform } from '../../hooks/useCanvas'

interface Props {
  transform: CanvasTransform
  containerRef: React.RefObject<HTMLDivElement>
  onPan: (x: number, y: number) => void
}

const CANVAS_SIZE = 6000
const BAR = 10   // scrollbar track thickness px
const MIN_THUMB = 0.06  // minimum thumb size as fraction of track

export default function CanvasScrollbars({ transform, containerRef, onPan }: Props) {
  const transformRef = useRef(transform)
  transformRef.current = transform

  const el = containerRef.current
  const W = el?.clientWidth  ?? 900
  const H = el?.clientHeight ?? 600

  const { x, y, scale } = transform

  // Current viewport bounds in canvas space
  const vLeft   = -x / scale
  const vTop    = -y / scale
  const vWidth  = W / scale
  const vHeight = H / scale

  // Thumb fraction: position [0,1] and size [MIN_THUMB,1]
  const hSize  = Math.max(MIN_THUMB, Math.min(1, vWidth  / CANVAS_SIZE))
  const vSize  = Math.max(MIN_THUMB, Math.min(1, vHeight / CANVAS_SIZE))
  const hStart = Math.max(0, Math.min(1 - hSize, vLeft / CANVAS_SIZE))
  const vStart = Math.max(0, Math.min(1 - vSize,  vTop  / CANVAS_SIZE))

  // ── Horizontal thumb drag ──────────────────────────────────────────────────
  const handleHDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const trackW     = (e.currentTarget as HTMLElement).parentElement!.clientWidth
    const startMouseX  = e.clientX
    const startX       = transformRef.current.x
    const startScale   = transformRef.current.scale

    const onMove = (ev: MouseEvent) => {
      const dx     = ev.clientX - startMouseX
      const newX   = startX - (dx / trackW) * CANVAS_SIZE * startScale
      onPan(newX, transformRef.current.y)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',  onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',  onUp)
  }

  // ── Vertical thumb drag ────────────────────────────────────────────────────
  const handleVDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const trackH     = (e.currentTarget as HTMLElement).parentElement!.clientHeight
    const startMouseY  = e.clientY
    const startY       = transformRef.current.y
    const startScale   = transformRef.current.scale

    const onMove = (ev: MouseEvent) => {
      const dy   = ev.clientY - startMouseY
      const newY = startY - (dy / trackH) * CANVAS_SIZE * startScale
      onPan(transformRef.current.x, newY)
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',  onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',  onUp)
  }

  // ── Click-on-track to jump ────────────────────────────────────────────────
  const handleHTrackClick = (e: React.MouseEvent) => {
    const track = e.currentTarget as HTMLElement
    const rect  = track.getBoundingClientRect()
    const frac  = (e.clientX - rect.left) / rect.width - hSize / 2
    const newX  = -Math.max(0, Math.min(1 - hSize, frac)) * CANVAS_SIZE * scale
    onPan(newX, y)
  }

  const handleVTrackClick = (e: React.MouseEvent) => {
    const track = e.currentTarget as HTMLElement
    const rect  = track.getBoundingClientRect()
    const frac  = (e.clientY - rect.top) / rect.height - vSize / 2
    const newY  = -Math.max(0, Math.min(1 - vSize, frac)) * CANVAS_SIZE * scale
    onPan(x, newY)
  }

  const thumbCls = 'absolute rounded-full bg-gray-400/50 hover:bg-gray-500/70 active:bg-gray-600/80 transition-colors cursor-pointer'

  return (
    <>
      {/* ── Horizontal scrollbar (bottom) ──────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-14 right-3 z-40 flex items-center"
        style={{ height: BAR + 4, paddingTop: 2, paddingBottom: 2 }}
      >
        <div
          className="relative flex-1 h-full rounded-full bg-gray-200/40 cursor-pointer"
          onClick={handleHTrackClick}
        >
          <div
            className={thumbCls}
            style={{
              left:   `${hStart * 100}%`,
              width:  `${hSize  * 100}%`,
              top: 0, bottom: 0,
            }}
            onMouseDown={handleHDrag}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>

      {/* ── Vertical scrollbar (right) ─────────────────────────────────────── */}
      <div
        className="absolute right-0 top-0 bottom-3 z-40 flex justify-center"
        style={{ width: BAR + 4, paddingLeft: 2, paddingRight: 2 }}
      >
        <div
          className="relative flex-1 w-full rounded-full bg-gray-200/40 cursor-pointer"
          onClick={handleVTrackClick}
        >
          <div
            className={thumbCls}
            style={{
              top:    `${vStart * 100}%`,
              height: `${vSize  * 100}%`,
              left: 0, right: 0,
            }}
            onMouseDown={handleVDrag}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>
    </>
  )
}
