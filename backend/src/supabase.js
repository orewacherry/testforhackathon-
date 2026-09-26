import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

// This client uses the SERVICE ROLE key.
// That key ignores Row Level Security, so this client can read and write
// EVERYTHING in your database. It belongs on the server only.
export const supabaseAdmin = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false, // no need for logins in a backend job
      autoRefreshToken: false,
    },
  }
)
