import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()
    if (!url) return new Response(JSON.stringify({ error: 'url required' }), { status: 400, headers: corsHeaders })

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AdvancedNotes/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()

    const get = (prop: string) => {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`, 'i'))
      return m?.[1] ?? ''
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const og_title = get('og:title') || titleMatch?.[1]?.trim() || ''
    const og_description = get('og:description') || get('description') || ''
    const og_image = get('og:image') || ''
    const domain = new URL(url).hostname.replace('www.', '')

    return new Response(JSON.stringify({ og_title, og_description, og_image, domain }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ og_title: '', og_description: '', og_image: '', domain: '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
