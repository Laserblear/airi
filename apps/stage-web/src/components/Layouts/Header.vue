<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'

import HeaderLink from './HeaderLink.vue'

import { doRequest } from '../../composables/api'
import { authClient, listSessions } from '../../composables/auth'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)

const userName = computed(() => user.value?.name)
const userAvatar = computed(() => user.value?.image)
const showDropdown = ref(false)

function handleLogout() {
  authClient.signOut()
}

function handleListSessions() {
  doRequest('/session')
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred')
    })
}
</script>

<template>
  <header mb-1 w-full gap-2>
    <div w-full>
      <HeaderLink />
    </div>

    <RouterLink
      class="block max-h-[10lh] min-h-[1lh] rounded-lg bg-neutral-100 p-2 text-lg text-neutral-500 outline-none dark:bg-neutral-800 dark:text-neutral-400"
      to="/settings"
    >
      <div i-solar:settings-minimalistic-bold-duotone />
    </RouterLink>

    <RouterLink
      v-if="!isAuthenticated"
      class="block max-h-[10lh] min-h-[1lh] rounded-lg bg-neutral-100 p-2 text-lg text-neutral-500 outline-none dark:bg-neutral-800 dark:text-neutral-400"
      to="/auth/login"
    >
      <div i-solar:user-bold-duotone />
    </RouterLink>

    <div v-else class="relative flex items-center gap-2">
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg px-2 py-1 outline-none ring-primary transition hover:bg-neutral-200 focus:ring-2 dark:hover:bg-neutral-700"
        aria-haspopup="true"
        :aria-expanded="showDropdown ? 'true' : 'false'"
        @click="showDropdown = !showDropdown"
      >
        <img v-if="userAvatar" :src="userAvatar" class="h-6 w-6 rounded-full">
        <div class="i-solar:alt-arrow-down-linear ml-1 text-lg" />
      </button>
      <div
        v-if="showDropdown"
        class="absolute right-0 top-full z-10 mt-2 min-w-[140px] flex flex-col rounded-lg bg-white shadow-lg dark:bg-neutral-900"
      >
        <span v-if="userName" class="rounded-lg p-2 text-sm text-neutral-700 dark:text-neutral-200">{{ userName }}</span>
        <button
          class="block w-full rounded-lg p-2 text-left text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
          @click="handleListSessions"
        >
          List Sessions
        </button>
        <button
          class="block w-full rounded-lg p-2 text-left text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
          @click="handleLogout"
        >
          <div class="i-solar:logout-3-bold-duotone mr-2 inline-block" />
          Logout
        </button>
      </div>
    </div>
  </header>
</template>
