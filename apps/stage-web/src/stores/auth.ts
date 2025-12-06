import { useLocalStorage } from '@vueuse/core'
import { jwtClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage('auth/token', '')
  const API_SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

  const client = createAuthClient({
    baseURL: API_SERVER_URL,
    plugins: [
      jwtClient(),
    ],
    auth: {
      type: 'Bearer',
      token: () => token.value,
    },
    fetchOptions: {
      onSuccess: (ctx) => {
        const newToken = ctx.response.headers.get('set-auth-token')
        if (newToken) {
          token.value = newToken
        }
      },
    },
  })

  const signInSocial = (provider: 'google' | 'github') => {
    return client.signIn.social({
      provider,
      callbackURL: `${API_SERVER_URL}/api/auth/callback/${provider}`,
    })
  }

  return {
    token,
    client,

    signInSocial,
  }
})
