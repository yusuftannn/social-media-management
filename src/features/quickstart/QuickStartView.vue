<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CheckCircle2, Clock3, Sparkles, Target } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const activeProjects = computed(
  () => workspace.projects.filter((project) => project.status === 'Active').length,
)

const waitingApprovals = computed(
  () => workspace.contents.filter((content) => content.status === 'Waiting Approval').length,
)

const dueSoon = computed(() => {
  const today = new Date()

  return workspace.tasks.filter((task) => {
    if (task.status === 'Done') return false

    const due = new Date(task.dueDate)
    if (Number.isNaN(due.getTime())) return false

    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 && diff <= 3
  }).length
})

const contentThisWeek = computed(() => {
  const now = new Date()
  const weekFromNow = new Date(now)
  weekFromNow.setDate(now.getDate() + 7)

  return workspace.contents.filter((content) => {
    const date = new Date(content.publishDate)
    return !Number.isNaN(date.getTime()) && date >= now && date <= weekFromNow
  }).length
})

const checklist = computed(() => [
  {
    label: 'Müşteri profili ve kampanya hedefleri netleştirildi mi?',
    done: workspace.customers.length > 0,
    detail: `${workspace.customers.length} müşteri kaydı mevcut.`,
  },
  {
    label: 'Onay bekleyen içerikler kontrol edildi mi?',
    done: waitingApprovals.value === 0,
    detail: `${waitingApprovals.value} içerik onay bekliyor.`,
  },
  {
    label: 'Haftalık yayın takvimi hazır mı?',
    done: contentThisWeek.value > 0,
    detail: `${contentThisWeek.value} içerik bu hafta planlanmış.`,
  },
  {
    label: 'Ekip yükü ve teslim tarihleri denetlendi mi?',
    done: dueSoon.value === 0,
    detail: `${dueSoon.value} görev yakın teslim.`,
  },
])

const recommendedActions = computed(() => [
  {
    title: 'Onay kuyruğunu temizle',
    value: `${waitingApprovals.value} içerik`,
    tone: 'amber',
  },
  {
    title: 'Aktif kampanyaları kontrol et',
    value: `${activeProjects.value} proje`,
    tone: 'emerald',
  },
  {
    title: 'Bu hafta yayın planı',
    value: `${contentThisWeek.value} içerik`,
    tone: 'blue',
  },
])

const topClients = computed(() =>
  workspace.customers.slice(0, 3).map((customer) => ({
    ...customer,
    projectCount: workspace.projects.filter((project) => project.customerId === customer.id).length,
  })),
)
</script>

<template>
  <PageHeader
    title="Hızlı Başlangıç"
    description="Ajans operasyonunu özetleyen haftalık görünüm ve en kritik sonraki adımlar."
  />

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Aktif proje" :value="activeProjects" tone="green" />
    <StatCard label="Onay bekleyen" :value="waitingApprovals" tone="orange" />
    <StatCard label="Bu hafta yayın" :value="contentThisWeek" tone="blue" />
    <StatCard label="Yakın teslim" :value="dueSoon" tone="slate" />
  </div>

  <section class="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
    <div class="panel p-5">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Kontrol listesi</p>
          <h2 class="mt-2 text-lg font-semibold">Operasyon akışı</h2>
        </div>
        <Sparkles class="h-5 w-5 text-brand" />
      </div>

      <div class="space-y-3">
        <div
          v-for="item in checklist"
          :key="item.label"
          class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70"
        >
          <span
            class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full"
            :class="item.done ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'"
          >
            <CheckCircle2 v-if="item.done" class="h-4 w-4" />
            <Clock3 v-else class="h-4 w-4" />
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ item.label }}</p>
            <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ item.detail }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="panel p-5">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Öncelikli aksiyon</p>
          <h2 class="mt-2 text-lg font-semibold">Sonraki adımlar</h2>
        </div>
        <Target class="h-5 w-5 text-emerald-600" />
      </div>

      <div class="space-y-3">
        <div
          v-for="action in recommendedActions"
          :key="action.title"
          class="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-medium text-slate-800 dark:text-slate-100">{{ action.title }}</p>
            <span
              class="rounded-full px-2 py-1 text-[10px] font-medium"
              :class="{
                'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300': action.tone === 'amber',
                'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300': action.tone === 'emerald',
                'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300': action.tone === 'blue',
              }"
            >
              {{ action.value }}
            </span>
          </div>
          <div class="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand">
            İş akışını aç
            <ArrowRight class="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-6 panel p-5">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Müşteri odak</p>
        <h2 class="mt-2 text-lg font-semibold">En aktif müşteriler</h2>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div
        v-for="client in topClients"
        :key="client.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
      >
        <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Müşteri</p>
        <h3 class="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          {{ client.companyName }}
        </h3>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ client.contactName }}</p>
        <div class="mt-4 flex items-center justify-between text-sm">
          <span class="text-slate-500 dark:text-slate-400">Aktif proje</span>
          <span class="font-semibold text-slate-900 dark:text-slate-100">{{ client.projectCount }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
