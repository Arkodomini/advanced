import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { getStoredTheme, saveTheme, type ThemeId } from '../lib/themes'
import { useBoardStore } from '../store/boardStore'
import { useCardStore } from '../store/cardStore'
import { useArrowStore } from '../store/arrowStore'
import { useUIStore } from '../store/uiStore'
import { useHistoryStore } from '../store/historyStore'
import { useCanvas } from '../hooks/useCanvas'
import { useCanvasPosition } from '../hooks/useCanvasPosition'
import type { CanvasTool, Board, Template } from '../types'
import Toolbar from '../components/canvas/Toolbar'
import LeftSidebar from '../components/canvas/LeftSidebar'
import CanvasScrollbars from '../components/canvas/CanvasScrollbars'
import ArrowLayer from '../components/canvas/ArrowLayer'
import BaseCard from '../components/canvas/cards/BaseCard'
import TemplatePanel from '../components/canvas/TemplatePanel'
import BoardTemplateChooser from '../components/canvas/BoardTemplateChooser'
import UnsortedPanel from '../components/canvas/UnsortedPanel'
import ExportPanel from '../components/canvas/ExportPanel'
import CardTooltip from '../components/canvas/CardTooltip'
import DrawingOverlay from '../components/canvas/DrawingOverlay'
import Toaster from '../components/common/Toast'
import SearchOverlay from '../components/common/SearchOverlay'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'

type Marquee = { x1: number; y1: number; x2: number; y2: number }

