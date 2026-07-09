<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CalendarDays,
  CheckCircle,
  Clock,
  MessageSquare,
  Search,
  Send,
  Trash2,
  Edit2,
  X,
} from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatCard from '@/components/ui/StatCard.vue'
import { useToast } from '@/composables/useToast'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { ContentStatus, SocialContent } from '@/types'

type ApprovalFilter = 'All' | 'Waiting Approval' | 'Approved' | 'Published' | 'Draft'

const CONTENT_STATUS = {
  DRAFT: 'Draft',
  WAITING: 'Waiting Approval',
  APPROVED: 'Approved',
  PUBLISHED: 'Published',
} as const

const workspace = useWorkspaceStore()
const toast = useToast()
const search = ref('')
const statusFilter = ref<ApprovalFilter>('Waiting Approval')
const revisionContent = ref<SocialContent | null>(null)
const revisionNote = ref('')
const updatingId = ref<string | null>(null)
const error = ref('')
const editingRevision = ref<SocialContent | null>(null)
const deletingRevisionId = ref<string | null>(null)

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

const filters: { label: string; value: ApprovalFilter }[] = [
  { label: 'Onay bekleyen', value: 'Waiting Approval' },
  { label: 'Tümü', value: 'All' },
  { label: 'Taslak', value: 'Draft' },
  { label: 'Onaylandı', value: 'Approved' },
  { label: 'Yayında', value: 'Published' },
]

const customerName = (customerId: string) =>
  workspace.customers.find((customer) => customer.id === customerId)?.companyName ??
  'Müşteri bulunamadı'

const waitingApproval = computed(() =>
  workspace.contents.filter((content) => content.status === CONTENT_STATUS.WAITING),
)

const approvedContents = computed(() =>
  workspace.contents.filter((content) => content.status === CONTENT_STATUS.APPROVED),
)

const revisionDrafts = computed(() =>
  workspace.contents.filter((content) => content.status === CONTENT_STATUS.DRAFT && content.approvalNote),
)

const publishedContents = computed(() =>
  workspace.contents.filter((content) => content.status === CONTENT_STATUS.PUBLISHED),
)

const sortedContents = computed(() => {
  const priority: Record<ContentStatus, number> = {
    [CONTENT_STATUS.WAITING]: 0,
    [CONTENT_STATUS.APPROVED]: 1,
    [CONTENT_STATUS.DRAFT]: 2,
    [CONTENT_STATUS.PUBLISHED]: 3,
  }

  return [...workspace.contents].sort((first, second) => {
    const statusSort = priority[first.status] - priority[second.status]
    if (statusSort !== 0) return statusSort

    return first.publishDate.localeCompare(second.publishDate)
  })
})

const filteredContents = computed(() => {
  const term = search.value.trim().toLowerCase()

  return sortedContents.value.filter((content) => {
    const matchesStatus = statusFilter.value === 'All' || content.status === statusFilter.value
    const matchesSearch =
      !term ||
      [
        content.title,
        content.description,
        content.contentType,
        content.platform,
        content.approvalNote,
        customerName(content.customerId),
      ]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(term))

    return matchesStatus && matchesSearch
  })
})

const closeRevisionModal = () => {
  if (updatingId.value) return

  revisionContent.value = null
  revisionNote.value = ''
}

const openEditRevisionModal = (content: SocialContent) => {
  editingRevision.value = content
}

const closeEditRevisionModal = () => {
  if (updatingId.value) return

  editingRevision.value = null
}

const updateRevisionNote = async () => {
  if (!editingRevision.value) return

  const note = editingRevision.value.approvalNote?.trim()
  if (!note) {
    const failureMessage = 'Revizyon notu boş bırakılamaz.'
    error.value = failureMessage
    toast.error(failureMessage)
    return
  }

  updatingId.value = editingRevision.value.id
  error.value = ''

  try {
    await workspace.updateContent(editingRevision.value.id, {
      approvalNote: note,
    })

    toast.success(`"${editingRevision.value.title}" revizyon notu guncellendi.`)
    closeEditRevisionModal()
  } catch {
    const failureMessage = 'Revizyon notu guncellenemedi.'

    error.value = failureMessage
    toast.error(failureMessage)
  } finally {
    updatingId.value = null
  }
}

const deleteRevision = async () => {
  if (!deletingRevisionId.value) return

  updatingId.value = deletingRevisionId.value
  error.value = ''

  try {
    const title = workspace.contents.find((c) => c.id === deletingRevisionId.value)?.title

    await workspace.removeContent(deletingRevisionId.value)

    toast.success(`"${title}" revizyondan silindi.`)
    deletingRevisionId.value = null
  } catch {
    const failureMessage = 'Revizyon silinemedi.'

    error.value = failureMessage
    toast.error(failureMessage)
  } finally {
    updatingId.value = null
  }
}

