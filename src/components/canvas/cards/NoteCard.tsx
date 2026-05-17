import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, Heading2, List } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import type { Card, NoteContent } from '../../../types'

export default function NoteCard({ card }: { card: Card }) {
  const { updateCard } = useCardStore()
  const content = card.content as unknown as NoteContent
  const [focused, setFocused] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: content.html || '',
    onUpdate: ({ editor }) => {
      updateCard(card.id, { content: { html: editor.getHTML() } })
    },
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
  })

  // card.bg_color overrides the themed-card background (e.g. yellow sticky note)
  const bgStyle = card.bg_color ? { background: card.bg_color } : undefined

  return (
    <div className="w-full h-full flex flex-col text-gray-800" style={bgStyle}>
      {/* Toolbar or label */}
      <div className="shrink-0 border-b border-black/[0.06]">
        {focused ? (
          <div className="flex items-center gap-0.5 px-2.5 py-1.5">
            <FmtBtn active={!!editor?.isActive('bold')}
              onMouseDown={() => editor?.chain().focus().toggleBold().run()} title="Bold">
              <Bold size={12} />
            </FmtBtn>
            <FmtBtn active={!!editor?.isActive('italic')}
              onMouseDown={() => editor?.chain().focus().toggleItalic().run()} title="Italic">
              <Italic size={12} />
            </FmtBtn>
            <FmtBtn active={!!editor?.isActive('underline')}
              onMouseDown={() => editor?.chain().focus().toggleUnderline().run()} title="Underline">
              <UnderlineIcon size={12} />
            </FmtBtn>
            <div className="w-px h-3.5 mx-1 bg-black/10" />
            <FmtBtn active={!!editor?.isActive('heading', { level: 2 })}
              onMouseDown={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading">
              <Heading2 size={12} />
            </FmtBtn>
            <FmtBtn active={!!editor?.isActive('bulletList')}
              onMouseDown={() => editor?.chain().focus().toggleBulletList().run()} title="List">
              <List size={12} />
            </FmtBtn>
          </div>
        ) : (
          <div className="px-4 pt-3 pb-2">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 select-none">
              Note
            </span>
          </div>
        )}
      </div>

      {/* Editor — text-gray-800 class is the fallback; .tiptap CSS vars take precedence */}
      <EditorContent
        editor={editor}
        onPointerDown={e => e.stopPropagation()}
        className="tiptap flex-1 overflow-y-auto px-4 py-3 text-[13px] text-gray-800 leading-relaxed cursor-text"
      />
    </div>
  )
}

function FmtBtn({ active, onMouseDown, title, children }: {
  active: boolean; onMouseDown: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onMouseDown() }}
      title={title}
      className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors select-none
        ${active ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      {children}
    </button>
  )
}
