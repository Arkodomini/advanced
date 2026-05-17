import { useState } from 'react'
import { ExternalLink, Pencil } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { fetchOg } from '../../../lib/ogFetch'
import type { Card, LinkContent } from '../../../types'

export default function LinkCard({ card }: { card: Card }) {
  const { updateCard } = useCardStore()
  const content = card.content as unknown as LinkContent
  const [editing, setEditing] = useState(!content.url)
  const [urlInput, setUrlInput] = useState(content.url ?? '')
  const [caption, setCaption] = useState(content.caption ?? '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const url = urlInput.trim()
    if (!url) return
    setLoading(true)
    try {
      const og = await fetchOg(url)
      updateCard(card.id, { content: { ...og, url, caption: caption.trim() } })
    } finally {
      setLoading(false)
      setEditing(false)
    }
  }

  const handleCaptionBlur = () => {
    if (content.url) {
      updateCard(card.id, { content: { ...content, caption: caption.trim() } })
    }
  }

  if (editing) {
    return (
      <div className="w-full h-full flex flex-col gap-3 px-4 py-4">
        <span className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: 'var(--card-text-muted, #9CA3AF)' }}>
          Link
        </span>

        <input
          type="url"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onPointerDown={e => e.stopPropagation()}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          placeholder="https://…"
          autoFocus
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ color: 'var(--card-text, #374151)' }}
        />

        <textarea
          value={caption}
          onChange={e => setCaption(e.target.value)}
          onPointerDown={e => e.stopPropagation()}
          placeholder="Caption (optional)…"
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          style={{ color: 'var(--card-text, #374151)' }}
        />

        <div className="flex gap-2 mt-auto">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[13px] py-2 rounded-lg transition-colors font-semibold"
          >
            {loading ? 'Loading…' : 'Save link'}
          </button>
          {content.url && (
            <button
              onPointerDown={e => e.stopPropagation()}
              onClick={() => { setCaption(content.caption ?? ''); setEditing(false) }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-500 text-[13px] py-2 px-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    )
  }

  const domain = content.domain || (() => {
    try { return new URL(content.url).hostname.replace('www.', '') } catch { return content.url }
  })()

  return (
    <div className="w-full h-full flex flex-col group/link">
      {/* OG image */}
      {content.og_image && (
        <div className="shrink-0 h-28 overflow-hidden">
          <img
            src={content.og_image}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}

      {/* Body */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-1.5 min-h-0">
        {/* Domain + favicon */}
        <div className="flex items-center gap-1.5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            className="w-3.5 h-3.5 shrink-0"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <span className="text-[11px] truncate" style={{ color: 'var(--card-text-muted, #9CA3AF)' }}>
            {domain}
          </span>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setEditing(true)}
            className="ml-auto opacity-0 group-hover/link:opacity-100 transition-opacity"
            style={{ color: 'var(--card-text-muted, #9CA3AF)' }}
          >
            <Pencil size={11} />
          </button>
        </div>

        {/* Title */}
        {content.og_title && (
          <p className="text-[13px] font-semibold leading-snug line-clamp-2"
            style={{ color: 'var(--card-text, #111827)' }}>
            {content.og_title}
          </p>
        )}

        {/* Description or caption */}
        {content.caption ? (
          <p className="text-[12px] italic line-clamp-3 leading-relaxed"
            style={{ color: 'var(--card-text, #6B7280)' }}>
            {content.caption}
          </p>
        ) : content.og_description ? (
          <p className="text-[12px] line-clamp-2 leading-relaxed"
            style={{ color: 'var(--card-text-muted, #9CA3AF)' }}>
            {content.og_description}
          </p>
        ) : null}

        {/* Open link */}
        <div className="mt-auto pt-1">
          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            onPointerDown={e => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[12px] text-blue-500 hover:text-blue-700 hover:underline transition-colors"
          >
            Open <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Inline caption editor */}
      {!editing && content.url && (
        <div className="px-4 pb-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            onBlur={handleCaptionBlur}
            onPointerDown={e => e.stopPropagation()}
            placeholder="Add a caption…"
            className="w-full text-[12px] italic bg-transparent focus:outline-none py-2"
            style={{ color: 'var(--card-text-muted, #9CA3AF)' }}
          />
        </div>
      )}
    </div>
  )
}
