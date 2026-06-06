import type { Customer, Project, SocialContent, Task, TeamMember } from '@/types'

export const customers: Customer[] = [
  {
    id: 'cus_1',
    companyName: 'Nova Retail',
    contactName: 'Elif Arslan',
    email: 'elif@novaretail.co',
    phone: '+90 555 012 4401',
    website: 'novaretail.co',
    notes: 'E-ticaret ve sosyal medya büyüme paketi.',
    createdAt: '2026-04-12',
  },
  {
    id: 'cus_2',
    companyName: 'Atlas Studio',
    contactName: 'Mert Kaya',
    email: 'mert@atlasstudio.io',
    phone: '+90 555 018 1147',
    website: 'atlasstudio.io',
    notes: 'Marka yenileme ve LinkedIn içerik yönetimi.',
    createdAt: '2026-05-02',
  },
]

export const projects: Project[] = [
  {
    id: 'prj_1',
    customerId: 'cus_1',
    projectName: 'Q2 Sosyal Medya Yönetimi',
    description: 'Instagram, TikTok ve haftalık performans raporları.',
    status: 'Active',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    createdAt: '2026-04-01',
  },
  {
    id: 'prj_2',
    customerId: 'cus_2',
    projectName: 'LinkedIn Thought Leadership',
    description: 'Kurucu profilleri için haftalık içerik planı.',
    status: 'Pending',
    startDate: '2026-06-03',
    endDate: '2026-08-31',
    createdAt: '2026-05-28',
  },
]

export const contents: SocialContent[] = [
  {
    id: 'cnt_1',
    customerId: 'cus_1',
    platform: 'Instagram',
    contentType: 'Reels',
    title: 'Yaz Koleksiyonu Lansmanı',
    description: 'Ürün odaklı kısa video.',
    publishDate: '2026-06-05',
    status: 'Waiting Approval',
    createdAt: '2026-05-30',
  },
  {
    id: 'cnt_2',
    customerId: 'cus_2',
    platform: 'LinkedIn',
    contentType: 'Carousel',
    title: 'Tasarım Sistemleri',
    description: 'Ajans kurucusu imzalı bilgi serisi.',
    publishDate: '2026-06-08',
    status: 'Draft',
    createdAt: '2026-06-01',
  },
]

export const tasks: Task[] = [
  {
    id: 'tsk_1',
    title: 'Nova Reels storyboard',
    description: 'Lansman videosu için ilk taslak.',
    assignedTo: 'Ayşe Demir',
    priority: 'High',
    dueDate: '2026-06-02',
    status: 'In Progress',
  },
  {
    id: 'tsk_2',
    title: 'Atlas LinkedIn görselleri',
    description: 'Carousel seti için 6 kapak tasarımı.',
    assignedTo: 'Can Yılmaz',
    priority: 'Medium',
    dueDate: '2026-06-06',
    status: 'To Do',
  },
]

export const team: TeamMember[] = [
  {
    id: 'mem_1',
    name: 'Ayşe Demir',
    email: 'ayse@agencyflow.app',
    role: 'Social Media Manager',
  },
  {
    id: 'mem_2',
    name: 'Can Yılmaz',
    email: 'can@agencyflow.app',
    role: 'Designer',
  },
]