const updateStatus = async (
  content: SocialContent,
  status: ContentStatus,
  message: string,
  approvalNote = '',
) => {
  updatingId.value = content.id
  error.value = ''

  try {
    await workspace.updateContent(content.id, {
      status,
      approvalNote,
    })

    toast.success(message)
  } catch {
    const failureMessage = 'Onay durumu guncellenemedi.'

    error.value = failureMessage
    toast.error(failureMessage)
  } finally {
    updatingId.value = null
  }
}

const approveContent = (content: SocialContent) =>
  updateStatus(content, CONTENT_STATUS.APPROVED, `"${content.title}" onaylandı.`)

const sendToApproval = (content: SocialContent) =>
  updateStatus(content, CONTENT_STATUS.WAITING, `"${content.title}" onaya gönderildi.`)

const markPublished = (content: SocialContent) =>
  updateStatus(content, CONTENT_STATUS.PUBLISHED, `"${content.title}" yayında olarak işaretlendi.`)

const openRevisionModal = (content: SocialContent) => {
  revisionContent.value = content
  revisionNote.value = content.approvalNote ?? ''
}

const requestRevision = async () => {
  if (!revisionContent.value) return

  const note = revisionNote.value.trim()
  if (!note) {
    const failureMessage = 'Revizyon istemek için kısa bir not ekleyin.'
    error.value = failureMessage
    toast.error(failureMessage)
    return
  }

  await updateStatus(
    revisionContent.value,
    CONTENT_STATUS.DRAFT,
    `"${revisionContent.value.title}" revizyona gonderildi.`,
    note,
  )

  closeRevisionModal()
}
</script>

