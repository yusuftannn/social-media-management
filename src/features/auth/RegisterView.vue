<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const auth = useAuthStore()
const router = useRouter()

const submit = async () => {
  error.value = ''

  if (password.value.length < 6) {
    error.value = 'Sifre en az 6 karakter olmali.'
    return
  }

  try {
    await auth.register(name.value, email.value, password.value)
    await router.push('/dashboard')
  } catch {
    error.value = 'Hesap olusturulamadi. E-posta daha once kullanilmis olabilir.'
  }
}
</script>

<template>
  <form class="panel w-full max-w-md p-6" @submit.prevent="submit">
    <h1 class="text-2xl font-semibold">Kayit</h1>
    <p class="mt-1 text-sm text-slate-500">Yeni ajans hesabi olustur.</p>

    <div class="mt-6 grid gap-3">
      <input v-model.trim="name" class="input" placeholder="Ad soyad" autocomplete="name" required />
      <input v-model.trim="email" class="input" type="email" placeholder="E-posta" autocomplete="email" required />
      <input
        v-model="password"
        class="input"
        type="password"
        placeholder="Sifre"
        autocomplete="new-password"
        required
      />

      <p v-if="error" class="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-200">
        {{ error }}
      </p>

      <button class="btn-primary mt-2" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Hesap olusturuluyor...' : 'Hesap olustur' }}
      </button>
    </div>

    <RouterLink class="mt-4 block text-sm text-brand" to="/auth/login">Girise don</RouterLink>
  </form>
</template>
