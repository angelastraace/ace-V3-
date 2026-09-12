import { createClient } from '@neondatabase/neon-js'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters'

const authUrl = import.meta.env.VITE_NEON_AUTH_URL
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL

if (!authUrl || !dataApiUrl) {
  throw new Error('VITE_NEON_AUTH_URL and VITE_NEON_DATA_API_URL are required')
}

export const neon = createClient({
  auth: {
    url: authUrl,
    adapter: BetterAuthReactAdapter(),
  },
  dataApi: { url: dataApiUrl },
})
