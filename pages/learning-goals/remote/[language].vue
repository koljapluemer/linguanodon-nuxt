<template>
  <UContainer class="py-8">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">Learning Goals</h1>
      </template>
      <div v-if="pending" class="text-center py-8">
        <UISpinner size="lg" />
      </div>
      <div v-else-if="error" class="text-red-500 text-center py-8">
        Failed to load learning goals.
      </div>
      <ul v-else>
        <li v-for="goal in data" :key="goal.uid" class="py-2 border-b last:border-b-0">
          {{ goal.name }}
        </li>
      </ul>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import type { LearningGoalSummary } from '~/types/persistent-general-data/LearningGoal'

const route = useRoute()
const language = route.params.language as string

const url = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`

const { data, pending, error } = await useAsyncData<LearningGoalSummary[]>(
  `learning-goals-${language}`,
  () => $fetch<LearningGoalSummary[]>(url)
)
</script>
