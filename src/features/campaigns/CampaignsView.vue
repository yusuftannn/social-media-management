<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, CalendarRange, Search, Sparkles, Target } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { ProjectStatus } from '@/types'

type CampaignFilter = ProjectStatus | 'All'

const workspace = useWorkspaceStore()
const search = ref('')
const statusFilter = ref<CampaignFilter>('All')

const statusLabels: Record<ProjectStatus, string> = {
  Active: 'Aktif',
  Pending: 'Bekliyor',
  Completed: 'Tamamlandı',
}

const statusClasses: Record<ProjectStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Completed: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const campaigns = computed(() =>
  workspace.projects.map((project) => {
    const customerName = customerMap.value.get(project.customerId) ?? 'Müşteri bulunamadı'
    const relatedContents = workspace.contents.filter(
      (content) => content.customerId === project.customerId,
    )
    const waitingApproval = relatedContents.filter(
      (content) => content.status === 'Waiting Approval',
    ).length

    const progress =
      project.status === 'Completed' ? 100 : project.status === 'Active' ? 72 : 52

    return {
      ...project,
      customerName,
      relatedContents,
      waitingApproval,
      progress,
      nextAction:
        waitingApproval > 0
          ? `${waitingApproval} içerik onay bekliyor.`
          : project.status === 'Pending'
            ? 'İçerik üretimi ve içerik planı hazırlanabilir.'
            : 'Yayın takvimi ve performans hedefleri kontrol edilmeli.',
    }
  }),
)

const filteredCampaigns = computed(() => {
  const term = search.value.trim().toLowerCase()

  return campaigns.value.filter((campaign) => {
    if (statusFilter.value !== 'All' && campaign.status !== statusFilter.value) {
      return false
    }

    if (!term) {
      return true
    }

    return [campaign.projectName, campaign.customerName, campaign.description]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
})

const activeCampaigns = computed(() =>
  campaigns.value.filter((campaign) => campaign.status === 'Active').length,
)
const pendingApproval = computed(() =>
  campaigns.value.reduce((count, campaign) => count + campaign.waitingApproval, 0),
)
</script>

<template>
  <PageHeader
    title="Kampanya Takibi"
    description="Müşteri bazlı kampanyalar, içerik akışı ve teslim planı tek ekranda görünür."
  />

  <div class="mb-5 grid gap-4 md:grid-cols-3">
    <div class="panel p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">Aktif kampanya</p>
        <Target class="h-4 w-4 text-emerald-600" />
      </div>
      <p class="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {{ activeCampaigns }}
      </p>
    </div>

    <div class="panel p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">Onay bekleyen</p>
        <Sparkles class="h-4 w-4 text-amber-600" />
      </div>
      <p class="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {{ pendingApproval }}
      </p>
    </div>

    <div class="panel p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500 dark:text-slate-400">Önümüzdeki teslim</p>
        <CalendarRange class="h-4 w-4 text-brand" />
      </div>
      <p class="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
        {{ campaigns.filter((campaign) => campaign.status !== 'Completed').length }}
      </p>
    </div>
  </div>

  <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <label class="relative w-full max-w-md">
      <Search
        class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
      <input
        v-model="search"
        class="input w-full pl-9"
        placeholder="Kampanya veya müşteri ara"
      />
    </label>

    <select v-model="statusFilter" class="input w-full md:w-48">
      <option value="All">Tüm durumlar</option>
      <option value="Active">Aktif</option>
      <option value="Pending">Bekliyor</option>
      <option value="Completed">Tamamlandı</option>
    </select>
  </div>

  <div v-if="filteredCampaigns.length" class="grid gap-4 xl:grid-cols-2">
    <RouterLink
      v-for="campaign in filteredCampaigns"
      :key="campaign.id"
      :to="`/campaigns/${campaign.id}`"
      class="panel flex h-full flex-col p-4 text-left transition hover:-translate-y-0.5 hover:border-brand/50"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">
            {{ campaign.customerName }}
          </p>
          <h2 class="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ campaign.projectName }}
          </h2>
        </div>
        <span
          class="rounded-full px-2 py-1 text-[10px] font-medium"
          :class="statusClasses[campaign.status]"
        >
          {{ statusLabels[campaign.status] }}
        </span>
      </div>

      <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
        {{ campaign.description }}
      </p>

      <div class="mt-4 space-y-3">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>İlerleme</span>
          <span>{{ campaign.progress }}%</span>
        </div>
        <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            class="h-full rounded-full bg-brand"
            :style="{ width: `${campaign.progress}%` }"
          />
        </div>
      </div>

      <div class="mt-4 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{{ campaign.relatedContents.length }} içerik</span>
        <span>{{ campaign.waitingApproval }} onay bekliyor</span>
      </div>

      <div class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        {{ campaign.nextAction }}
      </div>

      <div class="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand">
        Kampanya detayları
        <ArrowRight class="h-4 w-4" />
      </div>
    </RouterLink>
  </div>

  <div
    v-else
    class="panel p-8 text-center text-sm text-slate-500 dark:text-slate-400"
  >
    Seçilen filtreye uygun kampanya bulunamadı.
  </div>
</template>
