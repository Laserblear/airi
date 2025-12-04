<script setup lang="ts">
import { createAuthClient } from 'better-auth/client'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'

const route = useRoute()
const response = ref()

const state = computed(() => route.query.state as string)
const code = computed(() => route.query.code as string)

onMounted(async () => {
  if (!state.value || !code.value) {
    toast.error('Missing state or code')
    return
  }

  const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000',
  })

  const { error, data } = await authClient.signIn.social({
    provider: 'google',
    idToken: {
      token: state.value,
      accessToken: code.value,
    },
  })

  if (error) {
    toast.error(error?.message || 'An unknown error occurred')
  }

  response.value = data
})
</script>

<template>
  <div>
    <h1>Callback</h1>
  </div>

  <code>
    {{ $route.query }}
  </code>

  <code>
    {{ route.query.state }}
  </code>

  <code>
    {{ route.query.code }}
  </code>

  <code>
    {{ response }}
  </code>
</template>
