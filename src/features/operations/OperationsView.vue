<script setup lang="ts">
import { computed } from 'vue'
import { Activity, AlertTriangle, CircleDashed, UserRound } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()

const operationOverview = computed(() => [
  {
    label: 'Başarısız teslim',
    value: workspace.tasks.filter((task) => task.status === 'Review').length,
    tone: 'amber',
  },
  {
    label: 'Açık görev',
    value: workspace.tasks.filter((task) => task.status !== 'Done').length,
    tone: 'blue',
  },
  {
    label: 'Bekleyen onay',
    value: workspace.contents.filter((content) => content.status === 'Waiting Approval').length,
    tone: 'orange',
  },
])

const workload = computed(() =>
  workspace.team.map((member) => ({
    ...member,
    activeTasks: workspace.tasks.filter((task) => task.assignedTo === member.name).length,
  })),
)

const bottlenecks = computed(() =>
  workspace.contents
    .filter((content) => content.status !== 'Published')
    .slice(0, 4)
    .map((content) => ({
      title: content.title,
      platform: content.platform,
      status: content.status,
      due: content.publishDate,
    })),
)
</script>

<template>
  <PageHeader
    title="Operasyon Merkezi"
    description="Görev yükü, onay kuyrukları ve teslim darboğazlarını tek ekranda izleyin."
  />

  <div class="mb-6 grid gap-4 md:grid-cols-3">
    <div
      v-for="item in operationOverview"
      :key="item.label"
      class="panel p-4"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.label }}</p>
        <Activity class="h-4 w-4 text-brand" />
      </div>
      <p class="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{{ item.value }}</p>
    </div>
  </div>

  <div class="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
    <section class="panel p-5">
      <div class="mb-4 flex items-center gap-3">
        <UserRound class="h-5 w-5 text-brand" />
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Ekip yükü</p>
          <h2 class="mt-1 text-lg font-semibold">Kişi bazlı iş yoğunluğu</h2>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="person in workload"
          :key="person.id"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-sm font-medium text-slate-900 dark:text-slate-100">{{ person.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">{{ person.role }}</p>
            </div>
            <span class="rounded-full bg-brand/10 px-2 py-1 text-[10px] font-medium text-brand">
              {{ person.activeTasks }} görev
            </span>
          </div>
          <div class="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-brand"
              :style="{ width: `${Math.min(person.activeTasks * 25, 100)}%` }"
            />
          </div>
        </div>
      </div>
    </section>

    <aside class="panel p-5">
      <div class="mb-4 flex items-center gap-3">
        <AlertTriangle class="h-5 w-5 text-amber-500" />
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Darboğaz</p>
          <h2 class="mt-1 text-lg font-semibold">Gönderim takip listesi</h2>
        </div>
      </div>

      <div class="space-y-3">
        <div
          v-for="item in bottlenecks"
          :key="item.title"
          class="rounded-xl border border-dashed border-slate-200 p-3 dark:border-slate-700"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ item.title }}</p>
            <span class="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              {{ item.status }}
            </span>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-1"><CircleDashed class="h-3.5 w-3.5" /> {{ item.platform }}</span>
            <span>{{ item.due }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
