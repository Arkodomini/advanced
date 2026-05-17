import { supabase } from './supabase'
import type { LinkContent } from '../types'

export async function fetchOg(url: string): Promise<Partial<LinkContent>> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-og', { body: { url } })
    if (error) throw error
    return {
      url,
      og_title: data.og_title ?? data.title ?? '',
      og_description: data.og_description ?? data.description ?? '',
      og_image: data.og_image ?? data.image ?? '',
      domain: data.domain ?? (() => { try { return new URL(url).hostname.replace('www.', '') } catch { return '' } })(),
    }
  } catch {
    let domain = ''
    try { domain = new URL(url).hostname.replace('www.', '') } catch { /* */ }
    return { url, og_title: '', og_description: '', og_image: '', domain }
  }
}

// Alias for backward compat
export const fetchOG = fetchOg
