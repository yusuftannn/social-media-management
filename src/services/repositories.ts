import { contents, projects, tasks, team } from '@/data/mockData'
import { db } from '@/firebase/config'
import { createFirestoreRepository, createMemoryRepository } from '@/services/crudService'
import type { Customer, Project, SocialContent, Task, TeamMember } from '@/types'

export const customerRepository = createFirestoreRepository<Customer>(db, 'customers')
export const projectRepository = createMemoryRepository<Project>('prj', projects)
export const contentRepository = createMemoryRepository<SocialContent>('cnt', contents)
export const taskRepository = createMemoryRepository<Task>('tsk', tasks)
export const teamRepository = createMemoryRepository<TeamMember>('mem', team)
