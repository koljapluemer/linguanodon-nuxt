import { ref } from 'vue'
import type { LearningGoal, LearningGoalSummary } from '~/types/persistent-general-data/LearningGoal'
import type { UnitOfMeaning } from '~/types/persistent-general-data/UnitOfMeaning'
import type { Table } from 'dexie'

interface LearningGoalDB {
  learningGoals: Table<LearningGoal, string>
  unitsOfMeaning: Table<UnitOfMeaning, string>
}

interface DownloadOperation {
  do: () => Promise<void>
  undo: () => Promise<void>
}

/**
 * Handles downloading a learning goal and its units (and direct translations) from a remote server,
 * saving only new items to Dexie, and supporting undo/redo using the global infrastructure.
 */
export function useLearningGoalDownloader() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastDownloadedNames = ref<string[]>([])

  /**
   * Download a learning goal and all its units and direct translations, then save to Dexie with undo support.
   * @param goalSummary The summary of the learning goal to download (must have uid and name)
   * @param language The language code (for URL construction)
   * @param $db The Dexie instance (from Nuxt plugin)
   * @param execute The execute function for undo/redo (from Nuxt plugin)
   */
  async function downloadLearningGoal(
    goalSummary: LearningGoalSummary,
    language: string,
    $db: LearningGoalDB,
    execute: (op: DownloadOperation) => Promise<void>
  ) {
    isLoading.value = true
    error.value = null
    lastDownloadedNames.value = []
    try {
      // 1. Fetch full learning goal
      const goalUrl = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/${goalSummary.uid}.json`
      const learningGoal: LearningGoal = await $fetch(goalUrl)

      // 2. Fetch all units of meaning (use language from UID)
      const unitUids = learningGoal.unitsOfMeaning
      const unitPromises = unitUids.map(uid => {
        const unitLang = uid.split('_')[0]
        return $fetch<UnitOfMeaning>(`https://scintillating-empanada-730581.netlify.app/units_of_meaning/${unitLang}/${uid}.json`)
      })
      const units = await Promise.all(unitPromises)

      // 3. Fetch all direct translations for each unit (use language from UID)
      const translationUids = Array.from(new Set(units.flatMap(u => u.translations ?? [])))
      const translationPromises = translationUids.map(uid => {
        const transLang = uid.split('_')[0]
        return $fetch<UnitOfMeaning>(`https://scintillating-empanada-730581.netlify.app/units_of_meaning/${transLang}/${uid}.json`)
      })
      const translations = translationUids.length ? await Promise.all(translationPromises) : []

      // 4. Build set of all new items (learning goal, units, translations)
      const allUnits = [...units, ...translations]
      const allUnitUids = allUnits.map((u: UnitOfMeaning) => u.uid)
      const existingUnitUids = await $db.unitsOfMeaning.bulkGet(allUnitUids).then((arr: (UnitOfMeaning | undefined)[]) => arr.filter((u): u is UnitOfMeaning => Boolean(u)).map((u: UnitOfMeaning) => u.uid))
      const newUnits = allUnits.filter((u: UnitOfMeaning) => !existingUnitUids.includes(u.uid))
      const existingGoal = await $db.learningGoals.get(learningGoal.uid)
      const newGoal = !existingGoal ? learningGoal : null

      // 5. If nothing new, throw
      if (!newGoal && newUnits.length === 0) {
        error.value = `All items already exist locally.`
        return
      }

      // 6. Prepare undo/redo operation
      const op: DownloadOperation = {
        async do() {
          await $db.learningGoals.db.transaction('rw', $db.learningGoals, $db.unitsOfMeaning, async () => {
            if (newGoal) await $db.learningGoals.add(newGoal)
            if (newUnits.length) await $db.unitsOfMeaning.bulkAdd(newUnits)
          })
        },
        async undo() {
          await $db.learningGoals.db.transaction('rw', $db.learningGoals, $db.unitsOfMeaning, async () => {
            if (newGoal) await $db.learningGoals.delete(newGoal.uid)
            if (newUnits.length) await $db.unitsOfMeaning.bulkDelete(newUnits.map((u: UnitOfMeaning) => u.uid))
          })
        }
      }

      // 7. Execute operation (atomic, undoable)
      await execute(op)
      lastDownloadedNames.value = [newGoal?.name, ...newUnits.map((u: UnitOfMeaning) => u.content)].filter(Boolean) as string[]
    } catch (e: unknown) {
      error.value = `Failed to download '${goalSummary.name}'. See console for details.`
      // Log details for devs
      console.error('Download error:', e)
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    isLoading.value = false
    error.value = null
    lastDownloadedNames.value = []
  }

  return {
    downloadLearningGoal,
    isLoading,
    error,
    lastDownloadedNames,
    reset
  }
} 