<script setup lang="ts">
import { computed, ref } from 'vue'
import { AlertCircle, CalendarCheck, Clock, Lightbulb, Send } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { ContentPlatform, ContentStatus, SocialContent } from '@/types'

type ViewMode = 'week' | 'month'

const workspace = useWorkspaceStore()
const viewMode = ref<ViewMode>('week')

const statusLabels: Record<ContentStatus, string> = {
  Draft: 'Taslak',
  'Waiting Approval': 'Onay bekliyor',
  Approved: 'Onaylandı',
  Published: 'Yayında',
}

const statusClasses: Record<ContentStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Waiting Approval': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Published: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

const platformClasses: Record<ContentPlatform, string> = {
  Instagram: 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  Facebook: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  LinkedIn: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  TikTok: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  X: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
}

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const formatDay = (date: Date) =>
  new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(date)

const formatWeekday = (date: Date) =>
  new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(date)

const customerMap = computed(() => {
  return new Map(workspace.customers.map((customer) => [customer.id, customer.companyName]))
})

const customerName = (customerId: string) =>
  customerMap.value.get(customerId) ?? 'Müşteri bulunamadı'

const contentStats = computed(() => {
  const now = new Date()
  const today = toDateKey(now)
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const result = {
    overdue: [] as SocialContent[],
    waitingApproval: [] as SocialContent[],
    upcoming: [] as SocialContent[],
    publishedThisMonth: [] as SocialContent[],
  }

  for (const content of workspace.contents) {
    if (content.publishDate >= today) {
      result.upcoming.push(content)
    }

    if (content.publishDate < today && content.status !== 'Published') {
      result.overdue.push(content)
    }

    if (content.status === 'Waiting Approval') {
      result.waitingApproval.push(content)
    }

    if (content.status === 'Published' && content.publishDate.startsWith(month)) {
      result.publishedThisMonth.push(content)
    }
  }

  return result
})

const sortedContents = computed(() =>
  [...workspace.contents].sort((first, second) =>
    first.publishDate.localeCompare(second.publishDate),
  ),
)

const contentsByDate = computed(() => {
  const map = new Map<string, SocialContent[]>()

  for (const content of sortedContents.value) {
    const items = map.get(content.publishDate)

    if (items) {
      items.push(content)
    } else {
      map.set(content.publishDate, [content])
    }
  }

  return map
})

const upcomingContents = computed(() => contentStats.value.upcoming)

const overdueContents = computed(() => contentStats.value.overdue)

const waitingApproval = computed(() => contentStats.value.waitingApproval)

const publishedThisMonth = computed(() => contentStats.value.publishedThisMonth)

const plannerDays = computed(() => {
  const dayCount = viewMode.value === 'week' ? 7 : 30
  const today = new Date()

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)

    const key = toDateKey(date)

    return {
      key,
      day: formatDay(date),
      weekday: formatWeekday(date),
      items: contentsByDate.value.get(key) ?? [],
    }
  })
})

const platformBreakdown = computed(() => {
  const platforms: ContentPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']

  const total = workspace.contents.length || 1

  const counts: Record<ContentPlatform, number> = {
    Instagram: 0,
    Facebook: 0,
    LinkedIn: 0,
    TikTok: 0,
    X: 0,
  }

  for (const content of workspace.contents) {
    counts[content.platform]++
  }

  return platforms.map((platform) => ({
    platform,
    count: counts[platform],
    percent: Math.round((counts[platform] / total) * 100),
  }))
})

const bestNextAction = computed(() => {
  if (overdueContents.value.length > 0) {
    return `${overdueContents.value.length} geciken içerik için yayın tarihi veya durum güncellemesi gerekiyor.`
  }

  if (waitingApproval.value.length > 0) {
    return `${waitingApproval.value.length} içerik onay bekliyor. Müşteri onaylarını hızlandırmak iyi olur.`
  }

  if (upcomingContents.value.length < 4) {
    return 'Önümüzdeki günler seyrek görünüyor. İçerik havuzuna birkaç taslak eklenebilir.'
  }

  return 'Takvim dengeli görünüyor. Sıradaki odak performans raporlarından yeni fikir çıkarmak.'
})

const ideaPrompts = computed(() => [
  'En iyi performans alan posttan carousel devam serisi çıkar.',
  'Müşteri hikayesini Reels formatında kısa bir dönüşüm anlatısına çevir.',
  'Haftalık LinkedIn otorite paylaşımı için ekipten uzman görüşü al.',
  'Ay sonu kampanyası için üç aşamalı teaser planı hazırla.',
])

const emptyStateText = (items: SocialContent[]) =>
  items.length === 0 ? 'Planlı içerik yok' : `${items.length} içerik`
</script>

