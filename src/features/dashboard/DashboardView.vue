<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
const completedTasks = computed(() => workspace.tasks.filter((task) => task.status === 'Done').length)
const chartOptions = {
  chart: { toolbar: { show: false } },
  colors: ['#2563eb', '#10b981'],
  xaxis: { categories: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'] },
}
const chartSeries = [
  { name: 'Müşteri', data: [4, 6, 7, 10, 12, 15] },
  { name: 'İçerik', data: [18, 24, 31, 40, 48, 56] },
]
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
