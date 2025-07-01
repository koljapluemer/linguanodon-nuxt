import { describe, it, expect, beforeEach } from 'vitest';
import { createLinguaDexie } from '@/db/dexie';
import type { LearningGoal } from '@/types/persistent-general-data/LearningGoal';

describe('LinguaDexie', () => {
  let db: ReturnType<typeof createLinguaDexie>;

  beforeEach(async () => {
    db = createLinguaDexie();
    await db.delete(); // clear previous data
    await db.open();
  });

  it('should create tables', async () => {
    expect(db.learningGoals).toBeDefined();
    expect(db.unitsOfMeaning).toBeDefined();
  });

  it('should add and retrieve a LearningGoal', async () => {
    const goal: LearningGoal = {
      uid: 'goal1',
      name: 'Test Goal',
      parents: [],
      blockedBy: [],
      language: 'en',
      unitsOfMeaning: [],
      userCreated: true,
    };
    await db.learningGoals.add(goal);
    const found = await db.learningGoals.get('goal1');
    expect(found).toMatchObject(goal);
  });
}); 