// Loads the variables from backend/.env into process.env
import 'dotenv/config'

// Small helper: if a required variable is missing, stop right away with a
// message a beginner can actually understand (instead of a confusing crash).
function required(name) {
  const value = process.env[name]
  if (!value || !value.trim()) {
    console.error('')
    console.error(`❌ Missing environment variable: ${name}`)
    console.error('')
    console.error('   Fix it like this:')
    console.error('   1. Copy backend/.env.example to backend/.env')
    console.error('   2. Fill in the values from your Supabase project')
    console.error('      (Supabase dashboard -> Project Settings -> API)')
    console.error('')
    process.exit(1)
  }
  return value.trim()
}

export const config = {
  port: Number(process.env.PORT) || 4000,

  // Safe in the frontend: https://xxxx.supabase.co
  supabaseUrl: required('SUPABASE_URL'),

  // ⚠️ SECRET. This key can read AND write your whole database.
  // It must ONLY live here on the server. Never in the frontend, never in Git.
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),

  // Which websites are allowed to call this API from a browser.
  // Comma separated list, e.g. "http://localhost:5173,https://my-site.vercel.app"
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
}
