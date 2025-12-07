import type { ChatMessage } from '../types/chat'

import { watchEffect } from 'vue'

import { useChatStore } from '../stores/chat'
import { useMemoryStore } from '../stores/memory'

/**
 * Composable to integrate memory system with chat
 * Automatically stores important conversations and retrieves relevant memories
 */
export function useMemoryIntegration() {
  const chatStore = useChatStore()
  const memoryStore = useMemoryStore()

  /**
   * Extract text content from message
   */
  function extractTextFromMessage(message: ChatMessage): string {
    if (typeof message.content === 'string') {
      return message.content
    }

    if (Array.isArray(message.content)) {
      return message.content
        .filter(part => part.type === 'text')
        .map(part => (part as any).text || '')
        .join(' ')
    }

    return ''
  }

  /**
   * Determine if a message should be stored in memory
   */
  function shouldStoreMessage(message: ChatMessage): boolean {
    const text = extractTextFromMessage(message)

    // Skip empty messages
    if (!text.trim()) {
      return false
    }

    // Skip very short messages (less than 10 characters)
    if (text.length < 10) {
      return false
    }

    // Skip system messages
    if (message.role === 'system') {
      return false
    }

    return true
  }

  /**
   * Calculate importance score for a message
   */
  function calculateImportance(message: ChatMessage): number {
    const text = extractTextFromMessage(message)
    let score = 0.5 // Base score

    // Longer messages are typically more important
    if (text.length > 100) {
      score += 0.1
    }
    if (text.length > 500) {
      score += 0.1
    }

    // Messages with questions are important
    if (text.includes('?')) {
      score += 0.1
    }

    // Messages from user are generally important
    if (message.role === 'user') {
      score += 0.1
    }

    // Cap at 1.0
    return Math.min(score, 1.0)
  }

  /**
   * Store a chat message as memory
   */
  async function storeMessageAsMemory(message: ChatMessage, sessionId: string) {
    if (!memoryStore.isConfigured || !shouldStoreMessage(message)) {
      return
    }

    const text = extractTextFromMessage(message)
    const importance = calculateImportance(message)

    try {
      await memoryStore.storeMemory(text, {
        source: 'chat',
        importance,
        tags: [message.role],
        sessionId,
      })
    }
    catch (error) {
      console.error('Failed to store message as memory:', error)
    }
  }

  /**
   * Retrieve relevant memories for a query
   */
  async function getRelevantMemories(query: string, sessionId?: string) {
    if (!memoryStore.isConfigured) {
      return []
    }

    try {
      const results = await memoryStore.searchMemories({
        query,
        limit: 5,
        threshold: 0.7,
        sessionId,
      })

      return results
    }
    catch (error) {
      console.error('Failed to retrieve relevant memories:', error)
      return []
    }
  }

  /**
   * Setup automatic memory storage
   */
  function setupAutomaticMemoryStorage() {
    // Store assistant responses as memories
    chatStore.onAssistantResponseEnd(async (message) => {
      if (!memoryStore.memoryEnabled) {
        return
      }

      // Use the message content directly from the hook parameter
      await memoryStore.storeMemory(message, {
        source: 'chat',
        importance: message.length > 100 ? 0.7 : 0.5,
        tags: ['assistant'],
        sessionId: chatStore.activeSessionId,
      })
    })

    // Store user messages as memories
    chatStore.onAfterSend(async (message) => {
      if (!memoryStore.memoryEnabled) {
        return
      }

      // Use the message content directly from the hook parameter
      await memoryStore.storeMemory(message, {
        source: 'chat',
        importance: 0.6, // User messages are typically important
        tags: ['user'],
        sessionId: chatStore.activeSessionId,
      })
    })
  }

  /**
   * Format memories as context for LLM
   */
  function formatMemoriesAsContext(memories: Awaited<ReturnType<typeof getRelevantMemories>>): string {
    if (memories.length === 0) {
      return ''
    }

    const memoryTexts = memories.map((result, index) => {
      const date = new Date(result.entry.metadata.timestamp).toLocaleString()
      return `[Memory ${index + 1}] (${date}, similarity: ${result.similarity.toFixed(2)})\n${result.entry.content}`
    })

    return `\n\n--- Relevant Memories ---\n${memoryTexts.join('\n\n')}\n--- End of Memories ---\n\n`
  }

  // Auto-setup when memory is enabled (only once)
  let hooksSetup = false
  watchEffect(() => {
    if (memoryStore.memoryEnabled && !hooksSetup) {
      setupAutomaticMemoryStorage()
      hooksSetup = true
    }
  })

  return {
    storeMessageAsMemory,
    getRelevantMemories,
    formatMemoriesAsContext,
    setupAutomaticMemoryStorage,
  }
}
