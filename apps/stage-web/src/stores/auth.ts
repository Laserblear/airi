import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage('auth/token', '')

  return {
    token,
  }
})
