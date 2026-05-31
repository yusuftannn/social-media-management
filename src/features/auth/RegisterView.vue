<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const name = ref('')
const email = ref('')
const auth = useAuthStore()
const router = useRouter()

const submit = async () => {
  await auth.register(name.value, email.value)
  await router.push('/dashboard')
}
</script>

<template>
  <form class="panel w-full max-w-md p-6" @submit.prevent="submit">
    <h1 class="text-2xl font-semibold">Kayıt</h1>
    <p class="mt-1 text-sm text-slate-500">Yeni ajans hesabı oluştur.</p>
    <div class="mt-6 grid gap-3">
      <input v-model="name" class="input" placeholder="Ad soyad" required />
      <input v-model="email" class="input" type="email" placeholder="E-posta" required />
      <button class="btn-primary mt-2" type="submit">Hesap oluştur</button>
    </div>
    <RouterLink class="mt-4 block text-sm text-brand" to="/auth/login">Girişe dön</RouterLink>
  </form>
</template>
