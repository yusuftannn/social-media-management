<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <header class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold tracking-normal">{{ title }}</h1>
      <p v-if="description" class="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </div>
    <slot />
  </header>
</template>
