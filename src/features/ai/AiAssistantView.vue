<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRight, CheckCircle2, Clipboard, Save, Sparkles, Wand2 } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useToast } from '@/composables/useToast'
import { aiService } from '@/services/aiService'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { ContentPlatform } from '@/types'

const workspace = useWorkspaceStore()
const toast = useToast()

const topic = ref('Yaz sezonu lansmanı')
const platform = ref<ContentPlatform>('Instagram')
const contentType = ref('Reels')
const tone = ref('Profesyonel')
const goal = ref('Farkındalık')
const output = ref<Awaited<ReturnType<typeof aiService.generateContentSuggestions>> | null>(null)
const running = ref(false)
const error = ref('')

const platforms: ContentPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
const contentTypes = ['Reels', 'Carousel', 'Post', 'Story', 'Video']
const tones = ['Profesyonel', 'Samimi', 'Premium', 'Eğitici']
const goals = ['Farkındalık', 'Etkileşim', 'Satış', 'Müşteri bağlılığı']

const customerSummary = computed(() =>
  workspace.customers.length > 0 ? `${workspace.customers.length} müşteri kaydı hazır.` : 'Müşteri kaydı eklenmemiş.',
)

const generateSuggestion = async () => {
  if (!topic.value.trim()) {
    error.value = 'Önce konu ya da kampanya başlığı girin.'
    return
  }

  running.value = true
  error.value = ''

  try {
    output.value = await aiService.generateContentSuggestions(
      topic.value,
      platform.value,
      contentType.value,
      tone.value,
      goal.value,
    )
  } catch {
    error.value = 'İçerik önerisi üretilemedi. Lütfen tekrar deneyin.'
  } finally {
    running.value = false
  }
}

const copyOutput = async () => {
  if (!output.value) return

  try {
    const text = [
      `Başlık: ${output.value.title}`,
      ``,
      `Açıklama: ${output.value.description}`,
      `Kanca: ${output.value.hook}`,
      `CTA: ${output.value.cta}`,
      `Hashtag: ${output.value.hashtags.join(' ')}`,
      `Yayın planı: ${output.value.postingPlan}`,
    ].join('\n')

    await navigator.clipboard.writeText(text)
    toast.success('AI önerisi panoya kopyalandı.')
  } catch {
    toast.error('AI önerisi panoya kopyalanamadı.')
  }
}

const saveAsDraft = async () => {
  if (!output.value) return

  const customerId = workspace.customers[0]?.id
  if (!customerId) {
    toast.error('Önce en az bir müşteri kaydı oluşturmanız gerekir.')
    return
  }

  try {
    await workspace.addContent({
      customerId,
      platform: platform.value,
      contentType: contentType.value,
      title: output.value.title,
      description: output.value.description,
      publishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'Draft',
      createdAt: new Date().toISOString(),
    })

    toast.success('Önerilen içerik taslak olarak kaydedildi.')
  } catch {
    toast.error('Taslak kaydedilemedi.')
  }
}
</script>

<template>
  <PageHeader
    title="AI İçerik Asistanı"
    description="Kısa zaman içinde yayınlanabilir içerik fikri, açılış cümlesi ve hashtag seti üretir."
  />

  <section class="panel p-5">
    <div class="mb-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div class="space-y-4">
        <label class="block space-y-1">
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Konu / kampanya başlığı</span>
          <input v-model="topic" class="input w-full" placeholder="Örn. Yaz sezonu kampanyası" />
        </label>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="space-y-1">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Platform</span>
            <select v-model="platform" class="input w-full">
              <option v-for="item in platforms" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">İçerik tipi</span>
            <select v-model="contentType" class="input w-full">
              <option v-for="item in contentTypes" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Ton</span>
            <select v-model="tone" class="input w-full">
              <option v-for="item in tones" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-200">Hedef</span>
            <select v-model="goal" class="input w-full">
              <option v-for="item in goals" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
        </div>
      </div>

      <div class="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 dark:border-brand/60 dark:bg-brand/10">
        <div class="flex items-center gap-2 text-brand">
          <Sparkles class="h-5 w-5" />
          <span class="text-sm font-semibold uppercase tracking-[0.2em]">AI hazır</span>
        </div>
        <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {{ customerSummary }}
        </p>
        <div class="mt-4 rounded-xl bg-white p-3 text-sm text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
          <p class="font-medium">Önerilen yayın akışı</p>
          <p class="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
            1. Görsel/teaser<br />
            2. Ana içerik yayın<br />
            3. Yorumlara dönüş + ölçüm
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button class="btn-primary" type="button" :disabled="running" @click="generateSuggestion">
        <Wand2 class="h-4 w-4" />
        {{ running ? 'Üretiliyor...' : 'İçerik üret' }}
      </button>
      <button v-if="output" class="btn-muted" type="button" @click="copyOutput">
        <Clipboard class="h-4 w-4" />
        Kopyala
      </button>
      <button v-if="output" class="btn-muted" type="button" @click="saveAsDraft">
        <Save class="h-4 w-4" />
        Taslağa kaydet
      </button>
    </div>

    <p v-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </section>

  <section v-if="output" class="mt-6 panel p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Önerilen içerik</p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{{ output.title }}</h2>
      </div>
      <span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand dark:bg-brand/20">
        {{ platform }} · {{ contentType }}
      </span>
    </div>

    <div class="grid gap-5 lg:grid-cols-2">
      <div class="space-y-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Açıklama</p>
          <p class="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{{ output.description }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Kanca</p>
          <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ output.hook }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">CTA</p>
          <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ output.cta }}</p>
        </div>

        <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
          <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Yayın planı</p>
          <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ output.postingPlan }}</p>
        </div>
      </div>
    </div>

    <div class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
      <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 class="h-4 w-4" />
        <span class="text-sm font-semibold">Hedef kitle</span>
      </div>
      <p class="mt-2 text-sm text-emerald-800 dark:text-emerald-200">{{ output.audience }}</p>
    </div>

    <div class="mt-5">
      <p class="text-xs uppercase tracking-[0.18em] text-slate-400">Hashtag önerisi</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <span
          v-for="tag in output.hashtags"
          :key="tag"
          class="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="mt-5 flex items-center gap-2 text-sm font-medium text-brand">
      İçeriği yayına hazırla
      <ArrowRight class="h-4 w-4" />
    </div>
  </section>
</template>
