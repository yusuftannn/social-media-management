<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { CalendarDays, Pencil, Plus, Trash2, X } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useToast } from '@/composables/useToast'
import type { Priority, Task, TaskStatus } from '@/types'

type TaskForm = Omit<Task, 'id' | 'createdAt'>

const workspace = useWorkspaceStore()
const columns: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done']
const priorities: Priority[] = ['Low', 'Medium', 'High']
const toast = useToast()

const statusLabels: Record<TaskStatus, string> = {
  'To Do': 'Yapılacak',
  'In Progress': 'Devam ediyor',
  Review: 'İncelemede',
  Done: 'Tamamlandı',
}

const PRIORITY_CONFIG: Record<
  Priority,
  {
    label: string
    class: string
  }
> = {
  Low: {
    label: 'Düşük',
    class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  Medium: {
    label: 'Orta',
    class: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  },
  High: {
    label: 'Yüksek',
    class: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
}

const emptyForm = (): TaskForm => ({
  title: '',
  description: '',
  assignedTo: '',
  priority: 'Medium',
  dueDate: '',
  status: 'To Do',
})

const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const form = reactive<TaskForm>(emptyForm())
const isEditing = computed(() => editingId.value !== null)

const tasksByStatus = computed<Record<TaskStatus, Task[]>>(() => {
  const groups: Record<TaskStatus, Task[]> = {
    'To Do': [],
    'In Progress': [],
    Review: [],
    Done: [],
  }

  for (const task of workspace.tasks) {
    groups[task.status].push(task)
  }

  return groups
})

const resetForm = () => {
  Object.assign(form, emptyForm())
  editingId.value = null
  error.value = ''
}

const openCreateModal = (status: TaskStatus = 'To Do') => {
  resetForm()
  form.status = status
  form.assignedTo = workspace.team[0]?.name ?? ''
  isModalOpen.value = true
}

const openEditModal = (task: Task) => {
  Object.assign(form, {
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo,
    priority: task.priority,
    dueDate: task.dueDate,
    status: task.status,
  })
  editingId.value = task.id
  error.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  resetForm()
}

const submitTask = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload: TaskForm = {
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      status: form.status,
    }

    if (isEditing.value && editingId.value) {
      await workspace.updateTask(editingId.value, payload)
      toast.success(`"${payload.title}" görevi başarıyla güncellendi.`)
    } else {
      await workspace.addTask({
        ...payload,
        createdAt: new Date().toISOString().slice(0, 10),
      })
      toast.success(`"${payload.title}" görevi başarıyla eklendi.`)
    }

    isModalOpen.value = false
    resetForm()
  } catch {
    const message = isEditing.value
      ? 'Görev güncellemesi başarısız oldu.'
      : 'Görev eklenmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteTask = async (task: Task) => {
  const confirmed = globalThis.confirm(`${task.title} görevini silmek istiyor musunuz?`)
  if (!confirmed) return

  try {
    await workspace.removeTask(task.id)
    toast.success(`"${task.title}" görevi başarıyla silindi.`)
  } catch {
    const message = 'Görev silinmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  }
}
</script>

<template>
  <PageHeader title="Görevler" description="Kolon temelli görev akışı ve ekip iş takibi.">
    <button class="btn-primary" type="button" @click="openCreateModal()">
      <Plus class="h-4 w-4" />
      Görev ekle
    </button>
  </PageHeader>

  <p
    v-if="error || workspace.error"
    class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  >
    {{ error || workspace.error }}
  </p>

  <div v-if="workspace.loading" class="panel p-6 text-sm text-slate-500">
    Görevler yükleniyor...
  </div>
  <div v-else class="grid gap-4 lg:grid-cols-4">
    <section
      v-for="column in columns"
      :key="column"
      class="min-h-80 rounded-lg bg-slate-100 p-3 dark:bg-slate-800"
    >
      <div class="mb-3 flex items-center justify-between gap-3">
        <h2 class="text-sm font-semibold">{{ statusLabels[column] }}</h2>
        <button
          class="btn-muted h-8 w-8 p-0"
          type="button"
          title="Görev ekle"
          @click="openCreateModal(column)"
        >
          <Plus class="h-4 w-4" />
        </button>
      </div>

      <div
        v-if="tasksByStatus[column].length === 0"
        class="rounded-md border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700"
      >
        Bu kolonda görev yok.
      </div>

      <div v-else class="grid gap-3">
        <article v-for="task in tasksByStatus[column]" :key="task.id" class="panel p-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-sm font-medium">{{ task.title }}</h3>
              <p class="mt-2 line-clamp-3 text-xs text-slate-500">{{ task.description }}</p>
            </div>
            <div class="flex shrink-0 gap-1">
              <button
                class="btn-muted h-8 w-8 p-0"
                type="button"
                title="Düzenle"
                @click="openEditModal(task)"
              >
                <Pencil class="h-3.5 w-3.5" />
              </button>
              <button
                class="btn-muted h-8 w-8 p-0"
                type="button"
                title="Sil"
                @click="deleteTask(task)"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between gap-2 text-xs">
            <span class="truncate">{{ task.assignedTo }}</span>
            <span
              class="shrink-0 rounded-full px-2 py-1 font-medium"
              :class="PRIORITY_CONFIG[task.priority].class"
            >
              {{ PRIORITY_CONFIG[task.priority].label }}
            </span>
          </div>
          <div class="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarDays class="h-3.5 w-3.5" />
            <span>{{ task.dueDate }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>

  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
  >
    <form
      class="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5"
      @submit.prevent="submitTask"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">
            {{ isEditing ? 'Görev düzenle' : 'Görev ekle' }}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Görevlerinizi kolayca yönetin.
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
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Başlık</span>
          <input v-model="form.title" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Atanan kişi</span>
          <input v-model="form.assignedTo" class="input w-full" list="team-members" required />
          <datalist id="team-members">
            <option v-for="member in workspace.team" :key="member.id" :value="member.name" />
          </datalist>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Bitiş tarihi</span>
          <input v-model="form.dueDate" class="input w-full" required type="date" />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Öncelik</span>
          <select v-model="form.priority" class="input w-full" required>
            <option v-for="priority in priorities" :key="priority" :value="priority">
              {{ PRIORITY_CONFIG[priority].label }}
            </option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Durum</span>
          <select v-model="form.status" class="input w-full" required>
            <option v-for="status in columns" :key="status" :value="status">
              {{ statusLabels[status] }}
            </option>
          </select>
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
          {{
            saving
              ? isEditing
                ? 'Güncelleniyor...'
                : 'Kaydediliyor...'
              : isEditing
                ? 'Güncelle'
                : 'Kaydet'
          }}
        </button>
      </div>
    </form>
  </div>
</template>
