<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
</script>

<template>
  <PageHeader title="Ekip" description="Ajans rolleri ve ekip üyeleri." />
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article v-for="member in workspace.team" :key="member.id" class="panel p-4">
      <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 font-semibold text-brand dark:bg-blue-950">
        {{ member.name.slice(0, 1) }}
      </div>
      <h2 class="mt-4 font-semibold">{{ member.name }}</h2>
      <p class="text-sm text-slate-500">{{ member.email }}</p>
      <p class="mt-3 text-sm">{{ member.role }}</p>
    </article>
  </div>
</template>
