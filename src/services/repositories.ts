import { tasks } from '@/data/mockData'
import { db } from '@/firebase/config'
import { createFirestoreRepository, createMemoryRepository } from '@/services/crudService'
import type { Customer, Project, SocialContent, Task, TeamMember } from '@/types'

export const customerRepository = createFirestoreRepository<Customer>(db, 'customers')
export const projectRepository = createFirestoreRepository<Project>(db, 'projects')
export const contentRepository = createFirestoreRepository<SocialContent>(db, 'contents')
export const taskRepository = createMemoryRepository<Task>('tsk', tasks)
export const teamRepository = createFirestoreRepository<TeamMember>(db, 'team')
