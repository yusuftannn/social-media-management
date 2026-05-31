<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { TaskStatus } from '@/types'

const workspace = useWorkspaceStore()
const columns: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done']
</script>

<template>
  <PageHeader title="Görevler" description="Trello benzeri görev akışı için kolon temelli başlangıç yapısı." />
  <div class="grid gap-4 lg:grid-cols-4">
    <section v-for="column in columns" :key="column" class="min-h-80 rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
      <h2 class="mb-3 text-sm font-semibold">{{ column }}</h2>
      <div class="grid gap-3">
        <article v-for="task in workspace.tasks.filter((item) => item.status === column)" :key="task.id" class="panel p-3">
          <h3 class="text-sm font-medium">{{ task.title }}</h3>
          <p class="mt-2 text-xs text-slate-500">{{ task.description }}</p>
          <div class="mt-3 flex items-center justify-between text-xs">
            <span>{{ task.assignedTo }}</span>
            <span class="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{{ task.priority }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
