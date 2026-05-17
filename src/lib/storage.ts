import { supabase } from './supabase'

const BUCKET = 'card-images'

export async function uploadCardImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false })
  if (error) throw error
  return path
}

export function getCardImageUrl(storagePath: string): string {
  if (!storagePath) return ''
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

export async function deleteCardImage(storagePath: string): Promise<void> {
  if (!storagePath) return
  await supabase.storage.from(BUCKET).remove([storagePath])
}
