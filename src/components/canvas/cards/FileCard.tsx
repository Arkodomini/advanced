import { FileText, Download, File, Film, Music } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import type { Card, FileContent } from '../../../types'

interface Props { card: Card; boardId: string }

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function FileIcon({ type }: { type: string }) {
  if (type.startsWith('image/'))  return <File size={22} className="text-blue-400" />
  if (type.includes('pdf'))       return <FileText size={22} className="text-red-400" />
  if (type.startsWith('video/'))  return <Film size={22} className="text-purple-400" />
  if (type.startsWith('audio/'))  return <Music size={22} className="text-green-400" />
  return <FileText size={22} className="text-gray-400" />
}

export default function FileCard({ card }: Props) {
  const content = card.content as unknown as FileContent

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!content.storage_path) return
    const { data } = await supabase.storage.from('card-files').createSignedUrl(content.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  if (!content.file_name) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 py-4"
        style={{ color: 'var(--card-text-muted, #D1D5DB)' }}>
        <File size={28} />
        <span className="text-xs">No file</span>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex items-center gap-3.5 px-4 py-3">
      {/* Icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.04)' }}>
        <FileIcon type={content.file_type} />
      </div>

      {/* Name + size */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate"
          style={{ color: 'var(--card-text, #111827)' }}>
          {content.file_name}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--card-text-muted, #9CA3AF)' }}>
          {formatBytes(content.file_size)}
        </p>
      </div>

      {/* Download */}
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={handleDownload}
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--card-text-muted, #9CA3AF)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.color = 'var(--card-text, #374151)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--card-text-muted, #9CA3AF)' }}
        title="Download"
      >
        <Download size={15} />
      </button>
    </div>
  )
}
