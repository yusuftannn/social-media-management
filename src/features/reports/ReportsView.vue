<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { ContentPlatform, ContentStatus, ProjectStatus, TaskStatus } from '@/types'

const workspace = useWorkspaceStore()

const chartBase = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  dataLabels: { enabled: false },
  legend: {
    position: 'bottom',
    fontSize: '12px',
    markers: { width: 8, height: 8, radius: 8 },
  },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
  tooltip: { theme: 'light' },
}

const platformLabels: ContentPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
const taskStatusLabels: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done']
const projectStatusLabels: ProjectStatus[] = ['Active', 'Pending', 'Completed']
const contentStatusLabels: ContentStatus[] = ['Draft', 'Waiting Approval', 'Approved', 'Published']

const countBy = <T extends string>(items: T[], labels: T[]) => labels.map((label) => items.filter((item) => item === label).length)

const contentByPlatform = computed(() => countBy(workspace.contents.map((content) => content.platform), platformLabels))
const taskByStatus = computed(() => countBy(workspace.tasks.map((task) => task.status), taskStatusLabels))
const projectByStatus = computed(() => countBy(workspace.projects.map((project) => project.status), projectStatusLabels))
const contentByStatus = computed(() => countBy(workspace.contents.map((content) => content.status), contentStatusLabels))

const totalContents = computed(() => workspace.contents.length)
const publishedContents = computed(() => workspace.contents.filter((content) => content.status === 'Published').length)
const approvalWaiting = computed(() => workspace.contents.filter((content) => content.status === 'Waiting Approval').length)
const completedTasks = computed(() => workspace.tasks.filter((task) => task.status === 'Done').length)
const openTasks = computed(() => workspace.tasks.filter((task) => task.status !== 'Done').length)
const activeProjects = computed(() => workspace.projects.filter((project) => project.status === 'Active').length)
const completedProjects = computed(() => workspace.projects.filter((project) => project.status === 'Completed').length)

const taskCompletionRate = computed(() => {
  if (!workspace.tasks.length) return 0
  return Math.round((completedTasks.value / workspace.tasks.length) * 100)
})

const contentPublishRate = computed(() => {
  if (!totalContents.value) return 0
  return Math.round((publishedContents.value / totalContents.value) * 100)
})

const contentPlatformOptions = computed(() => ({
  ...chartBase,
  colors: ['#2563eb', '#10b981', '#f97316', '#ef4444', '#64748b'],
  plotOptions: { bar: { borderRadius: 5, columnWidth: '46%' } },
  xaxis: { categories: platformLabels },
  yaxis: { min: 0, tickAmount: 4 },
}))

const taskStatusOptions = computed(() => ({
  ...chartBase,
  colors: ['#94a3b8', '#2563eb', '#f97316', '#10b981'],
  labels: ['Yapılacak', 'Devam Ediyor', 'İnceleme', 'Tamamlandı'],
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Tamamlama',
            formatter: () => `${taskCompletionRate.value}%`,
          },
        },
      },
    },
  },
}))

const projectStatusOptions = computed(() => ({
  ...chartBase,
  colors: ['#2563eb', '#f97316', '#10b981'],
  plotOptions: { bar: { borderRadius: 5, horizontal: true, barHeight: '48%' } },
  xaxis: { categories: ['Aktif', 'Bekleyen', 'Tamamlanan'], min: 0, tickAmount: 4 },
}))

const contentStatusOptions = computed(() => ({
  ...chartBase,
  colors: ['#94a3b8', '#f97316', '#2563eb', '#10b981'],
  stroke: { curve: 'smooth', width: 3 },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 0.2, opacityFrom: 0.35, opacityTo: 0.05 },
  },
  xaxis: { categories: ['Taslak', 'Onay Bekliyor', 'Onaylandı', 'Yayınlandı'] },
  yaxis: { min: 0, tickAmount: 4 },
}))
</script>

<template>
  <PageHeader title="Raporlar" description="Müşteri, içerik, görev ve proje performansının güncel özeti." />

  <div class="grid gap-4 md:grid-cols-2">
    <section class="panel p-5">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-base font-semibold">İçerik Dağılımı</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Platformlara göre planlanan içerikler</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-right">
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Toplam</p>
            <p class="text-lg font-semibold">{{ totalContents }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Yayın oranı</p>
            <p class="text-lg font-semibold">{{ contentPublishRate }}%</p>
          </div>
        </div>
      </div>
      <apexchart
        height="260"
        type="bar"
        :options="contentPlatformOptions"
        :series="[{ name: 'İçerik', data: contentByPlatform }]"
      />
    </section>

    <section class="panel p-5">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-base font-semibold">Görev Durumu</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Ekip iş akışındaki açık ve tamamlanan işler</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-right">
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Açık</p>
            <p class="text-lg font-semibold">{{ openTasks }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Tamamlanan</p>
            <p class="text-lg font-semibold">{{ completedTasks }}</p>
          </div>
        </div>
      </div>
      <apexchart height="260" type="donut" :options="taskStatusOptions" :series="taskByStatus" />
    </section>

    <section class="panel p-5">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-base font-semibold">Proje Sağlığı</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Aktif, bekleyen ve tamamlanan projeler</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-right">
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Aktif</p>
            <p class="text-lg font-semibold">{{ activeProjects }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Biten</p>
            <p class="text-lg font-semibold">{{ completedProjects }}</p>
          </div>
        </div>
      </div>
      <apexchart
        height="260"
        type="bar"
        :options="projectStatusOptions"
        :series="[{ name: 'Proje', data: projectByStatus }]"
      />
    </section>

    <section class="panel p-5">
      <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-base font-semibold">İçerik Onay Akışı</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Taslak aşamasından yayına kadar durum görünümü</p>
        </div>
        <div class="grid grid-cols-2 gap-2 text-right">
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Onay bekleyen</p>
            <p class="text-lg font-semibold">{{ approvalWaiting }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-500 dark:text-slate-400">Yayında</p>
            <p class="text-lg font-semibold">{{ publishedContents }}</p>
          </div>
        </div>
      </div>
      <apexchart
        height="260"
        type="area"
        :options="contentStatusOptions"
        :series="[{ name: 'İçerik', data: contentByStatus }]"
      />
    </section>
  </div>
</template>
