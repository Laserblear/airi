import { jwtClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export const API_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export const authClient = createAuthClient({
  baseURL: API_SERVER_URL,
  plugins: [
    jwtClient(),
  ],
})
