<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const email = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)
const auth = useAuthStore()

const submit = async () => {
  message.value = ''
  error.value = ''
  loading.value = true

  try {
    await auth.resetPassword(email.value)
    message.value = 'Sifre sifirlama baglantisi e-posta adresine gonderildi.'
  } catch {
    error.value = 'E-posta adresini kontrol edip tekrar deneyin.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form class="panel w-full max-w-md p-6" @submit.prevent="submit">
    <h1 class="text-2xl font-semibold">Sifre sifirlama</h1>
    <p class="mt-1 text-sm text-slate-500">Hesabina ait e-posta adresine sifirlama baglantisi gonder.</p>

    <div class="mt-6 grid gap-3">
      <input v-model.trim="email" class="input" type="email" placeholder="E-posta" autocomplete="email" required />

      <p
        v-if="message"
        class="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
      >
        {{ message }}
      </p>
      <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
        {{ error }}
      </p>

      <button class="btn-primary" type="submit" :disabled="loading">
        {{ loading ? 'Gonderiliyor...' : 'Baglanti gonder' }}
      </button>
    </div>

    <RouterLink class="mt-4 block text-sm text-brand" to="/auth/login">Girise don</RouterLink>
  </form>
</template>
