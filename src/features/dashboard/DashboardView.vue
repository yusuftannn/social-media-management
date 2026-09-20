<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Sparkles } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()

const statusLabels: Record<string, string> = {
  Draft: 'Taslak',
  'Waiting Approval': 'Onay bekliyor',
  Approved: 'Onaylandı',
  Published: 'Yayında',
}

const priorityClasses: Record<string, string> = {
  High: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
}

const completedTasks = computed(
  () => workspace.tasks.filter((task) => task.status === 'Done').length,
)
const monthFormatter = new Intl.DateTimeFormat('tr-TR', {
  month: 'short',
})
const parseDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const recentMonths = computed(() => {
  const today = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)

    return {
      key: monthKey(date),
      label: monthFormatter.format(date),
    }
  })
})

const countRecordsByMonth = <T,>(
  items: readonly T[],
  getDateValue: (item: T) => string | undefined,
) => {
  const counter = new Map<string, number>()

  items.forEach((item) => {
    const date = parseDate(getDateValue(item))

    if (!date) return

    const key = monthKey(date)

    counter.set(key, (counter.get(key) ?? 0) + 1)
  })

  return recentMonths.value.map(({ key }) => counter.get(key) ?? 0)
}

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const customerName = (customerId: string): string =>
  customerMap.value.get(customerId) ?? 'Müşteri bulunamadı'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })

const customerGrowthByMonth = computed(() =>
  countRecordsByMonth(workspace.customers, (customer) => customer.createdAt),
)

const contentProductionByMonth = computed(() =>
  countRecordsByMonth(workspace.contents, (content) => content.publishDate || content.createdAt),
)

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  colors: ['#2563eb', '#10b981'],
  dataLabels: { enabled: false },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 0.2, opacityFrom: 0.35, opacityTo: 0.05 },
  },
  grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
  legend: { position: 'bottom' },
  noData: { text: workspace.loading ? 'Veriler yükleniyor' : 'Grafik için veri yok' },
  stroke: { curve: 'smooth', width: 3 },
  tooltip: { theme: 'light' },
  xaxis: { categories: recentMonths.value.map((month) => month.label) },
  yaxis: { min: 0, tickAmount: 4 },
}))

const chartSeries = computed(() => [
  { name: 'Müşteri', data: customerGrowthByMonth.value },
  { name: 'İçerik', data: contentProductionByMonth.value },
])

const activeProjects = computed(() =>
  workspace.projects.reduce((count, project) => count + Number(project.status === 'Active'), 0),
)

const pendingTasks = computed(() =>
  workspace.tasks.reduce((count, task) => count + Number(task.status !== 'Done'), 0),
)

const approvalQueue = computed(
  () => workspace.contents.filter((content) => content.status === 'Waiting Approval').length,
)

const upcomingContents = computed(() =>
  [...workspace.contents]
    .filter((content) => content.status !== 'Published')
    .sort((first, second) => first.publishDate.localeCompare(second.publishDate))
    .slice(0, 3)
    .map((content) => ({
      ...content,
      customer: customerName(content.customerId),
      publishLabel: formatDate(content.publishDate),
    })),
)

const priorityTasks = computed(() =>
  [...workspace.tasks]
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
    .slice(0, 3),
)

const taskActionSummary = computed(() => {
  const today = new Date()

  return {
    dueSoon: workspace.tasks.filter((task) => {
      if (task.status === 'Done') return false

      const dueDate = new Date(task.dueDate)
      if (Number.isNaN(dueDate.getTime())) return false

      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays <= 3
    }).length,
    reviewQueue: workspace.tasks.filter((task) => task.status === 'Review').length,
    blocked: workspace.tasks.filter((task) => task.priority === 'High' && task.status !== 'Done').length,
  }
})

const recentActivity = computed(() => {
  const items = [
    ...workspace.customers.map((customer) => ({
      type: 'Müşteri',
      title: customer.companyName,
      date: customer.createdAt,
      path: '/customers',
    })),
    ...workspace.projects.map((project) => ({
      type: 'Proje',
      title: project.projectName,
      date: project.createdAt,
      path: '/projects',
    })),
    ...workspace.contents.map((content) => ({
      type: 'İçerik',
      title: content.title,
      date: content.createdAt,
      path: '/content',
    })),
    ...workspace.tasks.map((task) => ({
      type: 'Görev',
      title: task.title,
      date: task.createdAt,
      path: '/tasks',
    })),
  ]

  return [...items]
    .sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime())
    .slice(0, 5)
})

const campaignSnapshot = computed(() =>
  [...workspace.projects]
    .sort((first, second) => new Date(first.endDate).getTime() - new Date(second.endDate).getTime())
    .slice(0, 3)
    .map((project) => ({
      ...project,
      customer: customerName(project.customerId),
      progress: project.status === 'Completed' ? 100 : project.status === 'Active' ? 72 : 52,
    })),
)
</script>

