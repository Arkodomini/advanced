import { useState } from 'react'
import { useCardStore } from '../../../store/cardStore'
import { useAuthStore } from '../../../store/authStore'
import type { Card, CommentContent } from '../../../types'

interface Props { card: Card }

export default function CommentCard({ card }: Props) {
  const { updateCard } = useCardStore()
  const { user } = useAuthStore()
  const content = card.content as unknown as CommentContent
  const [editing, setEditing] = useState(!content.html)
  const [draft, setDraft] = useState(content.html)

  const save = () => {
    setEditing(false)
    if (draft !== content.html) {
      updateCard(card.id, {
        content: {
          ...content,
          html: draft,
          author: content.author || (user?.email ?? 'You'),
          timestamp: new Date().toISOString(),
        },
      })
    }
  }

  const displayTime = content.timestamp
    ? new Date(content.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#FFFBEB' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 shrink-0 border-b border-amber-100">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="text-xs font-semibold text-amber-700 truncate flex-1 min-w-0">
          {content.author || user?.email || 'Comment'}
        </span>
        {displayTime && (
          <span className="text-[10px] text-amber-400 shrink-0 ml-2">{displayTime}</span>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={save}
          placeholder="Write a comment…"
          className="flex-1 resize-none px-4 py-3 text-[13px] text-gray-700 bg-transparent outline-none leading-relaxed placeholder-amber-300"
          onMouseDown={e => e.stopPropagation()}
        />
      ) : (
        <p
          onDoubleClick={() => setEditing(true)}
          className="flex-1 px-4 py-3 text-[13px] text-gray-700 whitespace-pre-wrap break-words cursor-text leading-relaxed"
        >
          {content.html || (
            <span className="text-amber-300 italic text-[12px]">Double-click to edit…</span>
          )}
        </p>
      )}
    </div>
  )
}
