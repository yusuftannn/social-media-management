<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Pencil, Plus, Search, Trash2, X, RotateCcw } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useToast } from '@/composables/useToast'
import type { Customer } from '@/types'

type CustomerForm = Omit<Customer, 'id' | 'createdAt'>
type SearchField = 'all' | 'companyName' | 'contactName' | 'email' | 'phone' | 'website' | 'notes'
type DetailFilter =
  | 'all'
  | 'withWebsite'
  | 'withoutWebsite'
  | 'withNotes'
  | 'withoutNotes'
  | 'withLogo'
  | 'withoutLogo'

const searchFieldLabels: Record<SearchField, string> = {
  all: 'Tüm alanlar',
  companyName: 'Şirket',
  contactName: 'Yetkili',
  email: 'E-posta',
  phone: 'Telefon',
  website: 'Web',
  notes: 'Notlar',
}

const detailFilterLabels: Record<DetailFilter, string> = {
  all: 'Tüm kayıtlar',
  withWebsite: 'Web sitesi olan',
  withoutWebsite: 'Web sitesi olmayan',
  withNotes: 'Notu olan',
  withoutNotes: 'Notu olmayan',
  withLogo: 'Logosu olan',
  withoutLogo: 'Logosu olmayan',
}

const searchFields = Object.keys(searchFieldLabels) as SearchField[]
const detailFilters = Object.keys(detailFilterLabels) as DetailFilter[]

const emptyForm = (): CustomerForm => ({
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  logo: '',
  notes: '',
})
const today = () => new Date().toISOString().slice(0, 10)
const workspace = useWorkspaceStore()
const toast = useToast()
const search = ref('')
const searchField = ref<SearchField>('all')
const detailFilter = ref<DetailFilter>('all')
const createdFromFilter = ref('')
const createdToFilter = ref('')
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const form = reactive<CustomerForm>(emptyForm())

const hasActiveFilters = computed(
  () =>
    search.value.trim() !== '' ||
    searchField.value !== 'all' ||
    detailFilter.value !== 'all' ||
    createdFromFilter.value !== '' ||
    createdToFilter.value !== '',
)

const searchableValues = (customer: Customer) => ({
  companyName: customer.companyName,
  contactName: customer.contactName,
  email: customer.email,
  phone: customer.phone,
  website: customer.website,
  notes: customer.notes ?? '',
})
const matchesDetailFilter = (customer: Customer, filter: DetailFilter) => {
  switch (filter) {
    case 'withWebsite':
      return Boolean(customer.website)

    case 'withoutWebsite':
      return !customer.website

    case 'withNotes':
      return Boolean(customer.notes)

    case 'withoutNotes':
      return !customer.notes

    case 'withLogo':
      return Boolean(customer.logo)

    case 'withoutLogo':
      return !customer.logo

    default:
      return true
  }
}
const filteredCustomers = computed(() => {
  const term = search.value.trim().toLowerCase()

  return workspace.customers.filter((customer) => {
    const values = searchableValues(customer)

    const fieldsToSearch =
      searchField.value === 'all' ? Object.values(values) : [values[searchField.value]]

    const matchesSearch =
      !term || fieldsToSearch.filter(Boolean).some((field) => field.toLowerCase().includes(term))

    const matchesCreatedFrom =
      !createdFromFilter.value || customer.createdAt >= createdFromFilter.value

    const matchesCreatedTo = !createdToFilter.value || customer.createdAt <= createdToFilter.value

    return (
      matchesSearch &&
      matchesDetailFilter(customer, detailFilter.value) &&
      matchesCreatedFrom &&
      matchesCreatedTo
    )
  })
})
const normalizeWebsite = (website: string) =>
  website.startsWith('http') ? website : `https://${website}`

const clearFilters = () => {
  search.value = ''
  searchField.value = 'all'
  detailFilter.value = 'all'
  createdFromFilter.value = ''
  createdToFilter.value = ''
}

const resetForm = () => {
  Object.assign(form, emptyForm())
  editingId.value = null
  error.value = ''
}

const openCreateModal = () => {
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (customer: Customer) => {
  Object.assign(form, {
    companyName: customer.companyName,
    contactName: customer.contactName,
    email: customer.email,
    phone: customer.phone,
    website: customer.website,
    logo: customer.logo ?? '',
    notes: customer.notes ?? '',
  })
  editingId.value = customer.id
  error.value = ''
  isModalOpen.value = true
}

const closeModal = () => {
  if (saving.value) return
  isModalOpen.value = false
  resetForm()
}
const buildPayload = () => ({
  companyName: form.companyName.trim(),
  contactName: form.contactName.trim(),
  email: form.email.trim(),
  phone: form.phone.trim(),
  website: form.website.trim(),
})
const submitCustomer = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload = buildPayload()

    if (editingId.value) {
      await workspace.updateCustomer(editingId.value, payload)

      toast.success(`"${payload.companyName}" müşterisi başarıyla güncellendi.`)
    } else {
      await workspace.addCustomer({
        ...payload,
        createdAt: today(),
      })

      toast.success(`"${payload.companyName}" müşterisi başarıyla eklendi.`)
    }

    isModalOpen.value = false
    resetForm()
  } catch {
    const message = editingId.value
      ? 'Müşteri güncellemesi başarısız oldu.'
      : 'Müşteri eklenmesi başarısız oldu.'

    error.value = message
    toast.error(message)
  } finally {
    saving.value = false
  }
}

