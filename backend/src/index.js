import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { proofsRouter } from './routes/proofs.js'

const app = express()

// Only these websites may call the API from a browser.
// An open CORS ("*") would let any random site use your backend.
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, Postman, server-to-server) are fine.
      if (!origin) return callback(null, true)
      if (config.corsOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
  })
)

// Only accept small JSON bodies. A 10 MB limit would let someone
// send a huge payload and use up your server's memory.
app.use(express.json({ limit: '16kb' }))

// A tiny "is the server alive?" endpoint. Handy after deploying.
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

app.use('/api/proofs', proofsRouter)

// Anything else is a 404.
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// If something throws, log it on the server but never send the real error
// details to the visitor (those can leak table names and file paths).
app.use((err, _req, res, _next) => {
  // A website that is not on the allow-list above.
  // We stop the request here, so the route never runs.
  if (err.message === 'Not allowed by CORS') {
    console.warn('Blocked request from a website that is not in CORS_ORIGIN.')
    return res
      .status(403)
      .json({ error: 'This website is not allowed to use this API.' })
  }

  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Something went wrong.' })
})

app.listen(config.port, () => {
  console.log(`✅ Backend running at http://localhost:${config.port}`)
  console.log(`   Health check: http://localhost:${config.port}/api/health`)
  console.log(`   Allowed frontend origins: ${config.corsOrigins.join(', ')}`)
})
