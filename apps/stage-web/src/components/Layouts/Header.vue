<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import HeaderLink from './HeaderLink.vue'

import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)

const userName = computed(() => user.value?.name)
</script>

<template>
  <header mb-1 w-full gap-2>
    <div w-full>
      <HeaderLink />
    </div>

    <RouterLink
      class="m-1 block max-h-[10lh] min-h-[1lh] rounded-lg bg-neutral-100 p-2 text-lg text-neutral-500 outline-none dark:bg-neutral-800 dark:text-neutral-400"
      to="/settings"
    >
      <div i-solar:settings-minimalistic-bold-duotone />
    </RouterLink>

    <RouterLink
      class="m-1 block max-h-[10lh] min-h-[1lh] rounded-lg bg-neutral-100 p-2 text-lg text-neutral-500 outline-none dark:bg-neutral-800 dark:text-neutral-400"
      to="/auth/login"
    >
      <div i-solar:user-bold-duotone />
    </RouterLink>
  </header>
</template>
