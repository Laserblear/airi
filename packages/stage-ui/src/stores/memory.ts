import type { EmbedProvider } from '@xsai-ext/shared-providers'

import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed } from 'vue'

import { useProvidersStore } from './providers'

export interface MemoryEntry {
  id: string
  content: string
  embedding?: number[]
  metadata: {
    timestamp: number
    source: string
    importance?: number
    tags?: string[]
  }
  sessionId?: string
}

export interface MemorySearchOptions {
  query: string
  limit?: number
  threshold?: number
  sessionId?: string
}

export interface MemorySearchResult {
  entry: MemoryEntry
  similarity: number
}

export const useMemoryStore = defineStore('memory', () => {
  const providersStore = useProvidersStore()

  const memories = useLocalStorage<MemoryEntry[]>('memory/entries', [])
  const memoryEnabled = useLocalStorage<boolean>('memory/enabled', false)
  const memoryProviderId = useLocalStorage<string>('memory/provider', '')
  const memoryEmbedProviderId = useLocalStorage<string>('memory/embed-provider', '')
  const memoryModel = useLocalStorage<string>('memory/model', '')
  const memoryEmbedModel = useLocalStorage<string>('memory/embed-model', '')

  const isConfigured = computed(() => {
    return memoryEnabled.value && memoryEmbedProviderId.value && memoryEmbedModel.value
  })

  /**
   * Generate embedding for text using configured provider
   */
  async function generateEmbedding(text: string): Promise<number[] | undefined> {
    if (!memoryEmbedProviderId.value || !memoryEmbedModel.value) {
      return undefined
    }

    try {
      const embedProvider = await providersStore.getProviderInstance<EmbedProvider>(memoryEmbedProviderId.value)
      const embedResult = embedProvider.embed(memoryEmbedModel.value)

      if (embedResult && typeof embedResult === 'object' && 'generate' in embedResult) {
        const result = await (embedResult as any).generate({ input: text })

        if (result && result.data && result.data.length > 0) {
          return result.data[0].embedding
        }
      }
    }
    catch (error) {
      console.error('Failed to generate embedding:', error)
    }

    return undefined
  }

  /**
   * Store a memory entry
   */
  async function storeMemory(
    content: string,
    metadata: {
      source?: string
      importance?: number
      tags?: string[]
      sessionId?: string
    } = {},
  ) {
    if (!isConfigured.value) {
      console.warn('Memory system not configured')
      return
    }

    const id = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const entry: MemoryEntry = {
      id,
      content,
      metadata: {
        timestamp: Date.now(),
        source: metadata.source || 'chat',
        importance: metadata.importance,
        tags: metadata.tags,
      },
      sessionId: metadata.sessionId,
    }

    // Generate embedding using helper function
    entry.embedding = await generateEmbedding(content)

    memories.value.push(entry)

    return entry
  }

  /**
   * Search memories by semantic similarity
   */
  async function searchMemories(options: MemorySearchOptions): Promise<MemorySearchResult[]> {
    if (!isConfigured.value || memories.value.length === 0) {
      return []
    }

    const { query, limit = 5, threshold = 0.7, sessionId } = options

    try {
      // Generate query embedding using helper function
      const queryEmbedding = await generateEmbedding(query)

      if (!queryEmbedding) {
        return []
      }

      // Filter by session if provided
      let filteredMemories = memories.value
      if (sessionId) {
        filteredMemories = memories.value.filter(m => m.sessionId === sessionId)
      }

      // Calculate cosine similarity for memories with embeddings
      const results: MemorySearchResult[] = filteredMemories
        .filter(memory => memory.embedding && memory.embedding.length > 0)
        .map((memory) => {
          const similarity = cosineSimilarity(queryEmbedding, memory.embedding!)
          return { entry: memory, similarity }
        })
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)

      return results
    }
    catch (error) {
      console.error('Failed to search memories:', error)
      return []
    }
  }

  /**
   * Get recent memories
   */
  function getRecentMemories(limit = 10, sessionId?: string): MemoryEntry[] {
    let filteredMemories = memories.value
    if (sessionId) {
      filteredMemories = memories.value.filter(m => m.sessionId === sessionId)
    }

    return [...filteredMemories]
      .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
      .slice(0, limit)
  }

  /**
   * Delete a memory
   */
  function deleteMemory(id: string) {
    const index = memories.value.findIndex(m => m.id === id)
    if (index !== -1) {
      memories.value.splice(index, 1)
    }
  }

  /**
   * Clear all memories
   */
  function clearMemories(sessionId?: string) {
    if (sessionId) {
      memories.value = memories.value.filter(m => m.sessionId !== sessionId)
    }
    else {
      memories.value = []
    }
  }

  /**
   * Get memory by ID
   */
  function getMemoryById(id: string): MemoryEntry | undefined {
    return memories.value.find(m => m.id === id)
  }

  /**
   * Update memory metadata
   */
  function updateMemoryMetadata(id: string, metadata: Partial<MemoryEntry['metadata']>) {
    const memory = memories.value.find(m => m.id === id)
    if (memory) {
      memory.metadata = { ...memory.metadata, ...metadata }
    }
  }

  return {
    memories,
    memoryEnabled,
    memoryProviderId,
    memoryEmbedProviderId,
    memoryModel,
    memoryEmbedModel,
    isConfigured,
    storeMemory,
    searchMemories,
    getRecentMemories,
    deleteMemory,
    clearMemories,
    getMemoryById,
    updateMemoryMetadata,
  }
})

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    return 0
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  normA = Math.sqrt(normA)
  normB = Math.sqrt(normB)

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (normA * normB)
}
