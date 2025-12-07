<script setup lang="ts">
import { Button, Callout, Card, FormControl, FormItem, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '@proj-airi/stage-ui/components'
import { useMemoryStore } from '@proj-airi/stage-ui/stores/memory'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const memoryStore = useMemoryStore()
const providersStore = useProvidersStore()

const {
  memoryEnabled,
  memoryEmbedProviderId,
  memoryEmbedModel,
  memories,
  isConfigured,
} = storeToRefs(memoryStore)

// Get available embedding providers
const embedProviders = computed(() => {
  return providersStore.allProvidersMetadata.filter(p => p.category === 'embed')
})

// Get models for selected embed provider
const embedModels = ref<any[]>([])
const loadingModels = ref(false)

watch(() => memoryEmbedProviderId.value, async (providerId) => {
  if (!providerId) {
    embedModels.value = []
    return
  }

  loadingModels.value = true
  try {
    embedModels.value = await providersStore.fetchModelsForProvider(providerId)
    // Auto-select first model if none selected
    if (embedModels.value.length > 0 && !memoryEmbedModel.value) {
      memoryEmbedModel.value = embedModels.value[0].id
    }
  }
  catch (error) {
    console.error('Failed to load models:', error)
  }
  finally {
    loadingModels.value = false
  }
}, { immediate: true })

function handleClearSessionMemories() {
  // eslint-disable-next-line no-alert
  if (confirm(t('settings.memory.storage.clear-confirmation'))) {
    memoryStore.clearMemories()
  }
}

function handleClearAllMemories() {
  // eslint-disable-next-line no-alert
  if (confirm(t('settings.memory.storage.clear-confirmation'))) {
    memoryStore.clearMemories()
  }
}
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 space-y-6">
    <div>
      <h1 class="mb-2 text-2xl font-bold">
        {{ t('settings.memory.title') }}
      </h1>
      <p class="text-neutral-600 dark:text-neutral-400">
        {{ t('settings.memory.description') }}
      </p>
    </div>

    <!-- Enable Memory -->
    <Card class="p-6">
      <FormItem>
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <FormControl>
              <label class="font-medium">{{ t('settings.memory.enable.title') }}</label>
            </FormControl>
            <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {{ t('settings.memory.enable.description') }}
            </p>
          </div>
          <Switch v-model="memoryEnabled" />
        </div>
      </FormItem>
    </Card>

    <!-- Configuration -->
    <Card v-if="memoryEnabled" class="p-6 space-y-4">
      <h2 class="text-xl font-semibold">
        {{ t('settings.common.section.basic.title') }}
      </h2>

      <!-- Embedding Provider Selection -->
      <FormItem>
        <FormControl>
          <label class="font-medium">{{ t('settings.memory.embed-provider.title') }}</label>
        </FormControl>
        <p class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
          {{ t('settings.memory.embed-provider.description') }}
        </p>
        <Select v-model="memoryEmbedProviderId">
          <SelectTrigger>
            <SelectValue :placeholder="t('settings.dialogs.onboarding.selectProvider')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="provider in embedProviders"
              :key="provider.id"
              :value="provider.id"
            >
              {{ provider.localizedName || provider.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FormItem>

      <!-- Model Selection -->
      <FormItem v-if="memoryEmbedProviderId">
        <FormControl>
          <label class="font-medium">{{ t('settings.memory.embed-model.title') }}</label>
        </FormControl>
        <p class="mb-2 text-sm text-neutral-600 dark:text-neutral-400">
          {{ t('settings.memory.embed-model.description') }}
        </p>
        <Select v-model="memoryEmbedModel" :disabled="loadingModels || embedModels.length === 0">
          <SelectTrigger>
            <SelectValue :placeholder="loadingModels ? 'Loading...' : t('settings.dialogs.onboarding.select-model')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="model in embedModels"
              :key="model.id"
              :value="model.id"
            >
              {{ model.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </FormItem>

      <!-- Configuration Status -->
      <Callout
        v-if="!isConfigured && memoryEnabled"
        label="Configuration Required"
        theme="orange"
      >
        <div>
          Please configure an embedding provider and model to enable memory functionality.
        </div>
      </Callout>

      <Callout
        v-if="isConfigured"
        label="Memory System Configured"
        theme="green"
      >
        <div>
          Memory system is configured and ready to use. AIRI will now remember conversations.
        </div>
      </Callout>
    </Card>

    <!-- Memory Storage Management -->
    <Card v-if="memoryEnabled && isConfigured" class="p-6 space-y-4">
      <h2 class="text-xl font-semibold">
        {{ t('settings.memory.storage.title') }}
      </h2>

      <div class="space-y-3">
        <p class="text-sm">
          {{ t('settings.memory.storage.current-count', { count: memories.length }) }}
        </p>

        <div class="flex gap-2">
          <Button
            variant="outline"
            @click="handleClearSessionMemories"
          >
            {{ t('settings.memory.storage.clear-session') }}
          </Button>

          <Button
            variant="outline"
            theme="destructive"
            @click="handleClearAllMemories"
          >
            {{ t('settings.memory.storage.clear-all') }}
          </Button>
        </div>
      </div>
    </Card>

    <!-- Info Callout -->
    <Callout
      v-if="!memoryEnabled"
      label="Memory System Disabled"
      theme="blue"
    >
      <div>
        Enable the memory system above to allow AIRI to remember and recall past conversations.
        This helps provide more contextual and personalized responses.
      </div>
    </Callout>
  </div>

  <div
    v-motion
    text="neutral-200/50 dark:neutral-600/20" pointer-events-none
    fixed top="[calc(100dvh-15rem)]" bottom-0 right--5 z--1
    :initial="{ scale: 0.9, opacity: 0, y: 15 }"
    :enter="{ scale: 1, opacity: 1, y: 0 }"
    :duration="500"
    size-60
    flex items-center justify-center
  >
    <div text="60" i-solar:brain-bold-duotone />
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  stageTransition:
    name: slide
</route>
