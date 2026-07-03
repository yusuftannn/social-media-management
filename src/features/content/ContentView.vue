<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useToast } from '@/composables/useToast'
import type { ContentPlatform, ContentStatus, ContentTemplate, SocialContent } from '@/types'

type ContentForm = Omit<SocialContent, 'id' | 'createdAt'>
type StatusFilter = ContentStatus | 'All'
type PlatformFilter = ContentPlatform | 'All'

const platforms: ContentPlatform[] = ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X']
const statuses: ContentStatus[] = ['Draft', 'Waiting Approval', 'Approved', 'Published']
const contentTemplates: ContentTemplate[] = [
  {
    id: 'tpl_launch',
    name: 'Lansman duyurusu',
    platform: 'Instagram',
    contentType: 'Reels',
    title: 'Yeni koleksiyonun lansmanı',
    description:
      'Ürününüzü kısa ve etkileyici bir videoyla tanıtın, ana faydayı öne çıkarın ve CTA ekleyin.',
    status: 'Draft',
  },
  {
    id: 'tpl_tip',
    name: 'İpucu paylaşımı',
    platform: 'LinkedIn',
    contentType: 'Post',
    title: 'Marka büyümesi için 3 pratik ipucu',
    description:
      'Takipçilerinize değer katacak kısa bir öneri listesi paylaşın ve bir soruyla etkileşimi artırın.',
    status: 'Waiting Approval',
  },
  {
    id: 'tpl_story',
    name: 'Hikâye anlatımı',
    platform: 'Facebook',
    contentType: 'Carousel',
    title: 'Müşteri deneyimini öyküleyin',
    description:
      'Bir müşteri yolculuğunu kare kare anlatan bir karusel hazırlayın ve sonuçları net şekilde paylaşın.',
    status: 'Draft',
  },
]

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

const emptyForm = (): ContentForm => ({
  customerId: '',
  platform: 'Instagram',
  contentType: '',
  title: '',
  description: '',
  publishDate: '',
  status: 'Draft',
})

const workspace = useWorkspaceStore()
const toast = useToast()
const search = ref('')
const statusFilter = ref<StatusFilter>('All')
const platformFilter = ref<PlatformFilter>('All')
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const publishStartDate = ref('')
const publishEndDate = ref('')
const previewMonth = ref(new Date())
const form = reactive<ContentForm>(emptyForm())

const customerMap = computed(
  () => new Map(workspace.customers.map((customer) => [customer.id, customer.companyName])),
)
const customerName = (customerId: string): string =>
  customerMap.value.get(customerId) ?? 'Müşteri bulunamadı'

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const previewMonthLabel = computed(() =>
  previewMonth.value.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
)

const calendarDays = computed(() => {
  const year = previewMonth.value.getFullYear()
  const month = previewMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const firstDayIndex = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const totalCells = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const date = new Date(year, month, index - firstDayIndex + 1)

    return {
      key: formatDateKey(date),
      date,
      isCurrentMonth: date.getMonth() === month,
    }
  })
})

const contentsByDate = computed(() => {
  const map = new Map<string, SocialContent[]>()

  for (const content of sortedContents.value) {
    const current = map.get(content.publishDate) ?? []
    current.push(content)
    map.set(content.publishDate, current)
  }

  return map
})

const isToday = (date: Date) => {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

const goToPreviousMonth = () => {
  previewMonth.value = new Date(previewMonth.value.getFullYear(), previewMonth.value.getMonth() - 1, 1)
}

const goToNextMonth = () => {
  previewMonth.value = new Date(previewMonth.value.getFullYear(), previewMonth.value.getMonth() + 1, 1)
}

const sortedContents = computed(() =>
  [...workspace.contents].sort((first, second) =>
    first.publishDate.localeCompare(second.publishDate),
  ),
)

const filteredContents = computed(() => {
  const term = search.value.trim().toLowerCase()

  return sortedContents.value.filter((content) => {
    if (statusFilter.value !== 'All' && content.status !== statusFilter.value) {
      return false
    }

    if (platformFilter.value !== 'All' && content.platform !== platformFilter.value) {
      return false
    }

    if (publishStartDate.value && content.publishDate < publishStartDate.value) {
      return false
    }

    if (publishEndDate.value && content.publishDate > publishEndDate.value) {
      return false
    }

    if (!term) {
      return true
    }

    return [
      content.title,
      content.description,
      content.contentType,
      content.platform,
      customerName(content.customerId),
    ]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term))
  })
})

const resetForm = () => {
  Object.assign(form, emptyForm())
  editingId.value = null
  error.value = ''
}

const openCreateModal = () => {
  resetForm()
  form.customerId = workspace.customers[0]?.id ?? ''
  form.publishDate = new Date().toISOString().slice(0, 10)
  isModalOpen.value = true
}

