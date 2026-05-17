import { useState, useRef, useEffect } from 'react'

const PRESETS = [
  '#FFFFFF', '#FEF9C3', '#DCFCE7', '#DBEAFE', '#F3E8FF', '#FFE4E6',
  '#F1F5F9', '#FED7AA', '#CCFBF1', '#E0E7FF', '#FCE7F3', '#FEF3C7',
  '#1F2937', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB',
]

interface Props {
  value: string
  onChange: (color: string) => void
  label?: string
}

export default function ColorPicker({ value, onChange, label }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {label && <span className="text-xs text-gray-500 mr-2">{label}</span>}
      <button onClick={() => setOpen(o => !o)}
        className="w-6 h-6 rounded-md border border-gray-300 shadow-sm shrink-0"
        style={{ background: value }} />
      {open && (
        <div className="absolute z-50 top-8 left-0 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-48">
          <div className="grid grid-cols-6 gap-1.5 mb-2">
            {PRESETS.map(c => (
              <button key={c} onClick={() => { onChange(c); setOpen(false) }}
                className={`w-6 h-6 rounded-md border transition-transform hover:scale-110 ${c === value ? 'border-blue-500 scale-110' : 'border-gray-200'}`}
                style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input type="color" value={value} onChange={e => onChange(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border-0 p-0" />
            <input type="text" value={value} onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value) }}
              className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 font-mono" />
          </div>
        </div>
      )}
    </div>
  )
}
