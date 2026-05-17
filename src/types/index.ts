export type CardType = 'note' | 'link' | 'todo' | 'image' | 'file' | 'board' | 'column' | 'comment' | 'color_swatch' | 'drawing' | 'line'
export type ArrowStyle = 'curved' | 'straight' | 'elbow'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Board {
  id: string
  owner_id: string
  parent_board_id: string | null
  title: string
  description: string | null
  cover_image_url: string | null
  icon_color: string
  icon_type: string
  is_starred: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Card {
  id: string
  board_id: string
  type: CardType
  x: number
  y: number
  width: number
  height: number
  z_index: number
  content: Record<string, unknown>
  bg_color: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Arrow {
  id: string
  board_id: string
  from_card_id: string
  to_card_id: string
  color: string
  style: ArrowStyle
  label: string | null
  created_at: string
}

// ── Content types ──────────────────────────────────────────
export interface NoteContent { html: string }

export interface TodoItem { id: string; text: string; checked: boolean }
export interface TodoContent { title: string; items: TodoItem[] }

export interface LinkContent {
  url: string; og_title: string; og_description: string
  og_image: string; domain: string; favicon: string; fetched: boolean
  caption?: string
}

export interface ImageContent { storage_path: string; original_name: string; width: number; height: number }

export interface FileContent { storage_path: string; file_name: string; file_size: number; file_type: string }

export interface NestedBoardItem {
  id: string; title: string
  type: 'board' | 'note' | 'todo'
  card_count: number; icon_color: string; icon_emoji?: string
}
export interface BoardContent {
  title: string; description: string
  cover_image?: string
  nested_items: NestedBoardItem[]
  todos: TodoItem[]
  linked_board_id?: string
  icon_color?: string
  icon_emoji?: string
}

export interface ColumnContent { text: string; text_color: string }

export interface CommentContent { html: string; author: string; timestamp: string }

export interface ColorSwatchContent { hex: string; label: string }

export interface DrawingPath { d: string; color: string; width: number }
export interface DrawingContent {
  paths: DrawingPath[]          // new format (per-path color/width)
  view_box: string
  svg_paths?: string[]          // legacy — keep for backward compat
  stroke_color?: string
  stroke_width?: number
}

export type LineMarker = 'none' | 'arrow' | 'dot'
export interface LineContent {
  x2: number
  y2: number
  /** Legacy field: 'dashed' = dashed+no-end-marker, 'arrow' = solid+arrow-end */
  style: 'dashed' | 'arrow'
  color: string
  /** Stroke width in canvas units. Default 1.5 */
  weight?: number
  /** Text label rendered at the line midpoint */
  label?: string
  /** Dashed stroke override (takes priority over legacy style) */
  dash?: boolean
  /** Start-point marker – overrides legacy style */
  start_marker?: LineMarker
  /** End-point marker – overrides legacy style */
  end_marker?: LineMarker
}

// ── UI types ──────────────────────────────────────────
export type CanvasTool = 'select' | 'hand' | 'note' | 'link' | 'todo' | 'image' | 'file' | 'board' | 'column' | 'comment' | 'color_swatch' | 'line' | 'draw'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface ToastItem {
  id: string; message: string; type: 'info' | 'success' | 'error'
}

export interface HistorySnapshot {
  cards: Card[]; arrows: Arrow[]
}

export interface TemplateCard {
  type: CardType; x: number; y: number; width: number; height: number
  content: Record<string, unknown>; bg_color: string
}

export interface Template {
  id: string; name: string; description: string
  category: string; color: string; thumbnail_color?: string
  cards: TemplateCard[]
}

export const CARD_DEFAULTS: Record<CardType, { width: number; height: number }> = {
  note:         { width: 280, height: 160 },
  link:         { width: 280, height: 160 },
  todo:         { width: 280, height: 200 },
  image:        { width: 280, height: 200 },
  file:         { width: 280, height: 72  },
  board:        { width: 280, height: 400 },
  column:       { width: 220, height: 48  },
  comment:      { width: 240, height: 120 },
  color_swatch: { width: 80,  height: 80  },
  drawing:      { width: 400, height: 300 },
  line:         { width: 200, height: 2   },
}

export const CARD_INITIAL_CONTENT: Record<CardType, Record<string, unknown>> = {
  note:         { html: '' },
  link:         { url: '', og_title: '', og_description: '', og_image: '', domain: '', favicon: '', fetched: false },
  todo:         { title: 'To do', items: [] },
  image:        { storage_path: '', original_name: '', width: 0, height: 0 },
  file:         { storage_path: '', file_name: '', file_size: 0, file_type: '' },
  board:        { title: 'New Board', description: '', nested_items: [], todos: [] },
  column:       { text: 'Section', text_color: '#111827' },
  comment:      { html: '', author: '', timestamp: new Date().toISOString() },
  color_swatch: { hex: '#6366F1', label: '' },
  drawing:      { paths: [], view_box: '0 0 400 300' },
  line:         { x2: 200, y2: 0, style: 'arrow', color: '#374151' },
}
