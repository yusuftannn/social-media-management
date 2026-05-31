<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const email = ref('owner@agencyflow.app')
const password = ref('demo1234')
const auth = useAuthStore()
const router = useRouter()

const submit = async () => {
  await auth.login(email.value)
  await router.push('/dashboard')
}
</script>

<template>
  <form class="panel w-full max-w-md p-6" @submit.prevent="submit">
    <h1 class="text-2xl font-semibold">Giriş</h1>
    <p class="mt-1 text-sm text-slate-500">Ajans çalışma alanına devam et.</p>
    <div class="mt-6 grid gap-3">
      <input v-model="email" class="input" type="email" placeholder="E-posta" />
      <input v-model="password" class="input" type="password" placeholder="Şifre" />
      <button class="btn-primary mt-2" type="submit">Giriş yap</button>
    </div>
    <div class="mt-4 flex justify-between text-sm">
      <RouterLink class="text-brand" to="/auth/register">Kayıt ol</RouterLink>
      <RouterLink class="text-slate-500" to="/auth/forgot-password">Şifremi unuttum</RouterLink>
    </div>
  </form>
</template>
