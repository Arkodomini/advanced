import { X, FileImage, FileText, Download, Archive } from 'lucide-react'

interface Props {
  boardTitle: string
  onClose: () => void
  onExportPng: () => void
}

export default function ExportPanel({ boardTitle, onClose, onExportPng }: Props) {
  return (
    <div
      className="absolute top-12 right-3 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
      style={{ width: 280 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Export</h3>
        <button onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-1">
        {/* Image section */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pb-1">Image</p>

        <ExportRow
          icon={<FileImage size={15} className="text-blue-500" />}
          label="PNG — print / save"
          description="Opens the browser print dialog"
          onClick={onExportPng}
        />

        <div className="h-px bg-gray-100 my-2" />

        {/* Document section */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pb-1">Document</p>

        <ExportRow
          icon={<FileText size={15} className="text-purple-500" />}
          label="Markdown"
          description="Export notes as .md file"
          onClick={() => exportMarkdown(boardTitle)}
        />

        <div className="h-px bg-gray-100 my-2" />

        {/* Files section */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 pb-1">Files</p>

        <ExportRow
          icon={<Archive size={15} className="text-gray-500" />}
          label="ZIP archive"
          description="All images and files from this board"
          onClick={() => alert('ZIP export coming soon')}
          comingSoon
        />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/60">
        <p className="text-[10px] text-gray-400 text-center">
          Exports include all non-deleted cards on this board
        </p>
      </div>
    </div>
  )
}

function ExportRow({ icon, label, description, onClick, comingSoon }: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
  comingSoon?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition-colors w-full text-left disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <span className="shrink-0 w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-800 flex items-center gap-1.5">
          {label}
          {comingSoon && (
            <span className="text-[9px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Soon</span>
          )}
        </p>
        <p className="text-[11px] text-gray-400">{description}</p>
      </div>
      {!comingSoon && <Download size={13} className="shrink-0 text-gray-300" />}
    </button>
  )
}

function exportMarkdown(boardTitle: string) {
  const md = `# ${boardTitle}\n\n_Exported from Advanced Notes_\n`
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${boardTitle.toLowerCase().replace(/\s+/g, '-')}.md`
  a.click()
  URL.revokeObjectURL(url)
}
