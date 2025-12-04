<script setup lang="ts">
import { Button } from '@proj-airi/ui'
import { createAuthClient } from 'better-auth/client'

async function signIn() {
  const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3000',
  })

  const data = await authClient.signIn.social({
    provider: 'google',
  })

  console.log(data)
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
