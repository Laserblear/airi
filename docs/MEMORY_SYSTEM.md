# Memory System Integration

This document describes the memory system integration in AIRI, which allows the AI to remember and recall conversations for more contextual responses.

## Overview

The memory system enables AIRI to:
- Automatically store conversations in semantic memory
- Search memories using embedding-based similarity
- Retrieve relevant memories for contextual responses
- Manage memories per session or globally

## Architecture

### Components

1. **Memory Store** (`packages/stage-ui/src/stores/memory.ts`)
   - Manages memory storage, retrieval, and search
   - Uses local storage for persistence
   - Integrates with embedding providers for semantic search

2. **Memory Integration** (`packages/stage-ui/src/composables/use-memory-integration.ts`)
   - Provides hooks for automatic memory storage
   - Calculates importance scores for memories
   - Formats memories as context for LLM

3. **Settings UI** (`packages/stage-pages/src/pages/settings/memory/index.vue`)
   - Configuration interface for memory system
   - Provider and model selection
   - Memory management controls

## Setup

### 1. Enable Memory System

Navigate to **Settings > Memory** and toggle the "Enable Memory" switch.

### 2. Configure Embedding Provider

Select an embedding provider (e.g., Ollama) from the dropdown. This provider will be used to generate embeddings for semantic search.

### 3. Select Embedding Model

Choose an embedding model from the available models for your selected provider (e.g., `nomic-embed-text` for Ollama).

### 4. Configuration Complete

Once configured, the memory system will automatically start storing conversations.

## Usage

### Automatic Memory Storage

When enabled, the memory system automatically:
- Stores user messages after sending
- Stores assistant responses after completion
- Calculates importance scores based on message length and content
- Generates embeddings for semantic search

### Memory Search

```typescript
import { useMemoryStore } from '@proj-airi/stage-ui/stores/memory'

const memoryStore = useMemoryStore()

// Search memories
const results = await memoryStore.searchMemories({
  query: 'What did we discuss about AI?',
  limit: 5,
  threshold: 0.7,
  sessionId: 'optional-session-id'
})

// Results include similarity scores
results.forEach((result) => {
  console.log(`Similarity: ${result.similarity}`)
  console.log(`Content: ${result.entry.content}`)
})
```

### Memory Retrieval

```typescript
// Get recent memories
const recent = memoryStore.getRecentMemories(10, 'session-id')

// Get memory by ID
const memory = memoryStore.getMemoryById('mem_id')

// Get all memories for a session
const sessionMemories = memoryStore.getRecentMemories(100, 'session-id')
```

### Memory Management

```typescript
// Delete a specific memory
memoryStore.deleteMemory('mem_id')

// Clear all memories for a session
memoryStore.clearMemories('session-id')

// Clear all memories
memoryStore.clearMemories()
```

## Integration with Chat

### Using Memory Integration Composable

```typescript
import { useMemoryIntegration } from '@proj-airi/stage-ui/composables'

const {
  getRelevantMemories,
  formatMemoriesAsContext,
  setupAutomaticMemoryStorage
} = useMemoryIntegration()

// Setup automatic storage (done once at app start)
setupAutomaticMemoryStorage()

// Get relevant memories for a query
const memories = await getRelevantMemories('user query', 'session-id')

// Format memories as context for LLM
const context = formatMemoriesAsContext(memories)
```

## Data Structure

### Memory Entry

```typescript
interface MemoryEntry {
  id: string // Unique identifier
  content: string // Memory content
  embedding?: number[] // Semantic embedding vector
  metadata: {
    timestamp: number // Creation time
    source: string // Source (e.g., 'chat')
    importance?: number // Importance score (0-1)
    tags?: string[] // Tags (e.g., ['user', 'assistant'])
  }
  sessionId?: string // Optional session ID
}
```

### Search Options

```typescript
interface MemorySearchOptions {
  query: string // Search query
  limit?: number // Max results (default: 5)
  threshold?: number // Similarity threshold (default: 0.7)
  sessionId?: string // Optional session filter
}
```

## Configuration

### Store Configuration

The memory system uses the following localStorage keys:
- `memory/entries`: Array of memory entries
- `memory/enabled`: Boolean flag for memory system
- `memory/provider`: Memory provider ID (currently unused)
- `memory/embed-provider`: Embedding provider ID
- `memory/model`: Memory model (currently unused)
- `memory/embed-model`: Embedding model ID

## Importance Scoring

The system automatically calculates importance scores based on:
- **Message length**: Longer messages get higher scores
- **Questions**: Messages with questions get bonus points
- **User messages**: User messages get slight priority

Base score: 0.5
- +0.1 for messages > 100 characters
- +0.1 for messages > 500 characters
- +0.1 for messages containing '?'
- +0.1 for user messages

Maximum score: 1.0

## Semantic Search

The memory system uses cosine similarity to find relevant memories:

1. Query embedding is generated using the configured embedding provider
2. Similarity is calculated between query and stored memory embeddings
3. Results are filtered by threshold (default: 0.7)
4. Top N results are returned sorted by similarity

## Performance Considerations

- **Local Storage**: Memories are stored in browser localStorage with a limit of ~5-10MB
- **Embedding Generation**: Async operation that may take time depending on provider
- **Search Performance**: Linear search through all memories (consider indexing for large datasets)

## Future Enhancements

- [ ] Memory viewer component for browsing memories
- [ ] Memory export/import functionality
- [ ] Memory consolidation/summarization
- [ ] Memory analytics and insights
- [ ] Indexed search for better performance
- [ ] Memory expiration and cleanup policies
- [ ] Memory categories and tagging improvements

## Troubleshooting

### Memory not storing
- Check if memory system is enabled in settings
- Verify embedding provider is configured
- Check browser console for errors

### Search not working
- Ensure embedding model is selected
- Verify provider is properly configured
- Check that memories have embeddings

### Configuration not saving
- Check browser localStorage is not full
- Verify localStorage is enabled in browser
- Clear browser data and reconfigure

## API Reference

See the TypeScript definitions in:
- `packages/stage-ui/src/stores/memory.ts`
- `packages/stage-ui/src/composables/use-memory-integration.ts`

For full API documentation and examples.
