import { useRef, useState, useEffect } from 'react'
import { Image, Upload, Pencil, Search, X } from 'lucide-react'
import { useCardStore } from '../../../store/cardStore'
import { useAuthStore } from '../../../store/authStore'
import { uploadCardImage, getCardImageUrl } from '../../../lib/storage'
import type { Card, ImageContent } from '../../../types'

interface Props { card: Card; boardId: string }

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY as string | undefined

interface UnsplashPhoto {
  id: string
  urls: { small: string; regular: string }
  alt_description: string | null
  user: { name: string }
}

async function searchUnsplash(query: string): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_KEY) return []
  const endpoint = query.trim()
    ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=${UNSPLASH_KEY}`
    : `https://api.unsplash.com/photos?per_page=12&order_by=popular&client_id=${UNSPLASH_KEY}`
  const res = await fetch(endpoint)
  if (!res.ok) return []
  const json = await res.json()
  return query.trim() ? (json.results ?? []) : json
}

export default function ImageCard({ card }: Props) {
  const { updateCard } = useCardStore()
  const { user } = useAuthStore()
  const content = card.content as unknown as ImageContent
  const [editing, setEditing] = useState(!content.storage_path)
  const [tab, setTab] = useState<'unsplash' | 'upload'>('unsplash')
  const [query, setQuery] = useState('')
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([])
  const [searching, setSearching] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const imageUrl = content.storage_path
    ? (content.storage_path.startsWith('http') ? content.storage_path : getCardImageUrl(content.storage_path))
    : null

  useEffect(() => {
    if (!editing || !UNSPLASH_KEY) return
    setSearching(true)
    searchUnsplash('').then(p => { setPhotos(p); setSearching(false) })
  }, [editing])

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (!UNSPLASH_KEY) return
    setSearching(true)
    const p = await searchUnsplash(q)
    setPhotos(p)
    setSearching(false)
  }

  const handleUnsplashPick = (photo: UnsplashPhoto) => {
    updateCard(card.id, {
      content: { ...content, storage_path: photo.urls.regular, original_name: photo.alt_description ?? 'Unsplash photo' }
    })
    setEditing(false)
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const path = await uploadCardImage(file, user.id)
      updateCard(card.id, { content: { ...content, storage_path: path, original_name: file.name } })
      setEditing(false)
    } finally { setUploading(false) }
  }

  const handleUrl = () => {
    const url = urlInput.trim()
    if (!url) return
    updateCard(card.id, { content: { ...content, storage_path: url, original_name: '' } })
    setEditing(false)
  }

  if (editing || !imageUrl) {
    return (
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b shrink-0" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          {UNSPLASH_KEY && (
            <button
              onClick={() => setTab('unsplash')}
              className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 ${
                tab === 'unsplash'
                  ? 'text-blue-600 border-blue-500'
                  : 'text-gray-400 border-transparent hover:text-gray-600'
              }`}
            >
              Recommended
            </button>
          )}
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 text-[11px] font-semibold py-2.5 transition-colors border-b-2 ${
              tab === 'upload'
                ? 'text-blue-600 border-blue-500'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            Upload
          </button>
        </div>

        {tab === 'unsplash' && UNSPLASH_KEY ? (
          <div className="flex flex-col flex-1 min-h-0 p-2.5 gap-2">
            {/* Search */}
            <div className="relative shrink-0">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={e => handleSearch(e.target.value)}
                onMouseDown={e => e.stopPropagation()}
                placeholder="Search images…"
                className="w-full pl-7 pr-8 py-1.5 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              {query && (
                <button onClick={() => handleSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={11} />
                </button>
              )}
            </div>

            {/* Photo grid */}
            <div className="flex-1 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">Searching…</div>
              ) : photos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-gray-400">No results</div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {photos.map(photo => (
                    <button
                      key={photo.id}
                      onClick={() => handleUnsplashPick(photo)}
                      onMouseDown={e => e.stopPropagation()}
                      className="aspect-square overflow-hidden rounded-md hover:opacity-85 transition-opacity"
                    >
                      <img src={photo.urls.small} alt={photo.alt_description ?? ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Upload tab */
          <div className="flex flex-col items-center justify-center flex-1 p-5 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.05)' }}>
              <Image size={22} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-gray-700">Upload an image</p>
              <p className="text-[11px] text-gray-400 mt-0.5">or paste a URL below</p>
            </div>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-[12px] px-4 py-2 rounded-lg transition-colors font-semibold"
            >
              <Upload size={13} />
              {uploading ? 'Uploading…' : 'Choose file'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <div className="flex w-full gap-2 items-center">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onMouseDown={e => e.stopPropagation()}
                onKeyDown={e => e.key === 'Enter' && handleUrl()}
                placeholder="https://…"
                className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                onMouseDown={e => e.stopPropagation()}
                onClick={handleUrl}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[12px] px-3 py-1.5 rounded-lg transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full h-full relative group/img">
      <img
        src={imageUrl}
        alt={content.original_name}
        className="w-full h-full object-cover"
        draggable={false}
      />
      <button
        onMouseDown={e => e.stopPropagation()}
        onClick={() => setEditing(true)}
        className="absolute top-2 right-2 bg-white/85 hover:bg-white text-gray-600 rounded-lg p-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
      >
        <Pencil size={12} />
      </button>
    </div>
  )
}
