<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Copy,
  Sparkles,
  Target,
  Users,
} from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useToast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
const toast = useToast()

const selectedProjectId = ref('')
const selectedPlatform = ref('Instagram')
const editorialTone = ref('Profesyonel')
const selectedGoal = ref('Farkındalık')

const platformOptions = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
const toneOptions = ['Profesyonel', 'Samimi', 'Premium', 'Eğitici']
const goalOptions = ['Farkındalık', 'Etkileşim', 'Satış', 'Müşteri bağlılığı']

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)

const projectOptions = computed(() =>
  workspace.projects.map((project) => ({
    ...project,
    customerName: customerMap.value.get(project.customerId) ?? 'Müşteri bulunamadı',
  })),
)

const selectedProject = computed(
  () =>
    projectOptions.value.find((project) => project.id === selectedProjectId.value) ??
    projectOptions.value[0],
)

const briefSummary = computed(() => {
  if (!selectedProject.value) {
    return null
  }

  const project = selectedProject.value
  const platform = selectedPlatform.value
  const tone = editorialTone.value
  const goal = selectedGoal.value

  return {
    title: `${project.projectName} | ${platform} içerik briefi`,
    customer: project.customerName,
    audience:
      platform === 'LinkedIn'
        ? 'B2B karar vericiler ve sektör liderleri'
        : 'Marka bilinirliği yüksek, aktif ve etkileşim odaklı hedef kitle',
    objective:
      goal === 'Satış'
        ? 'İlgi çeken mesajla ürün veya hizmete yönlendirme ve dönüşüm yaratma.'
        : goal === 'Etkileşim'
          ? 'Yorum, paylaşım ve takipçi katılımını artırma.'
          : goal === 'Müşteri bağlılığı'
            ? 'Müşteri sadakatini ve tekrar etkileşimi artırma.'
            : 'Marka farkındalığını ve görünürlüğünü artırma.',
    angle:
      tone === 'Premium'
        ? 'Lüks, güven ve değer odaklı görsel anlatım'
        : tone === 'Samimi'
          ? 'Yatırım gerektirmeyen, gündelik ve güvenilir anlatım'
          : tone === 'Eğitici'
            ? 'Pratik bilgi ve çözüm odaklı anlatım'
            : 'Net, profesyonel ve sonuç odaklı yaklaşım',
    hook:
      `${project.projectName} için izleyicinin dikkatini ilk 3 saniyede çeken vurucu başlık.`,
    cta:
      platform === 'Instagram'
        ? '“Yorumlara bu fikir için fikirlerinizi yazın.” çağrısı kullanın.'
        : platform === 'LinkedIn'
          ? '“Bu konuda deneyimlerinizi paylaşın.” diyerek profesyonel etkileşim artırın.'
          : '“Ben de denemek isterim” çağrısıyla etkileşimi teşvik edin.',
    deliverables: [
      'Ana içerik metni',
      'Görsel kompozisyon önerisi',
      'CTA ve yorum tetikleyicisi',
      'Paylaşım sonrası takip planı',
    ],
    timeline: [
      '1. Teaser görsel hazırlığı',
      '2. Ana içerik yayın ve yanıt planı',
      '3. Performans ve yorum analizi',
    ],
  }
})

const briefCards = computed(() => [
  { label: 'Aktif proje', value: String(workspace.projects.length), icon: Target },
  { label: 'Müşteri sayısı', value: String(workspace.customers.length), icon: Users },
  { label: 'Yayın planı', value: String(Math.max(workspace.contents.length, 1)), icon: CalendarClock },
])

const copyBrief = async () => {
  if (!briefSummary.value) {
    toast.error('Önce bir proje seçin.')
    return
  }

  const text = [
    `Başlık: ${briefSummary.value.title}`,
    `Müşteri: ${briefSummary.value.customer}`,
    `Hedef kitle: ${briefSummary.value.audience}`,
    `Amaç: ${briefSummary.value.objective}`,
    `Açı: ${briefSummary.value.angle}`,
    `Kanca: ${briefSummary.value.hook}`,
    `CTA: ${briefSummary.value.cta}`,
    `Teslimler: ${briefSummary.value.deliverables.join(' • ')}`,
    `Yayın akışı: ${briefSummary.value.timeline.join(' → ')}`,
  ].join('\n')

  try {
    await navigator.clipboard.writeText(text)
    toast.success('İçerik briefi panoya kopyalandı.')
  } catch {
    toast.error('Brief kopyalanamadı.')
  }
}

