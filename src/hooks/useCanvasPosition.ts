import { useCallback } from 'react'

export function useCanvasPosition(
  containerRef: React.RefObject<HTMLDivElement>,
  zoom: number,
  offset: { x: number; y: number }
) {
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (screenX - rect.left - offset.x) / zoom,
      y: (screenY - rect.top  - offset.y) / zoom,
    }
  }, [containerRef, zoom, offset])

  const getViewportCenter = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 300, y: 300 }
    return {
      x: (rect.width  / 2 - offset.x) / zoom,
      y: (rect.height / 2 - offset.y) / zoom,
    }
  }, [containerRef, zoom, offset])

  return { screenToCanvas, getViewportCenter }
}