<template>
  <PageHeader
    title="Yayın Planlayıcı"
    description="Yaklaşan içerikleri, onay darboğazlarını ve platform yoğunluğunu tek ekranda takip edin."
  >
    <div
      class="inline-flex rounded-md border border-line bg-white p-1 dark:border-slate-800 dark:bg-slate-950"
    >
      <button
        class="rounded px-3 py-1.5 text-sm font-medium transition"
        :class="viewMode === 'week' ? 'bg-brand text-white' : 'text-slate-600 dark:text-slate-300'"
        type="button"
        @click="viewMode = 'week'"
      >
        7 gün
      </button>
      <button
        class="rounded px-3 py-1.5 text-sm font-medium transition"
        :class="viewMode === 'month' ? 'bg-brand text-white' : 'text-slate-600 dark:text-slate-300'"
        type="button"
        @click="viewMode = 'month'"
      >
        30 gün
      </button>
    </div>
  </PageHeader>

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Yaklaşan İçerik" :value="upcomingContents.length" tone="blue" />
    <StatCard label="Onay Bekleyen" :value="waitingApproval.length" tone="orange" />
    <StatCard label="Bu Ay Yayında" :value="publishedThisMonth.length" tone="green" />
    <StatCard label="Geciken İş" :value="overdueContents.length" tone="slate" />
  </div>

  <section class="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <div class="panel overflow-hidden">
      <div class="border-b border-line px-5 py-4 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <CalendarCheck class="h-5 w-5 text-brand" />
          <h2 class="font-semibold">Yayın akışı</h2>
        </div>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ viewMode === 'week' ? 'Önümüzdeki 7 gün' : 'Önümüzdeki 30 gün' }} için planlanan işler.
        </p>
      </div>

      <div v-if="workspace.loading" class="p-5 text-sm text-slate-500">Plan yükleniyor...</div>
      <div v-else class="divide-y divide-line dark:divide-slate-800">
        <article
          v-for="day in plannerDays"
          :key="day.key"
          class="grid gap-4 px-5 py-4 md:grid-cols-[7rem_minmax(0,1fr)]"
        >
          <div>
            <p class="text-sm font-semibold">{{ day.day }}</p>
            <p class="text-xs uppercase text-slate-500">{{ day.weekday }}</p>
            <p class="mt-2 text-xs text-slate-400">{{ emptyStateText(day.items) }}</p>
          </div>

          <div v-if="day.items.length" class="grid gap-3 lg:grid-cols-2">
            <article
              v-for="content in day.items"
              :key="content.id"
              class="rounded-lg border border-line p-4 dark:border-slate-800"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-medium text-brand">
                    {{ customerName(content.customerId) }}
                  </p>
                  <h3 class="mt-1 text-sm font-semibold">{{ content.title }}</h3>
                </div>
                <span
                  class="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
                  :class="statusClasses[content.status]"
                >
                  {{ statusLabels[content.status] }}
                </span>
              </div>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="platformClasses[content.platform]"
                >
                  {{ content.platform }}
                </span>
                <span
                  class="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  {{ content.contentType }}
                </span>
              </div>
            </article>
          </div>

          <div
            v-else
            class="rounded-lg border border-dashed border-line p-4 text-sm text-slate-400 dark:border-slate-800"
          >
            Bu gün için yayın planı boş.
          </div>
        </article>
      </div>
    </div>

    <aside class="space-y-4">
      <section class="panel p-5">
        <div class="flex items-center gap-2">
          <AlertCircle class="h-5 w-5 text-amber-500" />
          <h2 class="font-semibold">Sıradaki en iyi adım</h2>
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {{ bestNextAction }}
        </p>
      </section>

      <section class="panel p-5">
        <div class="flex items-center gap-2">
          <Send class="h-5 w-5 text-brand" />
          <h2 class="font-semibold">Platform yoğunluğu</h2>
        </div>
        <div class="mt-4 space-y-3">
          <div v-for="item in platformBreakdown" :key="item.platform">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span>{{ item.platform }}</span>
              <span class="text-slate-500">{{ item.count }}</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div class="h-2 rounded-full bg-brand" :style="{ width: `${item.percent}%` }" />
            </div>
          </div>
        </div>
      </section>

      <section class="panel p-5">
        <div class="flex items-center gap-2">
          <Lightbulb class="h-5 w-5 text-emerald-500" />
          <h2 class="font-semibold">Hızlı fikirler</h2>
        </div>
        <ul class="mt-4 space-y-3">
          <li
            v-for="idea in ideaPrompts"
            :key="idea"
            class="flex gap-3 text-sm text-slate-600 dark:text-slate-300"
          >
            <Clock class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{{ idea }}</span>
          </li>
        </ul>
      </section>
    </aside>
  </section>
</template>
