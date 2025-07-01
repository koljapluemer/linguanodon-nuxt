<template>
  <div class="container mx-auto py-8">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h1 class="card-title text-2xl font-bold mb-4">Learning Goals</h1>
        <div v-if="pending" class="space-y-2">
          <div v-for="i in 3" :key="i" class="skeleton h-6 w-1/2" />
        </div>
        <div v-else-if="error" class="text-error text-center py-8">
          Failed to load learning goals.
        </div>
        <ul v-else class="divide-y divide-base-200">
          <ClientOnly>
            <component
              :is="LearningGoalListClient"
              :goals="data || []"
              :language="language"
            />
          </ClientOnly>
        </ul>
      </div>
    </div>
    <ToastArea />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { defineAsyncComponent } from 'vue'
import type { LearningGoalSummary } from '~/types/persistent-general-data/LearningGoal'

const LearningGoalListClient = defineAsyncComponent(() => import('~/components/LearningGoalList.client.vue'))

const route = useRoute()
const language = route.params.language as string

const url = `https://scintillating-empanada-730581.netlify.app/learning_goals/${language}/index.json`

const { data, pending, error } = await useAsyncData<LearningGoalSummary[]>(
  `learning-goals-${language}`,
  () => $fetch<LearningGoalSummary[]>(url)
)
</script>
