import { db } from '@/firebase/config'
import { createFirestoreRepository } from '@/services/crudService'
import type { Customer, Project, SocialContent, Task, TeamMember } from '@/types'

export const customerRepository = createFirestoreRepository<Customer>(db, 'customers')
export const projectRepository = createFirestoreRepository<Project>(db, 'projects')
export const contentRepository = createFirestoreRepository<SocialContent>(db, 'contents')
export const taskRepository = createFirestoreRepository<Task>(db, 'tasks')
export const teamRepository = createFirestoreRepository<TeamMember>(db, 'team')
