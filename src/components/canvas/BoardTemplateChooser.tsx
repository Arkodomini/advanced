import { useState } from 'react'
import { TEMPLATES } from '../../lib/templates/templateData'
import { THEMES, type ThemeId, type BoardTheme } from '../../lib/themes'
import type { Template } from '../../types'

const QUICK_IDS = ['mood-board', 'project-board', 'creative-brief', 'storyboard', 'weekly-planner', 'meeting-notes']
const QUICK_TEMPLATES = QUICK_IDS.map(id => TEMPLATES.find(t => t.id === id)).filter(Boolean) as Template[]

interface Props {
  currentTheme: ThemeId
  onThemeChange: (t: ThemeId) => void
  onUseTemplate: (template: Template, keepContent: boolean) => void
  onStartEmpty: () => void
  onMoreTemplates: () => void
}

export default function BoardTemplateChooser({
  currentTheme, onThemeChange,
  onUseTemplate, onStartEmpty, onMoreTemplates,
}: Props) {
  const [step,        setStep]        = useState<'theme' | 'template'>('theme')
  const [selected,    setSelected]    = useState<Template | null>(null)
  const [keepContent, setKeepContent] = useState(false)
  const [pickedTheme, setPickedTheme] = useState<ThemeId>(currentTheme)

  const handleThemePick = (id: ThemeId) => {
    setPickedTheme(id)
    onThemeChange(id)
  }

  // ── Step 1: Theme picker ────────────────────────────────────────────────────
  if (step === 'theme') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 w-[480px] overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-6 pb-4">
            <h2 className="text-base font-bold text-gray-900">Choose a style</h2>
            <p className="text-xs text-gray-400 mt-0.5">Pick a visual theme for this board.</p>
          </div>

          {/* Theme cards */}
          <div className="px-5 pb-4 grid grid-cols-3 gap-3">
            {THEMES.map(theme => (
              <ThemePreviewCard
                key={theme.id}
                theme={theme}
                selected={pickedTheme === theme.id}
                onSelect={() => handleThemePick(theme.id)}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-5 py-4 flex justify-end bg-gray-50/60">
            <button
              onClick={() => setStep('template')}
              className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 2: Template picker ─────────────────────────────────────────────────
  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
      <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-gray-100 w-[500px] overflow-hidden">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => setStep('theme')}
            className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
          >
            ← Style
          </button>
          <div>
            <h2 className="text-base font-bold text-gray-900">Choose a template</h2>
            <p className="text-xs text-gray-400 mt-0.5">Select a starting point, or begin with an empty board.</p>
          </div>
        </div>

        {/* Template list */}
        <div className="px-4 pb-3 flex flex-col gap-1">
          {/* Empty board */}
          <button
            onClick={() => setSelected(null)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left
              ${selected === null
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-gray-400 text-lg">+</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Empty board</p>
              <p className="text-[11px] text-gray-400">Start from scratch</p>
            </div>
          </button>

          {/* Quick templates */}
          {QUICK_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => setSelected(template)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all text-left
                ${selected?.id === template.id
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: template.color }}>
                {template.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">{template.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{template.description}</p>
              </div>
            </button>
          ))}

          {/* More templates */}
          <button
            onClick={onMoreTemplates}
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <span className="text-gray-400 text-xs">•••</span>
            </div>
            <span className="text-sm text-blue-600 font-medium hover:text-blue-800">More templates…</span>
          </button>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-4 flex items-center justify-between bg-gray-50/60">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepContent}
              onChange={e => setKeepContent(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-500 rounded"
            />
            <span className="text-[11px] text-gray-500">Keep canvas content</span>
          </label>
          <button
            onClick={() => selected ? onUseTemplate(selected, keepContent) : onStartEmpty()}
            className="bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shadow-sm"
          >
            {selected ? 'Use this template' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Theme preview card ─────────────────────────────────────────────────────────

function ThemePreviewCard({ theme, selected, onSelect }: {
  theme: BoardTheme
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border-2 overflow-hidden transition-all text-left
        ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
    >
      {/* Mini canvas preview */}
      <div className="relative h-28 overflow-hidden" style={{ background: theme.preview.canvas }}>
        {/* Mini sidebar */}
        <div className="absolute left-0 top-0 bottom-0 w-7 flex flex-col items-center pt-2 gap-1.5"
          style={{ background: theme.preview.sidebar }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 rounded-sm opacity-40"
              style={{ background: theme.preview.sidebar === '#FFFFFF' ? '#9CA3AF' : '#FFFFFF' }} />
          ))}
        </div>
        {/* Mini cards */}
        <div className="absolute left-10 top-3 right-3 flex flex-col gap-1.5">
          <div className="h-8 rounded-lg" style={{
            background: theme.preview.card,
            boxShadow: theme.id === 'dark' ? '0 2px 8px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.10)',
          }} />
          <div className="h-5 rounded-md w-2/3" style={{
            background: theme.preview.card,
            boxShadow: theme.id === 'dark' ? '0 2px 6px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.08)',
          }} />
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2 bg-white border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          {selected && (
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px]">✓</span>
          )}
          <p className="text-xs font-semibold text-gray-900">{theme.name}</p>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{theme.description}</p>
      </div>
    </button>
  )
}
