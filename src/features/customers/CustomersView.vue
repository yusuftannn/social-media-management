<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Pencil, Plus, Search, Trash2, X } from '@lucide/vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'
import { useToast } from '@/composables/useToast'
import type { Customer } from '@/types'

type CustomerForm = Omit<Customer, 'id' | 'createdAt'>

const emptyForm = (): CustomerForm => ({
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  website: '',
  logo: '',
  notes: '',
})

const workspace = useWorkspaceStore()
const toast = useToast()
const search = ref('')
const isModalOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const error = ref('')
const form = reactive<CustomerForm>(emptyForm())

const filteredCustomers = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return workspace.customers

  return workspace.customers.filter((customer) =>
    [customer.companyName, customer.contactName, customer.email, customer.phone, customer.website]
      .filter(Boolean)
      .some((field) => field.toLowerCase().includes(term)),
  )
})

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

const submitCustomer = async () => {
  saving.value = true
  error.value = ''

  try {
    const payload = {
      companyName: form.companyName.trim(),
      contactName: form.contactName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      website: form.website.trim(),
      logo: form.logo?.trim(),
      notes: form.notes?.trim(),
    }

    if (editingId.value) {
      await workspace.updateCustomer(editingId.value, payload)
      toast.success(`"${payload.companyName}" müşterisi başarıyla güncellendi.`)
    } else {
      await workspace.addCustomer({
        ...payload,
        createdAt: new Date().toISOString().slice(0, 10),
      })
      toast.success(`"${payload.companyName}" müşterisi başarıyla eklendi.`)
    }

    isModalOpen.value = false
    resetForm()
  } catch {
    const message = editingId.value ? 'Müşteri güncellemesi başarısız oldu.' : 'Müşteri eklenmesi başarısız oldu.'
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
  <PageHeader title="Müşteriler" description="Müşteri kayıtları, iletişim bilgileri ve hızlı durum görünümü.">
    <button class="btn-primary" type="button" @click="openCreateModal">
      <Plus class="h-4 w-4" />
      Müşteri ekle
    </button>
  </PageHeader>

  <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <label class="relative w-full max-w-md">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input v-model="search" class="input w-full pl-9" placeholder="Müşteri ara" />
    </label>
    <p class="text-sm text-slate-500 dark:text-slate-400">{{ filteredCustomers.length }} kayıt</p>
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
      Kayıtlı müşteri bulunamadı.
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
                :href="customer.website.startsWith('http') ? customer.website : `https://${customer.website}`"
                target="_blank"
                rel="noreferrer"
              >
                {{ customer.website }}
              </a>
            </td>
            <td class="p-4">
              <div class="flex justify-end gap-2">
                <button class="btn-muted h-9 w-9 p-0" type="button" title="Düzenle" @click="openEditModal(customer)">
                  <Pencil class="h-4 w-4" />
                </button>
                <button class="btn-muted h-9 w-9 p-0" type="button" title="Sil" @click="deleteCustomer(customer)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
    <form class="panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5" @submit.prevent="submitCustomer">
      <div class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold">{{ editingId ? 'Müşteri düzenle' : 'Müşteri ekle' }}</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">Kayıtlar Firestore customers koleksiyonuna yazılır.</p>
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
