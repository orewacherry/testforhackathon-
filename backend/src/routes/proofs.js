import { Router } from 'express'
import { supabaseAdmin } from '../supabase.js'

export const proofsRouter = Router()

// The longest text we accept for each field.
// Keeping limits small stops someone from filling your database with junk.
const LIMITS = {
  name: 60,
  claim: 120,
  evidenceUrl: 500,
}

// Turn anything into clean, short text.
function clean(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

// Only allow normal web links as evidence. This blocks things like
// "javascript:..." which could run code when a visitor clicks the link.
function isSafeUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

// Columns we are happy to show to the public.
const PUBLIC_COLUMNS = 'id, name, claim, evidence_url, created_at'

// GET /api/proofs — list the newest proofs (public, no login needed)
proofsRouter.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('proofs')
    .select(PUBLIC_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('GET /api/proofs failed:', error.message)
    return res.status(500).json({ error: 'Could not load proofs.' })
  }

  res.json({ proofs: data })
})

// POST /api/proofs — add a proof
proofsRouter.post('/', async (req, res) => {
  const name = clean(req.body?.name, LIMITS.name)
  const claim = clean(req.body?.claim, LIMITS.claim)
  const evidenceUrl = clean(req.body?.evidence_url, LIMITS.evidenceUrl)

  // Validate BEFORE touching the database.
  if (!name || !claim || !evidenceUrl) {
    return res
      .status(400)
      .json({ error: 'Your name, the claim and the evidence link are required.' })
  }

  if (!isSafeUrl(evidenceUrl)) {
    return res
      .status(400)
      .json({ error: 'The evidence link must start with http:// or https://' })
  }

  const { data, error } = await supabaseAdmin
    .from('proofs')
    .insert({ name, claim, evidence_url: evidenceUrl })
    .select(PUBLIC_COLUMNS)
    .single()

  if (error) {
    console.error('POST /api/proofs failed:', error.message)
    return res.status(500).json({ error: 'Could not save your proof.' })
  }

  res.status(201).json({ proof: data })
})
