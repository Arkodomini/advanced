import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const ICONS = {
  success: <CheckCircle size={16} className="text-green-500 shrink-0" />,
  error:   <XCircle size={16} className="text-red-500 shrink-0" />,
  info:    <AlertCircle size={16} className="text-blue-500 shrink-0" />,
}

export default function Toaster() {
  const { toasts, removeToast } = useUIStore()

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-[200] pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} id={t.id} message={t.message} type={t.type} onDismiss={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ id, message, type, onDismiss }: { id: string; message: string; type: 'success' | 'error' | 'info'; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 4000)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <div className="pointer-events-auto flex items-center gap-2 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 min-w-[240px] max-w-xs animate-fade-in">
      {ICONS[type]}
      <span className="text-sm text-gray-800 flex-1">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-gray-400 hover:text-gray-600 ml-1">
        <X size={14} />
      </button>
    </div>
  )
}
