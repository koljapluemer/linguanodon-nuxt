import { createLinguaDexie } from '@/db/dexie';
// Operation interface for undo/redo
interface Operation {
  do(): Promise<void>;
  undo(): Promise<void>;
  // Optionally, you can add a flag or type to control which ops are undoable
}

export default defineNuxtPlugin(() => {
  const db = createLinguaDexie();

  // In-memory undo/redo stacks
  const undoStack: Operation[] = [];
  const redoStack: Operation[] = [];

  /**
   * Execute an operation. Only DELETEs are undoable for now.
   * To make an operation undoable, wrap it in an Operation object and call execute().
   * For non-undoable ops, just call db methods directly.
   */
  const execute = async (op: Operation, undoable = true) => {
    await op.do();
    if (undoable) {
      undoStack.push(op);
      redoStack.length = 0;
    }
  };

  /** Undo last operation (if any) */
  const undo = async () => {
    const op = undoStack.pop();
    if (!op) return;
    await op.undo();
    redoStack.push(op);
  };

  /** Redo last undone operation (if any) */
  const redo = async () => {
    const op = redoStack.pop();
    if (!op) return;
    await op.do();
    undoStack.push(op);
  };

  /**
   * How to make an operation undoable:
   *
   * 1. Wrap the action in an Operation object with do/undo methods.
   * 2. Call execute(op, true).
   * 3. For non-undoable actions, call db methods directly or use execute(op, false).
   *
   * Example for a DELETE:
   *
   * const op: Operation = {
   *   do: () => db.learningGoals.delete(uid),
   *   undo: () => db.learningGoals.put(previousGoal)
   * }
   * await execute(op, true);
   */

  return {
    provide: {
      db,
      execute,
      undo,
      redo,
      // Optionally expose stacks for UI
      undoStack,
      redoStack,
    },
  };
}); 