import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// Terrains avec leurs photos et la moyenne des avis, en une requête.
export async function fetchCourtsWithRelations() {
  const { data, error } = await supabase
    .from('courts')
    .select('*, court_photos(id, url), court_reviews(rating)')
  if (error) throw error
  return data.map((c) => ({
    ...c,
    photos: c.court_photos ?? [],
    rating_avg: avg(c.court_reviews?.map((r) => r.rating)),
    rating_count: c.court_reviews?.length ?? 0,
  }))
}

export async function fetchCourtDetail(id) {
  const { data, error } = await supabase
    .from('courts')
    .select('*, court_photos(id, url), court_reviews(id, rating, text, helpful_count, created_at)')
    .eq('id', id)
    .single()
  if (error) throw error
  return {
    ...data,
    photos: data.court_photos ?? [],
    reviews: (data.court_reviews ?? []).sort((a, b) => b.helpful_count - a.helpful_count),
    rating_avg: avg(data.court_reviews?.map((r) => r.rating)),
    rating_count: data.court_reviews?.length ?? 0,
  }
}

export async function insertCourt(court) {
  const { data, error } = await supabase.from('courts').insert(court).select().single()
  if (error) throw error
  return data
}

export async function insertReview(courtId, rating, text) {
  const { error } = await supabase
    .from('court_reviews')
    .insert({ court_id: courtId, rating, text: text || null })
  if (error) throw error
}

export async function voteHelpful(reviewId) {
  const { error } = await supabase.rpc('vote_helpful', { review_id: reviewId })
  if (error) throw error
}

export async function insertValidation(courtId, type, note) {
  const { error } = await supabase
    .from('court_validations')
    .insert({ court_id: courtId, type, note: note || null })
  if (error) throw error
}

// Upload d'une photo dans le bucket puis enregistrement de l'URL publique.
export async function uploadCourtPhoto(courtId, file) {
  const path = `${courtId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
  const { error: upErr } = await supabase.storage.from('court-photos').upload(path, file)
  if (upErr) throw upErr
  const { data } = supabase.storage.from('court-photos').getPublicUrl(path)
  const { error } = await supabase
    .from('court_photos')
    .insert({ court_id: courtId, url: data.publicUrl })
  if (error) throw error
  return data.publicUrl
}

function avg(values) {
  if (!values || values.length === 0) return null
  return Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10
}
