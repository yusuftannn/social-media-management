<script setup lang="ts">
import { computed } from 'vue'
import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Target,
} from '@lucide/vue'
import { RouterLink, useRoute } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
const route = useRoute()

const campaignId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id

const campaign = computed(
  () => workspace.projects.find((project) => project.id === campaignId),
)

const customerName = computed(
  () =>
    workspace.customers.find((customer) => customer.id === campaign.value?.customerId)?.companyName ??
    'Müşteri',
)

const relatedContents = computed(() =>
  workspace.contents.filter((content) => content.customerId === campaign.value?.customerId),
)

const priorityTasks = computed(() =>
  [...workspace.tasks]
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
    .slice(0, 4),
)

const progress = computed(() => {
  if (!campaign.value) return 0

  if (campaign.value.status === 'Completed') return 100
  if (campaign.value.status === 'Active') return 72
  return 52
})

const milestones = computed(() => {
  if (!campaign.value) {
    return []
  }

  return [
    { label: 'Başlangıç', date: campaign.value.startDate, done: true },
    { label: 'İçerik üretimi', date: campaign.value.endDate, done: progress.value >= 50 },
    { label: 'Onay ve yayın', date: campaign.value.endDate, done: progress.value >= 80 },
  ]
})

const statusLabel = computed(() => {
  if (!campaign.value) return 'Bilinmeyen'

  return {
    Active: 'Aktif',
    Pending: 'Bekliyor',
    Completed: 'Tamamlandı',
  }[campaign.value.status]
})

const approvalCount = computed(
  () => relatedContents.value.filter((content) => content.status === 'Waiting Approval').length,
)
</script>

<template>
  <div v-if="!campaign" class="panel p-8 text-center text-sm text-slate-500 dark:text-slate-400">
    Kampanya bulunamadı.
  </div>

  <template v-else>
    <PageHeader
      :title="campaign.projectName"
      :description="`${customerName} müşterisi için kampanya görünümü.`"
    >
      <RouterLink to="/campaigns" class="btn-muted">
        <ArrowLeft class="h-4 w-4" />
        Kampanyalara dön
      </RouterLink>
    </PageHeader>

    <div class="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <section class="panel p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Kampanya durumu</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {{ statusLabel }}
            </h2>
          </div>
          <span class="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {{ progress }}% ilerleme
          </span>
        </div>

        <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {{ campaign.description }}
        </p>

        <div class="mt-5 space-y-3">
          <div class="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>Toplam ilerleme</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800">
            <div class="h-full rounded-full bg-brand" :style="{ width: `${progress}%` }" />
          </div>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs text-slate-500 dark:text-slate-400">İçerik</p>
            <p class="mt-2 text-xl font-semibold">{{ relatedContents.length }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs text-slate-500 dark:text-slate-400">Onay bekleyen</p>
            <p class="mt-2 text-xl font-semibold">{{ approvalCount }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs text-slate-500 dark:text-slate-400">Teslim</p>
            <p class="mt-2 text-xl font-semibold">
              {{ new Date(campaign.endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) }}
            </p>
          </div>
        </div>
      </section>

      <aside class="panel p-5">
        <div class="mb-4 flex items-center gap-2">
          <Target class="h-5 w-5 text-brand" />
          <h3 class="text-base font-semibold">Hızlı aksiyon</h3>
        </div>

        <div class="space-y-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Öncelik</p>
            <p class="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              {{ approvalCount > 0 ? `${approvalCount} içerik onay sürecinde.` : 'Yayın listesi hazır.' }}
            </p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Sonraki adım</p>
            <p class="mt-2 text-sm font-medium text-slate-800 dark:text-slate-100">
              {{ campaign.status === 'Pending' ? 'İçerik üretimi için ekip ataması yapın.' : 'Yayının devamı için performans takibini başlatın.' }}
            </p>
          </div>
        </div>
      </aside>
    </div>

    <section class="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <div class="panel p-5">
        <div class="mb-4 flex items-center gap-2">
          <CalendarCheck class="h-5 w-5 text-brand" />
          <h3 class="text-base font-semibold">Kampanya takvimi</h3>
        </div>

        <div class="space-y-3">
          <div
            v-for="milestone in milestones"
            :key="milestone.label"
            class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="mt-0.5 rounded-full p-1.5" :class="milestone.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'">
              <CheckCircle2 v-if="milestone.done" class="h-3.5 w-3.5" />
              <CircleDashed v-else class="h-3.5 w-3.5" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ milestone.label }}</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ new Date(milestone.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="panel p-5">
        <div class="mb-4 flex items-center gap-2">
          <Clock3 class="h-5 w-5 text-brand" />
          <h3 class="text-base font-semibold">İlgili görevler</h3>
        </div>

        <div class="space-y-3">
          <div
            v-for="task in priorityTasks"
            :key="task.id"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
          >
            <div class="flex items-center justify-between gap-3">
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ task.title }}</p>
              <span class="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                {{ task.priority }}
              </span>
            </div>
            <div class="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>{{ task.assignedTo }}</span>
              <span>{{ new Date(task.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
</template>
