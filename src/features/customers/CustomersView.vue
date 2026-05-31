<script setup lang="ts">
import { computed, ref } from 'vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useWorkspaceStore } from '@/stores/workspaceStore'

const workspace = useWorkspaceStore()
const search = ref('')
const filteredCustomers = computed(() =>
  workspace.customers.filter((customer) =>
    customer.companyName.toLowerCase().includes(search.value.toLowerCase()),
  ),
)
</script>

<template>
  <PageHeader title="Müşteriler" description="Müşteri kayıtları, arama ve hızlı durum görünümü.">
    <button class="btn-primary">Müşteri ekle</button>
  </PageHeader>
  <input v-model="search" class="input mb-4 w-full max-w-sm" placeholder="Müşteri ara" />
  <div class="panel overflow-hidden">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-slate-500 dark:bg-slate-900">
        <tr>
          <th class="p-4">Şirket</th>
          <th class="p-4">Yetkili</th>
          <th class="p-4">E-posta</th>
          <th class="p-4">Web</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in filteredCustomers" :key="customer.id" class="border-t border-line dark:border-slate-800">
          <td class="p-4 font-medium">{{ customer.companyName }}</td>
          <td class="p-4">{{ customer.contactName }}</td>
          <td class="p-4">{{ customer.email }}</td>
          <td class="p-4">{{ customer.website }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
