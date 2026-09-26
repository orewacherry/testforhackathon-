// Every call to the backend lives here, so there is only one place
// to change when the API moves.
//
// VITE_API_URL comes from frontend/.env (locally) or from your hosting
// provider's environment variables (in production).
//
// ⚠️ Only variables that start with VITE_ are visible in the browser.
// That is exactly why secrets must NEVER be named VITE_*.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    // Show the friendly message the backend sent, if there is one.
    throw new Error(body.error || `Request failed (${response.status})`)
  }

  return body
}

export function getProofs() {
  return request('/api/proofs')
}

export function createProof(proof) {
  return request('/api/proofs', {
    method: 'POST',
    body: JSON.stringify(proof),
  })
}
