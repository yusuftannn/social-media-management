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

  const addProject = async (payload: Omit<Project, 'id'>) => {
    projects.value = [await projectRepository.create(payload), ...projects.value]
  }

  const updateProject = async (id: string, payload: Partial<Project>) => {
    const updated = await projectRepository.update(id, payload)
    projects.value = projects.value.map((project) => (project.id === id ? updated : project))
  }

  const removeProject = async (id: string) => {
    await projectRepository.remove(id)
    projects.value = projects.value.filter((project) => project.id !== id)
  }

  const addContent = async (payload: Omit<SocialContent, 'id'>) => {
    contents.value = [await contentRepository.create(payload), ...contents.value]
  }

  const updateContent = async (id: string, payload: Partial<SocialContent>) => {
    const updated = await contentRepository.update(id, payload)
    contents.value = contents.value.map((content) => (content.id === id ? updated : content))
  }

  const removeContent = async (id: string) => {
    await contentRepository.remove(id)
    contents.value = contents.value.filter((content) => content.id !== id)
  }

  const addTask = async (payload: Omit<Task, 'id'>) => {
    tasks.value = [await taskRepository.create(payload), ...tasks.value]
  }

  const addTeamMember = async (payload: Omit<TeamMember, 'id'>) => {
    team.value = [await teamRepository.create(payload), ...team.value]
  }

  const updateTeamMember = async (id: string, payload: Partial<TeamMember>) => {
    const updated = await teamRepository.update(id, payload)
    team.value = team.value.map((member) => (member.id === id ? updated : member))
  }

  const removeTeamMember = async (id: string) => {
    await teamRepository.remove(id)
    team.value = team.value.filter((member) => member.id !== id)
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
    addProject,
    updateProject,
    removeProject,
    addContent,
    updateContent,
    removeContent,
    addTask,
    addTeamMember,
    updateTeamMember,
    removeTeamMember,
  }
})
