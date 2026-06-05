<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Mail, Pencil, Plus, Search, Trash2, UserRound, X } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import type { TeamMember } from '@/types'

type TeamMemberForm = Omit<TeamMember, 'id' | 'createdAt'>

const roles: TeamMember['role'][] = ['Designer', 'Developer', 'Social Media Manager', 'Content Creator']

const roleLabels: Record<TeamMember['role'], string> = {
  Designer: 'Tasarımcı',
  Developer: 'Geliştirici',
  'Social Media Manager': 'Sosyal Medya Yöneticisi',
  'Content Creator': 'İçerik Üreticisi',
}

const roleClasses: Record<TeamMember['role'], string> = {
  Designer: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
  Developer: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  'Social Media Manager': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Content Creator': 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
}

const emptyForm = (): TeamMemberForm => ({
  name: '',
  email: '',
  role: 'Social Media Manager',
  avatar: '',
})

const workspace = useWorkspaceStore()
const search = ref('')
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const form = reactive<TeamMemberForm>(emptyForm())

const filteredTeam = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return workspace.team

  return workspace.team.filter((member) =>
    [member.name, member.email, roleLabels[member.role], member.role]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term)),
  )
})

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join('')
    .toUpperCase()

const resetForm = () => {
  Object.assign(form, emptyForm())
  editingId.value = null
  error.value = ''
}

const openCreateModal = () => {
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (member: TeamMember) => {
  Object.assign(form, {
    name: member.name,
    email: member.email,
    role: member.role,
    avatar: member.avatar ?? '',
  })
  editingId.value = member.id
  error.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  resetForm()
}

const submitMember = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload: TeamMemberForm = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      avatar: form.avatar?.trim(),
    }

    if (editingId.value) {
      await workspace.updateTeamMember(editingId.value, payload)
    } else {
      await workspace.addTeamMember({
        ...payload,
        createdAt: new Date().toISOString().slice(0, 10),
      })
    }

    closeModal()
  } catch {
    error.value = 'Ekip kaydı Firebase üzerine yazılamadı.'
  } finally {
    saving.value = false
  }
}

const deleteMember = async (member: TeamMember) => {
  const confirmed = globalThis.confirm(`${member.name} ekip üyesini silmek istiyor musunuz?`)
  if (!confirmed) return

  try {
    await workspace.removeTeamMember(member.id)
  } catch {
    error.value = 'Ekip kaydı silinemedi.'
  }
}
</script>

<template>
  <PageHeader title="Ekip" description="Ajans rolleri ve ekip üyeleri.">
    <button class="btn-primary" type="button" @click="openCreateModal">
      <Plus class="h-4 w-4" />
      Üye ekle
    </button>
  </PageHeader>

  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <label class="relative w-full max-w-md">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input v-model="search" class="input w-full pl-9" placeholder="Ekip üyesi ara" />
    </label>
    <p class="text-sm text-slate-500 dark:text-slate-400">{{ filteredTeam.length }} üye</p>
  </div>

  <p
    v-if="error || workspace.error"
    class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
  >
    {{ error || workspace.error }}
  </p>

  <div v-if="workspace.loading" class="panel p-6 text-sm text-slate-500">Ekip yükleniyor...</div>
  <div v-else-if="filteredTeam.length === 0" class="panel p-6 text-sm text-slate-500">
    Kayıtlı ekip üyesi bulunamadı.
  </div>
  <div v-else class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <article v-for="member in filteredTeam" :key="member.id" class="panel flex min-h-64 flex-col p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <img
            v-if="member.avatar"
            class="h-12 w-12 rounded-full object-cover"
            :src="member.avatar"
            :alt="member.name"
          />
          <div
            v-else
            class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 font-semibold text-brand dark:bg-blue-950"
          >
            {{ initials(member.name) || '?' }}
          </div>
          <div>
            <h2 class="font-semibold">{{ member.name }}</h2>
            <p class="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
              <Mail class="h-3.5 w-3.5" />
              {{ member.email }}
            </p>
          </div>
        </div>
        <UserRound class="h-5 w-5 shrink-0 text-slate-300" />
      </div>

      <div class="mt-5">
        <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="roleClasses[member.role]">
          {{ roleLabels[member.role] }}
        </span>
      </div>

      <div class="mt-auto flex justify-end gap-2 pt-6">
        <button class="btn-muted h-9 w-9 p-0" type="button" title="Düzenle" @click="openEditModal(member)">
          <Pencil class="h-4 w-4" />
        </button>
        <button class="btn-muted h-9 w-9 p-0" type="button" title="Sil" @click="deleteMember(member)">
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </article>
  </div>

  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <form class="panel max-h-[90vh] w-full max-w-xl overflow-y-auto p-5" @submit.prevent="submitMember">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">{{ editingId ? 'Üye düzenle' : 'Üye ekle' }}</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Kayıtlar Firestore team koleksiyonuna yazılır.</p>
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
          <span class="text-sm font-medium">Ad soyad</span>
          <input v-model="form.name" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">E-posta</span>
          <input v-model="form.email" class="input w-full" required type="email" />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Rol</span>
          <select v-model="form.role" class="input w-full" required>
            <option v-for="role in roles" :key="role" :value="role">{{ roleLabels[role] }}</option>
          </select>
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Avatar URL</span>
          <input v-model="form.avatar" class="input w-full" placeholder="https://..." />
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
