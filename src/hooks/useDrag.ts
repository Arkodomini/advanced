import { useRef, useCallback } from 'react'
import { useCardStore } from '../store/cardStore'
import { useHistoryStore } from '../store/historyStore'
import { useArrowStore } from '../store/arrowStore'
import { useUIStore } from '../store/uiStore'
import type { Card } from '../types'

type DragItem = { id: string; startX: number; startY: number }

export function useDrag(zoom: number) {
  const { updateCard, updateCardLocal, deleteCard } = useCardStore()
  const { push } = useHistoryStore()
  const drag = useRef<{ active: boolean; items: DragItem[]; startMx: number; startMy: number }>({
    active: false, items: [], startMx: 0, startMy: 0,
  })

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent, card: Card) => {
    const tag = (e.target as HTMLElement).tagName.toLowerCase()
    if (['input', 'textarea', 'button', 'a', 'select'].includes(tag)) return
    if ((e.target as HTMLElement).isContentEditable) return
    if (e.type === 'mousedown' && (e as React.MouseEvent).button !== 0) return

    e.stopPropagation()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY

    // If dragged card is part of a multi-selection, move the whole group
    const { selectedCardIds } = useUIStore.getState()
    const { cards: allCards } = useCardStore.getState()
    const itemsToMove: Card[] = selectedCardIds.includes(card.id)
      ? allCards.filter(c => selectedCardIds.includes(c.id))
      : [card]

    drag.current = {
      active: true,
      items: itemsToMove.map(c => ({ id: c.id, startX: c.x, startY: c.y })),
      startMx: clientX,
      startMy: clientY,
    }

    const onMove = (ev: MouseEvent | TouchEvent) => {
      if (!drag.current.active) return
      const mx = 'touches' in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX
      const my = 'touches' in ev ? ev.touches[0].clientY : (ev as MouseEvent).clientY
      const dx = (mx - drag.current.startMx) / zoom
      const dy = (my - drag.current.startMy) / zoom
      drag.current.items.forEach(item =>
        updateCardLocal(item.id, { x: item.startX + dx, y: item.startY + dy })
      )
    }

    const cleanup = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }

    const onUp = (ev: MouseEvent | TouchEvent) => {
      if (!drag.current.active) return
      drag.current.active = false
      const mx = 'changedTouches' in ev ? ev.changedTouches[0].clientX : (ev as MouseEvent).clientX
      const my = 'changedTouches' in ev ? ev.changedTouches[0].clientY : (ev as MouseEvent).clientY

      // Drop on trash → delete every dragged card
      const el = document.elementFromPoint(mx, my)
      if (el?.closest('[data-trash="true"]')) {
        drag.current.items.forEach(item => deleteCard(item.id))
        cleanup()
        return
      }

      const dx = (mx - drag.current.startMx) / zoom
      const dy = (my - drag.current.startMy) / zoom
      drag.current.items.forEach(item =>
        updateCard(item.id, { x: item.startX + dx, y: item.startY + dy })
      )
      push({ cards: useCardStore.getState().cards, arrows: useArrowStore.getState().arrows })
      cleanup()
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
  }, [zoom, updateCard, updateCardLocal, deleteCard, push])

  return { onDragStart }
}
