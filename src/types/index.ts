export type UserRole = 'Super Admin' | 'Agency Owner' | 'Team Member'
export type ProjectStatus = 'Active' | 'Pending' | 'Completed'
export type ContentStatus = 'Draft' | 'Waiting Approval' | 'Approved' | 'Published'
export type ContentPlatform = 'Instagram' | 'Facebook' | 'LinkedIn' | 'TikTok' | 'X'
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Done'
export type Priority = 'Low' | 'Medium' | 'High'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

export interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  website: string
  logo?: string
  notes?: string
  createdAt: string
}

export interface Project {
  id: string
  customerId: string
  projectName: string
  description: string
  status: ProjectStatus
  startDate: string
  endDate: string
  createdAt: string
}

export interface SocialContent {
  id: string
  customerId: string
  platform: ContentPlatform
  contentType: string
  title: string
  description: string
  publishDate: string
  status: ContentStatus
}

export interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  priority: Priority
  dueDate: string
  status: TaskStatus
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Designer' | 'Developer' | 'Social Media Manager' | 'Content Creator'
  avatar?: string
  createdAt?: string
}
