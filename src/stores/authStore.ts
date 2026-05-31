import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AppUser, UserRole } from '@/types'

const demoUser: AppUser = {
  id: 'usr_1',
  name: 'Yusuf Agency',
  email: 'owner@agencyflow.app',
  role: 'Agency Owner',
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AppUser | null>(demoUser)
  const isAuthenticated = computed(() => Boolean(user.value))

  const login = async (email: string) => {
    user.value = { ...demoUser, email }
  }

  const register = async (name: string, email: string, role: UserRole = 'Agency Owner') => {
    user.value = { id: 'usr_new', name, email, role }
  }

  const logout = async () => {
    user.value = null
  }

  return { user, isAuthenticated, login, register, logout }
})
