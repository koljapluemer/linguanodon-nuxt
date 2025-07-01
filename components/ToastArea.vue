<script setup lang="ts">
const { toasts } = useAppToast()
</script>
<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <div
      v-for="t in toasts"
      :key="t.id"
      :class="`alert alert-${t.type} shadow-lg`"
      v-html="t.message"
    />
  </div>
</template> 