export default function BoardPage() {
  const { id: boardId } = useParams<{ id: string }>()
  const { boards, fetchBoards, fetchBoard, setBreadcrumb } = useBoardStore()
  const { cards, fetchCards, createCard, createCardFromTemplate, deleteCard, updateCard, loading: cardsLoading } = useCardStore()
  const { arrows, fetchArrows, createArrow } = useArrowStore()
  const { activeTool, setTool, clearSelection, setSaveStatus, setZoom, selectedCardIds, selectCards, selectCard } = useUIStore()
  const { push: pushHistory } = useHistoryStore()

  const [boardTheme, setBoardTheme] = useState<ThemeId>(() => getStoredTheme(boardId ?? ''))

  const handleThemeChange = useCallback((t: ThemeId) => {
    setBoardTheme(t)
    if (boardId) saveTheme(boardId, t)
  }, [boardId])

  const containerRef = useRef<HTMLDivElement>(null)
  const { transform, panning, startPan, resetTransform, setPan } = useCanvas(containerRef)

  // Space key held → temporary pan mode from any tool
  const spaceHeld   = useRef(false)
  const [spacePan, setSpacePan] = useState(false)
  const { getViewportCenter } = useCanvasPosition(
    containerRef as React.RefObject<HTMLDivElement>,
    transform.scale,
    { x: transform.x, y: transform.y }
  )

  const [arrowFrom,         setArrowFrom]         = useState<string | null>(null)
  const [showTemplates,     setShowTemplates]     = useState(false)
  const [chooserDismissed,  setChooserDismissed]  = useState(false)
  const [showUnsorted,      setShowUnsorted]      = useState(false)
  const [showExport,        setShowExport]        = useState(false)
  const [lastCreatedCardId, setLastCreatedCardId] = useState<string | null>(null)

  // Line style / color / weight / markers for newly drawn lines
  const [lineStyle,       setLineStyle]       = useState<'dashed' | 'arrow'>('arrow')
  const [lineColor,       setLineColor]       = useState('#374151')
  const [lineWeight,      setLineWeight]      = useState<number>(1.5)
  const [lineDash,        setLineDash]        = useState<boolean>(false)
  const [lineStartMarker, setLineStartMarker] = useState<'none' | 'arrow' | 'dot'>('none')
  const [lineEndMarker,   setLineEndMarker]   = useState<'none' | 'arrow' | 'dot'>('arrow')

  // Standalone line drawing
  // lineDrawing ref holds the canvas-space start point; linePreview holds screen-space coords for the SVG
  const lineDrawing = useRef<{ x: number; y: number } | null>(null)
  const [linePreview, setLinePreview] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)

  // Marquee selection
  const [marquee,       setMarquee]       = useState<Marquee | null>(null)
  const marqueeOrigin   = useRef<{ left: number; top: number }>({ left: 0, top: 0 })
  const marqueeUsed     = useRef(false)   // prevents click from clearing selection after marquee

  // Template drag
  const dragTemplate = useRef<Template | null>(null)
  const dragGhost    = useRef<HTMLDivElement | null>(null)

  // Sync zoom
  useEffect(() => { setZoom(transform.scale) }, [transform.scale, setZoom])

  // Load board data
  useEffect(() => {
    if (!boardId) return
    setChooserDismissed(false)
    if (boards.length === 0) fetchBoards()
    fetchBoard(boardId)
    fetchCards(boardId)
    fetchArrows(boardId)
  }, [boardId])

  // Breadcrumb
  useEffect(() => {
    if (!boardId) return
    const build = async () => {
      const crumbs: { id: string; title: string }[] = []
      let id: string | null = boardId
      const seen = new Set<string>()
      while (id && !seen.has(id)) {
        seen.add(id)
        const b: Board | null = boards.find(brd => brd.id === id) ?? await fetchBoard(id)
        if (!b) break
        crumbs.unshift({ id: b.id, title: b.title })
        id = b.parent_board_id
      }
      setBreadcrumb(crumbs.slice(0, -1))
    }
    build()
  }, [boardId, boards])

  // Separate line cards (rendered in SVG) from regular cards
  const lineCards    = useMemo(() => cards.filter(c => !c.is_deleted && c.type === 'line'),   [cards])
  const regularCards = useMemo(() => cards.filter(c => !c.is_deleted && c.type !== 'line'),   [cards])

  // The selected line card (if exactly one line card is selected)
  const selectedLineCard = useMemo(() => {
    if (selectedCardIds.length !== 1) return null
    return lineCards.find(c => c.id === selectedCardIds[0]) ?? null
  }, [selectedCardIds, lineCards])

  // Active style/color/weight/markers: from selected line card, or from the "next line" state
  const activeLineStyle       = (selectedLineCard?.content as any)?.style        ?? lineStyle
  const activeLineColor       = (selectedLineCard?.content as any)?.color        ?? lineColor
  const activeLineWeight      = (selectedLineCard?.content as any)?.weight       ?? lineWeight
  const activeLineDash        = (selectedLineCard?.content as any)?.dash         ?? lineDash
  const activeLineStartMarker = (selectedLineCard?.content as any)?.start_marker ?? lineStartMarker
  const activeLineEndMarker   = (selectedLineCard?.content as any)?.end_marker   ?? lineEndMarker

  const patchLine = (patch: Record<string, unknown>) => {
    if (selectedLineCard) {
      updateCard(selectedLineCard.id, { content: { ...selectedLineCard.content, ...patch } })
    }
  }

  const handleLineStyleChange = (s: 'dashed' | 'arrow') => {
    patchLine({ style: s }); if (!selectedLineCard) setLineStyle(s)
  }
  const handleLineColorChange = (c: string) => {
    patchLine({ color: c }); if (!selectedLineCard) setLineColor(c)
  }
  const handleLineWeightChange = (w: number) => {
    patchLine({ weight: w }); if (!selectedLineCard) setLineWeight(w)
  }
  const handleLineDashChange = (d: boolean) => {
    patchLine({ dash: d }); if (!selectedLineCard) setLineDash(d)
  }
  const handleLineStartMarkerChange = (m: 'none' | 'arrow' | 'dot') => {
    patchLine({ start_marker: m }); if (!selectedLineCard) setLineStartMarker(m)
  }
  const handleLineEndMarkerChange = (m: 'none' | 'arrow' | 'dot') => {
    patchLine({ end_marker: m }); if (!selectedLineCard) setLineEndMarker(m)
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement

      // Space → temporary pan (works even while typing focus is elsewhere)
      if (e.code === 'Space' && !e.repeat && !typing) {
        e.preventDefault()
        spaceHeld.current = true
        setSpacePan(true)
        return
      }

      if (typing) return

      // Delete / Backspace → remove selected cards
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCardIds.length > 0) {
          selectedCardIds.forEach(id => deleteCard(id))
          clearSelection()
        }
        return
      }

      const keys: Record<string, CanvasTool> = {
        v: 'select', h: 'hand', n: 'note', l: 'link', t: 'todo',
        b: 'board', c: 'comment', d: 'draw',
      }
      if (!e.metaKey && !e.ctrlKey && keys[e.key]) { setTool(keys[e.key]); return }

      if (e.key === 'Escape') {
        clearSelection()
        setArrowFrom(null)
        lineDrawing.current = null
        setLinePreview(null)
        setMarquee(null)
        setShowTemplates(false)
      }
    }

    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') { spaceHeld.current = false; setSpacePan(false) }
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup',   onUp)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp) }
  }, [selectedCardIds, deleteCard, clearSelection, setTool])

  // ── Canvas coordinate helper ───────────────────────────────────────────────
  const toCanvasPos = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      x: (clientX - rect.left - transform.x) / transform.scale,
      y: (clientY - rect.top  - transform.y) / transform.scale,
    }
  }, [transform])

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const isOnCard = !!(e.target as HTMLElement).closest('[data-card]')
    if (isOnCard) return

    // Space held OR hand tool → pan immediately
    if (spaceHeld.current || activeTool === 'hand') {
      startPan(e.clientX, e.clientY)
      return
    }

    // Line drawing — store canvas start in ref; preview uses raw screen offset
    if (activeTool === 'line') {
      const rect = containerRef.current?.getBoundingClientRect()
      const canvas = toCanvasPos(e.clientX, e.clientY)
      if (!rect || !canvas) return
      lineDrawing.current = canvas
      const sx = e.clientX - rect.left
      const sy = e.clientY - rect.top
      setLinePreview({ x1: sx, y1: sy, x2: sx, y2: sy })
      return
    }

    // Marquee selection
    if (activeTool === 'select') {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) marqueeOrigin.current = { left: rect.left, top: rect.top }
      marqueeUsed.current = false
      setMarquee({ x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY })
      return
    }

    // All card-creation tools → pan on empty canvas
    startPan(e.clientX, e.clientY)
  }

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    // Update line preview (screen-space, no conversion needed)
    if (activeTool === 'line' && lineDrawing.current) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      setLinePreview(prev => prev ? { ...prev, x2: e.clientX - rect.left, y2: e.clientY - rect.top } : null)
      return
    }
    // Update marquee
    if (marquee) {
      setMarquee(prev => prev ? { ...prev, x2: e.clientX, y2: e.clientY } : null)
    }
  }, [activeTool, marquee])

  const handleCanvasMouseUp = useCallback(async (e: React.MouseEvent) => {
    // Finalise line
    if (activeTool === 'line' && lineDrawing.current && boardId) {
      const canvasEnd = toCanvasPos(e.clientX, e.clientY)
      const canvasStart = lineDrawing.current
      lineDrawing.current = null
      setLinePreview(null)
      if (canvasEnd) {
        const dx = canvasEnd.x - canvasStart.x
        const dy = canvasEnd.y - canvasStart.y
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          const newLine = await createCard(boardId, 'line', canvasStart.x, canvasStart.y, {
            x2: canvasEnd.x, y2: canvasEnd.y,
            style: lineStyle, color: lineColor,
            weight: lineWeight, dash: lineDash,
            start_marker: lineStartMarker, end_marker: lineEndMarker,
          })
          if (newLine?.id) selectCard(newLine.id)
        }
      }
      setTool('select')
      return
    }

    // Finalise marquee
    if (marquee) {
      const mx1 = Math.min(marquee.x1, marquee.x2)
      const my1 = Math.min(marquee.y1, marquee.y2)
      const mx2 = Math.max(marquee.x1, marquee.x2)
      const my2 = Math.max(marquee.y1, marquee.y2)

      if (mx2 - mx1 > 5 && my2 - my1 > 5) {
        // Convert marquee to canvas coords and select overlapping cards
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const toCanvas = (sx: number, sy: number) => ({
            x: (sx - rect.left - transform.x) / transform.scale,
            y: (sy - rect.top  - transform.y) / transform.scale,
          })
          const cMin = toCanvas(mx1, my1)
          const cMax = toCanvas(mx2, my2)
          const hit = regularCards.filter(c =>
            c.x < cMax.x && c.x + c.width  > cMin.x &&
            c.y < cMax.y && c.y + c.height > cMin.y
          )
          // Also include line cards whose endpoints fall in the marquee
          const hitLines = lineCards.filter(c => {
            const content = c.content as { x2?: number; y2?: number }
            const x2 = content.x2 ?? c.x + 200
            const y2 = content.y2 ?? c.y
            return (
              (c.x >= cMin.x && c.x <= cMax.x && c.y >= cMin.y && c.y <= cMax.y) ||
              (x2  >= cMin.x && x2  <= cMax.x && y2  >= cMin.y && y2  <= cMax.y)
            )
          })
          selectCards([...hit.map(c => c.id), ...hitLines.map(c => c.id)])
          marqueeUsed.current = true
        }
      } else {
        clearSelection()
      }
      setMarquee(null)
    }
  }, [activeTool, marquee, boardId, createCard, setTool, toCanvasPos, lineStyle, lineColor,
      lineWeight, lineDash, lineStartMarker, lineEndMarker,
      regularCards, lineCards, selectCards, clearSelection, transform])

  const handleCanvasClick = async (e: React.MouseEvent) => {
    const isOnCard = !!(e.target as HTMLElement).closest('[data-card]')
    if (isOnCard) return
    // Select tool: mousedown/up already handled selection/deselection
    if (activeTool === 'hand' || activeTool === 'line' || activeTool === 'select' || activeTool === 'draw') return
    if (marqueeUsed.current) { marqueeUsed.current = false; return }

    clearSelection()
    setArrowFrom(null)
    if (!boardId) return

    const pos = toCanvasPos(e.clientX, e.clientY)
    if (!pos) return

    const typeMap: Partial<Record<CanvasTool, string>> = {
      note: 'note', link: 'link', todo: 'todo', image: 'image',
      file: 'file', board: 'board', column: 'column', comment: 'comment',
      color_swatch: 'color_swatch',
    }
    const type = typeMap[activeTool]
    if (type) {
      const newCard = await createCard(boardId, type as any, pos.x - 140, pos.y - 80)
      if (newCard?.id) { setLastCreatedCardId(newCard.id); selectCard(newCard.id) }
      setTool('select')
    }
  }

  // ── Sidebar drag → canvas drop ─────────────────────────────────────────────
  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('card-type')) e.preventDefault()
  }

  const handleCanvasDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    const tool = e.dataTransfer.getData('card-type') as CanvasTool
    if (!tool || !boardId) return
    const pos = toCanvasPos(e.clientX, e.clientY)
    if (!pos) return
    const typeMap: Partial<Record<CanvasTool, string>> = {
      note: 'note', link: 'link', todo: 'todo', image: 'image',
      file: 'file', board: 'board', column: 'column', comment: 'comment',
      color_swatch: 'color_swatch',
    }
    const type = typeMap[tool]
    if (type) await createCard(boardId, type as any, pos.x - 140, pos.y - 80)
  }, [boardId, toCanvasPos, createCard])

  // ── Sidebar click → place at center ───────────────────────────────────────
  const handleCreateCard = async (tool: CanvasTool) => {
    if (!boardId) return
    const pos = getViewportCenter()
    const typeMap: Partial<Record<CanvasTool, string>> = {
      note: 'note', link: 'link', todo: 'todo', image: 'image',
      file: 'file', board: 'board', column: 'column', comment: 'comment', color_swatch: 'color_swatch',
    }
    const type = typeMap[tool]
    if (type) {
      const newCard = await createCard(boardId, type as any, pos.x - 140, pos.y - 80)
      if (newCard?.id) { setLastCreatedCardId(newCard.id); selectCard(newCard.id) }
    }
  }

  // ── Arrow connections (card-to-card) ──────────────────────────────────────
  const handleCardClick = async (cardId: string) => {
    if (activeTool === 'line') {
      if (!arrowFrom) {
        setArrowFrom(cardId)
      } else if (arrowFrom !== cardId && boardId) {
        await createArrow(boardId, arrowFrom, cardId)
        setArrowFrom(null)
        pushHistory({ cards, arrows })
      }
    }
  }

  // ── File uploads ───────────────────────────────────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!boardId) return
    const { user } = useAuthStore.getState()
    if (!user) return
    setSaveStatus('saving')
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('card-images').upload(path, file)
    if (error) { setSaveStatus('error'); return }
    const pos = getViewportCenter()
    await createCard(boardId, 'image', pos.x - 140, pos.y - 100, {
      storage_path: path, original_name: file.name, width: 280, height: 200,
    })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  const handleFileUpload = async (file: File) => {
    if (!boardId) return
    const { user } = useAuthStore.getState()
    if (!user) return
    setSaveStatus('saving')
    const path = `${user.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('card-files').upload(path, file)
    if (error) { setSaveStatus('error'); return }
    const pos = getViewportCenter()
    await createCard(boardId, 'file', pos.x - 140, pos.y - 36, {
      storage_path: path, file_name: file.name, file_size: file.size, file_type: file.type,
    })
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  // ── Template drag/drop ────────────────────────────────────────────────────
  const handleTemplateDragStart = useCallback((template: Template, startX: number, startY: number) => {
    dragTemplate.current = template
    const ghost = document.createElement('div')
    ghost.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      background:${template.color}; color:white; font-size:12px; font-weight:600;
      padding:8px 14px; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.2);
      white-space:nowrap; transform:translate(-50%,-50%);
    `
    ghost.textContent = `📋 ${template.name}`
    ghost.style.left = startX + 'px'
    ghost.style.top  = startY + 'px'
    document.body.appendChild(ghost)
    dragGhost.current = ghost

    const onMove = (e: MouseEvent) => {
      ghost.style.left = e.clientX + 'px'
      ghost.style.top  = e.clientY + 'px'
    }
    const onUp = (e: MouseEvent) => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      if (dragTemplate.current && boardId && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const inCanvas = e.clientX >= rect.left && e.clientX <= rect.right &&
                         e.clientY >= rect.top  && e.clientY <= rect.bottom
        if (inCanvas) {
          const dropX = (e.clientX - rect.left - transform.x) / transform.scale - 140
          const dropY = (e.clientY - rect.top  - transform.y) / transform.scale - 80
          placeTemplate(dragTemplate.current, dropX, dropY)
        }
      }
      cleanupTemplateDrag()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [boardId, transform])

  const placeTemplate = useCallback(async (template: Template, originX: number, originY: number) => {
    if (!boardId) return
    await Promise.all(
      template.cards.map(card =>
        createCardFromTemplate(boardId, { ...card, x: card.x + originX, y: card.y + originY })
      )
    )
    pushHistory({ cards: useCardStore.getState().cards, arrows: useArrowStore.getState().arrows })
  }, [boardId, createCardFromTemplate, pushHistory])

  const cleanupTemplateDrag = () => {
    dragTemplate.current = null
    if (dragGhost.current) { document.body.removeChild(dragGhost.current); dragGhost.current = null }
  }

  const handleUseTemplate = useCallback((template: Template) => {
    const pos = getViewportCenter()
    placeTemplate(template, pos.x - 300, pos.y - 200)
    setShowTemplates(false)
  }, [placeTemplate, getViewportCenter])

  const handleChooserTemplate = useCallback(async (template: Template, keepContent: boolean) => {
    if (!keepContent && boardId) {
      const { cards: current } = useCardStore.getState()
      await Promise.all(current.filter(c => !c.is_deleted && c.board_id === boardId).map(c => deleteCard(c.id)))
    }
    const pos = getViewportCenter()
    placeTemplate(template, pos.x - 300, pos.y - 200)
    setChooserDismissed(true)
  }, [placeTemplate, getViewportCenter, boardId, deleteCard])

  // Unsorted: cards sitting at (0,0) that were never moved
  const unsortedCards = useMemo(
    () => regularCards.filter(c => c.x === 0 && c.y === 0),
    [regularCards]
  )

  const handlePlaceUnsorted = useCallback(async (card: import('../types').Card) => {
    const pos = getViewportCenter()
    await updateCard(card.id, { x: pos.x - card.width / 2, y: pos.y - card.height / 2 })
    setShowUnsorted(false)
  }, [getViewportCenter, updateCard])

  // PNG export — browser print dialog as a quick approximation
  const handleExportPng = useCallback(() => {
    window.print()
  }, [])

  // ── Drawing overlay save ──────────────────────────────────────────────────
  const handleDrawingSave = useCallback(async (
    paths: import('../types').DrawingPath[],
    viewBox: string,
    x: number, y: number, w: number, h: number,
  ) => {
    if (!boardId) return
    await createCard(boardId, 'drawing', x, y, { paths, view_box: viewBox, _w: w, _h: h })
    setTool('select')
  }, [boardId, createCard, setTool])

  // ── Cursor ────────────────────────────────────────────────────────────────
  const cursor =
    panning                  ? 'grabbing' :
    spacePan                 ? 'grab' :
    marquee                  ? 'crosshair' :
    activeTool === 'hand'    ? 'grab' :
    activeTool === 'select'  ? 'default' :
    activeTool === 'line'    ? 'crosshair' :
    ['note','link','todo','image','file','board','column','comment','color_swatch'].includes(activeTool) ? 'crosshair' :
    'grab'

  return (
    <div className="h-screen overflow-hidden flex" data-theme={boardTheme}>
      <LeftSidebar
        boardId={boardId ?? ''}
        onCreateCard={handleCreateCard}
        onTrash={() => {}}
        onImageUpload={handleImageUpload}
        onFileUpload={handleFileUpload}
      />

      <div className="flex-1 flex flex-col min-w-0 pl-14">
        <Toolbar
          boardId={boardId ?? ''}
          zoom={transform.scale}
          onZoomIn={() => {}}
          onZoomOut={() => {}}
          onResetZoom={resetTransform}
          onToggleTemplates={() => setShowTemplates(v => !v)}
          showTemplates={showTemplates}
          unsortedCount={unsortedCards.length}
          onToggleUnsorted={() => setShowUnsorted(v => !v)}
          showUnsorted={showUnsorted}
          onToggleExport={() => setShowExport(v => !v)}
          showExport={showExport}
        />

        <div className="flex-1 relative overflow-hidden">
          {/* Arrow connection hint */}
          {arrowFrom && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-amber-50 text-amber-700
              border border-amber-200 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm pointer-events-none">
              Click another card to connect — Esc to cancel
            </div>
          )}

          {/* Multi-selection badge */}
          {selectedCardIds.length > 1 && (
            <div className="absolute top-3 right-4 z-30 flex items-center gap-2
              bg-blue-600 text-white rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm">
              <span>{selectedCardIds.length} selected</span>
              <button
                className="hover:bg-blue-700 rounded px-1.5 py-0.5 text-xs transition-colors"
                onClick={() => { selectedCardIds.forEach(id => deleteCard(id)); clearSelection() }}
              >
                Delete all
              </button>
              <button className="hover:bg-blue-700 rounded px-1 transition-colors opacity-70 hover:opacity-100"
                onClick={clearSelection}>✕</button>
            </div>
          )}

          {/* Line options bar — shown when line tool active (but not mid-draw) OR a line card is selected */}
          {(activeTool === 'line' || selectedLineCard) && !linePreview && (
            <LineOptionsBar
              activeTool={activeTool}
              selectedLineCard={!!selectedLineCard}
              linePreview={!!linePreview}
              color={activeLineColor}
              weight={activeLineWeight}
              dash={activeLineDash}
              startMarker={activeLineStartMarker}
              endMarker={activeLineEndMarker}
              onColor={handleLineColorChange}
              onWeight={handleLineWeightChange}
              onDash={handleLineDashChange}
              onStartMarker={handleLineStartMarkerChange}
              onEndMarker={handleLineEndMarkerChange}
            />
          )}

          {/* Canvas */}
          <div
            ref={containerRef}
            className="absolute inset-0 canvas-bg select-none overflow-hidden"
            style={{ cursor }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            onDragOver={handleCanvasDragOver}
            onDrop={handleCanvasDrop}
          >
            <div style={{
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
              position: 'absolute',
              width: 6000,
              height: 6000,
            }}>
              {regularCards.map(card => (
                <BaseCard key={card.id} card={card} boardId={boardId!}
                  onCardClick={() => handleCardClick(card.id)}
                  isArrowSource={arrowFrom === card.id} />
              ))}
              {/* Onboarding tooltip for the most recently created card */}
              {lastCreatedCardId && (() => {
                const c = regularCards.find(r => r.id === lastCreatedCardId)
                return c ? (
                  <CardTooltip
                    key={lastCreatedCardId}
                    cardId={c.id}
                    cardType={c.type}
                    x={c.x}
                    y={c.y}
                    width={c.width}
                    zoom={transform.scale}
                  />
                ) : null
              })()}
              <ArrowLayer
                arrows={arrows}
                cards={cards.filter(c => !c.is_deleted)}
                lineCards={lineCards}
                scale={transform.scale}
              />
            </div>

            {/* Line preview while drawing — screen-space coords, no conversion */}
            {linePreview && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 100 }}>
                <defs>
                  <marker id="preview-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L8,3 z" fill={activeLineColor} />
                  </marker>
                </defs>
                <line
                  x1={linePreview.x1} y1={linePreview.y1}
                  x2={linePreview.x2} y2={linePreview.y2}
                  stroke={activeLineColor}
                  strokeWidth="1.5"
                  strokeDasharray={activeLineStyle === 'dashed' ? '6 3' : undefined}
                  markerEnd={activeLineStyle === 'arrow' ? 'url(#preview-arrow)' : undefined}
                />
              </svg>
            )}
          </div>

          {/* Marquee selection rectangle (screen-space overlay) */}
          {marquee && (
            <div
              className="absolute pointer-events-none z-50 rounded"
              style={{
                left:   Math.min(marquee.x1, marquee.x2) - marqueeOrigin.current.left,
                top:    Math.min(marquee.y1, marquee.y2) - marqueeOrigin.current.top,
                width:  Math.abs(marquee.x2 - marquee.x1),
                height: Math.abs(marquee.y2 - marquee.y1),
                border: '1.5px solid #3B82F6',
                background: 'rgba(59,130,246,0.08)',
              }}
            />
          )}

          {/* Full-canvas drawing overlay */}
          {activeTool === 'draw' && (
            <DrawingOverlay
              transform={transform}
              onSave={handleDrawingSave}
              onDiscard={() => setTool('select')}
            />
          )}

          {/* Scrollbars */}
          <CanvasScrollbars
            transform={transform}
            containerRef={containerRef}
            onPan={setPan}
          />

          {/* Template chooser — shown only when the board has no cards yet */}
          {!cardsLoading && !chooserDismissed && cards.filter(c => !c.is_deleted).length === 0 && (
            <BoardTemplateChooser
              currentTheme={boardTheme}
              onThemeChange={handleThemeChange}
              onUseTemplate={handleChooserTemplate}
              onStartEmpty={() => setChooserDismissed(true)}
              onMoreTemplates={() => { setChooserDismissed(true); setShowTemplates(true) }}
            />
          )}

          {/* Template panel */}
          {showTemplates && (
            <TemplatePanel
              onClose={() => setShowTemplates(false)}
              onDragStart={handleTemplateDragStart}
              onUseTemplate={handleUseTemplate}
            />
          )}

          {/* Unsorted panel */}
          {showUnsorted && (
            <UnsortedPanel
              cards={unsortedCards}
              onClose={() => setShowUnsorted(false)}
              onPlaceCard={handlePlaceUnsorted}
            />
          )}

          {/* Export panel */}
          {showExport && (
            <ExportPanel
              boardTitle={boards.find(b => b.id === boardId)?.title ?? 'Board'}
              onClose={() => setShowExport(false)}
              onExportPng={handleExportPng}
            />
          )}
        </div>
      </div>

      <Toaster />
      <SearchOverlay />
    </div>
  )
}