const openEditModal = (content: SocialContent) => {
  Object.assign(form, {
    customerId: content.customerId,
    platform: content.platform,
    contentType: content.contentType,
    title: content.title,
    description: content.description,
    publishDate: content.publishDate,
    status: content.status,
  })
  editingId.value = content.id
  error.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  resetForm()
}

const applyTemplate = (template: ContentTemplate) => {
  form.platform = template.platform
  form.contentType = template.contentType
  form.title = template.title
  form.description = template.description
  form.status = template.status

  if (!form.publishDate) {
    form.publishDate = new Date().toISOString().slice(0, 10)
  }
}

const submitContent = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload: ContentForm = {
      customerId: form.customerId,
      platform: form.platform,
      contentType: form.contentType.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      publishDate: form.publishDate,
      status: form.status,
    }

    if (editingId.value) {
      await workspace.updateContent(editingId.value, payload)

      toast.success(`"${payload.title}" içeriği başarıyla güncellendi.`)
    } else {
      await workspace.addContent({
        ...payload,
        createdAt: new Date().toISOString().slice(0, 10),
      })

      toast.success(`"${payload.title}" içeriği başarıyla eklendi.`)
    }

    isModalOpen.value = false
    resetForm()
  } catch {
    const message = editingId.value
      ? 'İçerik güncellemesi başarısız oldu.'
      : 'İçerik eklenmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteContent = async (content: SocialContent) => {
  const confirmed = globalThis.confirm(`${content.title} içeriğini silmek istiyor musunuz?`)
  if (!confirmed) return

  try {
    await workspace.removeContent(content.id)

    toast.success(`"${content.title}" içeriği başarıyla silindi.`)
  } catch {
    const message = 'İçerik silinmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  }
}
</script>

<template>
  <PageHeader
    title="İçerik Takvimi"
    description="Platformlara göre planlanan sosyal medya içerikleri."
  >
    <button
      class="btn-primary"
      type="button"
      :disabled="workspace.customers.length === 0"
      @click="openCreateModal"
    >
      <Plus class="h-4 w-4" />
      İçerik ekle
    </button>
  </PageHeader>

  <div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div class="flex w-full flex-col gap-3 sm:flex-row">
      <label class="relative w-full max-w-md">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input v-model="search" class="input w-full pl-9" placeholder="İçerik veya müşteri ara" />
      </label>
      <select v-model="platformFilter" class="input w-full sm:w-40">
        <option value="All">Tüm platformlar</option>
        <option v-for="platform in platforms" :key="platform" :value="platform">
          {{ platform }}
        </option>
      </select>
      <select v-model="statusFilter" class="input w-full sm:w-44">
        <option value="All">Tüm durumlar</option>
        <option v-for="status in statuses" :key="status" :value="status">
          {{ statusLabels[status] }}
        </option>
      </select>
      <input
        v-model="publishStartDate"
        type="date"
        class="input w-full sm:w-auto"
        title="Başlangıç tarihi"
      />

      <input
        v-model="publishEndDate"
        type="date"
        class="input w-full sm:w-auto"
        title="Bitiş tarihi"
      />
    </div>
    <p class="shrink-0 text-sm text-slate-500 dark:text-slate-400">
      {{ filteredContents.length }} içerik
    </p>
  </div>

  <p
    v-if="error || workspace.error"
    class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  >
    {{ error || workspace.error }}
  </p>

  <section class="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold">Yayın takvimi önizleme</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          İçeriklerinizi takvimde görüp yaklaşan yayınları takip edin.
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-muted h-9 w-9 p-0" type="button" @click="goToPreviousMonth">
          <ChevronLeft class="h-4 w-4" />
        </button>
        <span class="min-w-40 text-center text-sm font-medium capitalize">
          {{ previewMonthLabel }}
        </span>
        <button class="btn-muted h-9 w-9 p-0" type="button" @click="goToNextMonth">
          <ChevronRight class="h-4 w-4" />
        </button>
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
      <div v-for="label in ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']" :key="label">
        {{ label }}
      </div>
    </div>

    <div class="mt-2 grid grid-cols-7 gap-2">
      <div
        v-for="day in calendarDays"
        :key="day.key"
        class="min-h-24 rounded-lg border p-2 text-sm"
        :class="[
          day.isCurrentMonth
            ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
            : 'border-slate-100 bg-slate-50 text-slate-400 dark:border-slate-900 dark:bg-slate-900/60 dark:text-slate-500',
          isToday(day.date) ? 'ring-1 ring-brand' : '',
        ]"
      >
        <div class="flex items-center justify-between">
          <span class="font-medium" :class="isToday(day.date) ? 'text-brand' : ''">
            {{ day.date.getDate() }}
          </span>
          <span v-if="(contentsByDate.get(formatDateKey(day.date))?.length ?? 0) > 0" class="text-[11px] text-brand">
            {{ contentsByDate.get(formatDateKey(day.date))?.length }}
          </span>
        </div>

        <div class="mt-2 space-y-1">
          <div
            v-for="content in (contentsByDate.get(formatDateKey(day.date)) ?? []).slice(0, 2)"
            :key="content.id"
            class="rounded-md bg-blue-50 px-2 py-1 text-[11px] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {{ content.title }}
          </div>
          <div
            v-if="(contentsByDate.get(formatDateKey(day.date))?.length ?? 0) > 2"
            class="text-[11px] text-slate-500 dark:text-slate-400"
          >
            +{{ (contentsByDate.get(formatDateKey(day.date))?.length ?? 0) - 2 }} daha
          </div>
        </div>
      </div>
    </div>
  </section>

  <div v-if="workspace.loading" class="panel p-6 text-sm text-slate-500">
    İçerikler yükleniyor...
  </div>
  <div v-else-if="workspace.customers.length === 0" class="panel p-6 text-sm text-slate-500">
    İçerik ekleyebilmek için önce bir müşteri kaydı oluşturun.
  </div>
  <div v-else-if="filteredContents.length === 0" class="panel p-6 text-sm text-slate-500">
    Filtrelere uygun içerik bulunamadı.
  </div>
  <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="content in filteredContents"
      :key="content.id"
      class="panel flex min-h-60 flex-col p-5"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase text-brand">
            {{ customerName(content.customerId) }}
          </p>
          <h2 class="mt-1 font-semibold">{{ content.title }}</h2>
        </div>
        <span
          class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="statusClasses[content.status]"
        >
          {{ statusLabels[content.status] }}
        </span>
      </div>

      <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span class="rounded-md border border-line px-2 py-1 dark:border-slate-800">{{
          content.platform
        }}</span>
        <span class="rounded-md border border-line px-2 py-1 dark:border-slate-800">{{
          content.contentType
        }}</span>
      </div>

      <p class="mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
        {{ content.description }}
      </p>

      <div class="mt-auto flex items-end justify-between gap-3 pt-5">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays class="h-4 w-4" />
          <span>{{ content.publishDate }}</span>
        </div>
        <div class="flex gap-2">
          <button
            class="btn-muted h-9 w-9 p-0"
            type="button"
            title="Düzenle"
            @click="openEditModal(content)"
          >
            <Pencil class="h-4 w-4" />
          </button>
          <button
            class="btn-muted h-9 w-9 p-0"
            type="button"
            title="Sil"
            @click="deleteContent(content)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  </div>

  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
  >
    <form
      class="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5"
      @submit.prevent="submitContent"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">{{ editingId ? 'İçerik düzenle' : 'İçerik ekle' }}</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            İçerik planlamanızı kolayca yönetin.
          </p>
        </div>
        <button class="btn-muted h-9 w-9 p-0" type="button" @click="closeModal">
          <X class="h-4 w-4" />
        </button>
      </div>

      <p
        v-if="error"
        class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      >
        {{ error }}
      </p>

      <div class="mb-5 rounded-lg border border-dashed border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold">Hızlı şablonlar</p>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Önceden hazırlanmış yapıları seçip formu otomatik doldurun.
            </p>
          </div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="template in contentTemplates"
            :key="template.id"
            class="rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            type="button"
            @click="applyTemplate(template)"
          >
            {{ template.name }}
          </button>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-sm font-medium">Müşteri</span>
          <select v-model="form.customerId" class="input w-full" required>
            <option v-for="customer in workspace.customers" :key="customer.id" :value="customer.id">
              {{ customer.companyName }}
            </option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Durum</span>
          <select v-model="form.status" class="input w-full" required>
            <option v-for="status in statuses" :key="status" :value="status">
              {{ statusLabels[status] }}
            </option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Platform</span>
          <select v-model="form.platform" class="input w-full" required>
            <option v-for="platform in platforms" :key="platform" :value="platform">
              {{ platform }}
            </option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">İçerik tipi</span>
          <input
            v-model="form.contentType"
            class="input w-full"
            placeholder="Reels, Carousel, Post"
            required
          />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Başlık</span>
          <input v-model="form.title" class="input w-full" required />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Yayın tarihi</span>
          <input v-model="form.publishDate" class="input w-full" required type="date" />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Açıklama</span>
          <textarea
            v-model="form.description"
            class="min-h-28 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
            required
          />
        </label>
      </div>

      <div class="mt-5 flex justify-end gap-3">
        <button class="btn-muted" type="button" @click="closeModal">Vazgeç</button>
        <button class="btn-primary" type="submit" :disabled="saving">
          {{ saving ? 'Kaydediliyor...' : 'Kaydet' }}
        </button>
      </div>
    </form>
  </div>
</template>
