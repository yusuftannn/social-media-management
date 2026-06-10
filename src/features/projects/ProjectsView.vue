<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { CalendarDays, Pencil, Plus, Search, Trash2, X } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useToast } from '@/composables/useToast'
import type { Project, ProjectStatus } from '@/types'

type ProjectForm = Omit<Project, 'id' | 'createdAt'>
type StatusFilter = ProjectStatus | 'All'

const statuses: ProjectStatus[] = ['Active', 'Pending', 'Completed']
const statusLabels: Record<ProjectStatus, string> = {
  Active: 'Aktif',
  Pending: 'Beklemede',
  Completed: 'Tamamlandı',
}

const statusClasses: Record<ProjectStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Completed: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
}

const emptyForm = (): ProjectForm => ({
  customerId: '',
  projectName: '',
  description: '',
  status: 'Active',
  startDate: '',
  endDate: '',
})

const workspace = useWorkspaceStore()
const toast = useToast()
const search = ref('')
const statusFilter = ref<StatusFilter>('All')
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const startDateFilter = ref('')
const endDateFilter = ref('')
const form = reactive<ProjectForm>(emptyForm())

const customerName = (customerId: string) =>
  workspace.customers.find((customer) => customer.id === customerId)?.companyName ??
  'Müşteri bulunamadı'

const filteredProjects = computed(() => {
  const term = search.value.trim().toLowerCase()

  return workspace.projects.filter((project) => {
    const matchesStatus = statusFilter.value === 'All' || project.status === statusFilter.value

    const matchesSearch =
      !term ||
      [project.projectName, project.description, customerName(project.customerId)]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))

    const matchesStartDate = !startDateFilter.value || project.startDate >= startDateFilter.value

    const matchesEndDate = !endDateFilter.value || project.endDate <= endDateFilter.value

    return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate
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
  isModalOpen.value = true
}

const openEditModal = (project: Project) => {
  Object.assign(form, {
    customerId: project.customerId,
    projectName: project.projectName,
    description: project.description,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
  })
  editingId.value = project.id
  error.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  resetForm()
}

const submitProject = async () => {
  if (form.endDate < form.startDate) {
    const message = 'Bitiş tarihi başlangıç tarihinden önce olamaz.'

    error.value = message
    toast.error(message)

    return
  }

  saving.value = true
  error.value = ''

  try {
    const payload: ProjectForm = {
      customerId: form.customerId,
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      status: form.status,
      startDate: form.startDate,
      endDate: form.endDate,
    }

    if (editingId.value) {
      await workspace.updateProject(editingId.value, payload)

      toast.success(`"${payload.projectName}" projesi başarıyla güncellendi.`)
    } else {
      await workspace.addProject({
        ...payload,
        createdAt: new Date().toISOString().slice(0, 10),
      })

      toast.success(`"${payload.projectName}" projesi başarıyla eklendi.`)
    }

    isModalOpen.value = false
    resetForm()
  } catch {
    const message = editingId.value
      ? 'Proje güncellemesi başarısız oldu.'
      : 'Proje eklenmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteProject = async (project: Project) => {
  const confirmed = globalThis.confirm(`${project.projectName} projesini silmek istiyor musunuz?`)
  if (!confirmed) return

  try {
    await workspace.removeProject(project.id)
    toast.success(`"${project.projectName}" projesi başarıyla silindi.`)
  } catch {
    const message = 'Proje silinmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  }
}
</script>

<template>
  <PageHeader title="Projeler" description="Müşterilere bağlı proje portföyü ve durum takibi.">
    <button
      class="btn-primary"
      type="button"
      :disabled="workspace.customers.length === 0"
      @click="openCreateModal"
    >
      <Plus class="h-4 w-4" />
      Proje ekle
    </button>
  </PageHeader>

  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex w-full flex-col gap-3 sm:flex-row">
      <label class="relative w-full max-w-md">
        <Search
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
        <input v-model="search" class="input w-full pl-9" placeholder="Proje veya müşteri ara" />
      </label>
      <select v-model="statusFilter" class="input w-full sm:w-44">
        <option value="All">Tüm durumlar</option>
        <option v-for="status in statuses" :key="status" :value="status">
          {{ statusLabels[status] }}
        </option>
      </select>
      <input v-model="startDateFilter" type="date" class="input w-full sm:w-auto" />

      <input v-model="endDateFilter" type="date" class="input w-full sm:w-auto" />
    </div>
    <p class="shrink-0 text-sm text-slate-500 dark:text-slate-400">
      {{ filteredProjects.length }} proje
    </p>
  </div>

  <p
    v-if="error || workspace.error"
    class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  >
    {{ error || workspace.error }}
  </p>

  <div v-if="workspace.loading" class="panel p-6 text-sm text-slate-500">
    Projeler yükleniyor...
  </div>
  <div v-else-if="workspace.customers.length === 0" class="panel p-6 text-sm text-slate-500">
    Proje ekleyebilmek için önce bir müşteri kaydı oluşturun.
  </div>
  <div v-else-if="filteredProjects.length === 0" class="panel p-6 text-sm text-slate-500">
    Filtrelere uygun proje bulunamadı.
  </div>
  <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="project in filteredProjects"
      :key="project.id"
      class="panel flex min-h-56 flex-col p-5"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-medium uppercase tracking-wide text-brand">
            {{ customerName(project.customerId) }}
          </p>
          <h2 class="mt-1 font-semibold">{{ project.projectName }}</h2>
        </div>
        <span
          class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="statusClasses[project.status]"
        >
          {{ statusLabels[project.status] }}
        </span>
      </div>

      <p class="mt-3 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
        {{ project.description }}
      </p>

      <div class="mt-auto flex items-end justify-between gap-3 pt-5">
        <div class="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays class="h-4 w-4" />
          <span>{{ project.startDate }} - {{ project.endDate }}</span>
        </div>
        <div class="flex gap-2">
          <button
            class="btn-muted h-9 w-9 p-0"
            type="button"
            title="Düzenle"
            @click="openEditModal(project)"
          >
            <Pencil class="h-4 w-4" />
          </button>
          <button
            class="btn-muted h-9 w-9 p-0"
            type="button"
            title="Sil"
            @click="deleteProject(project)"
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
      @submit.prevent="submitProject"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">{{ editingId ? 'Proje düzenle' : 'Proje ekle' }}</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kayıtlar Firestore projects koleksiyonuna yazılır.
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
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Proje adı</span>
          <input v-model="form.projectName" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Başlangıç tarihi</span>
          <input v-model="form.startDate" class="input w-full" required type="date" />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Bitiş tarihi</span>
          <input v-model="form.endDate" class="input w-full" required type="date" />
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
