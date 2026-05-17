export type ThemeId = 'classic' | 'studio' | 'dark'

export interface BoardTheme {
  id: ThemeId
  name: string
  description: string
  preview: { canvas: string; sidebar: string; card: string }
}

export const THEMES: BoardTheme[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Warm, bright and focused',
    preview: { canvas: '#F5F5F0', sidebar: '#FFFFFF', card: '#FFFFFF' },
  },
  {
    id: 'studio',
    name: 'Studio',
    description: 'Dark sidebar, neutral canvas',
    preview: { canvas: '#E3E3E3', sidebar: '#1C1C1E', card: '#FFFFFF' },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes for night work',
    preview: { canvas: '#111827', sidebar: '#0F172A', card: '#1E293B' },
  },
]

export function getStoredTheme(boardId: string): ThemeId {
  return (localStorage.getItem(`board_theme_${boardId}`) as ThemeId) ?? 'classic'
}

export function saveTheme(boardId: string, theme: ThemeId) {
  localStorage.setItem(`board_theme_${boardId}`, theme)
}
