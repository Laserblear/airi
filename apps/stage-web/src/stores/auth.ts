import { useLocalStorage } from '@vueuse/core'
import { jwtClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import { defineStore } from 'pinia'

export const API_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const authToken = useLocalStorage('auth/token', '')

  return {
    authToken,
  }
})

export const authClient = createAuthClient({
  baseURL: API_SERVER_URL,
  credentials: 'include',
  plugins: [
    jwtClient(),
  ],
  auth: {
    type: 'Bearer',
    token: () => useAuthStore().authToken,
  },
  fetchOptions: {
    onSuccess: (ctx) => {
      const newToken = ctx.response.headers.get('set-auth-token')
      if (newToken) {
        useAuthStore().authToken = newToken
      }
    },
  },
})
