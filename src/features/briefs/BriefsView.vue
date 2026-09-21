<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpRight, Bot, CalendarClock, Sparkles } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const briefs = computed(() =>
  workspace.projects.slice(0, 4).map((project, index) => {
    const customer = customerMap.value.get(project.customerId) ?? 'Müşteri'
    const platform = ['Instagram', 'LinkedIn', 'TikTok', 'Facebook'][index % 4]
    const objectiveMap = {
      Instagram: 'Dönüşüm odaklı kısa video serisi oluştur.',
      LinkedIn: 'Kurumsal fikir liderliği ve uzman görünürlüğü artır.',
      TikTok: 'Trend uyumlu, yüksek etkileşimli içerik üret.',
      Facebook: 'Topluluk etkileşimini artıran canlı takip sonrası içerik planla.',
    }

    return {
      id: project.id,
      title: `${project.projectName} İçerik Briefi`,
      customer,
      platform,
      objective: objectiveMap[platform as keyof typeof objectiveMap],
      audience: index % 2 === 0 ? 'Genç yetişkin hedef kitle' : 'B2B karar vericiler',
      angle: index % 2 === 0 ? 'Yaratıcı ve özgün hikâye anlatımı' : 'Değer odaklı uzman bakış açısı',
      dueDate: project.endDate,
    }
  }),
)

const inspiration = computed(() => [
  'Kampanya başlığı daha net ve CTA odaklı olmalı.',
  'Reels ve karusel kombinasyonu ile tek bir fikir çoklu formatta kullanılabilir.',
  'Müşteri geri bildirimleri için 3 farklı başlık versiyonu hazırla.',
])
</script>

<template>
  <PageHeader
    title="İçerik Briefleri"
    description="Her kampanya için hızlı, uygulanabilir içerik yönlendirmeleri ve yaratıcı öneriler oluşturun."
  >
    <button class="btn-primary" type="button">
      <Bot class="h-4 w-4" />
      AI brief üret
    </button>
  </PageHeader>

  <div class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
    <section class="space-y-4">
      <div
        v-for="brief in briefs"
        :key="brief.id"
        class="panel p-5"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-400">{{ brief.customer }}</p>
            <h2 class="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{{ brief.title }}</h2>
          </div>
          <span class="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-medium text-brand dark:bg-blue-950">
            {{ brief.platform }}
          </span>
        </div>

        <div class="mt-4 grid gap-3 md:grid-cols-2">
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.14em] text-slate-400">Amaç</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ brief.objective }}</p>
          </div>
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.14em] text-slate-400">Hedef kitle</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ brief.audience }}</p>
          </div>
        </div>

        <div class="mt-4 rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
          <span class="font-medium text-slate-900 dark:text-slate-100">Açı:</span> {{ brief.angle }}
        </div>

        <div class="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span class="inline-flex items-center gap-2">
            <CalendarClock class="h-4 w-4" />
            {{ brief.dueDate }}
          </span>
          <button class="inline-flex items-center gap-2 font-medium text-brand" type="button">
            Briefi aç
            <ArrowUpRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>

    <aside class="space-y-4">
      <section class="panel p-5">
        <div class="mb-4 flex items-center gap-3">
          <Sparkles class="h-5 w-5 text-brand" />
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Yaratıcı öneri</p>
            <h2 class="mt-1 text-lg font-semibold">Yapılacak içerik fikri</h2>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="(item, index) in inspiration"
            :key="item"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <span class="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-white">
              {{ index + 1 }}
            </span>
            {{ item }}
          </div>
        </div>
      </section>

      <section class="panel p-5">
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Özet</p>
        <h2 class="mt-2 text-lg font-semibold">Brief üretim hızı</h2>
        <div class="mt-4 space-y-4">
          <div>
            <div class="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Başlık olarak hazır</span>
              <span>82%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div class="h-full w-[82%] rounded-full bg-brand" />
            </div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>Platform uyumu</span>
              <span>91%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div class="h-full w-[91%] rounded-full bg-emerald-500" />
            </div>
          </div>
          <div>
            <div class="mb-2 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>CTA netliği</span>
              <span>76%</span>
            </div>
            <div class="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
              <div class="h-full w-[76%] rounded-full bg-amber-500" />
            </div>
          </div>
        </div>
      </section>
    </aside>
  </div>
</template>