const deleteCustomer = async (customer: Customer) => {
  const confirmed = globalThis.confirm(`${customer.companyName} kaydını silmek istiyor musunuz?`)
  if (!confirmed) return

  try {
    await workspace.removeCustomer(customer.id)
    toast.success(`"${customer.companyName}" müşterisi başarıyla silindi.`)
  } catch {
    const message = 'Müşteri silinmesi başarısız oldu.'
    error.value = message
    toast.error(message)
  }
}
</script>

<template>
  <PageHeader
    title="Müşteriler"
    description="Müşteri kayıtları, iletişim bilgileri ve hızlı durum görünümü."
  >
    <button class="btn-primary" type="button" @click="openCreateModal">
      <Plus class="h-4 w-4" />
      Müşteri ekle
    </button>
  </PageHeader>

  <div class="mb-4 flex flex-col gap-3">
    <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div
        class="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_190px_160px_160px]"
      >
        <label class="relative">
          <Search
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input v-model="search" class="input w-full pl-9" placeholder="Müşteri ara" />
        </label>
        <select v-model="searchField" class="input w-full">
          <option v-for="field in searchFields" :key="field" :value="field">
            {{ searchFieldLabels[field] }}
          </option>
        </select>
        <select v-model="detailFilter" class="input w-full">
          <option v-for="filter in detailFilters" :key="filter" :value="filter">
            {{ detailFilterLabels[filter] }}
          </option>
        </select>
        <input
          v-model="createdFromFilter"
          type="date"
          class="input w-full"
          title="Başlangıç tarihi"
        />
        <input v-model="createdToFilter" type="date" class="input w-full" title="Bitiş tarihi" />
      </div>
      <div class="flex shrink-0 items-center justify-between gap-3">
        <button
          class="btn-muted h-10 w-10 p-0"
          type="button"
          title="Filtreleri temizle"
          :disabled="!hasActiveFilters"
          @click="clearFilters"
        >
          <RotateCcw class="h-4 w-4" />
        </button>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          {{ filteredCustomers.length }} kayıt
        </p>
      </div>
    </div>
  </div>

  <p
    v-if="error || workspace.error"
    class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
  >
    {{ error || workspace.error }}
  </p>

  <div class="panel overflow-hidden">
    <div v-if="workspace.loading" class="p-6 text-sm text-slate-500">Müşteriler yükleniyor...</div>
    <div v-else-if="filteredCustomers.length === 0" class="p-6 text-sm text-slate-500">
      Filtrelere uygun müşteri bulunamadı.
    </div>
    <div v-else class="overflow-x-auto">
      <table class="w-full min-w-[820px] text-left text-sm">
        <thead class="bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th class="p-4">Şirket</th>
            <th class="p-4">Yetkili</th>
            <th class="p-4">E-posta</th>
            <th class="p-4">Telefon</th>
            <th class="p-4">Web</th>
            <th class="p-4 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="customer in filteredCustomers"
            :key="customer.id"
            class="border-t border-line dark:border-slate-800"
          >
            <td class="p-4">
              <div class="font-medium">{{ customer.companyName }}</div>
              <div v-if="customer.notes" class="mt-1 line-clamp-1 text-xs text-slate-500">
                {{ customer.notes }}
              </div>
            </td>
            <td class="p-4">{{ customer.contactName }}</td>
            <td class="p-4">{{ customer.email }}</td>
            <td class="p-4">{{ customer.phone }}</td>
            <td class="p-4">
              <a
                v-if="customer.website"
                class="text-brand hover:underline"
                :href="normalizeWebsite(customer.website)"
                target="_blank"
                rel="noreferrer"
              >
                {{ customer.website }}
              </a>
            </td>
            <td class="p-4">
              <div class="flex justify-end gap-2">
                <button
                  class="btn-muted h-9 w-9 p-0"
                  type="button"
                  title="Düzenle"
                  @click="openEditModal(customer)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  class="btn-muted h-9 w-9 p-0"
                  type="button"
                  title="Sil"
                  @click="deleteCustomer(customer)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div
    v-if="isModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
  >
    <form
      class="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5"
      @submit.prevent="submitCustomer"
    >
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">
            {{ editingId ? 'Müşteri düzenle' : 'Müşteri ekle' }}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Müşteri kayıtlarını yönetin.
          </p>
        </div>
        <button class="btn-muted h-9 w-9 p-0" type="button" @click="closeModal">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <label class="space-y-1">
          <span class="text-sm font-medium">Şirket</span>
          <input v-model="form.companyName" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Yetkili</span>
          <input v-model="form.contactName" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">E-posta</span>
          <input v-model="form.email" class="input w-full" required type="email" />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Telefon</span>
          <input v-model="form.phone" class="input w-full" required />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Web sitesi</span>
          <input v-model="form.website" class="input w-full" placeholder="example.com" />
        </label>
        <label class="space-y-1">
          <span class="text-sm font-medium">Logo URL</span>
          <input v-model="form.logo" class="input w-full" />
        </label>
        <label class="space-y-1 sm:col-span-2">
          <span class="text-sm font-medium">Notlar</span>
          <textarea
            v-model="form.notes"
            class="min-h-24 w-full rounded-md border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-950"
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
