import { useState, useRef, useCallback, useEffect, type RefObject } from 'react'

export interface CanvasTransform {
  x: number
  y: number
  scale: number
}

export function useCanvas(containerRef: RefObject<HTMLDivElement>) {
  const [transform, setTransform] = useState<CanvasTransform>({ x: 0, y: 0, scale: 1 })
  const [panning, setPanning] = useState(false)
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const transformRef = useRef(transform)
  transformRef.current = transform

  // Start pan with window-level listeners so it works even when mouse leaves canvas
  const startPan = useCallback((clientX: number, clientY: number) => {
    isPanning.current = true
    setPanning(true)
    lastPos.current = { x: clientX, y: clientY }

    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return
      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y
      lastPos.current = { x: e.clientX, y: e.clientY }
      setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }))
    }

    const onUp = () => {
      isPanning.current = false
      setPanning(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  // Pinch / wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const scaleBy = 1.08
    const direction = e.deltaY < 0 ? 1 : -1
    setTransform(t => {
      const newScale = Math.max(0.15, Math.min(4, t.scale * (direction > 0 ? scaleBy : 1 / scaleBy)))
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      const newX = mouseX - (mouseX - t.x) * (newScale / t.scale)
      const newY = mouseY - (mouseY - t.y) * (newScale / t.scale)
      return { x: newX, y: newY, scale: newScale }
    })
  }, [containerRef])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [containerRef, handleWheel])

  const resetTransform = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 })
  }, [])

  const screenToCanvas = useCallback((screenX: number, screenY: number, rect: DOMRect) => {
    const t = transformRef.current
    return {
      x: (screenX - rect.left - t.x) / t.scale,
      y: (screenY - rect.top  - t.y) / t.scale,
    }
  }, [])

  const setPan = useCallback((x: number, y: number) => {
    setTransform(t => ({ ...t, x, y }))
  }, [])

  return { transform, panning, startPan, resetTransform, screenToCanvas, setPan }
}