<template>
  <PageHeader
    title="Onaylar"
    description="Müşteri onayına giden içerikleri, revizyonları ve yayına hazır işleri tek yerden yönetin."
  />

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <StatCard label="Onay Bekleyen" :value="waitingApproval.length" tone="orange" />
    <StatCard label="Revizyonda" :value="revisionDrafts.length" tone="slate" />
    <StatCard label="Onaylandı" :value="approvedContents.length" tone="green" />
    <StatCard label="Yayında" :value="publishedContents.length" tone="blue" />
  </div>

  <section class="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
    <div class="space-y-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label class="relative w-full max-w-md">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="search"
            class="input w-full pl-9"
            placeholder="İçerik, müşteri veya not ara"
          />
        </label>

        <div
          class="flex overflow-x-auto rounded-md border border-line bg-white p-1 dark:border-slate-800 dark:bg-slate-950"
        >
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="shrink-0 rounded px-3 py-1.5 text-sm font-medium transition"
            :class="
              statusFilter === filter.value
                ? 'bg-brand text-white'
                : 'text-slate-600 dark:text-slate-300'
            "
            type="button"
            @click="statusFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <p
        v-if="error || workspace.error"
        class="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
      >
        {{ error || workspace.error }}
      </p>

      <div v-if="workspace.loading" class="panel p-6 text-sm text-slate-500">
        Onay akisi yukleniyor...
      </div>
      <div v-else-if="filteredContents.length === 0" class="panel p-6 text-sm text-slate-500">
        Bu filtreye uygun icerik bulunamadı.
      </div>
      <div v-else class="space-y-3">
        <article v-for="content in filteredContents" :key="content.id" class="panel p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-xs font-medium uppercase text-brand">
                  {{ customerName(content.customerId) }}
                </p>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="statusClasses[content.status]"
                >
                  {{ statusLabels[content.status] }}
                </span>
              </div>

              <h2 class="mt-2 text-base font-semibold">{{ content.title }}</h2>
              <p class="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {{ content.description }}
              </p>

              <div class="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span class="rounded-md border border-line px-2 py-1 dark:border-slate-800">
                  {{ content.platform }}
                </span>
                <span class="rounded-md border border-line px-2 py-1 dark:border-slate-800">
                  {{ content.contentType }}
                </span>
                <span
                  class="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 dark:border-slate-800"
                >
                  <CalendarDays class="h-3.5 w-3.5" />
                  {{ content.publishDate }}
                </span>
              </div>

              <p
                v-if="content.approvalNote"
                class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300"
              >
                Revizyon notu: {{ content.approvalNote }}
              </p>
            </div>

            <div class="flex shrink-0 flex-wrap gap-2 lg:max-w-52 lg:justify-end">
              <button
                v-if="content.status === CONTENT_STATUS.DRAFT"
                class="btn-muted"
                type="button"
                :disabled="updatingId === content.id"
                @click="sendToApproval(content)"
              >
                <Send class="h-4 w-4" />
                Onaya gonder
              </button>
              <button
                v-if="content.status === CONTENT_STATUS.WAITING"
                class="btn-primary"
                type="button"
                :disabled="updatingId === content.id"
                @click="approveContent(content)"
              >
                <CheckCircle class="h-4 w-4" />
                Onayla
              </button>
              <button
                v-if="content.status === CONTENT_STATUS.WAITING"
                class="btn-muted"
                type="button"
                :disabled="updatingId === content.id"
                @click="openRevisionModal(content)"
              >
                <MessageSquare class="h-4 w-4" />
                Revizyon
              </button>
              <button
                v-if="content.status === CONTENT_STATUS.APPROVED"
                class="btn-primary"
                type="button"
                :disabled="updatingId === content.id"
                @click="markPublished(content)"
              >
                <Send class="h-4 w-4" />
                Yayında
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>

    <aside class="space-y-4">
      <section class="panel p-5">
        <div class="flex items-center gap-2">
          <Clock class="h-5 w-5 text-amber-500" />
          <h2 class="font-semibold">Öncelik sırası</h2>
        </div>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Once onay bekleyen isleri kapatın, ardından onaylananları yayına alın. Revizyon notu olan
          taslaklar ekip tarafında tekrar hazirlanmalı.
        </p>
      </section>

      <section class="panel p-5">
        <div class="flex items-center gap-2">
          <MessageSquare class="h-5 w-5 text-brand" />
          <h2 class="font-semibold">Revizyon havuzu</h2>
        </div>
        <div v-if="revisionDrafts.length === 0" class="mt-4 text-sm text-slate-500">
          Acik revizyon yok.
        </div>
        <ul v-else class="mt-4 space-y-3">
          <li
            v-for="content in revisionDrafts.slice(0, 4)"
            :key="content.id"
            class="rounded-md border border-line p-3 dark:border-slate-800"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium">{{ content.title }}</p>
                <p class="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {{ content.approvalNote }}
                </p>
              </div>
              <div class="flex shrink-0 gap-1">
                <button
                  class="btn-muted h-7 w-7 p-0"
                  type="button"
                  :disabled="updatingId === content.id"
                  title="Revizyonu düzenle"
                  @click="openEditRevisionModal(content)"
                >
                  <Edit2 class="h-3.5 w-3.5" />
                </button>
                <button
                  class="btn-muted h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                  type="button"
                  :disabled="updatingId === content.id"
                  title="Revizyonu sil"
                  @click="deletingRevisionId = content.id"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </section>
    </aside>
  </section>

  <div
    v-if="revisionContent"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
  >
    <form class="panel w-full max-w-xl p-5" @submit.prevent="requestRevision">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Revizyon iste</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ revisionContent.title }} icin musteriden gelen notu ekleyin.
          </p>
        </div>
        <button class="btn-muted h-9 w-9 p-0" type="button" @click="closeRevisionModal">
          <X class="h-4 w-4" />
        </button>
      </div>

      <label class="space-y-1">
        <span class="text-sm font-medium">Revizyon notu</span>
        <textarea
          v-model="revisionNote"
          class="min-h-32 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
          placeholder="Orn. Kapak gorseli degissin, CTA daha net olsun."
          required
        />
      </label>

      <div class="mt-5 flex justify-end gap-3">
        <button class="btn-muted" type="button" @click="closeRevisionModal">Vazgec</button>
        <button class="btn-primary" type="submit" :disabled="updatingId === revisionContent.id">
          {{ updatingId === revisionContent.id ? 'Kaydediliyor...' : 'Revizyona gonder' }}
        </button>
      </div>
    </form>
  </div>

  <div
    v-if="editingRevision"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
  >
    <form class="panel w-full max-w-xl p-5" @submit.prevent="updateRevisionNote">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">Revizyonu duzenle</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {{ editingRevision.title }} icin revizyonu guncelleyin.
          </p>
        </div>
        <button class="btn-muted h-9 w-9 p-0" type="button" @click="closeEditRevisionModal">
          <X class="h-4 w-4" />
        </button>
      </div>

      <label class="space-y-1">
        <span class="text-sm font-medium">Revizyon notu</span>
        <textarea
          v-model="editingRevision.approvalNote"
          class="min-h-32 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
          placeholder="Revizyon notunu guncelleyin..."
          required
        />
      </label>

      <div class="mt-5 flex justify-end gap-3">
        <button class="btn-muted" type="button" @click="closeEditRevisionModal">Vazgec</button>
        <button class="btn-primary" type="submit" :disabled="updatingId === editingRevision.id">
          {{ updatingId === editingRevision.id ? 'Kaydediliyor...' : 'Guncelle' }}
        </button>
      </div>
    </form>
  </div>

  <div
    v-if="deletingRevisionId"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
  >
    <div class="panel w-full max-w-sm p-5">
      <h2 class="text-lg font-semibold">Revizyonu sil</h2>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Bu revizyonu silmek istediginizden emin misiniz? Bu islem geri alinamaz.
      </p>

      <div class="mt-5 flex justify-end gap-3">
        <button
          class="btn-muted"
          type="button"
          :disabled="updatingId === deletingRevisionId"
          @click="deletingRevisionId = null"
        >
          Iptal et
        </button>
        <button
          class="btn-primary bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          type="button"
          :disabled="updatingId === deletingRevisionId"
          @click="deleteRevision"
        >
          {{ updatingId === deletingRevisionId ? 'Siliniyor...' : 'Sil' }}
        </button>
      </div>
    </div>
  </div>
</template>