<template>
  <PageHeader title="Dashboard" description="Ajans operasyonlarının güncel özeti." />

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Toplam Müşteri" :value="workspace.customers.length" tone="blue" />
    <StatCard label="Aktif Projeler" :value="activeProjects" tone="green" />
    <StatCard label="Bekleyen Görevler" :value="pendingTasks" tone="orange" />
    <StatCard label="Bu Ay Tamamlanan İşler" :value="completedTasks" tone="slate" />
  </div>

  <section class="mt-6 panel p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Kampanya akışı</p>
        <h2 class="mt-2 text-lg font-semibold">Yaklaşan teslim ve ilerleme</h2>
      </div>
      <RouterLink to="/campaigns" class="text-sm font-medium text-brand hover:text-blue-700">
        Tüm kampanyalar
      </RouterLink>
    </div>

    <div class="grid gap-3 lg:grid-cols-3">
      <div
        v-for="campaign in campaignSnapshot"
        :key="campaign.id"
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
      >
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-medium text-slate-900 dark:text-slate-100">
            {{ campaign.projectName }}
          </p>
          <span class="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {{ campaign.status }}
          </span>
        </div>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {{ campaign.customer }}
        </p>
        <div class="mt-3 space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>İlerleme</span>
            <span>{{ campaign.progress }}%</span>
          </div>
          <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
            <div class="h-full rounded-full bg-brand" :style="{ width: `${campaign.progress}%` }" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
    <div class="panel p-5">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Yönetici özeti
          </p>
          <h2 class="mt-2 text-lg font-semibold">Yaklaşan içerik ve teslim tarihleri</h2>
        </div>
        <RouterLink
          to="/content"
          class="inline-flex items-center gap-2 text-sm font-medium text-brand transition hover:text-blue-700"
        >
          Tüm görünüm
          <ArrowRight class="h-4 w-4" />
        </RouterLink>
      </div>

      <div class="space-y-3">
        <div
          v-for="content in upcomingContents"
          :key="content.id"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-medium text-slate-800 dark:text-slate-100">{{ content.title }}</p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {{ content.customer }} · {{ content.platform }} · {{ content.contentType }}
              </p>
            </div>
            <span
              class="rounded-full px-2 py-1 text-[10px] font-medium text-slate-700 dark:text-slate-200"
              :class="{
                'bg-slate-200 dark:bg-slate-700': content.status === 'Draft',
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300': content.status === 'Waiting Approval',
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300': content.status === 'Approved',
              }"
            >
              {{ statusLabels[content.status] }}
            </span>
          </div>

          <div class="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-1.5">
              <CalendarClock class="h-3.5 w-3.5" />
              {{ content.publishLabel }}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <Clock3 class="h-3.5 w-3.5" />
              {{ statusLabels[content.status] }}
            </span>
          </div>
        </div>

        <div
          v-if="upcomingContents.length === 0"
          class="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
        >
          Şu anda yaklaşan içerik bulunmuyor.
        </div>
      </div>
    </div>

    <div class="panel p-5">
      <div class="mb-5 flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Öncelik</p>
          <h2 class="mt-2 text-lg font-semibold">Öncelikli görevler</h2>
        </div>
        <RouterLink to="/tasks" class="text-sm font-medium text-brand hover:text-blue-700">
          Göster
        </RouterLink>
      </div>

      <div class="space-y-3">
        <div
          v-for="task in priorityTasks"
          :key="task.id"
          class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-medium text-slate-800 dark:text-slate-100">{{ task.title }}</p>
            <span
              class="rounded-full px-2 py-1 text-[10px] font-medium"
              :class="priorityClasses[task.priority]"
            >
              {{ task.priority }}
            </span>
          </div>

          <div class="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{{ task.assignedTo }}</span>
            <span>{{ formatDate(task.dueDate) }}</span>
          </div>
        </div>

        <div class="rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/40">
          <div class="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            <CheckCircle2 class="h-4 w-4" />
            Onay bekleyen içerik: {{ approvalQueue }}
          </div>
          <p class="mt-1 text-xs text-blue-700/80 dark:text-blue-300/80">
            Yöneticilerin onay sürecini hızlandırması önerilir.
          </p>
        </div>

        <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/70">
          <div class="flex items-center justify-between gap-2">
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Hızlı aksiyon</p>
            <RouterLink to="/tasks" class="text-[11px] font-medium text-brand">Göreve git</RouterLink>
          </div>

          <div class="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div class="rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
              <p class="text-base font-semibold text-slate-800 dark:text-slate-100">
                {{ taskActionSummary.dueSoon }}
              </p>
              <p class="text-slate-500 dark:text-slate-400">3 g içinde</p>
            </div>
            <div class="rounded-lg bg-amber-50 p-2 dark:bg-amber-950/40">
              <p class="text-base font-semibold text-amber-700 dark:text-amber-300">
                {{ taskActionSummary.reviewQueue }}
              </p>
              <p class="text-amber-700 dark:text-amber-300">İnceleme</p>
            </div>
            <div class="rounded-lg bg-rose-50 p-2 dark:bg-rose-950/40">
              <p class="text-base font-semibold text-rose-700 dark:text-rose-300">
                {{ taskActionSummary.blocked }}
              </p>
              <p class="text-rose-700 dark:text-rose-300">Yüksek öncelik</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
    <div class="panel p-4">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-base font-semibold">Büyüme ve üretim istatistikleri</h2>
        <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <Sparkles class="h-3.5 w-3.5" />
          Takip aktif
        </div>
      </div>
      <apexchart height="320" type="area" :options="chartOptions" :series="chartSeries" />
    </div>

    <div class="panel p-4">
      <div class="mb-4 flex items-center justify-between gap-2">
        <h2 class="text-base font-semibold">Son etkinlikler</h2>
        <RouterLink to="/reports" class="text-sm font-medium text-brand hover:text-blue-700">
          Tüm raporlar
        </RouterLink>
      </div>

      <div class="space-y-3">
        <div
          v-for="activity in recentActivity"
          :key="`${activity.type}-${activity.title}-${activity.date}`"
          class="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ activity.type }}</p>
            <p class="mt-1 font-medium text-slate-800 dark:text-slate-100">{{ activity.title }}</p>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ new Date(activity.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) }}
          </span>
        </div>

        <div
          v-if="recentActivity.length === 0"
          class="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400"
        >
          Henüz etkinlik kaydı yok.
        </div>
      </div>
    </div>
  </section>
</template>
