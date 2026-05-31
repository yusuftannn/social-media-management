<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
</script>

<template>
  <PageHeader title="Projeler" description="Müşterilere bağlı proje portföyü ve durum takibi." />
  <div class="grid gap-4 lg:grid-cols-3">
    <article v-for="project in workspace.projects" :key="project.id" class="panel p-4">
      <div class="flex items-start justify-between gap-3">
        <h2 class="font-semibold">{{ project.projectName }}</h2>
        <span class="rounded-full bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">{{ project.status }}</span>
      </div>
      <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ project.description }}</p>
      <p class="mt-4 text-xs text-slate-500">{{ project.startDate }} - {{ project.endDate }}</p>
    </article>
  </div>
</template>
