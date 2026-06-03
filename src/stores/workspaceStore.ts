import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  contentRepository,
  customerRepository,
  projectRepository,
  taskRepository,
  teamRepository,
} from '@/services/repositories'
import type { Customer, Project, SocialContent, Task, TeamMember } from '@/types'

export const useWorkspaceStore = defineStore('workspace', () => {
  const customers = ref<Customer[]>([])
  const projects = ref<Project[]>([])
  const contents = ref<SocialContent[]>([])
  const tasks = ref<Task[]>([])
  const team = ref<TeamMember[]>([])
  const loading = ref(false)
  const error = ref('')

  const load = async () => {
    loading.value = true
    error.value = ''
    try {
      ;[customers.value, projects.value, contents.value, tasks.value, team.value] = await Promise.all([
        customerRepository.list(),
        projectRepository.list(),
        contentRepository.list(),
        taskRepository.list(),
        teamRepository.list(),
      ])
    } catch {
      error.value = 'Veriler Firebase üzerinden okunamadı. Firestore izinlerini kontrol edin.'
    } finally {
      loading.value = false
    }
  }

  const addCustomer = async (payload: Omit<Customer, 'id'>) => {
    customers.value = [await customerRepository.create(payload), ...customers.value]
  }

  const updateCustomer = async (id: string, payload: Partial<Customer>) => {
    const updated = await customerRepository.update(id, payload)
    customers.value = customers.value.map((customer) => (customer.id === id ? updated : customer))
  }

  const removeCustomer = async (id: string) => {
    await customerRepository.remove(id)
    customers.value = customers.value.filter((customer) => customer.id !== id)
  }

  const addTask = async (payload: Omit<Task, 'id'>) => {
    tasks.value = [await taskRepository.create(payload), ...tasks.value]
  }

  return {
    customers,
    projects,
    contents,
    tasks,
    team,
    loading,
    error,
    load,
    addCustomer,
    updateCustomer,
    removeCustomer,
    addTask,
  }
})
