<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'

const options = {
  chart: { toolbar: { show: false } },
  colors: ['#2563eb', '#10b981', '#f97316'],
  xaxis: { categories: ['Müşteri', 'İçerik', 'Görev', 'Takım'] },
}
const series = [{ name: 'Performans', data: [82, 74, 91, 68] }]
</script>

<template>
  <PageHeader title="Raporlar" description="Müşteri, içerik, görev ve takım performans raporları." />
  <section class="panel p-4">
    <apexchart height="340" type="bar" :options="options" :series="series" />
  </section>
</template>
