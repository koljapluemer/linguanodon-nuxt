# Undo/Redo with Dexie in Nuxt

This guide explains how to implement an in‑session undo/redo system using Dexie.js (IndexedDB wrapper) in a Nuxt application. It covers defining operations, managing stacks, wrapping database transactions, and exposing APIs via a client‑only plugin.

---

## 1. Define an Operation Command

An **`Operation`** encapsulates a user action with methods to apply (`do()`) and revert (`undo()`) the change. Each operation should include all information needed to reverse itself.

```ts
interface Operation {
  /** Apply the action */
  do(): Promise<void>
  /** Revert the action */
  undo(): Promise<void>
}
```

*Example*: adding a new item can store the record and its generated ID so that the undo method can delete it later.

---

## 2. Maintain In‑Memory Stacks

Use two JavaScript arrays to track history:

* **`undoStack`**: operations that can be undone
* **`redoStack`**: operations that were undone and can be redone

```ts
const undoStack: Operation[] = []
const redoStack: Operation[] = []
```

Pushing and popping from these stacks controls the undo/redo flow.

---

## 3. Execute, Undo & Redo Logic

Implement three core functions:

```ts
async function execute(op: Operation) {
  await op.do()
  undoStack.push(op)
  redoStack.length = 0 // clear redo history on new action
}

async function undo() {
  const op = undoStack.pop()
  if (!op) return
  await op.undo()
  redoStack.push(op)
}

async function redo() {
  const op = redoStack.pop()
  if (!op) return
  await op.do()
  undoStack.push(op)
}
```

* **`execute`** applies a new operation and resets the redo stack.
* **`undo`** reverts the last operation and moves it to the redo stack.
* **`redo`** re‑applies an undone operation and moves it back to the undo stack.

---

## 4. Wrap Database Calls in Transactions

Ensure consistency by performing each `do()` or `undo()` within a Dexie transaction:

```ts
await db.transaction('rw', db.items, async () => {
  // invoke op.do() or op.undo() here
})
```

Transactions guarantee that a partial failure doesn’t leave your DB in an inconsistent state.

---

## 5. Client‑Only Nuxt Plugin

Create a plugin under `plugins/db.client.ts` so it only runs in the browser (IndexedDB is unavailable server‑side):

```ts
// plugins/db.client.ts
import Dexie from 'dexie'
import type { Operation } from '@/types'

export default defineNuxtPlugin(() => {
  // Initialize Dexie database
  const db = new Dexie('app-db')
  db.version(1).stores({ items: '++id, title' })

  // History stacks
  const undoStack: Operation[] = []
  const redoStack: Operation[] = []

  // Execute a new operation
  const execute = async (op: Operation) => {
    await db.transaction('rw', db.items, async () => {
      await op.do()
    })
    undoStack.push(op)
    redoStack.length = 0
  }

  // Undo last operation
  const undo = async () => {
    const op = undoStack.pop()
    if (!op) return
    await db.transaction('rw', db.items, async () => {
      await op.undo()
    })
    redoStack.push(op)
  }

  // Redo last undone
  const redo = async () => {
    const op = redoStack.pop()
    if (!op) return
    await db.transaction('rw', db.items, async () => {
      await op.do()
    })
    undoStack.push(op)
  }

  // Expose via Nuxt app
  return { provide: { db, execute, undo, redo } }
})
```

**Key points**:

* `plugins/db.client.ts` suffix ensures client‑only.
* Provide methods via `useNuxtApp()` for easy access in components.

---

## 6. Usage in Components

Consume the plugin methods inside your Vue components:

```vue
<script setup lang="ts">
const { $db, execute, undo, redo } = useNuxtApp()

onMounted(async () => {
  // Define an operation for adding an item
  const op: Operation = {
    do: () => $db.items.add({ title: 'New Item' }),
    undo: () => $db.items.delete(/* use returned ID */)
  }
  // Execute and record it
  await execute(op)
})
</script>
```

Use `undo()` and `redo()` in response to user clicks.

---

## 7. UI Controls

* **Undo button**: bind to `undo()`, disable if `undoStack.length === 0`.
* **Redo button**: bind to `redo()`, disable if `redoStack.length === 0`.

```vue
<button @click="undo()" :disabled="undoStack.length === 0">Undo</button>
<button @click="redo()" :disabled="redoStack.length === 0">Redo</button>
```

---

> **Note**: Stacks reside in memory and reset on page reload. For bulk operations, combine multiple actions into a single `Operation` to maintain atomic undo/redo behavior.