// ── Line Options Bar ───────────────────────────────────────────────────────────

interface LineOptionsBarProps {
  activeTool: string
  selectedLineCard: boolean
  linePreview: boolean
  color: string
  weight: number
  dash: boolean
  startMarker: 'none' | 'arrow' | 'dot'
  endMarker: 'none' | 'arrow' | 'dot'
  onColor: (c: string) => void
  onWeight: (w: number) => void
  onDash: (d: boolean) => void
  onStartMarker: (m: 'none' | 'arrow' | 'dot') => void
  onEndMarker: (m: 'none' | 'arrow' | 'dot') => void
}

function LineOptionsBar({
  activeTool, selectedLineCard, linePreview,
  color, weight, dash, startMarker, endMarker,
  onColor, onWeight, onDash, onStartMarker, onEndMarker,
}: LineOptionsBarProps) {
  const sep = <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />

  const mkBtn = (
    title: string,
    active: boolean,
    onClick: () => void,
    children: React.ReactNode,
  ) => (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded transition-colors shrink-0
        ${active ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-300' : 'text-gray-500 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )

  // SVG snippets for markers (20×10)
  const SolidLine  = <svg width="18" height="8" viewBox="0 0 18 8"><line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5"/></svg>
  const ArrowEnd   = <svg width="18" height="8" viewBox="0 0 18 8"><line x1="0" y1="4" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5"/><polygon points="12,1.5 18,4 12,6.5" fill="currentColor"/></svg>
  const DotEnd     = <svg width="18" height="8" viewBox="0 0 18 8"><line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="15" cy="4" r="2.5" fill="currentColor"/></svg>
  const ArrowStart = <svg width="18" height="8" viewBox="0 0 18 8"><polygon points="6,1.5 0,4 6,6.5" fill="currentColor"/><line x1="5" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5"/></svg>
  const DotStart   = <svg width="18" height="8" viewBox="0 0 18 8"><circle cx="3" cy="4" r="2.5" fill="currentColor"/><line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5"/></svg>
  const DashLine   = <svg width="18" height="8" viewBox="0 0 18 8"><line x1="0" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2.5"/></svg>

  return (
    <div
      className="absolute top-3 left-1/2 -translate-x-1/2 z-[60]
        flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl shadow-lg
        bg-white border border-gray-200 select-none"
      onMouseDown={e => e.stopPropagation()}
    >
      {activeTool === 'line' && !selectedLineCard && !linePreview && (
        <>
          <span className="text-[11px] text-gray-400 pr-2 mr-1 border-r border-gray-200 whitespace-nowrap">
            Click &amp; drag to draw
          </span>
        </>
      )}

      {/* Color */}
      <input
        type="color"
        value={color}
        onChange={e => onColor(e.target.value)}
        className="w-6 h-6 rounded cursor-pointer border border-gray-200 shrink-0"
        title="Line color"
      />
      <input
        type="text"
        value={color}
        onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onColor(e.target.value) }}
        maxLength={7}
        className="w-[58px] text-[11px] font-mono border border-gray-200 rounded px-1.5 py-0.5 text-gray-700
          focus:outline-none focus:ring-1 focus:ring-blue-400 shrink-0"
      />

      {sep}

      {/* Weight */}
      {([1, 2, 4] as const).map(w => (
        mkBtn(`Weight ${w}px`, Math.round(weight) === w, () => onWeight(w),
          <div className="rounded-full bg-current" style={{ width: w * 3, height: w * 3 }} />
        )
      ))}

      {sep}

      {/* Dash toggle */}
      {mkBtn('Dashed', dash, () => onDash(!dash), DashLine)}

      {sep}

      {/* Start marker */}
      {mkBtn('No start', startMarker === 'none',  () => onStartMarker('none'),  SolidLine)}
      {mkBtn('Arrow start', startMarker === 'arrow', () => onStartMarker('arrow'), ArrowStart)}
      {mkBtn('Dot start',   startMarker === 'dot',   () => onStartMarker('dot'),   DotStart)}

      {sep}

      {/* End marker */}
      {mkBtn('No end',    endMarker === 'none',  () => onEndMarker('none'),  SolidLine)}
      {mkBtn('Arrow end', endMarker === 'arrow', () => onEndMarker('arrow'), ArrowEnd)}
      {mkBtn('Dot end',   endMarker === 'dot',   () => onEndMarker('dot'),   DotEnd)}
    </div>
  )
}
