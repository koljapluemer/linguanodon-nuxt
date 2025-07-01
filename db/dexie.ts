import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { ExerciseProgress } from '@/types/per-user-data/ExerciseProgress';
import type { LearningGoalProgress } from '@/types/per-user-data/LearningGoalProgress';
import type { UnitOfMeaningProgress } from '@/types/per-user-data/UnitOfMeaningProgress';
import type { LearningGoal } from '@/types/persistent-general-data/LearningGoal';
import type { UnitOfMeaning } from '@/types/persistent-general-data/UnitOfMeaning';

/**
 * Dexie database for per-user data.
 *
 * Table schemas:
 * - ExerciseProgress: PK = uid
 * - LearningGoalProgress: PK = uid
 * - UnitOfMeaningProgress: PK = uid
 * - LearningGoal: PK = uid
 * - UnitOfMeaning: PK = uid
 */
export class LinguaDexie extends Dexie {
  exerciseProgress!: Table<ExerciseProgress, string>;
  learningGoalProgress!: Table<LearningGoalProgress, string>;
  unitOfMeaningProgress!: Table<UnitOfMeaningProgress, string>;
  learningGoals!: Table<LearningGoal, string>;
  unitsOfMeaning!: Table<UnitOfMeaning, string>;

  constructor() {
    super('linguanodon-db');
    this.version(1).stores({
      exerciseProgress: 'uid',
      learningGoalProgress: 'uid',
      unitOfMeaningProgress: 'uid',
      learningGoals: 'uid',
      unitsOfMeaning: 'uid',
    });
  }
}

/**
 * Factory function for creating a new Dexie instance.
 * Useful for unit testing and plugin injection.
 */
export function createLinguaDexie() {
  return new LinguaDexie();
} 