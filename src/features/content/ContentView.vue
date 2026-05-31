<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
</script>

<template>
  <PageHeader title="İçerik Takvimi" description="Platformlara göre planlanan sosyal medya içerikleri." />
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article v-for="content in workspace.contents" :key="content.id" class="panel p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium">{{ content.platform }}</span>
        <span class="text-xs text-slate-500">{{ content.publishDate }}</span>
      </div>
      <h2 class="mt-4 font-semibold">{{ content.title }}</h2>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{{ content.description }}</p>
      <span class="mt-4 inline-flex rounded-full bg-blue-50 px-2 py-1 text-xs text-brand dark:bg-blue-950">
        {{ content.status }}
      </span>
    </article>
  </div>
</template>
