<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const email = ref('')
const password = ref('')
const error = ref('')
const auth = useAuthStore()
const router = useRouter()

const submit = async () => {
  error.value = ''

  try {
    await auth.login(email.value, password.value)
    await router.push('/dashboard')
  } catch {
    error.value = 'E-posta veya şifre hatalı. Bilgileri kontrol edip tekrar deneyin.'
  }
}
</script>

<template>
  <form class="panel w-full max-w-md p-6" @submit.prevent="submit">
    <h1 class="text-2xl font-semibold">Giriş</h1>
    <p class="mt-1 text-sm text-slate-500">Ajans çalışma alanına devam et.</p>

    <div class="mt-6 grid gap-3">
      <input v-model.trim="email" class="input" type="email" placeholder="E-posta" autocomplete="email" required />
      <input
        v-model="password"
        class="input"
        type="password"
        placeholder="Şifre"
        autocomplete="current-password"
        required
      />

      <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
        {{ error }}
      </p>

      <button class="btn-primary mt-2" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Giriş yapılıyor...' : 'Giriş yap' }}
      </button>
    </div>

    <div class="mt-4 flex justify-between text-sm">
      <RouterLink class="text-brand" to="/auth/register">Kayıt ol</RouterLink>
      <RouterLink class="text-slate-500" to="/auth/forgot-password">Şifremi unuttum</RouterLink>
    </div>
  </form>
</template>
