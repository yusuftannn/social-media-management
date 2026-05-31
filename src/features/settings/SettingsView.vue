<script setup lang="ts">
import PageHeader from '@/components/ui/PageHeader.vue'
import { useThemeStore } from '@/stores/themeStore'

const theme = useThemeStore()
</script>

<template>
  <PageHeader title="Ayarlar" description="Profil, şirket, tema ve bildirim tercihleri." />
  <div class="grid gap-4 lg:grid-cols-2">
    <section class="panel p-4">
      <h2 class="font-semibold">Profil Ayarları</h2>
      <div class="mt-4 grid gap-3">
        <input class="input" placeholder="Ad soyad" />
        <input class="input" placeholder="E-posta" />
      </div>
    </section>
    <section class="panel p-4">
      <h2 class="font-semibold">Tema Ayarları</h2>
      <label class="mt-4 flex items-center justify-between rounded-lg border border-line p-3 dark:border-slate-800">
        <span class="text-sm">Dark mode</span>
        <input type="checkbox" :checked="theme.isDark" @change="theme.toggleDark()" />
      </label>
    </section>
  </div>
</template>
