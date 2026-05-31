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

  const load = async () => {
    loading.value = true
    ;[customers.value, projects.value, contents.value, tasks.value, team.value] = await Promise.all([
      customerRepository.list(),
      projectRepository.list(),
      contentRepository.list(),
      taskRepository.list(),
      teamRepository.list(),
    ])
    loading.value = false
  }

  const addCustomer = async (payload: Omit<Customer, 'id'>) => {
    customers.value = [await customerRepository.create(payload), ...customers.value]
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
    load,
    addCustomer,
    addTask,
  }
})
