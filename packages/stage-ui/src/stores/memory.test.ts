import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'

import { useMemoryStore } from './memory'

describe('useMemoryStore', () => {
  beforeEach(() => {
    // Create a new pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should initialize with empty memories', () => {
    const store = useMemoryStore()
    expect(store.memories).toEqual([])
    expect(store.memoryEnabled).toBe(false)
  })

  it('should enable/disable memory', () => {
    const store = useMemoryStore()
    store.memoryEnabled = true
    expect(store.memoryEnabled).toBe(true)
    store.memoryEnabled = false
    expect(store.memoryEnabled).toBe(false)
  })

  it('should not be configured without provider and model', () => {
    const store = useMemoryStore()
    store.memoryEnabled = true
    expect(store.isConfigured).toBe(false)
  })

  it('should be configured with provider and model', () => {
    const store = useMemoryStore()
    store.memoryEnabled = true
    store.memoryEmbedProviderId = 'test-provider'
    store.memoryEmbedModel = 'test-model'
    expect(store.isConfigured).toBe(true)
  })

  it('should get recent memories', () => {
    const store = useMemoryStore()

    // Manually add some test memories
    store.memories.push({
      id: 'mem_1',
      content: 'Test memory 1',
      metadata: {
        timestamp: Date.now() - 1000,
        source: 'test',
      },
    })

    store.memories.push({
      id: 'mem_2',
      content: 'Test memory 2',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    const recent = store.getRecentMemories(10)
    expect(recent).toHaveLength(2)
    // Most recent should be first
    expect(recent[0].id).toBe('mem_2')
    expect(recent[1].id).toBe('mem_1')
  })

  it('should delete memory by id', () => {
    const store = useMemoryStore()

    store.memories.push({
      id: 'mem_to_delete',
      content: 'Test memory',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    expect(store.memories).toHaveLength(1)
    store.deleteMemory('mem_to_delete')
    expect(store.memories).toHaveLength(0)
  })

  it('should get memory by id', () => {
    const store = useMemoryStore()

    const testMemory = {
      id: 'mem_test',
      content: 'Test memory',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    }

    store.memories.push(testMemory)

    const found = store.getMemoryById('mem_test')
    expect(found).toBeDefined()
    expect(found?.content).toBe('Test memory')
  })

  it('should filter memories by session', () => {
    const store = useMemoryStore()

    store.memories.push({
      id: 'mem_1',
      content: 'Session 1 memory',
      sessionId: 'session-1',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    store.memories.push({
      id: 'mem_2',
      content: 'Session 2 memory',
      sessionId: 'session-2',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    const session1Memories = store.getRecentMemories(10, 'session-1')
    expect(session1Memories).toHaveLength(1)
    expect(session1Memories[0].id).toBe('mem_1')
  })

  it('should clear all memories', () => {
    const store = useMemoryStore()

    store.memories.push({
      id: 'mem_1',
      content: 'Memory 1',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    store.memories.push({
      id: 'mem_2',
      content: 'Memory 2',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    expect(store.memories).toHaveLength(2)
    store.clearMemories()
    expect(store.memories).toHaveLength(0)
  })

  it('should clear session memories only', () => {
    const store = useMemoryStore()

    store.memories.push({
      id: 'mem_1',
      content: 'Session 1 memory',
      sessionId: 'session-1',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    store.memories.push({
      id: 'mem_2',
      content: 'Session 2 memory',
      sessionId: 'session-2',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
      },
    })

    expect(store.memories).toHaveLength(2)
    store.clearMemories('session-1')
    expect(store.memories).toHaveLength(1)
    expect(store.memories[0].sessionId).toBe('session-2')
  })

  it('should update memory metadata', () => {
    const store = useMemoryStore()

    store.memories.push({
      id: 'mem_1',
      content: 'Test memory',
      metadata: {
        timestamp: Date.now(),
        source: 'test',
        importance: 0.5,
      },
    })

    store.updateMemoryMetadata('mem_1', { importance: 0.9 })

    const memory = store.getMemoryById('mem_1')
    expect(memory?.metadata.importance).toBe(0.9)
  })
})
