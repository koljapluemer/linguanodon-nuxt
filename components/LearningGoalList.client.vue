<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { PropType } from 'vue'
import type { LearningGoalSummary } from '~/types/persistent-general-data/LearningGoal'
import { useAppToast } from '~/composables/useAppToast'

const props = defineProps({
  goals: { type: Array as PropType<LearningGoalSummary[]>, required: true },
  language: { type: String, required: true }
})

// Client-only state
const localGoalUids = ref<Set<string>>(new Set())
const downloadingUid = ref<string | null>(null)
const undoAvailable = ref<Record<string, boolean>>({})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { $db, execute, undo } = useNuxtApp() as any
const { downloadLearningGoal, isLoading, error, lastDownloadedNames, reset } = useLearningGoalDownloader()
const { addToast } = useAppToast()

async function checkLocalGoals() {
  const uids = props.goals.map(g => g.uid)
  const found = await $db.learningGoals.bulkGet(uids)
  localGoalUids.value = new Set(found.filter((g: unknown): g is LearningGoalSummary => Boolean(g) && typeof g === 'object' && g !== null && 'uid' in g).map((g: LearningGoalSummary) => g.uid))
  for (const uid of uids) {
    if (localGoalUids.value.has(uid)) undoAvailable.value[uid] = false
  }
}

if (import.meta.client) {
  onMounted(checkLocalGoals)
  watch(() => props.goals, checkLocalGoals)
}

async function handleDownload(goal: LearningGoalSummary) {
  downloadingUid.value = goal.uid
  try {
    await downloadLearningGoal(goal, props.language, $db, execute)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Download error:', e)
  }
  downloadingUid.value = null
  if (error.value) {
    addToast('error', error.value)
    reset()
    return
  }
  if (lastDownloadedNames.value.length) {
    addToast('success', `Added: ${lastDownloadedNames.value.join(', ')}`)
    undoAvailable.value[goal.uid] = true
    reset()
    await checkLocalGoals()
  }
}

async function handleUndo(goal: LearningGoalSummary) {
  try {
    await undo()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Undo error:', e)
    return
  }
  addToast('info', 'Undo complete.')
  undoAvailable.value[goal.uid] = false
  await checkLocalGoals()
}
</script>

<template>
  <ul>
    <li v-for="goal in goals" :key="goal.uid" class="py-2 flex items-center justify-between">
      <span>{{ goal.name }}</span>
      <ClientOnly>
        <template #default>
          <span v-if="localGoalUids.has(goal.uid)" class="badge badge-success">Downloaded</span>
          <button
            v-else
            class="btn btn-primary btn-sm"
            :disabled="isLoading && downloadingUid === goal.uid"
            @click="handleDownload(goal)"
          >
            <span v-if="isLoading && downloadingUid === goal.uid">Downloading...</span>
            <span v-else>Download</span>
          </button>
          <button
            v-if="undoAvailable[goal.uid] && downloadingUid === null"
            class="btn btn-outline btn-xs ml-2"
            @click="handleUndo(goal)"
          >Undo</button>
        </template>
      </ClientOnly>
    </li>
  </ul>
</template> 