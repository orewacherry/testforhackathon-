import { useEffect, useState } from 'react'
import { getProofs, createProof } from './api.js'

export default function App() {
  const [proofs, setProofs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: '', claim: '', evidence_url: '' })

  // Load the list once when the page opens.
  useEffect(() => {
    loadProofs()
  }, [])

  async function loadProofs() {
    setLoading(true)
    setError('')
    try {
      const data = await getProofs()
      setProofs(data.proofs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function updateField(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const data = await createProof(form)
      // Put the new proof on top of the list instead of reloading everything.
      setProofs((previous) => [data.proof, ...previous])
      setForm({ name: '', claim: '', evidence_url: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <h1>ProofWork</h1>
        <p>
          Turn a resume claim into something a recruiter can actually click and
          check.
        </p>
      </header>

      <main className="layout">
        <section className="card">
          <h2>Add a proof</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Alex Doe"
              maxLength={60}
              required
            />

            <label htmlFor="claim">What you claim</label>
            <input
              id="claim"
              name="claim"
              value={form.claim}
              onChange={updateField}
              placeholder="Cut page load time by 40%"
              maxLength={120}
              required
            />

            <label htmlFor="evidence_url">Link that proves it</label>
            <input
              id="evidence_url"
              name="evidence_url"
              type="url"
              value={form.evidence_url}
              onChange={updateField}
              placeholder="https://github.com/you/project/pull/12"
              maxLength={500}
              required
            />

            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add proof'}
            </button>
          </form>

          {/* React escapes text for us, so we never need dangerouslySetInnerHTML. */}
          {error && <p className="error">{error}</p>}
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Proof wall</h2>
            <button className="ghost" onClick={loadProofs} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
          </div>

          {loading && proofs.length === 0 ? (
            <p className="muted">Loading proofs…</p>
          ) : proofs.length === 0 ? (
            <p className="muted">
              Nothing yet. Add the first proof on the left.
            </p>
          ) : (
            <ul className="proof-list">
              {proofs.map((proof) => (
                <li key={proof.id} className="proof">
                  <p className="proof-claim">{proof.claim}</p>

                  {/* rel="noopener noreferrer" keeps the opened page from
                      controlling this tab. Always use it with target="_blank". */}
                  <a
                    href={proof.evidence_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View evidence ↗
                  </a>

                  <p className="proof-meta">
                    {proof.name} ·{' '}
                    {new Date(proof.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Frontend on Vercel/Netlify · Backend on Render · Data in Supabase</p>
      </footer>
    </div>
  )
}
