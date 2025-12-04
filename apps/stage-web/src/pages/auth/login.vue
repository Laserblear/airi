<script setup lang="ts">
import { Button } from '@proj-airi/ui'
import { toast } from 'vue-sonner'

import { API_SERVER_URL, authClient } from '../../composables/auth'

async function signIn() {
  const { error, data } = await authClient.signIn.social({
    provider: 'google',
    callbackURL: `${API_SERVER_URL}/api/auth/callback/google`,
  })

  if (error) {
    toast.error(error?.message || 'An unknown error occurred')
  }

  if (data && data.redirect && data.url) {
    window.open(data.url, '_blank')
  }
}
</script>

<template>
  <div>
    <h1>Login</h1>

    <Button @click="signIn">
      Sign In
    </Button>
  </div>
</template>
