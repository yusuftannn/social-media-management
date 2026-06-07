<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()

const completedTasks = computed(() => workspace.tasks.filter((task) => task.status === 'Done').length)

const parseDate = (value?: string) => {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const recentMonths = computed(() => {
  const today = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1)

    return {
      key: monthKey(date),
      label: new Intl.DateTimeFormat('tr-TR', { month: 'short' }).format(date),
    }
  })
})

const countRecordsByMonth = <T>(items: T[], getDateValue: (item: T) => string | undefined) =>
  recentMonths.value.map(({ key }) => {
    return items.filter((item) => {
      const date = parseDate(getDateValue(item))
      return date ? monthKey(date) === key : false
    }).length
  })

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
</script>

<template>
  <PageHeader title="Dashboard" description="Ajans operasyonlarının güncel özeti." />
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Toplam Müşteri" :value="workspace.customers.length" tone="blue" />
    <StatCard label="Aktif Projeler" :value="workspace.projects.filter((p) => p.status === 'Active').length" tone="green" />
    <StatCard label="Bekleyen Görevler" :value="workspace.tasks.filter((t) => t.status !== 'Done').length" tone="orange" />
    <StatCard label="Bu Ay Tamamlanan İşler" :value="completedTasks" tone="slate" />
  </div>
  <section class="panel mt-6 p-4">
    <h2 class="mb-4 text-base font-semibold">Büyüme ve üretim istatistikleri</h2>
    <apexchart height="320" type="area" :options="chartOptions" :series="chartSeries" />
  </section>
</template>