if (projectOptions.value.length && !selectedProjectId.value) {
  selectedProjectId.value = projectOptions.value[0].id
}
</script>

<template>
  <PageHeader
    title="İçerik Briefleri"
    description="Her kampanya için net amaç, hedef kitle ve yayın akışı içeren operasyonel brief üretin."
  >
    <button class="btn-primary" type="button" @click="copyBrief">
      <Bot class="h-4 w-4" />
      Brief kopyala
    </button>
  </PageHeader>

  <div v-if="projectOptions.length" class="mb-5 grid gap-4 md:grid-cols-3">
    <div v-for="card in briefCards" :key="card.label" class="panel p-4">
      <div class="flex items-center justify-between">
        <p class="text-xs uppercase tracking-[0.2em] text-slate-400">{{ card.label }}</p>
        <component :is="card.icon" class="h-4 w-4 text-brand" />
      </div>
      <p class="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ card.value }}</p>
    </div>
  </div>

  <div v-if="briefSummary" class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
    <section class="panel p-5">
      <div class="mb-5 space-y-4">
        <label class="space-y-1">
          <span class="text-sm font-medium">Proje</span>
          <select v-model="selectedProjectId" class="input w-full">
            <option v-for="project in projectOptions" :key="project.id" :value="project.id">
              {{ project.projectName }} · {{ project.customerName }}
            </option>
          </select>
        </label>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="space-y-1">
            <span class="text-sm font-medium">Platform</span>
            <select v-model="selectedPlatform" class="input w-full">
              <option v-for="item in platformOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>

          <label class="space-y-1">
            <span class="text-sm font-medium">Ton</span>
            <select v-model="editorialTone" class="input w-full">
              <option v-for="item in toneOptions" :key="item" :value="item">{{ item }}</option>
            </select>
          </label>
        </div>

        <label class="space-y-1">
          <span class="text-sm font-medium">Hedef</span>
          <select v-model="selectedGoal" class="input w-full">
            <option v-for="item in goalOptions" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>
      </div>

      <div class="rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-4 dark:border-brand/60 dark:bg-brand/10">
        <p class="text-xs uppercase tracking-[0.2em] text-brand">Aktif brief</p>
        <h2 class="mt-3 text-xl font-semibold text-slate-900 dark:text-slate-100">
          {{ briefSummary.title }}
        </h2>
        <div class="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Target class="h-4 w-4 text-brand" />
          {{ briefSummary.customer }}
        </div>
      </div>
    </section>

    <section class="space-y-4">
      <div class="panel p-5">
        <div class="flex items-center gap-2 text-brand">
          <Sparkles class="h-5 w-5" />
          <p class="text-xs uppercase tracking-[0.2em]">Brief özeti</p>
        </div>

        <div class="mt-4 space-y-4">
          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Amaç</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ briefSummary.objective }}</p>
          </div>

          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Hedef kitle</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ briefSummary.audience }}</p>
          </div>

          <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Açı</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ briefSummary.angle }}</p>
          </div>
        </div>
      </div>

      <div class="panel p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-[0.2em] text-slate-400">Yayın akışı</p>
            <h2 class="mt-2 text-lg font-semibold">Brief çıktısı</h2>
          </div>
          <button class="btn-muted" type="button" @click="copyBrief">
            <Copy class="h-4 w-4" />
            Kopyala
          </button>
        </div>

        <div class="space-y-3">
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">Kanca</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ briefSummary.hook }}</p>
          </div>

          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <p class="text-xs uppercase tracking-[0.16em] text-slate-400">CTA</p>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">{{ briefSummary.cta }}</p>
          </div>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-2">
          <div class="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
            <p class="text-xs uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Teslimler</p>
            <ul class="mt-2 space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
              <li v-for="item in briefSummary.deliverables" :key="item" class="flex items-start gap-2">
                <CheckCircle2 class="mt-0.5 h-4 w-4" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
            <p class="text-xs uppercase tracking-[0.16em] text-blue-700 dark:text-blue-300">Akış</p>
            <ul class="mt-2 space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li v-for="item in briefSummary.timeline" :key="item" class="flex items-start gap-2">
                <ArrowUpRight class="mt-0.5 h-4 w-4" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>

  <div v-else class="panel p-8 text-center text-sm text-slate-500 dark:text-slate-400">
    Başlatılacak proje bulunamadı. Önce proje ve müşteri kaydı oluşturun.
  </div>
</template>
