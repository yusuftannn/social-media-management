<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  tone?: 'blue' | 'green' | 'orange' | 'slate'
}>()
</script>

<template>
  <section class="panel p-4">
    <div
      class="mb-4 h-2 w-12 rounded-full"
      :class="{
        'bg-brand': tone === 'blue' || !tone,
        'bg-mint': tone === 'green',
        'bg-coral': tone === 'orange',
        'bg-slate-400': tone === 'slate',
      }"
    />
    <p class="text-sm text-slate-500 dark:text-slate-400">{{ label }}</p>
    <p class="mt-2 text-2xl font-semibold">{{ value }}</p>
  </section>
</template>
